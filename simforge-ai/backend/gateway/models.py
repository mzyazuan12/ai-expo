from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional

class ForgePayload(BaseModel):
    thread_text: str
    image_url: Optional[str] = None

class MissionMeta(BaseModel):
    terrain: str
    threats: List[str] = []
    wind_kts: int
    laps: int

class TelemetryPayload(BaseModel):
    mission: str
    pilot: str
    lap_time_sec: float

class MissionEntry(BaseModel):
    mission_name: str
    meta: MissionMeta
    created: datetime
    scores: list
