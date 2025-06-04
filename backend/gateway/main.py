import os
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException, Depends, status
import httpx
import motor.motor_asyncio
from models import ForgePayload, TelemetryPayload, Challenge
from mission_compiler import write_wbt
import socketio
import subprocess
import platform
from dotenv import load_dotenv
import json
import time
from bson import ObjectId
from pathlib import Path

# Load environment variables from .env file
load_dotenv()

# Get environment variables with defaults
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27018")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "sk-or-v1-8f16456ebb416567acf40669e244f156f8a1b5e669fe14b3156f8a1b5e669fe14b317524e0aa5f934b5")
OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions"

# Configure MongoDB client for local development
try:
    mongo_client = motor.motor_asyncio.AsyncIOMotorClient(
        "mongodb://localhost:27018",
        serverSelectionTimeoutMS=5000
    )
    db = mongo_client.simforge
    print("Connected to MongoDB successfully")
except Exception as e:
    print(f"Error connecting to MongoDB: {str(e)}")
    raise

# Dependency to check if a user is whitelisted
async def get_whitelisted_user(user_id: str):
    whitelisted_user = await db.whitelisted_users.find_one({"user_id": user_id})
    if not whitelisted_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not whitelisted for this action."
        )
    return whitelisted_user

# Initialize collections if they don't exist
async def init_db():
    try:
        # Create indexes without using a session
        await db.missions.create_index([("mission_name", 1)], unique=True)
        await db.missions.create_index([("created", -1)])
        # Index for leaderboard sorting
        await db.missions.create_index([("scores.lap_time_sec", 1)])
        # Index for whitelisted users
        await db.whitelisted_users.create_index([("user_id", 1)], unique=True)
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
        "domain": payload.domain or ai_meta.get("domain", "Unknown"), # Use frontend domain
        "gates": payload.meta.get("gates", []) if payload.meta else [] # Include gates from meta
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

    mission = await db.missions.find_one({"_id": ObjectId(mission_id)})
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    try:
        from mission_compiler import build_and_launch_wbt   # local import picks new code
        world_path = build_and_launch_wbt(mission)

        return {
            "status":  "success",
            "message": "Webots launched",
            "world":   str(world_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"simulate failed: {e}")

@app.post("/telemetry")
async def telemetry(data: TelemetryPayload):
    await db.missions.update_one(
        {"mission_name": data.mission},
        {"$push": {"scores": {"pilot": data.pilot, "lap_time_sec": data.lap_time_sec}}}
    )
    # Emit score update to a room specific to the mission name
    await sio.emit("score_update", data.model_dump(), room=data.mission)
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

@app.post("/challenges")
async def create_challenge(challenge: Challenge):
    """Create a new challenge and save it to the database."""
    # In a real application, author_uid would come from authentication
    author_uid = "anonymous_user" # Placeholder for now

    challenge_doc = challenge.model_dump()
    challenge_doc["author_uid"] = author_uid
    challenge_doc["created"] = datetime.utcnow().isoformat()
    # State is already defaulted to "pending" in the Pydantic model, but we ensure it here.
    challenge_doc["state"] = "pending"

    # Insert the new challenge into the database
    insert_result = await db.challenges.insert_one(challenge_doc)

    # Fetch the newly created document to return it with the _id
    new_challenge = await db.challenges.find_one({"_id": insert_result.inserted_id})

    if not new_challenge:
        raise HTTPException(status_code=500, detail="Failed to retrieve newly created challenge")

    # Ensure _id is a string for the frontend
    new_challenge["_id"] = str(new_challenge["_id"])

    # Note: We are skipping the auto-moderation/Redis queue step for this initial scaffold

    return new_challenge

@app.get("/missions/{mission_id}/leaderboard")
async def get_leaderboard(mission_id: str, top: int = 10):
    """Get the top lap times for a specific mission."""
    # Validate mission_id is a valid ObjectId
    if not ObjectId.is_valid(mission_id):
        raise HTTPException(status_code=400, detail="Invalid Mission ID format")

    # Define the aggregation pipeline
    pipeline = [
      {"$match":{"_id": ObjectId(mission_id)}},
      {"$unwind":"$scores"},
      {"$group":{
          "_id":"$scores.pilot",
          "fastest":{"$min":"$scores.lap_time_sec"}}},
      {"$sort":{"fastest":1}},
      {"$limit": top}
    ]

    # Execute the pipeline
    leaderboard_data = []
    async for doc in db.missions.aggregate(pipeline):
        leaderboard_data.append({
            "pilot": doc["_id"],
            "fastest_lap_time_sec": doc["fastest"]
        })

    # Optional: Check if the mission exists (the $match stage handles this partially)
    # A more robust check would be to find the mission first, then run the pipeline
    mission = await db.missions.find_one({"_id": ObjectId(mission_id)})
    if not mission:
         raise HTTPException(status_code=404, detail="Mission not found")

    # The pipeline already filters by mission_id, so if mission exists but pipeline returns empty,
    # it means there are no scores yet, which is valid.
    return leaderboard_data

@app.post("/challenges/{challenge_id}/state")
async def update_challenge_state(challenge_id: str, state: str, user_id: str = Depends(get_whitelisted_user)):
    """Update the state of a challenge (whitelist/reject)."""
    if state not in ["pending", "whitelisted", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid state. Must be one of: pending, whitelisted, rejected")

    # Validate challenge_id is a valid ObjectId
    if not ObjectId.is_valid(challenge_id):
        raise HTTPException(status_code=400, detail="Invalid Challenge ID format")

    # Update the challenge state
    result = await db.challenges.update_one(
        {"_id": ObjectId(challenge_id)},
        {"$set": {"state": state}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Challenge not found")

    # Fetch and return the updated challenge
    updated_challenge = await db.challenges.find_one({"_id": ObjectId(challenge_id)})
    if not updated_challenge:
        raise HTTPException(status_code=500, detail="Failed to retrieve updated challenge")

    # Convert ObjectId to string for JSON serialization
    updated_challenge["_id"] = str(updated_challenge["_id"])
    return updated_challenge

@app.get("/missions/{mission_id}")
async def get_mission(mission_id: str):
    """Get a single mission by its ID."""
    if not ObjectId.is_valid(mission_id):
        raise HTTPException(status_code=400, detail="Invalid Mission ID format")

    mission = await db.missions.find_one({"_id": ObjectId(mission_id)})

    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    # Convert ObjectId to string for JSON serialization
    mission["_id"] = str(mission["_id"])

    return mission

@app.post("/missions/{mission_id}/complete")
async def complete_mission(mission_id: str):
    """Mark a mission as completed."""
    if not ObjectId.is_valid(mission_id):
        raise HTTPException(status_code=400, detail="Invalid Mission ID format")

    result = await db.missions.update_one(
        {"_id": ObjectId(mission_id)},
        {"$set": {"status": "completed", "completion_time": datetime.utcnow()}}
    )

    if result.modified_count == 0:
        # Check if mission exists but status is already completed/failed
        mission = await db.missions.find_one({"_id": ObjectId(mission_id)})
        if mission:
             # Mission found, but not modified means status was already final
             return {"message": f"Mission {mission_id} status was already {mission.get('status', 'finalized')}"}
        else:
            raise HTTPException(status_code=404, detail="Mission not found")

    return {"message": f"Mission {mission_id} marked as completed"}

@app.post("/missions/{mission_id}/fail")
async def fail_mission(mission_id: str, reason: str = "unknown"):
    """Mark a mission as failed."""
    if not ObjectId.is_valid(mission_id):
        raise HTTPException(status_code=400, detail="Invalid Mission ID format")

    result = await db.missions.update_one(
        {"_id": ObjectId(mission_id)},
        {"$set": {"status": "failed", "failure_reason": reason, "completion_time": datetime.utcnow()}}
    )

    if result.modified_count == 0:
        # Check if mission exists but status is already completed/failed
        mission = await db.missions.find_one({"_id": ObjectId(mission_id)})
        if mission:
             # Mission found, but not modified means status was already final
             return {"message": f"Mission {mission_id} status was already {mission.get('status', 'finalized')}"}
        else:
            raise HTTPException(status_code=404, detail="Mission not found")

    return {"message": f"Mission {mission_id} marked as failed with reason: {reason}"}

@app.post("/whitelisted-users/{user_id}")
async def add_whitelisted_user(user_id: str):
    """Add a user to the whitelist."""
    try:
        result = await db.whitelisted_users.insert_one({"user_id": user_id})
        if result.inserted_id:
            return {"message": f"User {user_id} added to whitelist"}
        else:
            raise HTTPException(status_code=500, detail="Failed to add user to whitelist")
    except Exception as e:
        if "duplicate key error" in str(e).lower():
            raise HTTPException(status_code=400, detail="User is already whitelisted")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/whitelisted-users/{user_id}")
async def remove_whitelisted_user(user_id: str):
    """Remove a user from the whitelist."""
    result = await db.whitelisted_users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found in whitelist")
    return {"message": f"User {user_id} removed from whitelist"}

@app.get("/whitelisted-users")
async def get_whitelisted_users():
    """Get a list of all whitelisted user IDs."""
    cursor = db.whitelisted_users.find({}, {"_id": 0, "user_id": 1})
    whitelisted_users = []
    async for doc in cursor:
        whitelisted_users.append(doc["user_id"])
    return whitelisted_users

# Export the SocketIO app for uvicorn
application = socket_app
