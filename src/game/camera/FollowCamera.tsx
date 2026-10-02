"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VehicleState } from "../vehicle/vehicleTypes";

interface FollowCameraProps {
  vehicleState: VehicleState;
}

export function FollowCamera({ vehicleState }: FollowCameraProps) {
  const currentPos = useRef(new THREE.Vector3(0, 3, -6));
  const currentLookAt = useRef(new THREE.Vector3(0, 0.5, 0));
  const smoothedHeading = useRef(vehicleState.heading);
  const smoothedDrift = useRef(0);
  const isInitialized = useRef(false);

  useFrame((state, delta) => {
    const { position, heading, speed, driftFactor, scaleFactor = 1.0 } = vehicleState;
    const clampedDelta = Math.min(delta, 0.05);

    // 1. Angular interpolation with shortest wrap-around (prevents 360 spin glitch)
    let angleDiff = heading - smoothedHeading.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    // FR Legends style: camera heading follows with dynamic lag
    // Lags slightly more during high drift/turn for dynamic side-angle presentation
    const headingFollowSpeed = 4.2;
    smoothedHeading.current += angleDiff * Math.min(1, clampedDelta * headingFollowSpeed);

    // Smooth drift factor
    smoothedDrift.current = THREE.MathUtils.lerp(
      smoothedDrift.current,
      driftFactor,
      Math.min(1, clampedDelta * 6.0)
    );

    // Scale distance & height if in Pocket mode vs Big car mode
    const isPocket = scaleFactor < 0.5;
    const baseDist = isPocket ? 2.4 : 6.6;
    const baseHeight = isPocket ? 1.1 : 2.6;
    const speedRatio = Math.min(1, Math.abs(speed) / 18);

    // Dynamic camera distance & height
    const distance = baseDist + speedRatio * (isPocket ? 0.5 : 1.3);
    const height = baseHeight + speedRatio * 0.25;

    // Calculate ideal target position behind car using smoothed heading
    const targetX = position.x - Math.sin(smoothedHeading.current) * distance;
    const targetY = position.y + height;
    const targetZ = position.z - Math.cos(smoothedHeading.current) * distance;

    // Target look-at: car center + forward projection along movement
    const lookAheadDist = isPocket ? 0.8 : 2.2;
    const targetLookAtX = position.x + Math.sin(heading) * lookAheadDist;
    const targetLookAtY = position.y + (isPocket ? 0.15 : 0.6);
    const targetLookAtZ = position.z + Math.cos(heading) * lookAheadDist;

    if (!isInitialized.current) {
      currentPos.current.set(targetX, targetY, targetZ);
      currentLookAt.current.set(targetLookAtX, targetLookAtY, targetLookAtZ);
      state.camera.position.copy(currentPos.current);
      state.camera.lookAt(currentLookAt.current);
      isInitialized.current = true;
      return;
    }

    // Smooth dampening for position & lookAt
    const posLerp = Math.min(1, clampedDelta * 7.0);
    const lookLerp = Math.min(1, clampedDelta * 8.5);

    currentPos.current.lerp(new THREE.Vector3(targetX, targetY, targetZ), posLerp);
    currentLookAt.current.lerp(
      new THREE.Vector3(targetLookAtX, targetLookAtY, targetLookAtZ),
      lookLerp
    );

    // Dynamic FOV (FR Legends speed sensation)
    const perspCamera = state.camera as THREE.PerspectiveCamera;
    if (perspCamera.isPerspectiveCamera) {
      const targetFov = 48 + speedRatio * 7;
      perspCamera.fov = THREE.MathUtils.lerp(perspCamera.fov, targetFov, clampedDelta * 4);
      perspCamera.updateProjectionMatrix();
    }

    state.camera.position.copy(currentPos.current);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
}

