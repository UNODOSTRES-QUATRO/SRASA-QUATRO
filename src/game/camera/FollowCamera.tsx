"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VehicleState } from "../vehicle/vehicleTypes";

interface FollowCameraProps {
  vehicleState: VehicleState;
}

/**
 * Third-person chase camera with FR Legends style:
 * - Smooth heading lag (camera swings into drift)
 * - Side-angle drift pan when sliding
 * - Speed-based FOV zoom
 * - Subtle road vibration at high speed
 */
export function FollowCamera({ vehicleState }: FollowCameraProps) {
  const currentPos = useRef(new THREE.Vector3(0, 3, -6));
  const currentLookAt = useRef(new THREE.Vector3(0, 0.5, 0));
  const smoothedHeading = useRef(vehicleState.heading);
  const smoothedDrift = useRef(0);
  const vibrationTime = useRef(0);
  const isInitialized = useRef(false);

  useFrame((state, delta) => {
    const { position, heading, speed, driftFactor, lateralSpeed, scaleFactor = 1.0 } = vehicleState;
    const clampedDelta = Math.min(delta, 0.05);

    // ── 1. Heading lag (angular shortest-arc) ────────────────────────────────
    let angleDiff = heading - smoothedHeading.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    // Faster follow at low drift, more lag during drift for FR side-pan feel
    const headingLag = driftFactor > 0.25 ? 3.2 : 5.0;
    smoothedHeading.current += angleDiff * Math.min(1, clampedDelta * headingLag);

    // ── 2. Smooth drift factor ────────────────────────────────────────────────
    smoothedDrift.current = THREE.MathUtils.lerp(
      smoothedDrift.current,
      driftFactor,
      Math.min(1, clampedDelta * 5.0)
    );

    const isPocket = scaleFactor < 0.5;
    const baseDist = isPocket ? 2.4 : 7.0;
    const baseHeight = isPocket ? 1.1 : 2.8;
    const speedRatio = Math.min(1, Math.abs(speed) / 22);

    // ── 3. Dynamic distance & height ─────────────────────────────────────────
    const distance = baseDist + speedRatio * (isPocket ? 0.5 : 1.8);
    const height = baseHeight + speedRatio * 0.3;

    // ── 4. Drift side-pan offset (camera swings to show car sideways) ─────────
    // During drift, offset the camera azimuth to show the car from the side
    const driftSidePan = smoothedDrift.current * Math.sign(lateralSpeed || 0) * 0.45;
    const panAngle = smoothedHeading.current + driftSidePan;

    // ── 5. Target position behind car ────────────────────────────────────────
    const targetX = position.x - Math.sin(panAngle) * distance;
    const targetY = position.y + height;
    const targetZ = position.z - Math.cos(panAngle) * distance;

    // ── 6. Road vibration at high speed ──────────────────────────────────────
    vibrationTime.current += clampedDelta;
    const vibration = speedRatio > 0.7 ? Math.sin(vibrationTime.current * 55) * 0.015 * (speedRatio - 0.7) * 3 : 0;

    // ── 7. Look-ahead ─────────────────────────────────────────────────────────
    const lookAheadDist = isPocket ? 0.8 : 2.8;
    const targetLookAtX = position.x + Math.sin(heading) * lookAheadDist;
    const targetLookAtY = position.y + (isPocket ? 0.15 : 0.7);
    const targetLookAtZ = position.z + Math.cos(heading) * lookAheadDist;

    if (!isInitialized.current) {
      currentPos.current.set(targetX, targetY, targetZ);
      currentLookAt.current.set(targetLookAtX, targetLookAtY, targetLookAtZ);
      state.camera.position.copy(currentPos.current);
      state.camera.lookAt(currentLookAt.current);
      isInitialized.current = true;
      return;
    }

    // ── 8. Smooth position with exponential damping ─────────────────────────
    const posAlpha = 1.0 - Math.exp(-7.0 * clampedDelta);
    const lookAlpha = 1.0 - Math.exp(-9.0 * clampedDelta);

    currentPos.current.lerp(new THREE.Vector3(targetX, targetY + vibration, targetZ), posAlpha);
    currentLookAt.current.lerp(
      new THREE.Vector3(targetLookAtX, targetLookAtY, targetLookAtZ),
      lookAlpha
    );

    // ── 9. Speed FOV ──────────────────────────────────────────────────────────
    const perspCamera = state.camera as THREE.PerspectiveCamera;
    if (perspCamera.isPerspectiveCamera) {
      const targetFov = 46 + speedRatio * 10 + smoothedDrift.current * 5;
      const fovAlpha = 1.0 - Math.exp(-5.0 * clampedDelta);
      perspCamera.fov = THREE.MathUtils.lerp(perspCamera.fov, targetFov, fovAlpha);
      perspCamera.updateProjectionMatrix();
    }

    state.camera.position.copy(currentPos.current);
    state.camera.lookAt(currentLookAt.current);
  });

  return null;
}
