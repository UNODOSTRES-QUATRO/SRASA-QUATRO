"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VehicleState } from "../vehicle/vehicleTypes";

interface FollowCameraProps {
  vehicleState: VehicleState;
}

export function FollowCamera({ vehicleState }: FollowCameraProps) {
  const currentPos = new THREE.Vector3();
  const currentLookAt = new THREE.Vector3();

  useFrame((state, delta) => {
    const { position, heading, speed } = vehicleState;

    const speedRatio = Math.min(1, Math.abs(speed) / 18);
    const cameraDistance = 7.5 + speedRatio * 1.5;
    const cameraHeight = 3.6 + speedRatio * 0.4;

    const targetX = position.x - Math.sin(heading) * cameraDistance;
    const targetY = position.y + cameraHeight;
    const targetZ = position.z - Math.cos(heading) * cameraDistance;

    const lookAheadX = position.x + Math.sin(heading) * 2.0;
    const lookAheadY = position.y + 0.8;
    const lookAheadZ = position.z + Math.cos(heading) * 2.0;

    const lerpFactor = Math.min(1, delta * 4.5);
    state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), lerpFactor);

    currentLookAt.lerp(new THREE.Vector3(lookAheadX, lookAheadY, lookAheadZ), lerpFactor);
    state.camera.lookAt(currentLookAt);
  });

  return null;
}
