"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TheGuardianProps {
  position?: [number, number, number];
}

export function TheGuardian({ position = [-3.8, 0, 131] }: TheGuardianProps) {
  const torsoRef = useRef<THREE.Mesh>(null);
  const lanternGlowRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Gentle meditative breathing animation
    if (torsoRef.current) {
      torsoRef.current.position.y = 0.85 + Math.sin(t * 1.5) * 0.02;
    }
    // Subtle lantern flicker
    if (lanternGlowRef.current) {
      lanternGlowRef.current.intensity = 2.2 + Math.sin(t * 8.0) * 0.25;
    }
  });

  return (
    <group position={position}>
      {/* STONE BENCH */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.45, 0.9]} />
        <meshStandardMaterial color="#474e5d" roughness={0.9} />
      </mesh>

      {/* GUARDIAN SAGE BODY */}
      {/* Robe Lower Body */}
      <mesh position={[0, 0.65, 0.05]} castShadow>
        <boxGeometry args={[0.7, 0.5, 0.65]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>

      {/* Torso with Breathing */}
      <mesh ref={torsoRef} position={[0, 0.85, 0.05]} castShadow>
        <boxGeometry args={[0.62, 0.55, 0.55]} />
        <meshStandardMaterial color="#314055" roughness={0.75} />
      </mesh>

      {/* Folded Arms */}
      <mesh position={[0, 0.82, 0.35]} castShadow>
        <boxGeometry args={[0.55, 0.18, 0.22]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.25, 0.05]} castShadow>
        <boxGeometry args={[0.38, 0.38, 0.38]} />
        <meshStandardMaterial color="#e5c8a8" roughness={0.6} />
      </mesh>

      {/* Sage White Beard */}
      <mesh position={[0, 1.1, 0.22]} castShadow>
        <boxGeometry args={[0.3, 0.28, 0.16]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.85} />
      </mesh>

      {/* Hood / Hat */}
      <mesh position={[0, 1.44, 0.02]} castShadow>
        <boxGeometry args={[0.44, 0.14, 0.44]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* ANCIENT VOXEL LANTERN */}
      <group position={[0.75, 0.4, 0.3]}>
        {/* Lantern Base */}
        <mesh position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.22, 0.12, 0.22]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Glowing Lantern Core */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.16, 0.2, 0.16]} />
          <meshStandardMaterial
            color="#fff2c2"
            emissive="#f59e0b"
            emissiveIntensity={2.5}
            roughness={0.2}
          />
        </mesh>
        {/* Lantern Cap */}
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[0.24, 0.08, 0.24]} />
          <meshStandardMaterial color="#1f2937" roughness={0.5} metalness={0.7} />
        </mesh>
        {/* Lantern Handle Ring */}
        <mesh position={[0, 0.44, 0]}>
          <torusGeometry args={[0.06, 0.015, 6, 12]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Lantern Light Source */}
        <pointLight
          ref={lanternGlowRef}
          color="#ffb703"
          intensity={2.2}
          distance={8}
          decay={2}
          position={[0, 0.25, 0]}
        />
      </group>
    </group>
  );
}
