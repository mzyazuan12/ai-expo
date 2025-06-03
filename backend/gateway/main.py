import os
from datetime import datetime
from fastapi import FastAPI
import httpx
import motor.motor_asyncio
from models import ForgePayload, TelemetryPayload
from mission_compiler import write_mission
import socketio
import subprocess
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get environment variables with defaults
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
LLAMA_ENDPOINT = os.getenv("LLAMA_ENDPOINT", "http://localhost:11434")
LLAMA_API_KEY = os.getenv("LLAMA_API_KEY", "")

mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = mongo_client.simforge

# Create FastAPI app
app = FastAPI()

# Create SocketIO server
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# Mount SocketIO app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

@app.post("/forge")
async def forge(payload: ForgePayload):
    headers = {"Authorization": f"Bearer {LLAMA_API_KEY}"}
    data = {"prompt": payload.thread_text}
    if payload.image_url:
        data["image_url"] = payload.image_url
    async with httpx.AsyncClient() as client:
        res = await client.post(LLAMA_ENDPOINT, json=data, headers=headers)
        res.raise_for_status()
        meta = res.json()
    mission_name, path = write_mission(meta)
    subprocess.Popen(["open", "/Applications/FPV Skydive.app", "--args", "-start"])
    doc = {
        "mission_name": mission_name,
        "meta": meta,
        "created": datetime.utcnow(),
        "scores": []
    }
    await db.missions.insert_one(doc)
    return {"mission_name": mission_name, "created": doc["created"]}

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
        items.append(doc)
    return items

# Export the SocketIO app for uvicorn
application = socket_app
