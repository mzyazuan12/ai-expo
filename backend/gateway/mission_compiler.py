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

def write_mission(output_path: str, meta: Dict) -> None:
    # Read the template
    with open(TEMPLATE_DIR / "fpv_base_skydive.json", "r") as f:
        template = f.read()
    
    # Extract mission name from the output_path for the template
    mission_name_from_path = Path(output_path).stem.split(".skydive")[-2]
    
    # Create gates
    gates = [
        {"type": "gate", "x": 0, "y": 0, "z": 10, "yaw": 0},
        {"type": "gate", "x": 20, "y": 0, "z": 15, "yaw": 45},
        {"type": "gate", "x": 40, "y": 0, "z": 20, "yaw": 90},
        {"type": "gate", "x": 60, "y": 0, "z": 15, "yaw": 135},
        {"type": "gate", "x": 80, "y": 0, "z": 10, "yaw": 180}
    ]
    
    # Format gates as JSON
    gates_json = json.dumps([{
        "id": i + 1,
        "type": gate["type"],
        "pos": [gate["x"], gate["y"], gate["z"]],
        "rot": [0, gate["yaw"], 0]
    } for i, gate in enumerate(gates)])
    
    # Replace placeholders
    content = template.replace("MISSION_NAME", mission_name_from_path)
    content = content.replace("TERRAIN", meta.get("terrain", "city"))
    content = content.replace("3", str(meta.get("laps", 3)))
    content = content.replace("[]", gates_json)
    
    # Write the file
    with open(output_path, "w") as f:
        f.write(content)
