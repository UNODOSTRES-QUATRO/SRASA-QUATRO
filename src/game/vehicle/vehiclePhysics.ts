import { VehicleConfig, VehicleInput, VehicleState } from "./vehicleTypes";

export const DEFAULT_VEHICLE_CONFIG: VehicleConfig = {
  maxSpeed: 25.0,          // Punchy highway top speed
  maxReverseSpeed: 7.0,
  acceleration: 14.5,      // Responsive instant torque
  reverseAcceleration: 6.0,
  brakingDeceleration: 16.0,
  naturalDrag: 2.8,
  maxSteerAngle: Math.PI / 5.2, // ~35 degrees – quick and agile
  steerSpeed: 6.5,
  steerReturnSpeed: 8.5,
  wheelbase: 2.2,
  // Drift physics
  gripFactor: 0.85,        // Solid straight grip, smooth break-away
  handbrakeGrip: 0.16,     // Very loose on handbrake flick
  driftAngularMomentum: 0.76, // Smooth momentum carry through corners
};

export function createInitialVehicleState(): VehicleState {
  return {
    position: { x: 0, y: 0.35, z: 0 },
    heading: 0,
    speed: 0,
    lateralSpeed: 0,
    angularVelocity: 0,
    steeringAngle: 0,
    wheelRotation: 0,
    isReversing: false,
    isHandbraking: false,
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
  const clampedDt = Math.min(dt, 0.05);
  let { speed, heading, steeringAngle, wheelRotation, lateralSpeed, angularVelocity } = current;
  const position = { ...current.position };

  // ─── 1. STEERING ─────────────────────────────────────────────────────────────
  let targetSteer = 0;
  if (input.left) targetSteer += config.maxSteerAngle;
  if (input.right) targetSteer -= config.maxSteerAngle;

  if (targetSteer !== 0) {
    const steerRate = config.steerSpeed * clampedDt;
    steeringAngle =
      steeringAngle < targetSteer
        ? Math.min(targetSteer, steeringAngle + steerRate)
        : Math.max(targetSteer, steeringAngle - steerRate);
  } else {
    const returnRate = config.steerReturnSpeed * clampedDt;
    if (Math.abs(steeringAngle) <= returnRate) {
      steeringAngle = 0;
    } else {
      steeringAngle -= Math.sign(steeringAngle) * returnRate;
    }
  }

  // ─── 2. LONGITUDINAL VELOCITY ─────────────────────────────────────────────
  const isHandbraking = input.brake && Math.abs(speed) > 2.5;

  if (input.brake) {
    // If fast, handbrake initiates drift while preserving momentum
    if (isHandbraking) {
      const brakeRate = config.brakingDeceleration * 0.45 * clampedDt;
      speed = speed > 0 ? Math.max(2.0, speed - brakeRate) : Math.min(-2.0, speed + brakeRate);
    } else {
      // Full stop brake
      if (speed > 0) {
        speed = Math.max(0, speed - config.brakingDeceleration * clampedDt);
      } else if (speed < 0) {
        speed = Math.min(0, speed + config.brakingDeceleration * clampedDt);
      }
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
    speed = Math.abs(speed) <= drag ? 0 : speed - Math.sign(speed) * drag;
  }

  // ─── 3. DRIFT PHYSICS (True slip-angle bicycle model) ───────────────────────
  const effectiveGrip = isHandbraking ? config.handbrakeGrip : config.gripFactor;
  const effectiveWheelbase = current.scaleMode === "POCKET" ? config.wheelbase * 0.35 : config.wheelbase;

  // Desired angular velocity from steering (kinematic bicycle model)
  const desiredAngularVel =
    Math.abs(speed) > 0.05
      ? (speed / effectiveWheelbase) * Math.tan(steeringAngle)
      : 0;

  // Blend actual angular velocity toward desired (grip) or let momentum carry (slide)
  const angularBlend = Math.min(1, clampedDt * (effectiveGrip * 11));
  angularVelocity = angularVelocity + (desiredAngularVel - angularVelocity) * angularBlend;

  // Counter-steer stability assist (FR Legends style flow)
  // Stabilizes slide when driver counter-steers into the drift and keeps forward throttle power
  const isCounterSteering =
    (lateralSpeed > 0.3 && steeringAngle < -0.04) ||
    (lateralSpeed < -0.3 && steeringAngle > 0.04);

  if (isCounterSteering) {
    angularVelocity *= (1.0 - Math.min(0.65, clampedDt * 6.0));
    // Power-slide propulsion when holding throttle
    if (input.forward && Math.abs(speed) < config.maxSpeed * 0.85) {
      speed += config.acceleration * 0.35 * clampedDt;
    }
  }

  // Apply rotation
  heading += angularVelocity * clampedDt;

  // ─── 4. LATERAL VELOCITY (slide/drift) ───────────────────────────────────
  // Centrifugal lateral force from rotation
  const centrifugalLateral = angularVelocity * speed * 0.58;
  const lateralGripDamp = effectiveGrip * 13.0 * clampedDt;
  lateralSpeed += centrifugalLateral * clampedDt;
  lateralSpeed -= lateralSpeed * lateralGripDamp; // dampen toward 0

  // ─── 5. POSITION UPDATE ───────────────────────────────────────────────────
  // Forward/back movement along heading
  const moveForward = speed * clampedDt;
  // Lateral movement (perpendicular to heading) from slide
  const lateralMove = lateralSpeed * clampedDt;

  position.x += Math.sin(heading) * moveForward + Math.cos(heading) * lateralMove;
  position.z += Math.cos(heading) * moveForward - Math.sin(heading) * lateralMove;

  // ─── 6. WHEEL SPIN ────────────────────────────────────────────────────────
  wheelRotation += (speed / (0.35 * current.scaleFactor)) * clampedDt;

  // ─── 7. DRIFT FACTOR (visual & sound) ─────────────────────────────────────
  const slipRatio = Math.abs(lateralSpeed) / (Math.abs(speed) + 0.4);
  const driftFactor = Math.min(1.0, slipRatio * 2.6 * (isHandbraking ? 1.7 : 1.0));

  return {
    position,
    heading,
    speed,
    lateralSpeed,
    angularVelocity,
    steeringAngle,
    wheelRotation,
    isReversing: speed < -0.1,
    isHandbraking,
    driftFactor: Math.min(1.0, driftFactor),
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
