"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SceneLighting } from "./SceneLighting";
import { LocationCamera } from "@/game/camera/LocationCamera";
import { FollowCamera } from "@/game/camera/FollowCamera";
import { CockpitCamera } from "@/game/camera/CockpitCamera";
import { HumanPlayer } from "@/game/character/HumanPlayer";
import { LocationType } from "@/game/core/gameStore";
import { RemoteVehicle } from "@/game/vehicle/RemoteVehicle";
import { RemotePlayer } from "@/game/realtime/useGameRealtime";
import { VehicleState, CameraMode } from "@/game/vehicle/vehicleTypes";
import { WeaponSystem3D } from "@/game/weapons/WeaponSystem";
import type { WeaponSystemState } from "@/game/weapons/WeaponSystem";

interface GameCanvasProps {
  location: LocationType;
  humanPos: [number, number, number];
  humanHeading: number;
  isHumanMoving: boolean;
  isInsideEscapeRoom?: boolean;
  remotePlayers?: RemotePlayer[];
  // Driving
  vehicleState?: VehicleState;
  cameraMode?: CameraMode;
  // Weapons (walkable scenes only)
  weaponSystemStateRef?: React.MutableRefObject<WeaponSystemState>;
  isAttackingRef?: React.MutableRefObject<boolean>;
  isChargingRef?: React.MutableRefObject<boolean>;
  children?: React.ReactNode;
}

export function GameCanvas({
  location,
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
  children,
}: GameCanvasProps) {
  const isWalkable =
    location === "RUMAH" ||
    location === "TEMPAT_KERJA" ||
    location === "BENGKEL" ||
    location === "KASTIL";

  const isRoad = location === "JALAN" || location === "DIMENSI_LAIN";

  return (
    <Canvas
      shadows
      camera={{ position: [-6, 4, 6], fov: 48, near: 0.1, far: 300 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      className="w-full h-full"
    >
      <SceneLighting />

      {/* ── Camera Selection ── */}
      {isRoad && vehicleState ? (
        cameraMode === "COCKPIT" ? (
          <CockpitCamera vehicleState={vehicleState} />
        ) : (
          <FollowCamera vehicleState={vehicleState} />
        )
      ) : (
        <LocationCamera
          location={location}
          humanPos={humanPos}
          isInsideEscapeRoom={isInsideEscapeRoom}
        />
      )}

      {/* ── Human Player in Walkable Environments ── */}
      {isWalkable && (
        <HumanPlayer
          position={humanPos}
          heading={humanHeading}
          isMoving={isHumanMoving}
        />
      )}

      {/* ── Weapon System 3D (walkable scenes) ── */}
      {isWalkable && weaponSystemStateRef && isAttackingRef && isChargingRef && (
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
