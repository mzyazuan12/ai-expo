import os
import jinja2
from pathlib import Path
from .models import MissionMeta

def write_mission(mission_name: str, meta: MissionMeta) -> str:
    """Generate a VelociDrone mission file from template and meta data."""
    # Setup Jinja2 environment
    template_dir = Path(__file__).parent / "mission_templates"
    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader(str(template_dir)),
        autoescape=True
    )
    template = env.get_template("fpv_base.mission")
    
    # Render mission file
    mission_content = template.render(
        mission_name=mission_name,
        terrain=meta.terrain,
        threats=meta.threats,
        wind_kts=meta.wind_kts,
        laps=meta.laps
    )
    
    # Ensure VelociDrone custom tracks directory exists
    velodirone_dir = Path.home() / "Library/Application Support/VelociDrone/tracks/custom"
    velodirone_dir.mkdir(parents=True, exist_ok=True)
    
    # Write mission file
    mission_path = velodirone_dir / f"{mission_name}.mission"
    mission_path.write_text(mission_content)
    
    return str(mission_path)
