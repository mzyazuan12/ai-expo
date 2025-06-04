from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ForgePayload(BaseModel):
    thread_text: str
    image_url: Optional[str] = None
    environment: str = "stadium"
    tags: Optional[List[str]] = None
    trl: Optional[int] = None
    urgency: Optional[str] = None
    domain: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None

class MissionMeta(BaseModel):
    terrain: str
    threats: List[str] = []
    wind_kts: int
    laps: int
    tags: List[str] = []
    trl: int = 1
    urgency: str = "low"
    domain: str = "general"

class TelemetryPayload(BaseModel):
    mission: str
    pilot: str
    lap_time_sec: float

class MissionEntry(BaseModel):
    mission_name: str
    meta: MissionMeta
    created: datetime
    scores: list
    upvotes: int = 0

class Challenge(BaseModel):
    title: str
    body_md: str
    tags: List[str] = []
    trl: int = 1
    urgency: str = "low"
    domain: str = "general"
    state: str = "pending" # pending | whitelisted | rejected
    redactions: List[str] = []
    # author_uid will be added by the backend
    # created will be added by the backend
