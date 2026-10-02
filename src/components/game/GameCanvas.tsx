"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SceneLighting } from "./SceneLighting";
import { UnifiedCamera, UnifiedCameraMode } from "@/game/camera/UnifiedCamera";
import { HumanPlayer } from "@/game/character/HumanPlayer";
import { RemoteVehicle } from "@/game/vehicle/RemoteVehicle";
import { RemotePlayer } from "@/game/realtime/useGameRealtime";
import { VehicleState, CameraMode } from "@/game/vehicle/vehicleTypes";
import { WeaponSystem3D } from "@/game/weapons/WeaponSystem";
import type { WeaponSystemState } from "@/game/weapons/WeaponSystem";
import { WeaponId } from "@/game/weapons/weaponTypes";

interface GameCanvasProps {
  playerMode: "ON_FOOT" | "DRIVING";
  humanPos: [number, number, number];
  humanHeading: number;
  isHumanMoving: boolean;
  isInsideEscapeRoom?: boolean;
  remotePlayers?: RemotePlayer[];
  vehicleState?: VehicleState;
  cameraMode?: CameraMode;
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
  cameraMode = "CHASE",
  weaponSystemStateRef,
  isAttackingRef,
  isChargingRef,
  activeWeaponId = "BLUE_SHARD_SWORD",
  chargeLevel = 0,
  attackProgress = 0,
  isAttacking = false,
  children,
}: GameCanvasProps) {
  // Determine camera mode:
  // If DRIVING -> DRIVING_CHASE or DRIVING_COCKPIT
  // If ON_FOOT -> ON_FOOT
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

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      frameloop="always"
      camera={{ position: [-6, 6, 12], fov: 48, near: 0.1, far: 400 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.18,
        powerPreference: "high-performance",
      }}
      className="w-full h-full"
    >
      <SceneLighting />

      {/* ── Buttery-Smooth Unified Camera Controller (No Jitter, No Snapping) ── */}
      <UnifiedCamera
        mode={unifiedMode}
        targetPos={cameraTargetPos}
        targetHeading={cameraTargetHeading}
        vehicleState={vehicleState}
        isInsideEscapeRoom={isInsideEscapeRoom}
      />

      {/* ── Human Player Character (Shown on foot, socketed with weapon) ── */}
      {playerMode === "ON_FOOT" && (
        <HumanPlayer
          position={humanPos}
          heading={humanHeading}
          isMoving={isHumanMoving}
          activeWeaponId={activeWeaponId}
          chargeLevel={chargeLevel}
          attackProgress={attackProgress}
          isAttacking={isAttacking}
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

      {/* ── 3D World Scene Content ── */}
      {children}

      {/* ── Multiplayer Remote Vehicles ── */}
      {remotePlayers.map((player) => (
        <RemoteVehicle key={player.id} player={player} />
      ))}
    </Canvas>
  );
}
