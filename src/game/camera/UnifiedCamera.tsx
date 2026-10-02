"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { VehicleState } from "../vehicle/vehicleTypes";

export type UnifiedCameraMode = "ON_FOOT" | "DRIVING_CHASE" | "DRIVING_COCKPIT";

interface UnifiedCameraProps {
  mode: UnifiedCameraMode;
  targetPos: [number, number, number]; // [x, y, z] of player or car
  targetHeading: number; // in radians
  vehicleState?: VehicleState;
  isInsideEscapeRoom?: boolean;
}

export function UnifiedCamera({
  mode,
  targetPos,
  targetHeading,
  vehicleState,
  isInsideEscapeRoom = false,
}: UnifiedCameraProps) {
  const { camera, gl } = useThree();

  // Current interpolated state
  const currentPos = useRef(new THREE.Vector3(targetPos[0], targetPos[1] + 6, targetPos[2] - 10));
  const currentLookAt = useRef(new THREE.Vector3(targetPos[0], targetPos[1] + 1, targetPos[2]));
  const smoothedHeading = useRef(targetHeading);
  const smoothedDrift = useRef(0);
  const isInitialized = useRef(false);

  // Orbit parameters for ON_FOOT mode
  const orbitAzimuth = useRef(0);
  const orbitPolar = useRef(0.68);
  const orbitDistance = useRef(8.5);
  const targetOrbitDistance = useRef(8.5);
  const pointer = useRef({ dragging: false, pointerId: -1, x: 0, y: 0 });

  // Cockpit head bob & dynamics
  const prevSpeed = useRef(0);
  const bobTime = useRef(0);

  // Mouse drag & wheel handlers for ON_FOOT mode
  useEffect(() => {
    const element = gl.domElement;

    const handlePointerDown = (event: PointerEvent) => {
      if (mode !== "ON_FOOT" || event.button !== 0) return;
      pointer.current = {
        dragging: true,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      element.setPointerCapture(event.pointerId);
      element.style.cursor = "grabbing";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointer.current.dragging || pointer.current.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - pointer.current.x;
      const deltaY = event.clientY - pointer.current.y;
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;

      orbitAzimuth.current -= deltaX * 0.005;
      orbitPolar.current = THREE.MathUtils.clamp(
        orbitPolar.current + deltaY * 0.0035,
        0.25,
        Math.PI / 2 - 0.08
      );
    };

    const endDrag = (event: PointerEvent) => {
      if (pointer.current.pointerId !== event.pointerId) return;
      pointer.current.dragging = false;
      pointer.current.pointerId = -1;
      element.style.cursor = mode === "ON_FOOT" ? "grab" : "default";
    };

    const handleWheel = (event: WheelEvent) => {
      if (mode !== "ON_FOOT") return;
      event.preventDefault();
      targetOrbitDistance.current = THREE.MathUtils.clamp(
        targetOrbitDistance.current + event.deltaY * 0.008,
        4.0,
        18.0
      );
    };

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", endDrag);
    element.addEventListener("pointercancel", endDrag);
    element.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", endDrag);
      element.removeEventListener("pointercancel", endDrag);
      element.removeEventListener("wheel", handleWheel);
    };
  }, [gl, mode]);

  useFrame((state, delta) => {
    // Decouple delta to eliminate micro-stutters
    const dt = Math.min(delta, 0.05);

    let desiredPos = new THREE.Vector3();
    let desiredLookAt = new THREE.Vector3();
    let targetFov = 50;

    // ── 1. Heading Shortest-Arc Smoothing ────────────────────────────────────
    let angleDiff = targetHeading - smoothedHeading.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    const headingLambda = mode === "DRIVING_CHASE" ? (vehicleState?.driftFactor && vehicleState.driftFactor > 0.2 ? 4.0 : 6.0) : 8.0;
    const headingAlpha = 1.0 - Math.exp(-headingLambda * dt);
    smoothedHeading.current += angleDiff * headingAlpha;

    if (mode === "DRIVING_CHASE" && vehicleState) {
      // ── MODE: DRIVING CHASE (FR Legends Flow) ──────────────────────────────
      const { speed, driftFactor = 0, lateralSpeed = 0, scaleFactor = 1.0 } = vehicleState;
      const speedRatio = Math.min(1, Math.abs(speed) / 22);

      // Smooth drift factor with exponential damping
      const driftAlpha = 1.0 - Math.exp(-6.0 * dt);
      smoothedDrift.current = THREE.MathUtils.lerp(smoothedDrift.current, driftFactor, driftAlpha);

      const isPocket = scaleFactor < 0.5;
      const baseDist = isPocket ? 2.5 : 6.8;
      const baseHeight = isPocket ? 1.2 : 2.7;

      const distance = baseDist + speedRatio * 1.6;
      const height = baseHeight + speedRatio * 0.25;

      // Side-angle drift pan offset (swings camera outward to showcase car's slip angle)
      const driftSidePan = smoothedDrift.current * Math.sign(lateralSpeed || 0) * 0.42;
      const panAngle = smoothedHeading.current + driftSidePan;

      desiredPos.set(
        targetPos[0] - Math.sin(panAngle) * distance,
        targetPos[1] + height,
        targetPos[2] - Math.cos(panAngle) * distance
      );

      const lookAheadDist = isPocket ? 0.8 : 2.6;
      desiredLookAt.set(
        targetPos[0] + Math.sin(targetHeading) * lookAheadDist,
        targetPos[1] + 0.65,
        targetPos[2] + Math.cos(targetHeading) * lookAheadDist
      );

      // Speed FOV: breathing expansion sensation without motion sickness
      targetFov = 48 + speedRatio * 9 + smoothedDrift.current * 4;

    } else if (mode === "DRIVING_COCKPIT" && vehicleState) {
      // ── MODE: DRIVING COCKPIT (First-Person Interior) ──────────────────────
      const { speed, steeringAngle = 0, lateralSpeed = 0 } = vehicleState;
      const speedRatio = Math.min(1, Math.abs(speed) / 22);

      // Head bob & G-Force
      bobTime.current += dt * Math.abs(speed) * 0.8;
      const bob = Math.sin(bobTime.current * 2.2) * 0.01 * Math.min(1, Math.abs(speed) / 6);
      const accelDelta = speed - prevSpeed.current;
      prevSpeed.current = speed;
      const gPitch = THREE.MathUtils.clamp(accelDelta * 0.25, -0.05, 0.05);
      const lateralSway = THREE.MathUtils.clamp(lateralSpeed * 0.035, -0.1, 0.1);
      const steerSway = steeringAngle * -0.05;

      // Left driver seat offset
      const cockpitOffset = new THREE.Vector3(
        -0.28 + steerSway + lateralSway,
        1.05 + bob + gPitch,
        0.22
      );
      const rotMatrix = new THREE.Matrix4().makeRotationY(smoothedHeading.current);
      cockpitOffset.applyMatrix4(rotMatrix);

      desiredPos.set(
        targetPos[0] + cockpitOffset.x,
        targetPos[1] + cockpitOffset.y,
        targetPos[2] + cockpitOffset.z
      );

      const lookDist = 18;
      desiredLookAt.set(
        targetPos[0] + Math.sin(smoothedHeading.current) * lookDist + steerSway * 3,
        targetPos[1] + 0.9,
        targetPos[2] + Math.cos(smoothedHeading.current) * lookDist
      );

      targetFov = 62 + speedRatio * 7;

    } else {
      // ── MODE: ON_FOOT (Smooth Over-The-Shoulder / Isometric Orbit) ─────────
      // Smooth orbit distance damping
      const distAlpha = 1.0 - Math.exp(-6.0 * dt);
      orbitDistance.current = THREE.MathUtils.lerp(
        orbitDistance.current,
        targetOrbitDistance.current,
        distAlpha
      );

      const hDist = orbitDistance.current * Math.sin(orbitPolar.current);
      const vDist = orbitDistance.current * Math.cos(orbitPolar.current);

      // Follow player heading if not dragging, with soft lag
      const combinedAzimuth = orbitAzimuth.current + smoothedHeading.current;

      desiredPos.set(
        targetPos[0] - Math.sin(combinedAzimuth) * hDist,
        targetPos[1] + vDist + (isInsideEscapeRoom ? 0.4 : 0.8),
        targetPos[2] - Math.cos(combinedAzimuth) * hDist
      );

      desiredLookAt.set(
        targetPos[0],
        targetPos[1] + (isInsideEscapeRoom ? 1.0 : 1.1),
        targetPos[2]
      );

      targetFov = 48;
    }

    // ── First Frame Initializer ──────────────────────────────────────────────
    if (!isInitialized.current) {
      currentPos.current.copy(desiredPos);
      currentLookAt.current.copy(desiredLookAt);
      camera.position.copy(desiredPos);
      camera.lookAt(desiredLookAt);
      isInitialized.current = true;
      return;
    }

    // ── Exponential Smoothing (1 - exp(-lambda * dt)) ────────────────────────
    // Completely eliminates jitter, frame drops, and snapping!
    const posLambda = mode === "DRIVING_COCKPIT" ? 14.0 : 7.2;
    const lookLambda = mode === "DRIVING_COCKPIT" ? 11.0 : 8.5;

    const posAlpha = 1.0 - Math.exp(-posLambda * dt);
    const lookAlpha = 1.0 - Math.exp(-lookLambda * dt);

    currentPos.current.lerp(desiredPos, posAlpha);
    currentLookAt.current.lerp(desiredLookAt, lookAlpha);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);

    // Dynamic FOV smoothing
    const perspCamera = camera as THREE.PerspectiveCamera;
    if (perspCamera.isPerspectiveCamera) {
      const fovAlpha = 1.0 - Math.exp(-5.0 * dt);
      perspCamera.fov = THREE.MathUtils.lerp(perspCamera.fov, targetFov, fovAlpha);
      perspCamera.updateProjectionMatrix();
    }
  });

  return null;
}
