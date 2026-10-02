"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LocationType } from "../core/gameStore";

interface LocationCameraProps {
  location: LocationType;
  humanPos: [number, number, number];
  isInsideEscapeRoom?: boolean;
}

export function LocationCamera({
  location,
  humanPos,
  isInsideEscapeRoom = false,
}: LocationCameraProps) {
  const currentPos = useRef(new THREE.Vector3(0, 8, 8));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isInit = useRef(false);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    let targetX = 0;
    let targetY = 5;
    let targetZ = 6;
    let lookX = 0;
    let lookY = 0.8;
    let lookZ = 0;

    switch (location) {
      case "RUMAH":
        // Isometric cozy top-down 3/4 view following human player
        targetX = humanPos[0] * 0.7;
        targetY = 7.5;
        targetZ = humanPos[2] * 0.7 + 6.2;
        lookX = humanPos[0];
        lookY = 1.0;
        lookZ = humanPos[2];
        break;

      case "JALAN":
      case "DIMENSI_LAIN":
        // Isometric view from front-side (camera angle mobil dijalan dari samping depan)
        targetX = -6.2;
        targetY = 3.6;
        targetZ = 5.8;
        lookX = 0;
        lookY = 0.8;
        lookZ = 0.5;
        break;

      case "TEMPAT_KERJA":
        // 2000s Office isometric view following human
        targetX = humanPos[0] * 0.6;
        targetY = 8.5;
        targetZ = humanPos[2] * 0.6 + 7.0;
        lookX = humanPos[0];
        lookY = 1.0;
        lookZ = humanPos[2];
        break;

      case "BENGKEL":
        // Garage isometric camera
        targetX = -3.5;
        targetY = 4.8;
        targetZ = 6.2;
        lookX = 0;
        lookY = 1.0;
        lookZ = 0;
        break;

      case "KASTIL":
        if (isInsideEscapeRoom) {
          // Inside Castle Escape Room
          targetX = humanPos[0] * 0.4;
          targetY = 6.2;
          targetZ = 6.0;
          lookX = humanPos[0] * 0.3;
          lookY = 1.2;
          lookZ = 0;
        } else {
          // Castle Courtyard
          targetX = humanPos[0] * 0.7;
          targetY = 7.8;
          targetZ = humanPos[2] * 0.7 + 7.5;
          lookX = humanPos[0];
          lookY = 1.2;
          lookZ = humanPos[2];
        }
        break;

      default:
        targetX = 0;
        targetY = 6;
        targetZ = 8;
        lookX = 0;
        lookY = 0;
        lookZ = 0;
        break;
    }

    if (!isInit.current) {
      currentPos.current.set(targetX, targetY, targetZ);
      currentLookAt.current.set(lookX, lookY, lookZ);
      state.camera.position.copy(currentPos.current);
      state.camera.lookAt(currentLookAt.current);
      isInit.current = true;
      return;
    }

    // Smooth lerp
    const posLerp = Math.min(1, dt * 6.5);
    const lookLerp = Math.min(1, dt * 8.0);

    currentPos.current.lerp(new THREE.Vector3(targetX, targetY, targetZ), posLerp);
    currentLookAt.current.lerp(new THREE.Vector3(lookX, lookY, lookZ), lookLerp);

    state.camera.position.copy(currentPos.current);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
}
