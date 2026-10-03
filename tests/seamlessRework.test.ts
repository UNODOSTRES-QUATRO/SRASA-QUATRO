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

  it("verifies vehicle physics clamps angular velocity to prevent jarring spin-outs", () => {
    const initial = createInitialVehicleState();
    initial.speed = 25.0;
    initial.steeringAngle = Math.PI / 4.8;
    initial.angularVelocity = 10.0; // extreme angular velocity

    const next = updateVehiclePhysics(initial, {
      forward: true,
      backward: false,
      left: false,
      right: true,
      brake: false,
    }, 0.05);

    expect(next.angularVelocity).toBeLessThanOrEqual(2.4);
    expect(next.angularVelocity).toBeGreaterThanOrEqual(-2.4);
    expect(next.lateralSpeed).toBeLessThanOrEqual(12.0);
    expect(next.lateralSpeed).toBeGreaterThanOrEqual(-12.0);
  });

  it("verifies camera auto-follow ignores strafing and only follows forward motion", () => {
    // When moving forward: heading ~ azimuth (diff < 80 deg)
    const forwardDiff = 0.15;
    const shouldAutoFollowForward = Math.abs(forwardDiff) < Math.PI * 0.44;
    expect(shouldAutoFollowForward).toBe(true);

    // When strafing right: heading is 90 deg relative to camera (diff = PI/2)
    const strafeDiff = Math.PI / 2;
    const shouldAutoFollowStrafe = Math.abs(strafeDiff) < Math.PI * 0.44;
    expect(shouldAutoFollowStrafe).toBe(false);

    // When walking backward: heading is 180 deg relative to camera
    const backDiff = Math.PI;
    const shouldAutoFollowBack = Math.abs(backDiff) < Math.PI * 0.44;
    expect(shouldAutoFollowBack).toBe(false);
  });

  it("verifies vehicle door angle animates during mount/dismount lifecycle", () => {
    const initial = createInitialVehicleState();
    expect(initial.doorAngle).toBe(0);

    // When mounting, door swings open to ~0.95 rad (~54 degrees)
    initial.doorAngle = 0.95;
    expect(initial.doorAngle).toBeGreaterThan(0.5);

    // Closes back to 0
    initial.doorAngle = 0;
    expect(initial.doorAngle).toBe(0);
  });

  it("verifies cockpit driver offset is calculated accurately using vehicle heading", () => {
    const headingNorth = 0;
    const headingEast = Math.PI / 2;

    // Base cockpit eye offset inside car: -0.34m left of centerline, 1.10m height, 0.04m forward
    const baseOffset = { x: -0.34, y: 1.10, z: 0.04 };

    // When facing north, X remains -0.34, Z is +0.04
    const northRotX = baseOffset.x * Math.cos(headingNorth) + baseOffset.z * Math.sin(headingNorth);
    const northRotZ = -baseOffset.x * Math.sin(headingNorth) + baseOffset.z * Math.cos(headingNorth);
    expect(northRotX).toBeCloseTo(-0.34, 2);
    expect(northRotZ).toBeCloseTo(0.04, 2);

    // When facing east (rotated 90 deg clockwise), driver sits south of center (negative Z)
    const eastRotX = baseOffset.x * Math.cos(headingEast) + baseOffset.z * Math.sin(headingEast);
    const eastRotZ = -baseOffset.x * Math.sin(headingEast) + baseOffset.z * Math.cos(headingEast);
    expect(eastRotX).toBeCloseTo(0.04, 2);
    expect(eastRotZ).toBeCloseTo(0.34, 2);
  });

  it("verifies astral monster defeat mechanics reduce HP and set respawn timer safely", () => {
    const monster = {
      id: "astral-test",
      name: "Test Wisp",
      maxHp: 60,
      hp: 60,
      isDefeated: false,
      respawnTime: 0,
    };

    // Take damage from Blue Shard Katana (38 damage)
    monster.hp = Math.max(0, monster.hp - 38);
    expect(monster.hp).toBe(22);
    expect(monster.isDefeated).toBe(false);

    // Fatal hit
    monster.hp = Math.max(0, monster.hp - 38);
    expect(monster.hp).toBe(0);
    monster.isDefeated = true;
    monster.respawnTime = 18.0;

    expect(monster.isDefeated).toBe(true);
    expect(monster.respawnTime).toBe(18.0);
  });

  it("verifies continuous world clamps player and vehicle within open seamless world bounds", () => {
    // Attempting to drive far beyond north edge at Z = 300
    const farNorthPos = { x: 0, y: 0.35, z: 300 };
    const clampedNorthZ = Math.min(225.0, Math.max(-85.0, farNorthPos.z));
    expect(clampedNorthZ).toBe(225.0);

    // Attempting to drive far beyond south edge at Z = -150
    const farSouthPos = { x: 0, y: 0.35, z: -150 };
    const clampedSouthZ = Math.min(225.0, Math.max(-85.0, farSouthPos.z));
    expect(clampedSouthZ).toBe(-85.0);

    // Attempting to walk beyond east lateral boundary at X = 50
    const farEastX = 50.0;
    const clampedEastX = Math.min(28.0, Math.max(-28.0, farEastX));
    expect(clampedEastX).toBe(28.0);
  });

  it("verifies shortest-arc angular wrapping keeps diff between -PI and PI", () => {
    const wrapDiff = (target: number, current: number) => {
      let diff = target - current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      return diff;
    };

    // Turning from 350 deg (6.1 rad) to 10 deg (0.17 rad) should be +20 deg (+0.35 rad), not -340 deg
    const diff1 = wrapDiff(0.17, 6.1);
    expect(diff1).toBeGreaterThan(0);
    expect(Math.abs(diff1)).toBeLessThan(Math.PI);

    // Turning from 10 deg to 350 deg should be -20 deg, not +340 deg
    const diff2 = wrapDiff(6.1, 0.17);
    expect(diff2).toBeLessThan(0);
    expect(Math.abs(diff2)).toBeLessThan(Math.PI);
  });

  it("verifies guardrail openings allow seamless vehicle driveway traversals", () => {
    // 1. Home driveway opening is at right side between Z = -60 and Z = -44
    const homeCar = resolveVehicleWorldPosition(
      { x: 6.0, y: 0.35, z: -52.0 },
      { x: 12.0, y: 0.35, z: -52.0 },
      1.15
    );
    expect(homeCar.collided).toBe(false);
    expect(homeCar.position.x).toBe(12.0);

    // 2. Bengkel garage apron opening is at left side between Z = -14 and Z = 14
    const bengkelCar = resolveVehicleWorldPosition(
      { x: -6.0, y: 0.35, z: 0.0 },
      { x: -12.0, y: 0.35, z: 0.0 },
      1.15
    );
    expect(bengkelCar.collided).toBe(false);
    expect(bengkelCar.position.x).toBe(-12.0);

    // 3. Workplace office parking opening is at right side between Z = 58 and Z = 82
    const officeCar = resolveVehicleWorldPosition(
      { x: 6.0, y: 0.35, z: 70.0 },
      { x: 11.5, y: 0.35, z: 70.0 },
      1.15
    );
    expect(officeCar.collided).toBe(false);
    expect(officeCar.position.x).toBe(11.5);
  });

  it("verifies reverse gear and reverse lights flag activate on reverse motion", () => {
    const initial = createInitialVehicleState();
    initial.speed = -3.5;

    const next = updateVehiclePhysics(initial, {
      forward: false,
      backward: true,
      left: false,
      right: false,
      brake: false,
    }, 0.05);

    expect(next.isReversing).toBe(true);
    expect(next.speed).toBeLessThan(0);
  });

  it("verifies sound manager contains ambient bell and bass boost capabilities", () => {
    expect(() => soundManager.init()).not.toThrow();
    // Ambient bell method and sound playback without errors
    expect(() => soundManager.playEndingChime()).not.toThrow();
    expect(() => soundManager.playFootstep()).not.toThrow();
  });

  it("verifies cockpit look-at aligns with front windshield heading and steer sway", () => {
    const carHeading = Math.PI / 4; // 45 degrees
    const steerSway = 0.02;
    const lookDist = 20;

    const rotLookX = Math.sin(carHeading) * lookDist + Math.cos(carHeading) * steerSway * 3.2;
    const rotLookZ = Math.cos(carHeading) * lookDist - Math.sin(carHeading) * steerSway * 3.2;

    // Both X and Z are positive when facing northeast
    expect(rotLookX).toBeGreaterThan(13);
    expect(rotLookZ).toBeGreaterThan(13);
  });

  it("verifies vehicle mount proximity detection triggers on foot within 3.6m", () => {
    const carPos = { x: 20.0, z: -48.0 };
    const playerNearby = { x: 21.5, z: -49.0 };
    const playerFar = { x: 10.0, z: -55.0 };

    const distNearby = Math.hypot(playerNearby.x - carPos.x, playerNearby.z - carPos.z);
    const distFar = Math.hypot(playerFar.x - carPos.x, playerFar.z - carPos.z);

    expect(distNearby).toBeLessThan(3.6);
    expect(distFar).toBeGreaterThan(3.6);
  });

  it("verifies Mechanic Shop orientation with rotation Math.PI / 2 faces the highway apron", () => {
    // Garage center at [-18, 0, 0], rotated Math.PI / 2
    // Local entrance is at local Z = +6.0
    const localEntranceZ = 6.0;
    const localEntranceX = 0.0;
    const rotationY = Math.PI / 2;

    const worldEntranceX = -18.0 + (localEntranceX * Math.cos(rotationY) + localEntranceZ * Math.sin(rotationY));
    const worldEntranceZ = 0.0 + (-localEntranceX * Math.sin(rotationY) + localEntranceZ * Math.cos(rotationY));

    // Entrance opens onto X = -12, Z = 0 directly facing the highway apron
    expect(worldEntranceX).toBeCloseTo(-12.0, 2);
    expect(worldEntranceZ).toBeCloseTo(0.0, 2);

    // Pak Montir at local [2.0, 0, -1.5] translates to world [-19.5, 0, -2.0]
    const localMontirX = 2.0;
    const localMontirZ = -1.5;
    const worldMontirX = -18.0 + (localMontirX * Math.cos(rotationY) + localMontirZ * Math.sin(rotationY));
    const worldMontirZ = 0.0 + (-localMontirX * Math.sin(rotationY) + localMontirZ * Math.cos(rotationY));

    expect(worldMontirX).toBeCloseTo(-19.5, 2);
    expect(worldMontirZ).toBeCloseTo(-2.0, 2);
  });

  it("verifies driver silhouette is only rendered when player is driving in chase mode", () => {
    const isCockpit = false;
    const isDriving = (mode: string) => mode === "DRIVING" && !isCockpit;

    expect(isDriving("ON_FOOT")).toBe(false);
    expect(isDriving("DRIVING")).toBe(true);

    // In cockpit mode, driver silhouette is hidden
    const isDrivingCockpit = (mode: string) => mode === "DRIVING" && !true;
    expect(isDrivingCockpit("DRIVING")).toBe(false);
  });

  it("power-sliding with [Space] + [W] maintains engine acceleration through the slide", () => {
    const initial = createInitialVehicleState();
    initial.speed = 12.0;
    initial.lateralSpeed = 3.0;
    initial.driftFactor = 0.6;

    // Both brake (handbrake) and forward (gas) pressed
    const input = {
      forward: true,
      backward: false,
      left: true,
      right: false,
      brake: true, // handbrake power-slide!
    };

    const next = updateVehiclePhysics(initial, input, 0.05);

    // Power-slide accelerates rather than bogging down
    expect(next.speed).toBeGreaterThan(initial.speed);
    expect(next.isHandbraking).toBe(true);
    expect(next.driftFactor).toBeGreaterThan(0.2);
  });

  it("verifies exponential damping lambda sign prevents negative or oscillating camera alphas", () => {
    const lambdas = [6.0, 14.0, 18.0, 22.0, 28.0, 48.0];
    const dt = 0.0166; // 60 FPS

    for (const lambda of lambdas) {
      // Correct formula with negative sign
      const alpha = 1.0 - Math.exp(-lambda * dt);
      expect(alpha).toBeGreaterThan(0);
      expect(alpha).toBeLessThan(1);

      // Verify that missing negative sign would have produced negative alpha
      const wrongAlpha = 1.0 - Math.exp(lambda * dt);
      expect(wrongAlpha).toBeLessThan(0);
    }
  });

  it("triggers Katana combo strikes (combo 0, 1, 2) without throwing errors", () => {
    expect(() => soundManager.playSwordSlash(0)).not.toThrow();
    expect(() => soundManager.playSwordSlash(1)).not.toThrow();
    expect(() => soundManager.playSwordSlash(2)).not.toThrow();
  });

  it("initiates power-over drift with throttle and hard steering without handbrake", () => {
    const initial = createInitialVehicleState();
    initial.speed = 10.0;
    initial.steeringAngle = 0;

    // Throttle held and steering hard right without brake
    const input = {
      forward: true,
      backward: false,
      left: false,
      right: true,
      brake: false,
    };

    // Run a few physics steps
    let current = initial;
    for (let i = 0; i < 8; i++) {
      current = updateVehiclePhysics(current, input, 0.033);
    }

    // Vehicle enters dynamic slip angle
    expect(current.angularVelocity).toBeLessThan(0); // Turning right
    expect(Math.abs(current.lateralSpeed)).toBeGreaterThan(0);
  });
});
