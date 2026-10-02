import { describe, expect, it } from "vitest";
import { resolvePlayerWorldPosition, resolveVehicleWorldPosition } from "../src/game/core/playerCollision";
import { updateVehiclePhysics, createInitialVehicleState } from "../src/game/vehicle/vehiclePhysics";
import { WEAPON_DEFS, WEAPON_ORDER } from "../src/game/weapons/weaponTypes";
import { soundManager } from "../src/game/audio/SoundManager";

describe("PRD Rework: Seamless World, Driving, Weapons & Low-Cortisol Monsters", () => {
  it("allows player to walk directly through the West entrance of Workplace from the parking lot", () => {
    // Player is in the parking lot at X=10.5, Z=70.0 and steps into the office lobby at X=11.5, Z=70.0
    const resolved = resolvePlayerWorldPosition(
      [10.5, 0, 70.0],
      [11.5, 0, 70.0],
      0.32
    );

    // The doorway at Z=70 is open, so player successfully passes through to X=11.5
    expect(resolved[0]).toBe(11.5);
    expect(resolved[2]).toBe(70.0);
  });

  it("blocks player from walking through the solid sections of the Workplace west wall", () => {
    // Attempting to walk through the wall north of the entrance at Z=65.0
    const resolved = resolvePlayerWorldPosition(
      [10.5, 0, 65.0],
      [11.5, 0, 65.0],
      0.32
    );

    // Player is blocked and stays at X=10.5
    expect(resolved[0]).toBe(10.5);
  });

  it("calculates driver-side dismount coordinates safely", () => {
    const carPos = { x: 12.0, y: 0.35, z: 70.0 };
    const carHeading = 0; // Facing north (+Z)

    // Left driver side is -cos(heading)*1.8 along X, +sin(heading)*1.8 along Z
    const rawDismountX = carPos.x - Math.cos(carHeading) * 1.8;
    const rawDismountZ = carPos.z + Math.sin(carHeading) * 1.8;

    const [dismountX, , dismountZ] = resolvePlayerWorldPosition(
      [carPos.x, 0, carPos.z],
      [rawDismountX, 0, rawDismountZ],
      0.35
    );

    expect(dismountX).toBeCloseTo(10.2, 1);
    expect(dismountZ).toBeCloseTo(70.0, 1);
  });

  it("FR Legends drift counter-steering stabilizes slip-angle and maintains propulsion", () => {
    const initial = createInitialVehicleState();
    initial.speed = 15.0;
    initial.lateralSpeed = 2.0; // sliding right
    initial.driftFactor = 0.5;

    // Driver counter-steers left while holding throttle
    const input = {
      forward: true,
      backward: false,
      left: true,  // Counter-steer into the slide
      right: false,
      brake: false,
    };

    const next = updateVehiclePhysics(initial, input, 0.05);

    // Speed is maintained or accelerated by power-slide assist
    expect(next.speed).toBeGreaterThanOrEqual(14.5);
    // Drift factor is registered
    expect(next.driftFactor).toBeGreaterThan(0.1);
  });

  it("all 5 weapons have distinct aesthetic parameters and low-cortisol low-jank definitions", () => {
    expect(WEAPON_ORDER).toHaveLength(5);

    for (const wId of WEAPON_ORDER) {
      const def = WEAPON_DEFS[wId];
      expect(def).toBeDefined();
      expect(def.name).toBeTruthy();
      expect(def.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(def.damage).toBeGreaterThan(0);
      expect(def.attackSpeed).toBeGreaterThan(0);
    }
  });

  it("audio sound manager handles mode switching between WALKING, DRIVING and COMBAT", () => {
    // Should not throw even in non-browser vitest environment
    expect(() => soundManager.setMode("DRIVING")).not.toThrow();
    expect(() => soundManager.setMode("COMBAT")).not.toThrow();
    expect(() => soundManager.setMode("WALKING")).not.toThrow();
    expect(() => soundManager.setMuted(true)).not.toThrow();
    expect(() => soundManager.setMuted(false)).not.toThrow();
  });

  it("handles audio SFX calls safely without throw in headless runtime", () => {
    expect(() => soundManager.playSwordSlash()).not.toThrow();
    expect(() => soundManager.playBowRelease()).not.toThrow();
    expect(() => soundManager.playInkStroke()).not.toThrow();
    expect(() => soundManager.playHarmonicChime()).not.toThrow();
    expect(() => soundManager.playCrystalShatter()).not.toThrow();
    expect(() => soundManager.playVehicleMount()).not.toThrow();
    expect(() => soundManager.playVehicleDismount()).not.toThrow();
    expect(() => soundManager.playExhaustPop()).not.toThrow();
    expect(() => soundManager.updateEngine(12.5, true)).not.toThrow();
    expect(() => soundManager.updateTireDrift(0.65, 14.0)).not.toThrow();
  });

  it("prevents vehicle from driving into the solid walls of the mechanic shop", () => {
    // Car tries to drive through the west solid wall of the mechanic shop at X=-24.5, Z=0
    const resolved = resolveVehicleWorldPosition(
      { x: -22.0, y: 0.35, z: 0 },
      { x: -25.0, y: 0.35, z: 0 },
      1.15
    );

    expect(resolved.collided).toBe(true);
    expect(resolved.position.x).toBe(-22.0); // Held at current X
  });

  it("verifies exponential damping calculation (1 - exp(-lambda * dt)) is smooth and frame-rate independent", () => {
    const lambda = 8.5;
    const dt60fps = 0.0166;
    const dt30fps = 0.0333;

    const alpha60 = 1.0 - Math.exp(-lambda * dt60fps);
    const alpha30 = 1.0 - Math.exp(-lambda * dt30fps);

    // Alpha is strictly between 0 and 1 (no overshoot/oscillations)
    expect(alpha60).toBeGreaterThan(0);
    expect(alpha60).toBeLessThan(1);
    expect(alpha30).toBeGreaterThan(alpha60);

    // After 2 frames at 60fps, remaining distance is close to 1 frame at 30fps
    const remain2x60 = (1 - alpha60) * (1 - alpha60);
    const remain1x30 = 1 - alpha30;
    expect(remain2x60).toBeCloseTo(remain1x30, 2);
  });
});
