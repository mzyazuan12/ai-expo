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
    environment: str = "general"
    state: str = "draft"  # draft | pending_review | approved | rejected | archived
    redactions: List[str] = []
    author_uid: str
    author_name: Optional[str] = None
    is_anonymous: bool = False
    created: str
    updated: str
    upvotes: int = 0
    video_url: Optional[str] = None
    solutions: List[dict] = []
    moderators: List[str] = []
    review_notes: Optional[str] = None
    classification_level: str = "unclassified"  # unclassified | confidential | secret | top_secret
    verification_required: bool = False
    allowed_provider_types: List[str] = ["academia", "startup", "industry"]
    required_clearance_level: Optional[str] = None
    threats: Optional[List[str]] = None
    wind_kts: Optional[int] = None
    laps: Optional[int] = None
