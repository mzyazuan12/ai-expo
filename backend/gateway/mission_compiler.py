from textwrap import dedent
from pathlib import Path
from datetime import datetime
import json, subprocess, os

from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT              = Path(__file__).resolve().parents[2]      # ai-expo/
WB_TPL_DIR        = ROOT / "webots" / "mission_templates"
WB_WORLD_DIR      = ROOT / "webots" / "worlds"
WB_WORLD_DIR.mkdir(parents=True, exist_ok=True)

env = Environment(
    loader=FileSystemLoader(str(WB_TPL_DIR)),
    autoescape=select_autoescape()
)

def write_wbt(mission_name: str, meta: dict) -> Path:
    """Render .wbt from template + mission meta, return absolute path"""
    tpl  = env.get_template("wb_base.wbt.j2")

    # Process gates to ensure all required fields exist
    gates = meta.get("gates", [])
    for gate in gates:
        # Ensure all required fields exist with defaults if missing
        if "x" not in gate: gate["x"] = 0
        if "y" not in gate: gate["y"] = 0
        if "z" not in gate: gate["z"] = 0
        if "yaw" not in gate: gate["yaw"] = 0
    
    # very naive camera: 12 m behind first gate or origin
    g0 = gates[0] if gates else {"x": 0, "y": 0, "z": 0}
    cam = dict(cam_x=g0["x"], cam_y=5, cam_z=g0["z"] + 12)

    world_txt = tpl.render(
        world_name   = mission_name,
        mission_id   = meta["mission_id"],
        background_tex = "textures/stadium.jpg",
        gates        = gates,
        **cam
    )

    out_path = WB_WORLD_DIR / f"{mission_name}.wbt"
    out_path.write_text(world_txt)
    return out_path

def launch_webots(world_path: Path):
    webots_dir = Path("/Applications/Webots.app/Contents/MacOS/webots")
    if not webots_dir.exists():
        raise RuntimeError("Webots not found at expected location")

    # Set WEBOTS_EXTRA_PROTO_PATH to point to our protos directory
    os.environ["WEBOTS_EXTRA_PROTO_PATH"] = str(Path(__file__).resolve().parents[2] / "webots" / "protos")
    
    # Launch Webots with the absolute path to the world file
    subprocess.Popen([str(webots_dir), str(world_path)])

# helper used by FastAPI endpoint
def build_and_launch_wbt(mission_doc: dict):
    world_path = write_wbt(mission_doc["mission_name"], mission_doc["meta"] | {"mission_id": mission_doc["_id"]})
    launch_webots(world_path)
    return world_path
