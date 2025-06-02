import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import motor.motor_asyncio
from .models import ForgePayload, TelemetryPayload, MissionEntry, MissionMeta
from .mission_compiler import write_mission
import socketio
import subprocess

# Get configuration from environment variables
MONGO_URL = os.getenv("MONGO_URI", "mongodb://localhost:27017")
LLAMA_ENDPOINT = os.getenv("LLAMA_ENDPOINT")
LLAMA_API_KEY = os.getenv("LLAMA_API_KEY")
THREADS_BASEURL = os.getenv("THREADS_BASEURL", "http://localhost:4000")
LLAMA_MODEL = "meta-llama/Llama-Vision-Free"

mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = mongo_client.simforge
missions = db.missions

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
app = FastAPI()
socket_app = socketio.ASGIApp(sio)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/forge")
async def forge_mission(payload: ForgePayload):
    # Get thread data from mock API
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{THREADS_BASEURL}/threads/{payload.thread_text}")
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Thread not found")
        thread_data = response.json()

    # Call Llama API based on image presence
    if payload.image_url:
        # Call Llama Vision API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                LLAMA_ENDPOINT,
                headers={"Authorization": f"Bearer {LLAMA_API_KEY}"},
                json={
                    "model": LLAMA_MODEL,
                    "image_url": payload.image_url,
                    "text": thread_data["text"]
                }
            )
    else:
        # Call Llama Text API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                LLAMA_ENDPOINT,
                headers={"Authorization": f"Bearer {LLAMA_API_KEY}"},
                json={
                    "model": LLAMA_MODEL,
                    "text": thread_data["text"]
                }
            )
    
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Llama API error")
    
    mission_params = response.json()
    mission_meta = MissionMeta(**mission_params)
    
    # Generate mission name and write file
    mission_name = f"simforge_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    mission_path = write_mission(mission_name, mission_meta)
    
    # Launch VelociDrone
    subprocess.Popen(["open", "/Applications/VelociDrone.app", "--args", "-start"])
    
    # Save to MongoDB
    mission_entry = MissionEntry(
        mission_name=mission_name,
        meta=mission_meta,
        created=datetime.now(),
        scores=[]
    )
    await missions.insert_one(mission_entry.dict())
    
    return {"mission_name": mission_name, "created": mission_entry.created}

@app.post("/telemetry")
async def record_telemetry(payload: TelemetryPayload):
    # Update scores in MongoDB
    await missions.update_one(
        {"mission_name": payload.mission},
        {"$push": {"scores": {
            "pilot": payload.pilot,
            "lap_time_sec": payload.lap_time_sec,
            "timestamp": datetime.now()
        }}}
    )
    
    # Emit socket.io event
    await sio.emit("score_update", {
        "mission": payload.mission,
        "pilot": payload.pilot,
        "lap_time_sec": payload.lap_time_sec
    })
    
    return {"status": "success"}

@app.get("/missions")
async def get_missions():
    cursor = db.missions.find().sort("created", -1)
    items = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        items.append(doc)
    return items

# Mount socket.io app
app.mount("/socket.io", socket_app)
