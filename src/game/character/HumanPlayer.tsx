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

    const swing = Math.sin(t) * 0.45;
    const idle = Math.sin(timeSec * 2.5) * 0.02;

    // Walking animation
    if (isMoving) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (headRef.current) headRef.current.position.y = 1.35 + Math.abs(Math.sin(t)) * 0.04;

      if (!isAttacking) {
        if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.7;
        if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.5 + 0.2;
      }
    } else {
      // Idle breathing
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (headRef.current) headRef.current.position.y = 1.35 + idle;

      if (!isAttacking) {
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0;
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0.2 + idle * 2;
      }
    }

    // Dynamic Attack Arm Posing (Socket IK & Natural Posture)
    if (isAttacking && rightArmRef.current) {
      if (activeWeaponId === "BLUE_SHARD_SWORD") {
        // Fluid diagonal slash arc from high right to low left
        const slashPhase = Math.sin(attackProgress * Math.PI);
        rightArmRef.current.rotation.x = -1.3 + slashPhase * 2.5;
        rightArmRef.current.rotation.y = -0.5 + slashPhase * 1.1;
        rightArmRef.current.rotation.z = -0.4 + slashPhase * 0.8;
      } else if (activeWeaponId === "BOW") {
        // Left arm extends bow forward, right arm draws string back
        if (leftArmRef.current) leftArmRef.current.rotation.x = -1.45;
        rightArmRef.current.rotation.x = -1.35;
        rightArmRef.current.rotation.y = -0.4 - (chargeLevel || 0) * 0.5;
        rightArmRef.current.rotation.z = 0.2;
      } else if (activeWeaponId === "HEAVENLY_PEN") {
        // Elegant calligraphy flourish
        const flourish = Math.sin(attackProgress * Math.PI * 2);
        rightArmRef.current.rotation.x = -1.0 + Math.sin(attackProgress * Math.PI) * 0.8;
        rightArmRef.current.rotation.y = flourish * 0.6;
        rightArmRef.current.rotation.z = -0.2 + flourish * 0.3;
      } else if (activeWeaponId === "SCYTHE") {
        // Wide sweeping scythe harvest strike
        const sweepPhase = Math.sin(attackProgress * Math.PI);
        rightArmRef.current.rotation.x = -1.4 + sweepPhase * 2.2;
        rightArmRef.current.rotation.y = 0.8 - sweepPhase * 1.6;
      } else if (activeWeaponId === "RPG") {
        // Shoulder-aimed recoil
        const recoil = Math.sin(attackProgress * Math.PI) * 0.25;
        rightArmRef.current.rotation.x = -1.4 + recoil;
        rightArmRef.current.rotation.y = -0.15;
      }
    } else {
      // Natural idle weapon carrying posture
      if (rightArmRef.current) {
        if (activeWeaponId === "BLUE_SHARD_SWORD") {
          // Low ready stance: arm at side, sword angled downward
          rightArmRef.current.rotation.x = isMoving ? swing * 0.4 + 0.2 : 0.25 + idle * 1.5;
          rightArmRef.current.rotation.y = -0.1;
          rightArmRef.current.rotation.z = 0.08;
        } else if (activeWeaponId === "BOW") {
          // Bow held in left hand, right arm relaxed
          rightArmRef.current.rotation.x = isMoving ? swing * 0.5 : idle;
          rightArmRef.current.rotation.y = 0;
          rightArmRef.current.rotation.z = 0;
        } else if (activeWeaponId === "HEAVENLY_PEN") {
          // Pen held poised near waist
          rightArmRef.current.rotation.x = isMoving ? swing * 0.3 + 0.3 : 0.35 + idle * 1.2;
          rightArmRef.current.rotation.y = -0.15;
          rightArmRef.current.rotation.z = 0.1;
        } else if (activeWeaponId === "RPG") {
          // Rested on shoulder
          rightArmRef.current.rotation.x = -1.2 + (isMoving ? swing * 0.1 : idle * 0.5);
          rightArmRef.current.rotation.y = -0.1;
          rightArmRef.current.rotation.z = 0.15;
        }
      }
    }

    // Animate slash energy ribbon
    if (slashRibbonRef.current) {
      if (isAttacking && activeWeaponId === "BLUE_SHARD_SWORD" && attackProgress > 0.05 && attackProgress < 0.88) {
        slashRibbonRef.current.visible = true;
        (slashRibbonRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(attackProgress * Math.PI) * 0.85;
      } else {
        slashRibbonRef.current.visible = false;
      }
    }

    // Animate calligraphy ink flourish ribbon
    if (inkRibbonRef.current) {
      if (isAttacking && activeWeaponId === "HEAVENLY_PEN" && attackProgress > 0.05 && attackProgress < 0.9) {
        inkRibbonRef.current.visible = true;
        (inkRibbonRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(attackProgress * Math.PI) * 0.9;
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

        {/* If Bow: Left hand holds bow riser vertically */}
        {activeWeaponId === "BOW" && (
          <group position={[0, -0.54, 0.08]} rotation={[0, Math.PI / 2, 0]}>
            {/* Bow upper & lower stave */}
            <mesh>
              <torusGeometry args={[0.42, 0.02, 6, 24, Math.PI * 0.95]} />
              <meshStandardMaterial color="#4ade80" emissive="#22c55e" emissiveIntensity={1.4} roughness={0.4} />
            </mesh>
            {/* Bowstring */}
            <mesh position={[-0.18, 0, 0]}>
              <boxGeometry args={[0.006, 0.78, 0.006]} />
              <meshBasicMaterial color="#d1fae5" />
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

        {/* ── HAND SOCKET: ANCHORED NATURALLY IN PALM ── */}
        <group position={[0, -0.54, 0.02]}>
          {/* 1. BLUE SHARD KATANA */}
          {activeWeaponId === "BLUE_SHARD_SWORD" && (
            <group
              rotation={
                isAttacking
                  ? [0.2, 0, -0.2] // Strike stance: blade forward
                  : [2.5, 0.15, -0.2] // Rest stance: blade pointing down & back along thigh
              }
            >
              {/* Wrapped Hilt (centered inside fist) */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.22, 8]} />
                <meshStandardMaterial color="#1e293b" roughness={0.85} />
              </mesh>
              {/* Pommel */}
              <mesh position={[0, -0.12, 0]}>
                <cylinderGeometry args={[0.026, 0.026, 0.03, 8]} />
                <meshStandardMaterial color="#0284c7" metalness={0.9} />
              </mesh>
              {/* Tsuba / Guard */}
              <mesh position={[0, 0.11, 0]}>
                <boxGeometry args={[0.11, 0.022, 0.07]} />
                <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.2} />
              </mesh>
              {/* Luminous Blue Shard Blade */}
              <mesh position={[0, 0.48, 0]} castShadow>
                <boxGeometry args={[0.038, 0.72, 0.02]} />
                <meshStandardMaterial
                  color="#bfdbfe"
                  emissive="#38bdf8"
                  emissiveIntensity={2.0 + (chargeLevel || 0) * 2}
                  metalness={0.95}
                  roughness={0.1}
                />
              </mesh>
              {/* Shard Blade Edge Glow */}
              <mesh position={[0, 0.48, 0.015]}>
                <boxGeometry args={[0.01, 0.7, 0.005]} />
                <meshBasicMaterial color="#e0f2fe" />
              </mesh>
              {/* Chiseled Crystal Tip */}
              <mesh position={[0, 0.86, 0]}>
                <coneGeometry args={[0.035, 0.1, 4]} />
                <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={2.8} />
              </mesh>
            </group>
          )}

          {/* 2. ETHEREAL LONGBOW ARROW (ONLY VISIBLE ON DRAW / ATTACK) */}
          {activeWeaponId === "BOW" && isAttacking && (
            <group position={[-0.2, 0, 0.15]} rotation={[0, -Math.PI / 2, 0]}>
              {/* Arrow shaft */}
              <mesh position={[0, 0, 0.2]}>
                <cylinderGeometry args={[0.006, 0.006, 0.65, 6]} />
                <meshStandardMaterial color="#d1fae5" metalness={0.8} />
              </mesh>
              {/* Arrow arrowhead */}
              <mesh position={[0, 0.35, 0.2]}>
                <coneGeometry args={[0.018, 0.08, 6]} />
                <meshStandardMaterial color="#86efac" emissive="#4ade80" emissiveIntensity={2.5} />
              </mesh>
            </group>
          )}

          {/* 3. VOID CALLIGRAPHY PEN */}
          {activeWeaponId === "HEAVENLY_PEN" && (
            <group
              rotation={
                isAttacking
                  ? [0.3, 0, 0.1]
                  : [2.3, 0.2, -0.3]
              }
            >
              {/* Bamboo & Gold Shaft */}
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.02, 0.015, 0.52, 8]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.4} metalness={0.8} />
              </mesh>
              {/* Calligraphy Brush Tip */}
              <mesh position={[0, 0.39, 0]}>
                <coneGeometry args={[0.022, 0.11, 8]} />
                <meshStandardMaterial color="#1c1917" metalness={0.9} />
              </mesh>
              {/* Glowing Ink droplet */}
              <mesh position={[0, 0.44, 0]}>
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={3.5} />
              </mesh>
            </group>
          )}

          {/* 4. REAPER SCYTHE */}
          {activeWeaponId === "SCYTHE" && (
            <group
              rotation={
                isAttacking
                  ? [-0.2, 0, 0.3]
                  : [2.4, 0.1, -0.2]
              }
            >
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.018, 0.016, 1.15, 8]} />
                <meshStandardMaterial color="#312e81" metalness={0.6} />
              </mesh>
              <mesh position={[0.18, 0.76, 0]} rotation={[0, 0, 0.8]}>
                <torusGeometry args={[0.34, 0.022, 6, 20, Math.PI * 0.7]} />
                <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={1.6} />
              </mesh>
            </group>
          )}

          {/* 5. RPG LAUNCHER */}
          {activeWeaponId === "RPG" && (
            <group rotation={[-1.2, 0.1, 0]} position={[0, 0.2, -0.1]}>
              <mesh>
                <cylinderGeometry args={[0.055, 0.055, 0.85, 8]} />
                <meshStandardMaterial color="#374151" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.46, 0]}>
                <coneGeometry args={[0.065, 0.18, 8]} />
                <meshStandardMaterial color="#ea580c" emissive="#c2410c" emissiveIntensity={1.2} />
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
