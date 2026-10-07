"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HumanPlayerProps {
  position: [number, number, number];
  heading: number; // in radians
  isMoving: boolean;
  gender: "male" | "female";
  humanPosRef?: React.MutableRefObject<{ x: number; y: number; z: number; heading: number }>;
}

export function HumanPlayer({
  position,
  heading,
  isMoving,
  gender,
  humanPosRef,
}: HumanPlayerProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (rootRef.current) {
      const pos = humanPosRef?.current
        ? [humanPosRef.current.x, humanPosRef.current.y, humanPosRef.current.z]
        : position;
      const head = humanPosRef?.current ? humanPosRef.current.heading : heading;
      rootRef.current.position.set(pos[0], pos[1], pos[2]);
      rootRef.current.rotation.y = head;
    }
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 10;
    const timeSec = clock.getElapsedTime();

    if (rootRef.current) {
      if (humanPosRef?.current) {
        rootRef.current.position.set(
          humanPosRef.current.x,
          humanPosRef.current.y,
          humanPosRef.current.z
        );
        rootRef.current.rotation.y = humanPosRef.current.heading;
      } else {
        rootRef.current.position.set(position[0], position[1], position[2]);
        rootRef.current.rotation.y = heading;
      }
    }

    const swing = Math.sin(t) * 0.42;
    const idle = Math.sin(timeSec * 2.4) * 0.025;

    if (isMoving) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing;
      if (headRef.current) headRef.current.position.y = 1.35 + Math.abs(Math.sin(t)) * 0.035;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0;
      if (headRef.current) headRef.current.position.y = 1.35 + idle;
    }
  });

  // Anime-inspired styling
  const isMale = gender === "male";
  const skinColor = "#fef3c7";
  const hairColor = isMale ? "#1c1917" : "#451a03"; // Dark hair / dark brown
  const jacketColor = isMale ? "#334155" : "#e4a19b"; // Urban overshirt / cardigan
  const shirtColor = isMale ? "#f8fafc" : "#fafafa";
  const pantsColor = isMale ? "#1e293b" : "#44403c";
  const shoesColor = isMale ? "#f1f5f9" : "#a8a29e";

  return (
    <group ref={rootRef}>
      {/* SHADOW BLOB */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* LEGS */}
      <mesh ref={leftLegRef} position={[-0.12, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.65, 0.16]} />
        <meshStandardMaterial color={pantsColor} roughness={0.8} />
        {/* SHOES */}
        <mesh position={[0, -0.29, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.24]} />
          <meshStandardMaterial color={shoesColor} roughness={0.9} />
        </mesh>
      </mesh>
      <mesh ref={rightLegRef} position={[0.12, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.65, 0.16]} />
        <meshStandardMaterial color={pantsColor} roughness={0.8} />
        {/* SHOES */}
        <mesh position={[0, -0.29, 0.04]} castShadow>
          <boxGeometry args={[0.16, 0.12, 0.24]} />
          <meshStandardMaterial color={shoesColor} roughness={0.9} />
        </mesh>
      </mesh>

      {/* TORSO / JACKET */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={isMale ? [0.42, 0.55, 0.26] : [0.38, 0.52, 0.24]} />
        <meshStandardMaterial color={jacketColor} roughness={0.7} />
      </mesh>

      {/* INNER SHIRT */}
      <mesh position={[0, 1.15, 0.11]} castShadow>
        <boxGeometry args={[0.18, 0.15, 0.06]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>

      {/* LEFT ARM */}
      <group ref={leftArmRef} position={[-0.28, 1.15, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <boxGeometry args={[0.13, 0.52, 0.14]} />
          <meshStandardMaterial color={jacketColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.54, 0.02]} castShadow>
          <boxGeometry args={[0.09, 0.1, 0.1]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* RIGHT ARM */}
      <group ref={rightArmRef} position={[0.28, 1.15, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <boxGeometry args={[0.13, 0.52, 0.14]} />
          <meshStandardMaterial color={jacketColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.54, 0.02]} castShadow>
          <boxGeometry args={[0.09, 0.1, 0.1]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* HEAD GROUP */}
      <group ref={headRef} position={[0, 1.35, 0]}>
        {/* Face Base */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={isMale ? [0.28, 0.28, 0.28] : [0.26, 0.26, 0.26]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>

        {/* Eyes (Expressive) */}
        <mesh position={[-0.07, 0.12, 0.135]}>
          <boxGeometry args={isMale ? [0.04, 0.04, 0.01] : [0.05, 0.05, 0.01]} />
          <meshBasicMaterial color="#1a202c" />
        </mesh>
        <mesh position={[0.07, 0.12, 0.135]}>
          <boxGeometry args={isMale ? [0.04, 0.04, 0.01] : [0.05, 0.05, 0.01]} />
          <meshBasicMaterial color="#1a202c" />
        </mesh>

        {/* Hair */}
        {isMale ? (
          <group>
            {/* Messy intentional male hair */}
            <mesh position={[0, 0.26, -0.02]} castShadow>
              <boxGeometry args={[0.3, 0.14, 0.32]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.14, -0.15]} castShadow>
              <boxGeometry args={[0.3, 0.2, 0.06]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
          </group>
        ) : (
          <group>
            {/* Long length female hair */}
            <mesh position={[0, 0.25, -0.02]} castShadow>
              <boxGeometry args={[0.28, 0.12, 0.3]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.05, -0.13]} castShadow>
              <boxGeometry args={[0.3, 0.5, 0.1]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
            {/* Front bangs */}
            <mesh position={[0, 0.2, 0.13]} castShadow>
              <boxGeometry args={[0.28, 0.08, 0.06]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}
