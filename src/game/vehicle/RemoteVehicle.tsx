"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { RemotePlayer } from "../realtime/useGameRealtime";
import { QuatroMesh } from "./QuatroMesh";
import { VehicleState } from "./vehicleTypes";

interface RemoteVehicleProps {
  player: RemotePlayer;
}

export function RemoteVehicle({ player }: RemoteVehicleProps) {
  const currentPos = useRef(
    new THREE.Vector3(player.position.x, player.position.y, player.position.z)
  );
  const currentHeading = useRef(player.heading);

  // Smooth lerp to target network position & heading to avoid jitter
  useFrame((_, delta) => {
    const targetPos = new THREE.Vector3(
      player.position.x,
      player.position.y,
      player.position.z
    );
    currentPos.current.lerp(targetPos, Math.min(1, delta * 12));

    // Angular lerp with wrap-around
    let angleDiff = player.heading - currentHeading.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    currentHeading.current += angleDiff * Math.min(1, delta * 12);
  });

  const interpolatedState: VehicleState = {
    position: {
      x: currentPos.current.x,
      y: currentPos.current.y,
      z: currentPos.current.z,
    },
    heading: currentHeading.current,
    speed: player.speed,
    steeringAngle: 0,
    wheelRotation: player.speed * 2,
    isReversing: player.speed < -0.1,
    driftFactor: 0,
    scaleMode: player.scaleMode,
    scaleFactor: player.scaleFactor,
  };

  const isPocket = player.scaleMode === "POCKET";

  return (
    <group
      position={[
        interpolatedState.position.x,
        interpolatedState.position.y,
        interpolatedState.position.z,
      ]}
    >
      {/* FLOATING 3D MULTIPLAYER NAMETAG */}
      <Html
        position={[0, isPocket ? 0.7 : 1.8, 0]}
        center
        distanceFactor={15}
        className="pointer-events-none select-none"
      >
        <div className="flex flex-col items-center">
          <div className="bg-quatro-navy/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-blue-400/60 shadow-xl flex items-center space-x-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-blue-200">
              {player.name || "Remote Driver"}
            </span>
            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1 py-0.2 rounded uppercase">
              {isPocket ? "Pocket" : "Big Car"}
            </span>
          </div>
          {/* Subtle triangle point */}
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-quatro-navy/90" />
        </div>
      </Html>

      {/* RENDER ACTUAL VEHICLE MESH */}
      <QuatroMesh
        vehicleState={{
          ...interpolatedState,
          position: { x: 0, y: 0, z: 0 }, // Position handled by parent group
        }}
        bodyColor="#2563eb" // Cobalt blue rally livery for other players
      />
    </group>
  );
}
