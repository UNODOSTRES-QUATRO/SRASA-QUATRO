"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WeaponId } from "../weapons/weaponTypes";

interface HumanPlayerProps {
  position: [number, number, number];
  heading: number; // in radians
  isMoving: boolean;
  activeWeaponId?: WeaponId;
  chargeLevel?: number;
  attackProgress?: number;
  isAttacking?: boolean;
  humanPosRef?: React.MutableRefObject<{ x: number; y: number; z: number; heading: number }>;
}

export function HumanPlayer({
  position,
  heading,
  isMoving,
  activeWeaponId = "BLUE_SHARD_SWORD",
  chargeLevel = 0,
  attackProgress = 0,
  isAttacking = false,
  humanPosRef,
}: HumanPlayerProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const slashRibbonRef = useRef<THREE.Mesh>(null);
  const inkRibbonRef = useRef<THREE.Mesh>(null);

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

    // Walking animation
    if (isMoving) {
      const swing = Math.sin(t) * 0.45;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (headRef.current) headRef.current.position.y = 1.35 + Math.abs(Math.sin(t)) * 0.04;

      if (!isAttacking) {
        if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.7;
        if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.5 + 0.2;
      }
    } else {
      // Idle breathing
      const idle = Math.sin(timeSec * 2.5) * 0.02;
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (headRef.current) headRef.current.position.y = 1.35 + idle;

      if (!isAttacking) {
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0.2 + idle * 2;
      }
    }

    // Dynamic Attack Arm Posing (Socket IK)
    if (isAttacking && rightArmRef.current) {
      if (activeWeaponId === "BLUE_SHARD_SWORD") {
        // Fluid diagonal slash arc
        const slashPhase = Math.sin(attackProgress * Math.PI);
        rightArmRef.current.rotation.x = -1.2 + slashPhase * 2.4;
        rightArmRef.current.rotation.y = -0.4 + slashPhase * 0.8;
        rightArmRef.current.rotation.z = -0.3 + slashPhase * 0.6;
      } else if (activeWeaponId === "BOW") {
        // Left arm holds bow out forward, right arm draws back
        if (leftArmRef.current) leftArmRef.current.rotation.x = -1.4;
        rightArmRef.current.rotation.x = -1.3;
        rightArmRef.current.rotation.y = -0.5 - chargeLevel * 0.4;
      } else if (activeWeaponId === "HEAVENLY_PEN") {
        // Calligraphy stroke flourish
        const flourish = Math.sin(attackProgress * Math.PI * 2);
        rightArmRef.current.rotation.x = -0.8 + flourish * 0.5;
        rightArmRef.current.rotation.y = flourish * 0.6;
      } else {
        rightArmRef.current.rotation.x = -1.0 + Math.sin(attackProgress * Math.PI) * 1.8;
      }
    }

    // Animate slash energy ribbon
    if (slashRibbonRef.current) {
      if (isAttacking && activeWeaponId === "BLUE_SHARD_SWORD" && attackProgress > 0.05 && attackProgress < 0.85) {
        slashRibbonRef.current.visible = true;
        (slashRibbonRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - attackProgress) * 0.85;
      } else {
        slashRibbonRef.current.visible = false;
      }
    }

    // Animate calligraphy ink flourish ribbon
    if (inkRibbonRef.current) {
      if (isAttacking && activeWeaponId === "HEAVENLY_PEN" && attackProgress > 0.05 && attackProgress < 0.9) {
        inkRibbonRef.current.visible = true;
        (inkRibbonRef.current.material as THREE.MeshBasicMaterial).opacity = (1 - attackProgress) * 0.9;
        inkRibbonRef.current.rotation.z = attackProgress * Math.PI * 2;
      } else {
        inkRibbonRef.current.visible = false;
      }
    }
  });

  return (
    <group ref={rootRef} position={position} rotation={[0, heading, 0]}>
      {/* SHADOW BLOB */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* LEGS */}
      <mesh ref={leftLegRef} position={[-0.12, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.65, 0.16]} />
        <meshStandardMaterial color="#2d3748" roughness={0.8} />
      </mesh>
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
      <mesh position={[0, 1.15, 0.11]} castShadow>
        <boxGeometry args={[0.18, 0.15, 0.06]} />
        <meshStandardMaterial color="#f7fafc" roughness={0.8} />
      </mesh>

      {/* LEFT ARM */}
      <group ref={leftArmRef} position={[-0.28, 1.15, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <boxGeometry args={[0.13, 0.52, 0.14]} />
          <meshStandardMaterial color="#2c7a7b" roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.54, 0.02]} castShadow>
          <boxGeometry args={[0.09, 0.1, 0.1]} />
          <meshStandardMaterial color="#fbd38d" />
        </mesh>

        {/* If Bow: Left hand holds bow riser */}
        {activeWeaponId === "BOW" && (
          <group position={[0, -0.54, 0.1]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <torusGeometry args={[0.45, 0.022, 6, 24, Math.PI * 0.9]} />
              <meshStandardMaterial color="#4ade80" emissive="#22c55e" emissiveIntensity={1.2} />
            </mesh>
          </group>
        )}
      </group>

      {/* RIGHT ARM WITH EMBEDDED HAND SOCKET */}
      <group ref={rightArmRef} position={[0.28, 1.15, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <boxGeometry args={[0.13, 0.52, 0.14]} />
          <meshStandardMaterial color="#2c7a7b" roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.54, 0.02]} castShadow>
          <boxGeometry args={[0.09, 0.1, 0.1]} />
          <meshStandardMaterial color="#fbd38d" />
        </mesh>

        {/* ── HAND SOCKET: WEAPON MOUNTED FIRMLY IN PALM ── */}
        <group position={[0, -0.54, 0.06]} rotation={[0.4, 0, 0]}>
          {/* 1. BLUE SHARD KATANA */}
          {activeWeaponId === "BLUE_SHARD_SWORD" && (
            <group position={[0, 0.35, 0.05]} rotation={[-0.2, 0, 0]}>
              {/* Handle */}
              <mesh position={[0, -0.32, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.24, 8]} />
                <meshStandardMaterial color="#1e293b" roughness={0.8} />
              </mesh>
              {/* Tsuba / Guard */}
              <mesh position={[0, -0.19, 0]}>
                <boxGeometry args={[0.12, 0.025, 0.08]} />
                <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Luminous Blue Shard Blade */}
              <mesh position={[0, 0.28, 0]} castShadow>
                <boxGeometry args={[0.045, 0.72, 0.028]} />
                <meshStandardMaterial
                  color="#bfdbfe"
                  emissive="#38bdf8"
                  emissiveIntensity={1.8 + chargeLevel * 2}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
              {/* Tip */}
              <mesh position={[0, 0.66, 0]}>
                <coneGeometry args={[0.04, 0.12, 4]} />
                <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={2.5} />
              </mesh>
            </group>
          )}

          {/* 2. ETHEREAL LONGBOW ARROW / DRAW */}
          {activeWeaponId === "BOW" && (
            <group position={[0, 0, 0]}>
              {/* Glowing Arrow on nock */}
              <mesh position={[0, 0.1, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.008, 0.65, 6]} />
                <meshStandardMaterial color="#d1fae5" emissive="#4ade80" emissiveIntensity={2.0} />
              </mesh>
            </group>
          )}

          {/* 3. VOID CALLIGRAPHY PEN */}
          {activeWeaponId === "HEAVENLY_PEN" && (
            <group position={[0, 0.2, 0.02]} rotation={[-0.4, 0, 0]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.022, 0.016, 0.48, 8]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.27, 0]}>
                <coneGeometry args={[0.02, 0.09, 6]} />
                <meshStandardMaterial color="#1c1917" metalness={0.95} />
              </mesh>
            </group>
          )}

          {/* 4. REAPER SCYTHE */}
          {activeWeaponId === "SCYTHE" && (
            <group position={[0, 0.4, 0]}>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.018, 1.2, 8]} />
                <meshStandardMaterial color="#312e81" metalness={0.5} />
              </mesh>
              <mesh position={[0.2, 0.55, 0]} rotation={[0, 0, 0.8]}>
                <torusGeometry args={[0.35, 0.025, 6, 18, Math.PI * 0.7]} />
                <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={1.5} />
              </mesh>
            </group>
          )}

          {/* 5. RPG LAUNCHER */}
          {activeWeaponId === "RPG" && (
            <group position={[0, 0.2, 0.2]} rotation={[-0.3, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
                <meshStandardMaterial color="#374151" metalness={0.7} />
              </mesh>
              <mesh position={[0, 0.45, 0]}>
                <coneGeometry args={[0.07, 0.2, 8]} />
                <meshStandardMaterial color="#ea580c" emissive="#c2410c" emissiveIntensity={0.8} />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* SWORD SLASH ENERGY RIBBON */}
      <mesh ref={slashRibbonRef} position={[0.4, 1.1, 0.7]} rotation={[0.4, 0, -0.6]} visible={false}>
        <torusGeometry args={[0.75, 0.08, 4, 24, Math.PI * 0.65]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* CALLIGRAPHY INK FLOURISH RIBBON */}
      <mesh ref={inkRibbonRef} position={[0.25, 1.1, 0.6]} rotation={[0.2, 0.4, 0]} visible={false}>
        <torusGeometry args={[0.65, 0.06, 4, 24, Math.PI * 0.8]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {/* HEAD GROUP */}
      <group ref={headRef} position={[0, 1.35, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color="#fbd38d" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.25, -0.02]} castShadow>
          <boxGeometry args={[0.3, 0.12, 0.32]} />
          <meshStandardMaterial color="#4a2c11" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.14, -0.13]} castShadow>
          <boxGeometry args={[0.3, 0.2, 0.08]} />
          <meshStandardMaterial color="#4a2c11" roughness={0.9} />
        </mesh>
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
