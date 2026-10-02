"use client";

import { useRef } from "react";
import * as THREE from "three";

export function SceneLighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      {/* Warm ambient base: soft twilight sky tone */}
      <ambientLight color="#8ba2be" intensity={0.65} />

      {/* Low-angle Golden Hour Directional Sunlight */}
      <directionalLight
        ref={dirLightRef}
        color="#fed7aa"
        intensity={1.9}
        position={[45, 32, -20]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={220}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0003}
      />

      {/* Gentle upward bounce light simulating warm asphalt / dusk ground radiation */}
      <hemisphereLight
        args={["#fed7aa", "#1e293b", 0.5]}
      />

      {/* Atmospheric low-cortisol twilight fog (deep expansive horizon) */}
      <fog attach="fog" args={["#182030", 55, 250]} />
    </>
  );
}
