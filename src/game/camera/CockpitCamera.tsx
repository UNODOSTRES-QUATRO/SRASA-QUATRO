"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VehicleState } from "../vehicle/vehicleTypes";

interface CockpitCameraProps {
  vehicleState: VehicleState;
}

/**
 * Interior / Cockpit camera — positioned inside the cabin behind the windshield.
 * Gives an immersive first-person driving view with head-bob and lateral sway.
 */
export function CockpitCamera({ vehicleState }: CockpitCameraProps) {
  const smoothedPos = useRef(new THREE.Vector3());
  const smoothedLookAt = useRef(new THREE.Vector3());
  const smoothedHeading = useRef(vehicleState.heading);
  const bobTime = useRef(0);
  const isInitialized = useRef(false);
  const prevSpeed = useRef(0);

  useFrame((state, delta) => {
    const { position, heading, speed, steeringAngle, driftFactor, lateralSpeed } = vehicleState;
    const clampedDelta = Math.min(delta, 0.05);

    // Smooth heading (shortest-arc)
    let angleDiff = heading - smoothedHeading.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    smoothedHeading.current += angleDiff * Math.min(1, clampedDelta * 8);

    // ── Head bob tied to speed ────────────────────────────────────────────────
    bobTime.current += clampedDelta * Math.abs(speed) * 0.8;
    const bob = Math.sin(bobTime.current * 2.0) * 0.012 * Math.min(1, Math.abs(speed) / 6);

    // ── G-force head pitch (acceleration / braking) ───────────────────────────
    const accelDelta = speed - prevSpeed.current;
    prevSpeed.current = speed;
    const gPitch = THREE.MathUtils.clamp(accelDelta * 0.3, -0.06, 0.06);

    // ── Lateral sway from drift ───────────────────────────────────────────────
    const lateralSway = THREE.MathUtils.clamp(lateralSpeed * 0.04, -0.12, 0.12);
    const steerSway = steeringAngle * -0.06; // subtle counter-lean into corners

    // ── Cockpit position: driver's head (right-hand drive — left seat) ────────
    // Inside the car: slightly above dashboard level, slightly left of center
    const cockpitOffset = new THREE.Vector3(
      -0.28 + steerSway + lateralSway, // left-seat offset + sway
      1.05 + bob + gPitch,             // head height with bob
      0.22                              // slightly forward in cabin
    );

    // Rotate offset to world space by vehicle heading
    const rotMatrix = new THREE.Matrix4().makeRotationY(smoothedHeading.current);
    cockpitOffset.applyMatrix4(rotMatrix);

    const targetPos = new THREE.Vector3(
      position.x + cockpitOffset.x,
      position.y + cockpitOffset.y,
      position.z + cockpitOffset.z
    );

    // ── Look-ahead point: far down the road ahead ─────────────────────────────
    const lookDist = 18;
    const targetLookAt = new THREE.Vector3(
      position.x + Math.sin(smoothedHeading.current) * lookDist + steerSway * 3,
      position.y + 0.9,
      position.z + Math.cos(smoothedHeading.current) * lookDist
    );

    if (!isInitialized.current) {
      smoothedPos.current.copy(targetPos);
      smoothedLookAt.current.copy(targetLookAt);
      state.camera.position.copy(targetPos);
      state.camera.lookAt(targetLookAt);
      isInitialized.current = true;
      return;
    }

    // Smooth the camera position
    smoothedPos.current.lerp(targetPos, Math.min(1, clampedDelta * 14));
    smoothedLookAt.current.lerp(targetLookAt, Math.min(1, clampedDelta * 10));

    state.camera.position.copy(smoothedPos.current);
    state.camera.lookAt(smoothedLookAt.current);

    // Dynamic FOV — narrow at speed for tunnel-vision focus
    const perspCamera = state.camera as THREE.PerspectiveCamera;
    if (perspCamera.isPerspectiveCamera) {
      const speedRatio = Math.min(1, Math.abs(speed) / 22);
      const driftFov = driftFactor * 4;
      const targetFov = 62 + speedRatio * 8 + driftFov;
      perspCamera.fov = THREE.MathUtils.lerp(perspCamera.fov, targetFov, clampedDelta * 5);
      perspCamera.updateProjectionMatrix();
    }
  });

  return null;
}
