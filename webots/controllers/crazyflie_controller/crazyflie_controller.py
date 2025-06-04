from controller import Robot, Motor
import sys

# Get robot instance
robot = Robot()
timestep = int(robot.getBasicTimeStep())

# Get motor devices
motors = []
motor_names = ["m1_motor", "m2_motor", "m3_motor", "m4_motor"]
for name in motor_names:
    motor = robot.getDevice(name)
    if motor is None:
        print(f"Error: Motor '{name}' not found. Ensure your Crazyflie PROTO has these motors defined.")
        sys.exit()
    motor.setPosition(float('inf'))
    motor.setVelocity(0.0)
    motors.append(motor)

print("Crazyflie controller started.")

# Main loop:
while robot.step(timestep) != -1:
    # Simple example: make the motors spin (this won't make it fly yet)
    for motor in motors:
        motor.setVelocity(10.0)

    # TODO: Implement flight control logic here
    pass 