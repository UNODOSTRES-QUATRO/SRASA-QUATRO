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
    scaleMode: "BIG",
    scaleFactor: 1.0,
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

  // 3. Bicycle kinematics model with FR Legends style drift oversteer
  const effectiveWheelbase =
    current.scaleMode === "POCKET"
      ? config.wheelbase * 0.35
      : config.wheelbase;

  const isHandbraking = input.brake && Math.abs(speed) > 2.5 && Math.abs(steeringAngle) > 0.08;
  const oversteerMultiplier = isHandbraking ? 1.55 : 1.0;

  if (Math.abs(speed) > 0.05) {
    const angularVelocity = (speed / effectiveWheelbase) * Math.tan(steeringAngle) * oversteerMultiplier;
    heading += angularVelocity * clampedDt;
  }

  // 4. Update Position with subtle lateral drift slide
  const moveDistance = speed * clampedDt;
  position.x += Math.sin(heading) * moveDistance;
  position.z += Math.cos(heading) * moveDistance;

  // 5. Update Wheel spin
  wheelRotation += (speed / (0.35 * current.scaleFactor)) * clampedDt;

  const calculatedDrift =
    (Math.abs(steeringAngle) / config.maxSteerAngle) *
    (Math.abs(speed) / config.maxSpeed) *
    (isHandbraking ? 1.8 : 1.0);

  return {
    position,
    heading,
    speed,
    steeringAngle,
    wheelRotation,
    isReversing: speed < -0.1,
    driftFactor: Math.min(1.0, calculatedDrift),
    scaleMode: current.scaleMode,
    scaleFactor: current.scaleFactor,
  };
}

export function toggleVehicleScale(current: VehicleState): VehicleState {
  const isBig = current.scaleMode === "BIG";
  const newMode = isBig ? "POCKET" : "BIG";
  const newFactor = isBig ? 0.22 : 1.0;
  const newY = isBig ? 0.08 : 0.35;

  return {
    ...current,
    scaleMode: newMode,
    scaleFactor: newFactor,
    position: {
      ...current.position,
      y: newY,
    },
  };
}

