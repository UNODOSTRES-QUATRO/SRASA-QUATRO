"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface SemicolonCatProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  isAlert?: boolean;
}

export function SemicolonCat({
  position = [0.38, 0.72, -0.15],
  rotation = [0, -0.2, 0],
  isAlert = false,
}: SemicolonCatProps) {
  const bodyRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Subtle breathing animation
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(t * 2.5) * 0.03;
    }

    // Gentle tail twitch
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 1.8) * 0.25;
      tailRef.current.rotation.z = Math.cos(t * 1.2) * 0.15;
    }

    // Head reacts if alert
    if (headRef.current) {
      if (isAlert) {
        headRef.current.rotation.y = Math.sin(t * 4) * 0.2;
      } else {
        headRef.current.rotation.y = Math.sin(t * 0.8) * 0.08;
      }
    }
  });

  return (
    <group position={position} rotation={rotation} scale={0.45}>
      <group ref={bodyRef}>
        {/* CAT TORSO (Warm dark slate/black fur) */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[0.5, 0.45, 0.75]} />
          <meshStandardMaterial color="#22252c" roughness={0.9} />
        </mesh>

        {/* WHITE CHEST TUFT */}
        <mesh position={[0, 0.26, 0.38]}>
          <boxGeometry args={[0.26, 0.3, 0.04]} />
          <meshStandardMaterial color="#f3ede2" roughness={0.9} />
        </mesh>

        {/* HEAD */}
        <group ref={headRef} position={[0, 0.55, 0.32]}>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.38, 0.38]} />
            <meshStandardMaterial color="#22252c" roughness={0.9} />
          </mesh>

          {/* LEFT EAR */}
          <mesh position={[0.15, 0.24, 0]}>
            <boxGeometry args={[0.12, 0.16, 0.08]} />
            <meshStandardMaterial color="#22252c" />
          </mesh>

          {/* RIGHT EAR */}
          <mesh position={[-0.15, 0.24, 0]}>
            <boxGeometry args={[0.12, 0.16, 0.08]} />
            <meshStandardMaterial color="#22252c" />
          </mesh>

          {/* AMBER EYES (The Semicolon glow) */}
          <mesh position={[0.12, 0.06, 0.19]}>
            <boxGeometry args={[0.08, 0.06, 0.02]} />
            <meshStandardMaterial
              color="#ffe2a0"
              emissive="#e09f58"
              emissiveIntensity={isAlert ? 2.0 : 1.2}
            />
          </mesh>
          <mesh position={[-0.12, 0.06, 0.19]}>
            <boxGeometry args={[0.08, 0.06, 0.02]} />
            <meshStandardMaterial
              color="#ffe2a0"
              emissive="#e09f58"
              emissiveIntensity={isAlert ? 2.0 : 1.2}
            />
          </mesh>

          {/* SOFT PINK NOSE */}
          <mesh position={[0, -0.02, 0.2]}>
            <boxGeometry args={[0.05, 0.04, 0.02]} />
            <meshStandardMaterial color="#d49292" />
          </mesh>
        </group>

        {/* PAWS (With white socks) */}
        <mesh position={[0.18, 0.06, 0.28]}>
          <boxGeometry args={[0.14, 0.12, 0.18]} />
          <meshStandardMaterial color="#f3ede2" roughness={0.9} />
        </mesh>
        <mesh position={[-0.18, 0.06, 0.28]}>
          <boxGeometry args={[0.14, 0.12, 0.18]} />
          <meshStandardMaterial color="#f3ede2" roughness={0.9} />
        </mesh>

        {/* TAIL (Curling up gracefully) */}
        <group ref={tailRef} position={[0, 0.25, -0.38]}>
          <mesh position={[0, 0.18, -0.1]} rotation={[-0.4, 0, 0]}>
            <boxGeometry args={[0.1, 0.38, 0.1]} />
            <meshStandardMaterial color="#22252c" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.38, -0.22]} rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.09, 0.2, 0.09]} />
            <meshStandardMaterial color="#f3ede2" roughness={0.9} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
