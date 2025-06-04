from controller import Supervisor
import os, requests, json
import sys
import time

# Configuration
BACKEND_URL = os.getenv("SIMFORGE_API", "http://localhost:8000")
TELEMETRY_URL = f"{BACKEND_URL}/telemetry"
MISSION_DETAIL_URL_TEMPLATE = f"{BACKEND_URL}/missions/{{}}"
MISSION_COMPLETION_URL_TEMPLATE = f"{BACKEND_URL}/missions/{{}}/complete"
MISSION_FAILURE_URL_TEMPLATE = f"{BACKEND_URL}/missions/{{}}/fail"

MISSION_ID = "local_mission"
PILOT = os.getenv("USERNAME", "local")

# Parse MISSION_ID from controller arguments
# Expected format: controllerArgs "MISSION_ID=your_mission_id"
if len(sys.argv) > 1:
    for arg in sys.argv[1:]:
        if arg.startswith("MISSION_ID="):
            MISSION_ID = arg.split("=", 1)[1]
            break

# Initialize Supervisor
sup = Supervisor()
dt = int(sup.getBasicTimeStep())

drone = sup.getFromDef("CF1")  # assumes Crazyflie robot in world
if drone is None:
    print("Error: CF1 drone not found in world. Exiting supervisor.")
    sup.simulationQuit(1)
    sys.exit()

# Fetch mission details from backend
mission_details = None
if MISSION_ID and MISSION_ID != "local_mission":
    try:
        response = requests.get(MISSION_DETAIL_URL_TEMPLATE.format(MISSION_ID))
        response.raise_for_status() # Raise an exception for bad status codes
        mission_details = response.json()
        print(f"[Supervisor] Fetched mission details for {MISSION_ID}")
    except requests.exceptions.RequestException as e:
        print(f"[Supervisor] Error fetching mission details for {MISSION_ID}: {e}")
        # Continue with default behavior or exit if mission details are crucial
        mission_details = None # Ensure it's None if fetching fails

# Mission parameters (use fetched details or defaults)
gates = mission_details.get("meta", {}).get("gates", []) if mission_details else []
laps_required = mission_details.get("meta", {}).get("laps", 1) if mission_details else 1

print(f"[Supervisor] Mission has {len(gates)} gates and requires {laps_required} laps.")

# Gate tracking variables
current_checkpoint_index = 0
laps_completed = 0
checkpoint_times = []
lap_start_time = sup.getTime()
last_checkpoint_time = lap_start_time
last_drone_position = None # To detect if the drone is stuck or for entry detection
STUCK_THRESHOLD = 5 # seconds
last_movement_time = sup.getTime()
MISSION_TIMEOUT = mission_details.get("meta", {}).get("timeout_sec", 600) if mission_details else 600 # Default to 10 minutes
current_lap_invalid = False # Flag to indicate if the current lap is invalid

# Crash detection variables
last_velocity = [0, 0, 0]
VELOCITY_CHANGE_THRESHOLD = 10.0 # meters/second - tune this based on expected speeds
ALTITUDE_THRESHOLD = -0.1 # meters - assuming ground is at z=0, allow a small margin below

# Find gate nodes and calculate bounding boxes
gate_nodes = []
gate_bounds = []
# Define a margin around the gate for the trigger zone
GATE_TRIGGER_MARGIN = 1.0 # meters

for i, gate in enumerate(gates):
    gate_node = sup.getFromDef(f"Gate_{i+1}")
    if gate_node:
        gate_nodes.append(gate_node)
        # Calculate a simple bounding box around the gate
        # This assumes gates are oriented upright and roughly cubic/spherical
        # A more accurate approach would involve getting the node's actual bounding box
        position = gate_node.getPosition()
        # Using a fixed size for simplicity; ideally, get this from the gate node's geometry
        size = [0.5, 0.5, 0.5] # Assuming a gate size of 0.5m in all dimensions from the template
        min_bound = [p - s/2.0 - GATE_TRIGGER_MARGIN for p, s in zip(position, size)]
        max_bound = [p + s/2.0 + GATE_TRIGGER_MARGIN for p, s in zip(position, size)]
        gate_bounds.append((min_bound, max_bound))

    else:
        print(f"[Supervisor] Warning: Gate_{i+1} not found in world.")
        # Handle missing gates
        # For now, we'll continue, but this should be improved.


# Function to check if drone position is within a bounding box
def is_within_bounds(position, bounds):
    min_bound, max_bound = bounds
    return (position[0] > min_bound[0] and position[0] < max_bound[0] and
            position[1] > min_bound[1] and position[1] < max_bound[1] and
            position[2] > min_bound[2] and position[2] < max_bound[2])

# Simulation loop
while sup.step(dt) != -1:
    current_time = sup.getTime()

    if not gate_nodes:
        # No gates defined
        pass # Keep simulation running if no gates

    drone_position = drone.getPosition()
    current_velocity = drone.getVelocity() # Assuming the drone node has getVelocity method

    # Crash detection
    # Check for sudden large velocity change or hitting the ground
    velocity_change_magnitude = sum([(current_velocity[i] - last_velocity[i])**2 for i in range(3)])**0.5
    if velocity_change_magnitude > VELOCITY_CHANGE_THRESHOLD or drone_position[2] < ALTITUDE_THRESHOLD:
        print("[Supervisor] Crash detected! Ending simulation.")
        # Signal backend about mission failure due to crash
        if MISSION_ID and MISSION_ID != "local_mission":
            try:
                requests.post(MISSION_FAILURE_URL_TEMPLATE.format(MISSION_ID), json={"reason": "crash"})
                print("[Supervisor] Mission failure (crash) signaled to backend.")
            except requests.exceptions.RequestException as e:
                print(f"[Supervisor] Error signaling mission failure: {e}")
        sup.simulationQuit(1)
        sys.exit()
    last_velocity = current_velocity

    # Basic stuck detection: if drone hasn't moved significantly for a while
    if last_drone_position is not None:
        distance_moved = ((drone_position[0] - last_drone_position[0])**2 +
                          (drone_position[1] - last_drone_position[1])**2 +
                          (drone_position[2] - last_drone_position[2])**2)**0.5
        if distance_moved > 0.05: # Define a small movement threshold (e.g., 5 cm)
            last_movement_time = current_time
        elif current_time - last_movement_time > STUCK_THRESHOLD:
            print("[Supervisor] Drone appears to be stuck. Ending simulation.")
            # Signal backend about mission failure due to being stuck
            if MISSION_ID and MISSION_ID != "local_mission":
                try:
                    requests.post(MISSION_FAILURE_URL_TEMPLATE.format(MISSION_ID), json={"reason": "stuck"})
                    print("[Supervisor] Mission failure (stuck) signaled to backend.")
                except requests.exceptions.RequestException as e:
                    print(f"[Supervisor] Error signaling mission failure: {e}")
            sup.simulationQuit(1)
            sys.exit()
    
    # Checkpoint detection using bounding boxes and sequence
    if current_checkpoint_index < len(gate_nodes):
        next_gate_bounds = gate_bounds[current_checkpoint_index]

        # Refined checkpoint detection: check for entry into the bounding box in the correct sequence
        was_outside = last_drone_position is None or not is_within_bounds(last_drone_position, next_gate_bounds)
        is_inside = is_within_bounds(drone_position, next_gate_bounds)

        if was_outside and is_inside:
            # Check if this is the correct gate in the sequence
            if current_checkpoint_index < len(gate_nodes):
                print(f"[Supervisor] Passed Checkpoint {current_checkpoint_index + 1}!")
                checkpoint_time = current_time - last_checkpoint_time
                checkpoint_times.append(checkpoint_time)
                last_checkpoint_time = current_time
                current_checkpoint_index += 1

                # If all checkpoints for a lap are passed
                if current_checkpoint_index == len(gate_nodes):
                    lap_time = current_time - lap_start_time
                    print(f"[Supervisor] Lap {laps_completed + 1} completed in {lap_time:.2f} seconds!")

                    # Only register a valid lap if not marked invalid
                    if not current_lap_invalid:
                        # Send lap time telemetry
                        if MISSION_ID and MISSION_ID != "local_mission":
                            try:
                                requests.post(TELEMETRY_URL, json={
                                    "mission": MISSION_ID,
                                    "pilot": PILOT,
                                    "lap_time_sec": lap_time,
                                    "checkpoint_times_sec": checkpoint_times[-len(gate_nodes):],
                                    "status": "running" # Indicate simulation is still running
                                })
                                print("[Supervisor] Telemetry sent.")
                            except requests.exceptions.RequestException as e:
                                print(f"[Supervisor] Error sending telemetry: {e}")

                        laps_completed += 1
                        print(f"[Supervisor] Valid laps completed: {laps_completed}/{laps_required}")
                    else:
                        print("[Supervisor] Lap invalidated due to out-of-sequence gate.")
                        # TODO: Consider sending telemetry about invalidated lap or penalty

                    # Reset for next lap
                    current_checkpoint_index = 0
                    lap_start_time = current_time
                    last_checkpoint_time = current_time # Reset last checkpoint time for the new lap
                    current_lap_invalid = False # Reset lap invalid flag
                    # Clear checkpoint times for the completed lap
                    checkpoint_times = [] # This clears all previous times, might need adjustment if tracking overall times

                    # Check for mission completion
                    if laps_completed >= laps_required:
                        print(f"[Supervisor] Mission {MISSION_ID} completed!\nTotal time: {current_time:.2f} seconds")
                        # Signal backend about mission completion
                        if MISSION_ID and MISSION_ID != "local_mission":
                            try:
                                requests.post(MISSION_COMPLETION_URL_TEMPLATE.format(MISSION_ID))
                                print("[Supervisor] Mission completion signaled to backend.")
                            except requests.exceptions.RequestException as e:
                                print(f"[Supervisor] Error signaling mission completion: {e}")

                        sup.simulationQuit(0)
                        sys.exit()
            else:
                # Passed a gate out of sequence - check if it's any gate beyond the current expected one
                # A more robust check would involve checking against all gates *after* the current_checkpoint_index
                # For simplicity now, we'll just mark the lap as invalid if *any* gate is hit out of order.
                # This simple check needs refinement for complex courses.
                is_any_gate_bounds = False
                for i, bounds in enumerate(gate_bounds):
                    if i != current_checkpoint_index and is_within_bounds(drone_position, bounds):
                        is_any_gate_bounds = True
                        break

                if is_any_gate_bounds:
                    print(f"[Supervisor] Passed a gate out of sequence. Marking current lap as invalid.")
                    current_lap_invalid = True
                    # No change to current_checkpoint_index, still waiting for the correct one.

    # Update last_drone_position at the end of the loop iteration
    last_drone_position = drone_position

    # Mission timeout check
    if current_time - lap_start_time > MISSION_TIMEOUT:
        print(f"[Supervisor] Simulation time limit ({MISSION_TIMEOUT} seconds) reached. Ending simulation.")
        # Signal backend about mission failure due to timeout
        if MISSION_ID and MISSION_ID != "local_mission":
            try:
                requests.post(MISSION_FAILURE_URL_TEMPLATE.format(MISSION_ID), json={"reason": "timeout"})
                print("[Supervisor] Mission failure (timeout) signaled to backend.")
            except requests.exceptions.RequestException as e:
                print(f"[Supervisor] Error signaling mission failure: {e}")
        sup.simulationQuit(1) # Exit with non-zero code for failure
        sys.exit()

    # TODO: Add logic for other mission objectives or failure conditions (e.g., going out of bounds if a mission area is defined)

# End of simulation loop

 