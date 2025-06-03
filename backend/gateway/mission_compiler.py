from datetime import datetime
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from typing import Dict, Tuple
import os
import json
import subprocess

TEMPLATE_DIR = Path(__file__).parent / "mission_templates"
SKYDIVE_TRACK_DIR = Path.home() / "Library/Application Support/FPV SkyDive/tracks"

env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

STEAM_APP_ID = "1278060"  # FPV SkyDive Free Steam App ID

def write_mission(meta: Dict) -> Tuple[str, Path]:
    mission_name = f"Test Mission {datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Create a simple zigzag pattern with 5 gates
    gates = [
        {"position": [0, 0, 10], "yaw": 0},
        {"position": [20, 0, 15], "yaw": 45},
        {"position": [40, 0, 20], "yaw": 90},
        {"position": [60, 0, 15], "yaw": 135},
        {"position": [80, 0, 10], "yaw": 180}
    ]
    
    # Ensure the SkyDive tracks directory exists
    os.makedirs(SKYDIVE_TRACK_DIR, exist_ok=True)
    
    # Create mission data
    mission_data = {
        "name": mission_name,
        "gates": gates,
        "laps": meta.get("laps", 3),
        "terrain": meta.get("terrain", "city")
    }
    
    # Save the mission file
    mission_file = SKYDIVE_TRACK_DIR / f"{mission_name}.json"
    with open(mission_file, "w") as f:
        json.dump(mission_data, f, indent=2)
    
    print(f"Mission saved to {mission_file}")
    
    # Launch FPV SkyDive
    subprocess.Popen(["open", "/Applications/FPV Skydive.app", "--args", "-start"])
    
    return mission_name, mission_file
