"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SceneLighting } from "./SceneLighting";
import { QuatroMesh } from "@/game/vehicle/QuatroMesh";
import { FollowCamera } from "@/game/camera/FollowCamera";
import { VehicleState } from "@/game/vehicle/vehicleTypes";

interface GameCanvasProps {
  vehicleState: VehicleState;
  children?: React.ReactNode;
}

export function GameCanvas({ vehicleState, children }: GameCanvasProps) {
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
      <QuatroMesh vehicleState={vehicleState} />
      <FollowCamera vehicleState={vehicleState} />
      {children}
    </Canvas>
  );
}
