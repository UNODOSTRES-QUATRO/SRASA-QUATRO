import { describe, it, expect } from "vitest";
import {
  createInitialVehicleState,
  updateVehiclePhysics,
  DEFAULT_VEHICLE_CONFIG,
} from "../src/game/vehicle/vehiclePhysics";
import { VehicleInput } from "../src/game/vehicle/vehicleTypes";

describe("Vehicle Physics Engine", () => {
  it("should initialize vehicle at rest", () => {
    const state = createInitialVehicleState();
    expect(state.speed).toBe(0);
    expect(state.position).toEqual({ x: 0, y: 0.35, z: 0 });
    expect(state.heading).toBe(0);
  });

  it("should accelerate forward when forward input is active", () => {
    const state = createInitialVehicleState();
    const input: VehicleInput = {
      forward: true,
      backward: false,
      left: false,
      right: false,
      brake: false,
    };
    const nextState = updateVehiclePhysics(state, input, 0.1, DEFAULT_VEHICLE_CONFIG);
    expect(nextState.speed).toBeGreaterThan(0);
    expect(nextState.speed).toBeLessThanOrEqual(DEFAULT_VEHICLE_CONFIG.maxSpeed);
  });

  it("should decelerate due to drag when no input is pressed", () => {
    const state = { ...createInitialVehicleState(), speed: 10 };
    const input: VehicleInput = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
    };
    const nextState = updateVehiclePhysics(state, input, 0.1, DEFAULT_VEHICLE_CONFIG);
    expect(nextState.speed).toBeLessThan(10);
  });

  it("should steer with inertia and change heading when moving", () => {
    const state = { ...createInitialVehicleState(), speed: 5 };
    const input: VehicleInput = {
      forward: true,
      backward: false,
      left: true,
      right: false,
      brake: false,
    };
    const nextState = updateVehiclePhysics(state, input, 0.1, DEFAULT_VEHICLE_CONFIG);
    expect(nextState.steeringAngle).toBeGreaterThan(0);
    expect(nextState.heading).not.toBe(0);
  });

  it("should brake effectively when brake input is active", () => {
    const state = { ...createInitialVehicleState(), speed: 8 };
    const input: VehicleInput = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: true,
    };
    const nextState = updateVehiclePhysics(state, input, 0.1, DEFAULT_VEHICLE_CONFIG);
    expect(nextState.speed).toBeLessThan(8);
  });
});
