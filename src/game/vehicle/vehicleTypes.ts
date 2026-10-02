export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface VehicleInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}

export interface VehicleConfig {
  maxSpeed: number;
  maxReverseSpeed: number;
  acceleration: number;
  reverseAcceleration: number;
  brakingDeceleration: number;
  naturalDrag: number;
  maxSteerAngle: number; // in radians
  steerSpeed: number;
  steerReturnSpeed: number;
  wheelbase: number;
  // Drift physics
  gripFactor: number;       // 0..1, how much lateral grip (1 = no slip)
  handbrakeGrip: number;    // 0..1, reduced grip during handbrake
  driftAngularMomentum: number; // rotational inertia coefficient
}

export interface VehicleState {
  position: Vector3D;
  heading: number; // yaw angle in radians
  speed: number;   // units per second (forward/back)
  lateralSpeed: number; // sideways sliding speed (units/s)
  angularVelocity: number; // yaw rate (rad/s), for momentum drift
  steeringAngle: number; // current front wheel turn angle
  wheelRotation: number; // spinning wheel angle
  isReversing: boolean;
  driftFactor: number;    // 0..1 visual drift intensity
  isHandbraking: boolean;
  scaleMode: "BIG" | "POCKET";
  scaleFactor: number; // 1.0 for BIG, 0.22 for POCKET
  doorAngle?: number; // 0 = closed, ~1.1 rad = fully open
}

export type CameraMode = "CHASE" | "COCKPIT";
