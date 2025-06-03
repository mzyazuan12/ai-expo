import os
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
import httpx
import motor.motor_asyncio
from models import ForgePayload, TelemetryPayload
from mission_compiler import write_mission
import socketio
import subprocess
import platform
from dotenv import load_dotenv
import json
import time
from bson import ObjectId

# Load environment variables from .env file
load_dotenv()

# Get environment variables with defaults
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "sk-or-v1-8f16456ebb416567acf40669e244f156f8a1b5e669fe14b3156f8a1b5e669fe14b317524e0aa5f934b5")
OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

# SkyDive paths
SKYDIVE_CUSTOM_TRACKS = os.path.expanduser("~/Library/Application Support/FPV SkyDive/TrackBuilder/CustomTracks")

def launch_skydive():
    """Launch FPV SkyDive via Steam based on the current platform."""
    try:
        if platform.system() == "Darwin":  # macOS
            subprocess.Popen(["open", "-a", "Steam", "steam://run/1278060"])
        elif platform.system() == "Windows":
            subprocess.Popen(["cmd", "/C", "start", "steam://rungameid/1278060"], shell=True)
        else:  # Linux
            subprocess.Popen(["steam", "steam://run/1278060"])
        return True
    except Exception as e:
        print(f"Error launching SkyDive: {str(e)}")
        return False

# Configure MongoDB client for local development
try:
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(
        "mongodb://localhost:27017",
        serverSelectionTimeoutMS=5000
    )
    db = mongo_client.simforge
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Error connecting to MongoDB: {str(e)}")
    raise

# Initialize collections if they don't exist
async def init_db():
    try:
        # Create indexes without using a session
        await db.missions.create_index([("mission_name", 1)], unique=True)
        await db.missions.create_index([("created", -1)])
        print("Database initialized successfully")
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        raise

# Create FastAPI app
app = FastAPI()

# Initialize database on startup
@app.on_event("startup")
async def startup_db_client():
    try:
        await init_db()
    except Exception as e:
        print(f"Failed to initialize database: {str(e)}")
        raise

# Create SocketIO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# Mount SocketIO app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

@app.post("/forge")
async def forge(payload: ForgePayload):
    thread_text = payload.thread_text
    image_url = payload.image_url

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:3002", # Replace with your actual frontend URL if deployed
        "X-Title": "AI Expo" # Replace with your application name
    }

    ai_payload = {
        "model": "deepseek/deepseek-r1:free", # Or another suitable model
        "messages": [
            {
                "role": "user",
                "content": f"{thread_text}\n\nReturn JSON with the following structure: {{'terrain': string, 'threats': string[], 'wind_kts': number, 'laps': number}}"
            }
        ]
    }
    # Add image to payload if provided
    if image_url:
         ai_payload["messages"].append({"role": "user", "content": [{"type": "image_url", "image_url": {"url": image_url}}]})

    async with httpx.AsyncClient(timeout=90) as client:
        res = await client.post(OPENROUTER_ENDPOINT, json=ai_payload, headers=headers)
        res.raise_for_status()
        response = res.json()

    # Parse the response content
    content = response["choices"][0]["message"]["content"]
    
    # Try to parse the JSON from the AI response
    try:
        ai_meta = json.loads(content)
        if not isinstance(ai_meta, dict):
             print(f"Warning: AI response not a dictionary: {content}")
             # Fallback to a basic structure
             ai_meta = {}

    except json.JSONDecodeError:
        print(f"Warning: AI response not valid JSON: {content}")
        # Fallback to a basic structure
        ai_meta = {}

    # Define valid environments for the Track Builder
    VALID_BUILDER_ENVIRONMENTS = ["stadium", "gymnasium"]

    # Combine frontend data with AI response, prioritizing frontend data and validating environment
    selected_environment = payload.environment # Get environment from frontend form
    ai_generated_terrain = ai_meta.get("terrain") # Get terrain from AI response

    # Determine the final terrain/environment for the mission meta
    final_environment = "stadium" # Default to a valid builder environment

    if selected_environment in VALID_BUILDER_ENVIRONMENTS:
        final_environment = selected_environment # Use frontend selection if valid
    elif ai_generated_terrain in VALID_BUILDER_ENVIRONMENTS:
         final_environment = ai_generated_terrain # Use AI terrain if valid
    # If neither is valid, the default "stadium" is used

    mission_meta = {
        "terrain": final_environment, # Use the validated environment
        "threats": ai_meta.get("threats", []), # Use AI threats
        "wind_kts": ai_meta.get("wind_kts", 0), # Use AI wind_kts
        "laps": ai_meta.get("laps", 1), # Use AI laps
        "tags": [tag.strip() for tag in payload.tags] if payload.tags else [], # Use frontend tags
        "trl": payload.trl if payload.trl is not None else ai_meta.get("trl", 1), # Use frontend trl
        "urgency": payload.urgency or ai_meta.get("urgency", "Low"), # Use frontend urgency
        "domain": payload.domain or ai_meta.get("domain", "Unknown") # Use frontend domain
    }

    # Generate a unique mission name (can still be based on time for uniqueness)
    mission_name = f"mission_{int(time.time())}"
    
    # Create the mission document in MongoDB
    mission_doc = {
        "mission_name": mission_name,
        "meta": mission_meta,
        "created": datetime.utcnow().isoformat(),
        "scores": [],
        "upvotes": 0
    }
    insert_result = await db.missions.insert_one(mission_doc)
    
    # Fetch the newly created document to return it with the _id
    new_mission = await db.missions.find_one({"_id": insert_result.inserted_id})
    
    if not new_mission:
        raise HTTPException(status_code=500, detail="Failed to retrieve newly created mission")

    # Ensure _id is a string for the frontend
    new_mission["_id"] = str(new_mission["_id"])

    return new_mission

@app.post("/simulate/{mission_id}")
async def simulate(mission_id: str):

    try:
        # Fetch the mission data from the database
        mission = await db.missions.find_one({"_id": ObjectId(mission_id)})
        
        if not mission:
            raise HTTPException(status_code=404, detail="Mission not found")
            
        mission_data = mission.get("meta")
        mission_name = mission.get("mission_name")

        if not mission_data:
            raise ValueError("Mission data not found in database entry")

        # Ensure the CustomTracks directory exists
        os.makedirs(SKYDIVE_CUSTOM_TRACKS, exist_ok=True)
        
        # Write the mission file using the mission compiler
        # Truncate mission name to fit SkyDive's limit (e.g., last 20 characters)
        truncated_mission_name = mission_name[-20:] 
        mission_file = os.path.join(SKYDIVE_CUSTOM_TRACKS, f"{truncated_mission_name}.skydive.json")
        write_mission(mission_file, mission_data)
        
        # Launch SkyDive
        if launch_skydive():
            return {
                "status": "success",
                "message": "SkyDive launched successfully",
                "mission_name": mission_name,
                "mission_file": mission_file
            }
        else:
            raise Exception("Failed to launch SkyDive")
            
    except Exception as e:
        print(f"Error in simulation: {str(e)}")
        return {
            "status": "error",
            "message": f"Failed to start simulation: {str(e)}",
            "error": str(e)
        }, 500

@app.post("/telemetry")
async def telemetry(data: TelemetryPayload):
    await db.missions.update_one(
        {"mission_name": data.mission},
        {"$push": {"scores": {"pilot": data.pilot, "lap_time_sec": data.lap_time_sec}}}
    )
    await sio.emit("score_update", data.model_dump())
    return {"status": "ok"}

@app.get("/missions")
async def missions():
    cursor = db.missions.find().sort("created", -1)
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        # Ensure scores field exists
        if "scores" not in doc:
            doc["scores"] = []
        # Ensure meta field exists with default values
        if "meta" not in doc:
            doc["meta"] = {
                "terrain": "Unknown",
                "threats": [],
                "wind_kts": 0,
                "laps": 1,
                "tags": [],
                "trl": 1,
                "urgency": "Low",
                "domain": "Unknown"
            }
        # Ensure mission_name exists
        if "mission_name" not in doc:
            doc["mission_name"] = f"mission_{int(time.time())}"
        items.append(doc)
    return items

@app.post("/missions/{mission_name}/upvote")
async def upvote_mission(mission_name: str):
    result = await db.missions.update_one({"mission_name": mission_name}, {"$inc": {"upvotes": 1}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Mission not found")
    mission = await db.missions.find_one({"mission_name": mission_name})
    return {"upvotes": mission.get("upvotes", 0)}

@app.get("/missions/{mission_name}/upvotes")
async def get_upvotes(mission_name: str):
    mission = await db.missions.find_one({"mission_name": mission_name})
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    return {"upvotes": mission.get("upvotes", 0)}

# Export the SocketIO app for uvicorn
application = socket_app
