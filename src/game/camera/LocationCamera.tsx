"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { LocationType } from "../core/gameStore";

interface LocationCameraProps {
  location: LocationType;
  humanPos: [number, number, number];
  isInsideEscapeRoom?: boolean;
}

const CAMERA_PRESETS: Partial<Record<LocationType, { distance: number; min: number; max: number; polar: number }>> = {
  RUMAH: { distance: 10.5, min: 7, max: 16, polar: 0.68 },
  TEMPAT_KERJA: { distance: 13, min: 8, max: 20, polar: 0.7 },
  BENGKEL: { distance: 10, min: 7, max: 16, polar: 0.72 },
  KASTIL: { distance: 17, min: 10, max: 26, polar: 0.75 },
};

const DEFAULT_PRESET = { distance: 13, min: 8, max: 22, polar: 0.72 };

export function LocationCamera({
  location,
  humanPos,
  isInsideEscapeRoom = false,
}: LocationCameraProps) {
  const { camera, gl } = useThree();
  const azimuth = useRef(-0.62);
  const polar = useRef(0.72);
  const distance = useRef(13);
  const targetDistance = useRef(13);
  const targetPoint = useRef(new THREE.Vector3());
  const desiredPosition = useRef(new THREE.Vector3());
  const pointer = useRef({ dragging: false, pointerId: -1, x: 0, y: 0 });
  const isInitialized = useRef(false);

  useEffect(() => {
    const element = gl.domElement;
    const preset = location === "KASTIL" && isInsideEscapeRoom
      ? { ...CAMERA_PRESETS.KASTIL!, distance: 12, min: 8, max: 18 }
      : CAMERA_PRESETS[location] ?? DEFAULT_PRESET;
    targetDistance.current = preset.distance;
    if (!isInitialized.current) polar.current = preset.polar;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pointer.current = {
        dragging: true,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
      element.setPointerCapture(event.pointerId);
      element.style.cursor = "grabbing";
      event.preventDefault();
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!pointer.current.dragging || pointer.current.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - pointer.current.x;
      const deltaY = event.clientY - pointer.current.y;
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;
      azimuth.current -= deltaX * 0.006;
      polar.current = THREE.MathUtils.clamp(polar.current + deltaY * 0.004, 0.28, 1.35);
    };
    const endDrag = (event: PointerEvent) => {
      if (pointer.current.pointerId !== event.pointerId) return;
      pointer.current.dragging = false;
      pointer.current.pointerId = -1;
      element.style.cursor = "grab";
    };
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      targetDistance.current = THREE.MathUtils.clamp(
        targetDistance.current + event.deltaY * 0.012,
        preset.min,
        preset.max
      );
    };
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();

    element.style.cursor = "grab";
    element.style.touchAction = "none";
    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", endDrag);
    element.addEventListener("pointercancel", endDrag);
    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("contextmenu", preventContextMenu);

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", endDrag);
      element.removeEventListener("pointercancel", endDrag);
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("contextmenu", preventContextMenu);
      element.style.cursor = "";
      element.style.touchAction = "";
    };
  }, [gl, isInsideEscapeRoom, location]);

  useFrame((_, delta) => {
    const preset = CAMERA_PRESETS[location] ?? DEFAULT_PRESET;
    const isRoad = location === "JALAN" || location === "DIMENSI_LAIN";
    const focusY = location === "KASTIL" && isInsideEscapeRoom ? 1.1 : 0.95;
    const target = isRoad
      ? targetPoint.current.set(humanPos[0], 0.6, 0)
      : targetPoint.current.set(...humanPos);
    if (!isRoad) target.y += focusY;
    const clampedDelta = Math.min(delta, 0.05);

    distance.current = THREE.MathUtils.damp(distance.current, targetDistance.current, 4, clampedDelta);

    const horizontalDistance = distance.current * Math.sin(polar.current);
    desiredPosition.current.set(
      target.x + Math.sin(azimuth.current) * horizontalDistance,
      target.y + distance.current * Math.cos(polar.current),
      target.z + Math.cos(azimuth.current) * horizontalDistance
    );

    if (location === "RUMAH") {
      desiredPosition.current.x = THREE.MathUtils.clamp(desiredPosition.current.x, -4.05, 4.05);
      desiredPosition.current.z = THREE.MathUtils.clamp(desiredPosition.current.z, -4.05, 4.05);
    } else if (location === "TEMPAT_KERJA") {
      desiredPosition.current.x = THREE.MathUtils.clamp(desiredPosition.current.x, -6.45, 6.45);
      desiredPosition.current.z = THREE.MathUtils.clamp(desiredPosition.current.z, -6.45, 6.45);
    } else if (location === "BENGKEL") {
      desiredPosition.current.x = THREE.MathUtils.clamp(desiredPosition.current.x, -5.45, 5.45);
      desiredPosition.current.z = THREE.MathUtils.clamp(desiredPosition.current.z, -5.45, 5.45);
    } else if (location === "KASTIL" && isInsideEscapeRoom) {
      desiredPosition.current.x = THREE.MathUtils.clamp(desiredPosition.current.x, -5.8, 5.8);
      desiredPosition.current.z = THREE.MathUtils.clamp(desiredPosition.current.z, -5.8, 5.8);
    }

    const smoothing = 1 - Math.exp(-clampedDelta * 5.5);
    if (!isInitialized.current) {
      camera.position.copy(desiredPosition.current);
      camera.lookAt(target);
      isInitialized.current = true;
      return;
    }

    camera.position.lerp(desiredPosition.current, smoothing);
    camera.lookAt(target);
  });

  return null;
}
