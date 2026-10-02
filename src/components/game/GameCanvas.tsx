"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SceneLighting } from "./SceneLighting";
import { LocationCamera } from "@/game/camera/LocationCamera";
import { HumanPlayer } from "@/game/character/HumanPlayer";
import { LocationType } from "@/game/core/gameStore";
import { RemoteVehicle } from "@/game/vehicle/RemoteVehicle";
import { RemotePlayer } from "@/game/realtime/useGameRealtime";

interface GameCanvasProps {
  location: LocationType;
  humanPos: [number, number, number];
  humanHeading: number;
  isHumanMoving: boolean;
  isInsideEscapeRoom?: boolean;
  remotePlayers?: RemotePlayer[];
  children?: React.ReactNode;
}

export function GameCanvas({
  location,
  humanPos,
  humanHeading,
  isHumanMoving,
  isInsideEscapeRoom = false,
  remotePlayers = [],
  children,
}: GameCanvasProps) {
  const isWalkable =
    location === "RUMAH" ||
    location === "TEMPAT_KERJA" ||
    location === "BENGKEL" ||
    location === "KASTIL";

  return (
    <Canvas
      shadows
      camera={{ position: [-6, 4, 6], fov: 48, near: 0.1, far: 250 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      className="w-full h-full"
    >
      <SceneLighting />

      {/* Dynamic Camera per Location */}
      <LocationCamera
        location={location}
        humanPos={humanPos}
        isInsideEscapeRoom={isInsideEscapeRoom}
      />

      {/* Human Player in Walkable Environments */}
      {isWalkable && (
        <HumanPlayer
          position={humanPos}
          heading={humanHeading}
          isMoving={isHumanMoving}
        />
      )}

      {/* 3D World Scene Content */}
      {children}

      {/* Multiplayer Remote Vehicles (if active) */}
      {remotePlayers.map((player) => (
        <RemoteVehicle key={player.id} player={player} />
      ))}
    </Canvas>
  );
}
