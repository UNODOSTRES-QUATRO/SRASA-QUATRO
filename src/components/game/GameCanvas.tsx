"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneLighting } from "./SceneLighting";
import { UnifiedCamera, UnifiedCameraMode } from "@/game/camera/UnifiedCamera";
import { HumanPlayer } from "@/game/character/HumanPlayer";
import { RemoteVehicle } from "@/game/vehicle/RemoteVehicle";
import { RemotePlayer } from "@/game/realtime/useGameRealtime";
import { VehicleState, CameraMode } from "@/game/vehicle/vehicleTypes";
import { updateVehiclePhysics } from "@/game/vehicle/vehiclePhysics";
import { resolvePlayerWorldPosition, resolveVehicleWorldPosition } from "@/game/core/playerCollision";
import { soundManager } from "@/game/audio/SoundManager";
import { WeaponSystem3D } from "@/game/weapons/WeaponSystem";
import type { WeaponSystemState } from "@/game/weapons/WeaponSystem";
import { WeaponId } from "@/game/weapons/weaponTypes";
import { CharacterId } from "@/components/ui/CharacterPortraits";

interface ContinuousPhysicsProps {
  playerMode: "ON_FOOT" | "DRIVING";
  vehicleStateRef?: React.MutableRefObject<VehicleState>;
  humanPosRef?: React.MutableRefObject<{ x: number; y: number; z: number; heading: number }>;
  humanVelocityRef?: React.MutableRefObject<{ vx: number; vz: number }>;
  inputRef?: React.MutableRefObject<{ forward: boolean; backward: boolean; left: boolean; right: boolean; brake: boolean }>;
  canExitHouse?: boolean;
  isPaused?: boolean;
  onFootstep?: () => void;
  onSyncUI?: (x: number, z: number, heading: number, isMoving: boolean, vehicle?: VehicleState) => void;
  camAzimuthRef?: React.MutableRefObject<number>;
}

function ContinuousWorldPhysics({
  playerMode,
  vehicleStateRef,
  humanPosRef,
  humanVelocityRef,
  inputRef,
  canExitHouse = true,
  isPaused = false,
  onFootstep,
  onSyncUI,
  camAzimuthRef,
}: ContinuousPhysicsProps) {
  const lastSyncTime = useRef(0);
  const lastFootstepTime = useRef(0);

  useFrame((_, delta) => {
    if (isPaused) return;
    const dt = Math.min(delta, 0.0333);

    if (playerMode === "ON_FOOT" && humanPosRef?.current && humanVelocityRef?.current && inputRef?.current) {
      const input = inputRef.current;
      let moveForward = 0;
      let moveRight = 0;
      if (input.forward) moveForward += 1;
      if (input.backward) moveForward -= 1;
      if (input.right) moveRight += 1;
      if (input.left) moveRight -= 1;

      const isPressingMove = moveForward !== 0 || moveRight !== 0;
      let targetVx = 0;
      let targetVz = 0;
      const walkSpeed = 5.2;

      if (isPressingMove) {
        const len = Math.hypot(moveForward, moveRight);
        const normF = moveForward / len;
        const normR = moveRight / len;

        // Camera-relative orientation so [W] is ALWAYS forward where the player is looking
        const camAngle = camAzimuthRef?.current ?? 0;
        const sinA = Math.sin(camAngle);
        const cosA = Math.cos(camAngle);

        const dirX = normF * sinA + normR * cosA;
        const dirZ = normF * cosA - normR * sinA;

        targetVx = dirX * walkSpeed;
        targetVz = dirZ * walkSpeed;
      }

      // Smooth exponential velocity damping (1 - exp(-lambda * dt))
      const velAlpha = 1.0 - Math.exp(-18.0 * dt);
      humanVelocityRef.current.vx += (targetVx - humanVelocityRef.current.vx) * velAlpha;
      humanVelocityRef.current.vz += (targetVz - humanVelocityRef.current.vz) * velAlpha;

      const curSpeed = Math.hypot(humanVelocityRef.current.vx, humanVelocityRef.current.vz);
      const isMoving = curSpeed > 0.05;

      if (isMoving) {
        const curX = humanPosRef.current.x;
        const curZ = humanPosRef.current.z;
        let nextX = curX + humanVelocityRef.current.vx * dt;
        let nextZ = curZ + humanVelocityRef.current.vz * dt;

        // Smooth shortest-arc heading with exponential damping
        const targetHeading = Math.atan2(humanVelocityRef.current.vx, humanVelocityRef.current.vz);
        let headingDiff = targetHeading - humanPosRef.current.heading;
        while (headingDiff < -Math.PI) headingDiff += Math.PI * 2;
        while (headingDiff > Math.PI) headingDiff -= Math.PI * 2;
        const headingAlpha = 1.0 - Math.exp(-18.0 * dt);
        const nextHeading = humanPosRef.current.heading + headingDiff * headingAlpha;

        // Continuous world collision checking
        const [rx, , rz] = resolvePlayerWorldPosition(
          [curX, 0, curZ],
          [nextX, 0, nextZ],
          0.32,
          !canExitHouse
        );

        nextX = THREE.MathUtils.clamp(rx, -28.0, 28.0);
        nextZ = THREE.MathUtils.clamp(rz, -85.0, 225.0);

        humanPosRef.current.x = nextX;
        humanPosRef.current.y = 0;
        humanPosRef.current.z = nextZ;
        humanPosRef.current.heading = nextHeading;

        const now = performance.now();
        if (now - lastFootstepTime.current > 310) {
          onFootstep?.();
          lastFootstepTime.current = now;
        }

        if (now - lastSyncTime.current > 60) {
          onSyncUI?.(nextX, nextZ, nextHeading, isMoving);
          lastSyncTime.current = now;
        }
      } else {
        const now = performance.now();
        if (now - lastSyncTime.current > 60) {
          onSyncUI?.(humanPosRef.current.x, humanPosRef.current.z, humanPosRef.current.heading, false);
          lastSyncTime.current = now;
        }
      }
    } else if (playerMode === "DRIVING" && vehicleStateRef?.current && inputRef?.current) {
      const input = inputRef.current;
      const nextVehicle = updateVehiclePhysics(vehicleStateRef.current, input, dt);

      const prevPos = vehicleStateRef.current.position;
      const { position: resolvedPos, collided } = resolveVehicleWorldPosition(prevPos, nextVehicle.position, 1.15);

      if (collided) {
        nextVehicle.speed *= -0.25; // soft bounce deceleration
        nextVehicle.lateralSpeed *= 0.5;
        if (Math.abs(vehicleStateRef.current.speed) > 4.5) {
          soundManager.playExhaustPop();
        }
      }

      // Clamp to continuous map boundaries
      nextVehicle.position.x = THREE.MathUtils.clamp(resolvedPos.x, -28.0, 28.0);
      nextVehicle.position.z = THREE.MathUtils.clamp(resolvedPos.z, -85.0, 225.0);

      vehicleStateRef.current = nextVehicle;

      // Keep humanPosRef in lockstep with vehicle position so all world proximity queries are always accurate
      if (humanPosRef?.current) {
        humanPosRef.current.x = nextVehicle.position.x;
        humanPosRef.current.y = nextVehicle.position.y;
        humanPosRef.current.z = nextVehicle.position.z;
        humanPosRef.current.heading = nextVehicle.heading;
      }

      soundManager.updateEngine(nextVehicle.speed, true);
      soundManager.updateTireDrift(nextVehicle.driftFactor, nextVehicle.speed);

      const now = performance.now();
      if (now - lastSyncTime.current > 60) {
        onSyncUI?.(nextVehicle.position.x, nextVehicle.position.z, nextVehicle.heading, false, nextVehicle);
        lastSyncTime.current = now;
      }
    }
  }, -1);

  return null;
}

interface GameCanvasProps {
  playerMode: "ON_FOOT" | "DRIVING";
  humanPos: [number, number, number];
  humanHeading: number;
  isHumanMoving: boolean;
  isInsideEscapeRoom?: boolean;
  remotePlayers?: RemotePlayer[];
  vehicleState?: VehicleState;
  vehicleStateRef?: React.MutableRefObject<VehicleState>;
  humanPosRef?: React.MutableRefObject<{ x: number; y: number; z: number; heading: number }>;
  humanVelocityRef?: React.MutableRefObject<{ vx: number; vz: number }>;
  inputRef?: React.MutableRefObject<{ forward: boolean; backward: boolean; left: boolean; right: boolean; brake: boolean }>;
  canExitHouse?: boolean;
  isPaused?: boolean;
  onFootstep?: () => void;
  onSyncUI?: (x: number, z: number, heading: number, isMoving: boolean, vehicle?: VehicleState) => void;
  cameraMode?: CameraMode;
  characterId?: CharacterId;
  // Weapons
  weaponSystemStateRef?: React.MutableRefObject<WeaponSystemState>;
  isAttackingRef?: React.MutableRefObject<boolean>;
  isChargingRef?: React.MutableRefObject<boolean>;
  activeWeaponId?: WeaponId;
  chargeLevel?: number;
  attackProgress?: number;
  isAttacking?: boolean;
  children?: React.ReactNode;
}

export function GameCanvas({
  playerMode,
  humanPos,
  humanHeading,
  isHumanMoving,
  isInsideEscapeRoom = false,
  remotePlayers = [],
  vehicleState,
  vehicleStateRef,
  humanPosRef,
  humanVelocityRef,
  inputRef,
  canExitHouse = true,
  isPaused = false,
  onFootstep,
  onSyncUI,
  cameraMode = "CHASE",
  characterId = "ORIGINAL",
  weaponSystemStateRef,
  isAttackingRef,
  isChargingRef,
  activeWeaponId = "BLUE_SHARD_SWORD",
  chargeLevel = 0,
  attackProgress = 0,
  isAttacking = false,
  children,
}: GameCanvasProps) {
  const unifiedMode: UnifiedCameraMode =
    playerMode === "DRIVING"
      ? cameraMode === "COCKPIT"
        ? "DRIVING_COCKPIT"
        : "DRIVING_CHASE"
      : "ON_FOOT";

  const cameraTargetPos: [number, number, number] =
    playerMode === "DRIVING" && vehicleState
      ? [vehicleState.position.x, vehicleState.position.y, vehicleState.position.z]
      : humanPos;

  const cameraTargetHeading =
    playerMode === "DRIVING" && vehicleState ? vehicleState.heading : humanHeading;

  const camAzimuthRef = useRef(humanHeading);

  return (
    <Canvas
      dpr={1}
      camera={{ position: [-6, 6, 12], fov: 48, near: 0.1, far: 350 }}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
      }}
      className="w-full h-full"
    >
      <SceneLighting />

      {/* ── Sub-Frame Synchronized Continuous World Physics (Zero-Jitter, 60+ FPS) ── */}
      <ContinuousWorldPhysics
        playerMode={playerMode}
        vehicleStateRef={vehicleStateRef}
        humanPosRef={humanPosRef}
        humanVelocityRef={humanVelocityRef}
        inputRef={inputRef}
        canExitHouse={canExitHouse}
        isPaused={isPaused}
        onFootstep={onFootstep}
        onSyncUI={onSyncUI}
        camAzimuthRef={camAzimuthRef}
      />

      {/* ── Human Player Character (Shown on foot, socketed with weapon) ── */}
      {playerMode === "ON_FOOT" && (
        <HumanPlayer
          position={humanPos}
          heading={humanHeading}
          isMoving={isHumanMoving}
          characterId={characterId}
          activeWeaponId={activeWeaponId}
          chargeLevel={chargeLevel}
          attackProgress={attackProgress}
          isAttacking={isAttacking}
          humanPosRef={humanPosRef}
          weaponSystemStateRef={weaponSystemStateRef}
        />
      )}

      {/* ── Weapon Projectiles & Particle Effects in Flight ── */}
      {weaponSystemStateRef && isAttackingRef && isChargingRef && (
        <WeaponSystem3D
          playerPos={humanPos}
          playerHeading={humanHeading}
          stateRef={weaponSystemStateRef}
          isAttacking={isAttackingRef}
          isChargingRef={isChargingRef}
        />
      )}

      {/* ── 3D Continuous World Scene Content ── */}
      {children}

      {/* ── Multiplayer Remote Vehicles ── */}
      {remotePlayers.map((player) => (
        <RemoteVehicle key={player.id} player={player} />
      ))}

      {/* ── Buttery-Smooth Unified Camera Controller (Executed last for zero-frame latency) ── */}
      <UnifiedCamera
        mode={unifiedMode}
        targetPos={cameraTargetPos}
        targetHeading={cameraTargetHeading}
        vehicleState={vehicleState}
        vehicleStateRef={vehicleStateRef}
        humanPosRef={humanPosRef}
        isInsideEscapeRoom={isInsideEscapeRoom}
        isMoving={isHumanMoving}
        camAzimuthRef={camAzimuthRef}
      />
    </Canvas>
  );
}
