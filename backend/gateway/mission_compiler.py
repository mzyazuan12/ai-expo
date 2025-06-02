from datetime import datetime
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from typing import Dict, Tuple

TEMPLATE_DIR = Path(__file__).parent / "mission_templates"
MISSION_DIR = Path.home() / "Library/Application Support/VelociDrone/tracks/custom"

env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

def write_mission(data: Dict) -> Tuple[str, str]:
    name = f"{data.get('terrain','mission')}-{int(datetime.utcnow().timestamp())}"
    safe_name = ''.join(c for c in name if c.isalnum() or c in '-_')
    template = env.get_template('fpv_base.mission')
    content = template.render(**data)
    MISSION_DIR.mkdir(parents=True, exist_ok=True)
    path = MISSION_DIR / f"{safe_name}.mission"
    path.write_text(content)
    return safe_name, str(path)
