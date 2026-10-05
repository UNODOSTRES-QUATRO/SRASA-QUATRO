"use client";

import { useRef } from "react";
import * as THREE from "three";

export function SceneLighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      {/* 3D Horizon & Canvas Clear Color */}
      <color attach="background" args={["#182030"]} />

      {/* Warm ambient base: soft twilight sky tone */}
      <ambientLight color="#94a3b8" intensity={0.85} />

      {/* Low-angle Golden Hour Directional Sunlight */}
      <directionalLight
        ref={dirLightRef}
        color="#fed7aa"
        intensity={1.9}
        position={[45, 32, -20]}
      />

      {/* Gentle upward bounce light simulating warm asphalt / dusk ground radiation */}
      <hemisphereLight
        args={["#fed7aa", "#1e293b", 0.65]}
      />

      {/* Atmospheric low-cortisol twilight fog (deep expansive horizon) */}
      <fog attach="fog" args={["#182030", 55, 250]} />
    </>
  );
}
