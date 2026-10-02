"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SceneLighting } from "./SceneLighting";
import { QuatroMesh } from "@/game/vehicle/QuatroMesh";
import { RemoteVehicle } from "@/game/vehicle/RemoteVehicle";
import { FollowCamera } from "@/game/camera/FollowCamera";
import { VehicleState } from "@/game/vehicle/vehicleTypes";
import { RemotePlayer } from "@/game/realtime/useGameRealtime";

interface GameCanvasProps {
  vehicleState: VehicleState;
  isCatAlert?: boolean;
  remotePlayers?: RemotePlayer[];
  children?: React.ReactNode;
}

export function GameCanvas({
  vehicleState,
  isCatAlert = false,
  remotePlayers = [],
  children,
}: GameCanvasProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 4, -8], fov: 50, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      className="w-full h-full"
    >
      <SceneLighting />
      <QuatroMesh vehicleState={vehicleState} isCatAlert={isCatAlert} />
      <FollowCamera vehicleState={vehicleState} />

      {/* RENDER MULTIPLAYER REMOTE PLAYERS WITH LERP & 3D NAMETAGS */}
      {remotePlayers.map((player) => (
        <RemoteVehicle key={player.id} player={player} />
      ))}

      {children}
    </Canvas>
  );
}
