"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface VoxelPortalProps {
  position?: [number, number, number];
  isActive?: boolean;
}

export function VoxelPortal({
  position = [0, 3.2, 105],
  isActive = true,
}: VoxelPortalProps) {
  const outerRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!isActive) return;
    const t = clock.getElapsedTime();

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.6;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 0.9;
      innerRingRef.current.rotation.y = Math.sin(t * 1.5) * 0.2;
    }

    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(t * 3.5) * 0.12);
    }
  });

  if (!isActive) return null;

  return (
    <group position={position}>
      {/* GLOWING AMBIENT LIGHT FROM PORTAL */}
      <pointLight color="#78d1d2" intensity={4.0} distance={25} decay={2} />
      <pointLight color="#e09f58" intensity={3.0} distance={15} decay={2} />

      {/* PORTAL PILLARS / THRESHOLD ARCH */}
      <mesh position={[-4.5, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 8, 1.2]} />
        <meshStandardMaterial color="#1a1e29" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[4.5, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 8, 1.2]} />
        <meshStandardMaterial color="#1a1e29" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 4.2, 0]} castShadow>
        <boxGeometry args={[10.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#1a1e29" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* OUTER ROTATING VOXEL RING */}
      <group ref={outerRingRef}>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          const radius = 3.8;
          return (
            <mesh
              key={`outer-cube-${i}`}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
            >
              <boxGeometry args={[0.7, 0.7, 0.7]} />
              <meshStandardMaterial
                color="#e09f58"
                emissive="#ffe2a0"
                emissiveIntensity={1.4}
              />
            </mesh>
          );
        })}
      </group>

      {/* INNER COUNTER-ROTATING VOXEL RING */}
      <group ref={innerRingRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const radius = 2.4;
          return (
            <mesh
              key={`inner-cube-${i}`}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
            >
              <boxGeometry args={[0.55, 0.55, 0.55]} />
              <meshStandardMaterial
                color="#5bc0be"
                emissive="#78d1d2"
                emissiveIntensity={1.8}
              />
            </mesh>
          );
        })}
      </group>

      {/* CENTRAL DIGITAL EVENT HORIZON */}
      <mesh ref={coreRef} position={[0, 0, 0]}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshBasicMaterial
          color="#3a506b"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
