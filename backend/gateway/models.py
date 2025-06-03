from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

class ForgePayload(BaseModel):
    thread_text: str
    image_url: Optional[str] = None
    tags: List[str] = []
    trl: Optional[int] = 1
    urgency: Optional[str] = "low"
    domain: Optional[str] = "general"
    environment: Optional[str] = "stadium"

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
