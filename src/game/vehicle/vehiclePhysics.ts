import { VehicleConfig, VehicleInput, VehicleState } from "./vehicleTypes";

export const DEFAULT_VEHICLE_CONFIG: VehicleConfig = {
  maxSpeed: 18.0,
  maxReverseSpeed: 6.0,
  acceleration: 10.0,
  reverseAcceleration: 5.0,
  brakingDeceleration: 18.0,
  naturalDrag: 3.5,
  maxSteerAngle: Math.PI / 6, // 30 degrees
  steerSpeed: 4.0,
  steerReturnSpeed: 6.0,
  wheelbase: 2.2,
};

export function createInitialVehicleState(): VehicleState {
  return {
    position: { x: 0, y: 0.35, z: 0 },
    heading: 0,
    speed: 0,
    steeringAngle: 0,
    wheelRotation: 0,
    isReversing: false,
    driftFactor: 0,
  };
}

export function updateVehiclePhysics(
  current: VehicleState,
  input: VehicleInput,
  dt: number,
  config: VehicleConfig = DEFAULT_VEHICLE_CONFIG
): VehicleState {
  const clampedDt = Math.min(dt, 0.1);
  let { speed, heading, steeringAngle, wheelRotation } = current;
  const position = { ...current.position };

  // 1. Calculate steering angle
  let targetSteer = 0;
  if (input.left) targetSteer += config.maxSteerAngle;
  if (input.right) targetSteer -= config.maxSteerAngle;

  if (targetSteer !== 0) {
    const steerRate = config.steerSpeed * clampedDt;
    if (steeringAngle < targetSteer) {
      steeringAngle = Math.min(targetSteer, steeringAngle + steerRate);
    } else {
      steeringAngle = Math.max(targetSteer, steeringAngle - steerRate);
    }
  } else {
    const returnRate = config.steerReturnSpeed * clampedDt;
    if (Math.abs(steeringAngle) <= returnRate) {
      steeringAngle = 0;
    } else if (steeringAngle > 0) {
      steeringAngle -= returnRate;
    } else {
      steeringAngle += returnRate;
    }
  }

  // 2. Acceleration / Braking / Drag
  if (input.brake) {
    if (speed > 0) {
      speed = Math.max(0, speed - config.brakingDeceleration * clampedDt);
    } else if (speed < 0) {
      speed = Math.min(0, speed + config.brakingDeceleration * clampedDt);
    }
  } else if (input.forward) {
    if (speed < 0) {
      speed += config.brakingDeceleration * clampedDt;
    } else {
      speed = Math.min(config.maxSpeed, speed + config.acceleration * clampedDt);
    }
  } else if (input.backward) {
    if (speed > 0) {
      speed -= config.brakingDeceleration * clampedDt;
    } else {
      speed = Math.max(-config.maxReverseSpeed, speed - config.reverseAcceleration * clampedDt);
    }
  } else {
    const drag = config.naturalDrag * clampedDt;
    if (Math.abs(speed) <= drag) {
      speed = 0;
    } else if (speed > 0) {
      speed -= drag;
    } else {
      speed += drag;
    }
  }

  // 3. Bicycle kinematics model for smooth vehicle turning
  if (Math.abs(speed) > 0.05) {
    const angularVelocity = (speed / config.wheelbase) * Math.tan(steeringAngle);
    heading += angularVelocity * clampedDt;
  }

  // 4. Update Position
  const moveDistance = speed * clampedDt;
  position.x += Math.sin(heading) * moveDistance;
  position.z += Math.cos(heading) * moveDistance;

  // 5. Update Wheel spin
  wheelRotation += (speed / 0.35) * clampedDt;

  return {
    position,
    heading,
    speed,
    steeringAngle,
    wheelRotation,
    isReversing: speed < -0.1,
    driftFactor: Math.abs(steeringAngle) * (Math.abs(speed) / config.maxSpeed),
  };
}
