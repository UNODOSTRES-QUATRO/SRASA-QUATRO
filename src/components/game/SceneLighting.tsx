"use client";

import { useRef } from "react";
import * as THREE from "three";

export function SceneLighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      {/* Warm ambient base: soft blue-grey dusk sky tone */}
      <ambientLight color="#8ca5b5" intensity={0.5} />

      {/* Low-angle Golden Hour Directional Sunlight */}
      <directionalLight
        ref={dirLightRef}
        color="#ffe2a0"
        intensity={1.8}
        position={[40, 25, -30]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0005}
      />

      {/* Gentle upward bounce light simulating warm asphalt/ground radiation */}
      <hemisphereLight
        args={["#ffe2a0", "#3a261a", 0.4]}
      />

      {/* Atmospheric dusk fog */}
      <fog attach="fog" args={["#242b3b", 30, 95]} />
    </>
  );
}
