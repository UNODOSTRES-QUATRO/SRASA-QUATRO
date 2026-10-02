"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HumanPlayerProps {
  position: [number, number, number];
  heading: number; // in radians
  isMoving: boolean;
}

export function HumanPlayer({ position, heading, isMoving }: HumanPlayerProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 10;

    if (rootRef.current) {
      // Smoothly interpolate position and rotation
      rootRef.current.position.set(position[0], position[1], position[2]);
      rootRef.current.rotation.y = heading;
    }

    if (isMoving) {
      // Walking swing
      const swing = Math.sin(t) * 0.45;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.8;
      if (headRef.current) headRef.current.position.y = 1.35 + Math.abs(Math.sin(t)) * 0.04;
    } else {
      // Idle breathing
      const idle = Math.sin(clock.getElapsedTime() * 2) * 0.02;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
      if (headRef.current) headRef.current.position.y = 1.35 + idle;
    }
  });

  return (
    <group ref={rootRef} position={position} rotation={[0, heading, 0]}>
      {/* SHADOW BLOB */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* LEGS */}
      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.12, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.65, 0.16]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>
      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.12, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.65, 0.16]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>

      {/* SHOES */}
      <mesh position={[-0.12, 0.06, 0.04]} castShadow>
        <boxGeometry args={[0.16, 0.12, 0.24]} />
        <meshStandardMaterial color="#1a202c" roughness={0.9} />
      </mesh>
      <mesh position={[0.12, 0.06, 0.04]} castShadow>
        <boxGeometry args={[0.16, 0.12, 0.24]} />
        <meshStandardMaterial color="#1a202c" roughness={0.9} />
      </mesh>

      {/* TORSO / JACKET */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.26]} />
        <meshStandardMaterial color="#319795" roughness={0.7} />
      </mesh>
      {/* Inner Shirt Collar */}
      <mesh position={[0, 1.15, 0.11]} castShadow>
        <boxGeometry args={[0.18, 0.15, 0.06]} />
        <meshStandardMaterial color="#f7fafc" roughness={0.8} />
      </mesh>

      {/* ARMS */}
      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.28, 0.9, 0]} castShadow>
        <boxGeometry args={[0.13, 0.52, 0.14]} />
        <meshStandardMaterial color="#2c7a7b" roughness={0.7} />
      </mesh>
      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.28, 0.9, 0]} castShadow>
        <boxGeometry args={[0.13, 0.52, 0.14]} />
        <meshStandardMaterial color="#2c7a7b" roughness={0.7} />
      </mesh>

      {/* HEAD GROUP */}
      <group ref={headRef} position={[0, 1.35, 0]}>
        {/* Head Skin */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color="#fbd38d" roughness={0.7} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 0.25, -0.02]} castShadow>
          <boxGeometry args={[0.3, 0.12, 0.32]} />
          <meshStandardMaterial color="#4a2c11" roughness={0.9} />
        </mesh>
        {/* Hair Back */}
        <mesh position={[0, 0.14, -0.13]} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.08]} />
          <meshStandardMaterial color="#4a2c11" roughness={0.9} />
        </mesh>
        {/* Eyes (Front facing Z+) */}
        <mesh position={[-0.07, 0.12, 0.145]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial color="#1a202c" />
        </mesh>
        <mesh position={[0.07, 0.12, 0.145]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial color="#1a202c" />
        </mesh>
      </group>
    </group>
  );
}
