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
}

export interface VehicleState {
  position: Vector3D;
  heading: number; // yaw angle in radians
  speed: number;   // units per second
  steeringAngle: number; // current front wheel turn angle
  wheelRotation: number; // spinning wheel angle
  isReversing: boolean;
  driftFactor: number;
}
