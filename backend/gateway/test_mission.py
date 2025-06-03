from mission_compiler import write_mission

def test_mission():
    """Generate and launch a test mission in SkyDive."""
    mission_name = "Test Mission"
    gates = [
        {
            "type": "gate",
            "x": 0,
            "y": 0,
            "z": 10,
            "yaw": 0
        },
        {
            "type": "gate",
            "x": 20,
            "y": 0,
            "z": 15,
            "yaw": 45
        },
        {
            "type": "gate",
            "x": 40,
            "y": 0,
            "z": 20,
            "yaw": 90
        },
        {
            "type": "gate",
            "x": 60,
            "y": 0,
            "z": 15,
            "yaw": 135
        },
        {
            "type": "gate",
            "x": 80,
            "y": 0,
            "z": 10,
            "yaw": 180
        }
    ]
    
    result = write_mission(mission_name, gates, laps=3, terrain="city")
    print(f"Mission compilation result: {result}")

if __name__ == "__main__":
    test_mission() 