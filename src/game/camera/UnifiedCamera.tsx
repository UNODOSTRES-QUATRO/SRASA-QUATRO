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
  vehicleStateRef?: React.MutableRefObject<VehicleState>;
  humanPosRef?: React.MutableRefObject<{ x: number; y: number; z: number; heading: number }>;
  isInsideEscapeRoom?: boolean;
  isMoving?: boolean;
  camAzimuthRef?: React.MutableRefObject<number>;
}

export function UnifiedCamera({
  mode,
  targetPos,
  targetHeading,
  vehicleState,
  vehicleStateRef,
  humanPosRef,
  isInsideEscapeRoom = false,
  isMoving = false,
  camAzimuthRef,
}: UnifiedCameraProps) {
  const { camera, gl } = useThree();

  // Current interpolated state with exponential damping
  const currentPos = useRef(new THREE.Vector3(targetPos[0], targetPos[1] + 5, targetPos[2] - 8));
  const currentLookAt = useRef(new THREE.Vector3(targetPos[0], targetPos[1] + 1.2, targetPos[2]));
  const smoothedHeading = useRef(targetHeading);
  const smoothedDrift = useRef(0);
  const isInitialized = useRef(false);
  const prevMode = useRef<UnifiedCameraMode>(mode);

  // Orbit parameters for ON_FOOT mode
  const orbitAzimuth = useRef(targetHeading);
  const orbitPolar = useRef(0.65);
  const orbitDistance = useRef(isInsideEscapeRoom ? 6.0 : 8.0);
  const targetOrbitDistance = useRef(isInsideEscapeRoom ? 6.0 : 8.0);
  const pointer = useRef({ dragging: false, pointerId: -1, x: 0, y: 0 });

  // Cockpit head bob & dynamics
  const prevSpeed = useRef(0);
  const bobTime = useRef(0);

  // Transition smoothing between modes
  const transitionProgress = useRef(0);
  const prevDesiredPos = useRef(new THREE.Vector3());

  // Inertial pointer dragging velocity for ON_FOOT
  const pointerVel = useRef({ x: 0, y: 0 });
  const lastPointerPos = useRef({ x: 0, y: 0, time: 0 });

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
      pointerVel.current = { x: 0, y: 0 };
      lastPointerPos.current = { x: event.clientX, y: event.clientY, time: performance.now() };
      element.setPointerCapture(event.pointerId);
      element.style.cursor = "grabbing";
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!pointer.current.dragging || pointer.current.pointerId !== event.pointerId) return;
      const now = performance.now();
      const dtMove = Math.max(1, now - lastPointerPos.current.time) / 1000;

      const deltaX = event.clientX - pointer.current.x;
      const deltaY = event.clientY - pointer.current.y;
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;

      // Track instantaneous velocity for smooth release inertia
      pointerVel.current = {
        x: (deltaX / dtMove) * 0.003,
        y: (deltaY / dtMove) * 0.002,
      };
      lastPointerPos.current = { x: event.clientX, y: event.clientY, time: now };

      orbitAzimuth.current -= deltaX * 0.0045;
      orbitPolar.current = THREE.MathUtils.clamp(
        orbitPolar.current + deltaY * 0.003,
        0.22,
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
        3.5,
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
    // Decouple delta to eliminate micro-stutters: sub-frame clamped
    const dt = Math.min(delta, 0.05);

    const liveVehicle = vehicleStateRef?.current ?? vehicleState;
    const liveTargetPos: [number, number, number] = mode === "ON_FOOT"
      ? (humanPosRef?.current ? [humanPosRef.current.x, humanPosRef.current.y, humanPosRef.current.z] : targetPos)
      : (liveVehicle ? [liveVehicle.position.x, liveVehicle.position.y, liveVehicle.position.z] : targetPos);

    const liveHeading = mode === "ON_FOOT"
      ? (humanPosRef?.current ? humanPosRef.current.heading : targetHeading)
      : (liveVehicle ? liveVehicle.heading : targetHeading);

    // Smooth mode switch alignment with dynamic transition easing
    if (prevMode.current !== mode) {
      const dx = currentPos.current.x - liveTargetPos[0];
      const dz = currentPos.current.z - liveTargetPos[2];
      const currentAngle = Math.atan2(-dx, -dz);

      if (mode === "ON_FOOT") {
        orbitAzimuth.current = isNaN(currentAngle) ? liveHeading : currentAngle;
        const currentDist = Math.hypot(dx, dz);
        if (!isNaN(currentDist) && currentDist > 1.5) {
          const clamped = THREE.MathUtils.clamp(currentDist, 4.0, 10.0);
          orbitDistance.current = clamped;
          targetOrbitDistance.current = clamped;
        }
        pointerVel.current = { x: 0, y: 0 };
      } else if (mode === "DRIVING_CHASE") {
        if (!isNaN(currentAngle)) {
          smoothedHeading.current = currentAngle;
        }
      }
      prevMode.current = mode;
      transitionProgress.current = 1.0; // Trigger transition blend
    }

    // Decay transition progress smoothly
    if (transitionProgress.current > 0) {
      transitionProgress.current = Math.max(0, transitionProgress.current - dt / 0.55);
    }

    let desiredPos = new THREE.Vector3();
    let desiredLookAt = new THREE.Vector3();
    let targetFov = 50;

    // ── 1. Heading Shortest-Arc Smoothing (Exponential decay) ────────────────
    let angleDiff = liveHeading - smoothedHeading.current;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

    const headingLambda = mode === "DRIVING_COCKPIT"
      ? 24.0
      : mode === "DRIVING_CHASE"
      ? (liveVehicle?.driftFactor && liveVehicle.driftFactor > 0.2 ? 4.5 : 6.5)
      : 8.0;
    const headingAlpha = 1.0 - Math.exp(-headingLambda * dt);
    smoothedHeading.current += angleDiff * headingAlpha;

    if (mode === "DRIVING_CHASE" && liveVehicle) {
      // ── MODE: DRIVING CHASE (FR Legends Flow) ──────────────────────────────
      const { speed, driftFactor = 0, lateralSpeed = 0, scaleFactor = 1.0 } = liveVehicle;
      const speedRatio = Math.min(1, Math.abs(speed) / 24);

      // Smooth drift factor with exponential damping
      const driftAlpha = 1.0 - Math.exp(-7.0 * dt);
      smoothedDrift.current = THREE.MathUtils.lerp(smoothedDrift.current, driftFactor, driftAlpha);

      const isPocket = scaleFactor < 0.5;
      const baseDist = isPocket ? 2.5 : 6.8;
      const baseHeight = isPocket ? 1.2 : 2.65;

      const distance = baseDist + speedRatio * 1.8;
      const height = baseHeight + speedRatio * 0.3;

      // Side-angle drift pan offset (smoothly swings camera outward with car's slip angle, zero jitter)
      const driftSidePan = THREE.MathUtils.clamp((lateralSpeed || 0) * 0.06, -0.45, 0.45) * smoothedDrift.current;
      const panAngle = smoothedHeading.current + driftSidePan;

      desiredPos.set(
        liveTargetPos[0] - Math.sin(panAngle) * distance,
        liveTargetPos[1] + height,
        liveTargetPos[2] - Math.cos(panAngle) * distance
      );

      const lookAheadDist = isPocket ? 0.8 : 2.8;
      desiredLookAt.set(
        liveTargetPos[0] + Math.sin(smoothedHeading.current) * lookAheadDist,
        liveTargetPos[1] + 0.65,
        liveTargetPos[2] + Math.cos(smoothedHeading.current) * lookAheadDist
      );

      // Speed FOV: breathing expansion sensation without motion sickness
      targetFov = 48 + speedRatio * 9 + smoothedDrift.current * 4.0;

    } else if (mode === "DRIVING_COCKPIT" && liveVehicle) {
      // ── MODE: DRIVING COCKPIT (First-Person Interior) ──────────────────────
      const { speed, steeringAngle = 0, lateralSpeed = 0 } = liveVehicle;
      const speedRatio = Math.min(1, Math.abs(speed) / 24);

      // Head bob & G-Force
      bobTime.current += dt * Math.abs(speed) * 0.8;
      const bob = Math.sin(bobTime.current * 2.2) * 0.01 * Math.min(1, Math.abs(speed) / 6);
      const accelDelta = (speed - prevSpeed.current) / Math.max(0.001, dt);
      prevSpeed.current = speed;
      const gPitch = THREE.MathUtils.clamp(accelDelta * 0.006, -0.045, 0.045);
      const lateralSway = THREE.MathUtils.clamp(lateralSpeed * 0.032, -0.09, 0.09);
      const steerSway = steeringAngle * -0.045;

      // Left driver seat offset inside cabin (eye level directly above bucket seat)
      const cockpitOffset = new THREE.Vector3(
        -0.34 + steerSway + lateralSway,
        1.10 + bob + gPitch,
        0.04
      );
      const rotMatrix = new THREE.Matrix4().makeRotationY(smoothedHeading.current);
      cockpitOffset.applyMatrix4(rotMatrix);

      desiredPos.set(
        liveTargetPos[0] + cockpitOffset.x,
        liveTargetPos[1] + cockpitOffset.y,
        liveTargetPos[2] + cockpitOffset.z
      );

      const lookDist = 22;
      const lookOffsetLateral = steerSway * 3.5;
      const rotLookX = Math.sin(smoothedHeading.current) * lookDist + Math.cos(smoothedHeading.current) * lookOffsetLateral;
      const rotLookZ = Math.cos(smoothedHeading.current) * lookDist - Math.sin(smoothedHeading.current) * lookOffsetLateral;
      desiredLookAt.set(
        liveTargetPos[0] + rotLookX,
        liveTargetPos[1] + 1.0,
        liveTargetPos[2] + rotLookZ
      );

      targetFov = 64 + speedRatio * 8;

    } else {
      // ── MODE: ON_FOOT (Smooth Over-The-Shoulder / Isometric Orbit) ─────────
      if (camAzimuthRef) {
        camAzimuthRef.current = orbitAzimuth.current;
      }
      // Detect if player is inside an interior (Home, Workplace, or Great Keep)
      const isInsideHome =
        liveTargetPos[0] > 15.5 &&
        liveTargetPos[0] < 24.5 &&
        liveTargetPos[2] > -64.5 &&
        liveTargetPos[2] < -55.5;

      const isInsideWorkplace =
        liveTargetPos[0] > 11.0 &&
        liveTargetPos[0] < 25.0 &&
        liveTargetPos[2] > 63.0 &&
        liveTargetPos[2] < 77.0;

      const isInsideBengkel =
        liveTargetPos[0] > -24.5 &&
        liveTargetPos[0] < -11.5 &&
        liveTargetPos[2] > -6.5 &&
        liveTargetPos[2] < 6.5;

      const isInterior = isInsideEscapeRoom || isInsideHome || isInsideWorkplace || isInsideBengkel || liveTargetPos[2] > 198.0;

      // Smart interior distance clamping to prevent clipping through exterior walls/roofs
      const effectiveTargetDistance = isInterior
        ? THREE.MathUtils.clamp(targetOrbitDistance.current, 2.8, 4.2)
        : targetOrbitDistance.current;

      // Smooth orbit distance damping
      const distAlpha = 1.0 - Math.exp(-6.5 * dt);
      orbitDistance.current = THREE.MathUtils.lerp(
        orbitDistance.current,
        effectiveTargetDistance,
        distAlpha
      );

      // Inertia or gentle auto-follow
      if (!pointer.current.dragging) {
        if (Math.abs(pointerVel.current.x) > 0.0001 || Math.abs(pointerVel.current.y) > 0.0001) {
          orbitAzimuth.current -= pointerVel.current.x * dt;
          orbitPolar.current = THREE.MathUtils.clamp(
            orbitPolar.current + pointerVel.current.y * dt,
            isInterior ? 0.35 : 0.22,
            isInterior ? 1.25 : Math.PI / 2 - 0.08
          );
          const decay = Math.exp(-8.0 * dt);
          pointerVel.current.x *= decay;
          pointerVel.current.y *= decay;
        } else if (isMoving) {
          // Gentle auto-follow only when walking forward (diff within 80 deg), never when strafing or facing backward
          let diff = liveHeading - orbitAzimuth.current;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          if (Math.abs(diff) < Math.PI * 0.44) {
            orbitAzimuth.current += diff * (1.0 - Math.exp(-1.8 * dt));
          }
        }
      }

      const hDist = orbitDistance.current * Math.sin(orbitPolar.current);
      const vDist = orbitDistance.current * Math.cos(orbitPolar.current);

      const calculatedCamY = liveTargetPos[1] + vDist + (isInterior ? 0.35 : 0.85);
      const clampedCamY = isInterior
        ? Math.min(2.85, Math.max(0.65, calculatedCamY))
        : Math.max(0.55, calculatedCamY);

      desiredPos.set(
        liveTargetPos[0] - Math.sin(orbitAzimuth.current) * hDist,
        clampedCamY,
        liveTargetPos[2] - Math.cos(orbitAzimuth.current) * hDist
      );

      desiredLookAt.set(
        liveTargetPos[0],
        liveTargetPos[1] + (isInterior ? 1.0 : 1.15),
        liveTargetPos[2]
      );

      targetFov = isInterior ? 52 : 48;
    }

    // ── First Frame Initializer or Teleport Discontinuity Snap ───────────────
    const distToTarget = currentLookAt.current.distanceTo(desiredLookAt);
    if (!isInitialized.current || distToTarget > 45) {
      currentPos.current.copy(desiredPos);
      currentLookAt.current.copy(desiredLookAt);
      camera.position.copy(desiredPos);
      camera.lookAt(desiredLookAt);
      isInitialized.current = true;
      return;
    }

    // ── Exponential Smoothing (1 - exp(-lambda * dt)) ────────────────────────
    // Softer lambda during transitions for a cinematic crane glide, tight lambda during gameplay
    const basePosLambda = mode === "DRIVING_CHASE" ? 9.5 : 8.5;
    const baseLookLambda = mode === "DRIVING_COCKPIT" ? 28.0 : mode === "DRIVING_CHASE" ? 10.5 : 9.0;

    const posLambda = THREE.MathUtils.lerp(basePosLambda, 5.0, transitionProgress.current);
    const lookLambda = THREE.MathUtils.lerp(baseLookLambda, 5.5, transitionProgress.current);

    const posAlpha = 1.0 - Math.exp(-posLambda * dt);
    const lookAlpha = 1.0 - Math.exp(-lookLambda * dt);

    if (mode === "DRIVING_COCKPIT") {
      // Pin cockpit camera tightly to interior cabin with zero lag, smooth glide only during mode transition
      if (transitionProgress.current <= 0.02) {
        currentPos.current.copy(desiredPos);
      } else {
        const cockpitPosAlpha = 1.0 - Math.exp(-14.0 * dt);
        currentPos.current.lerp(desiredPos, cockpitPosAlpha);
      }
    } else {
      currentPos.current.lerp(desiredPos, posAlpha);
    }

    currentLookAt.current.lerp(desiredLookAt, lookAlpha);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLookAt.current);

    // Dynamic FOV smoothing (only update projection matrix when changed)
    const perspCamera = camera as THREE.PerspectiveCamera;
    if (perspCamera.isPerspectiveCamera) {
      const fovAlpha = 1.0 - Math.exp(-5.0 * dt);
      const nextFov = THREE.MathUtils.lerp(perspCamera.fov, targetFov, fovAlpha);
      if (Math.abs(perspCamera.fov - nextFov) > 0.015) {
        perspCamera.fov = nextFov;
        perspCamera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
