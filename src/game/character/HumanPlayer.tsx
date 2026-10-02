"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WeaponId } from "../weapons/weaponTypes";
import type { WeaponSystemState } from "../weapons/WeaponSystem";

interface HumanPlayerProps {
  position: [number, number, number];
  heading: number; // in radians
  isMoving: boolean;
  activeWeaponId?: WeaponId;
  chargeLevel?: number;
  attackProgress?: number;
  isAttacking?: boolean;
  humanPosRef?: React.MutableRefObject<{ x: number; y: number; z: number; heading: number }>;
  weaponSystemStateRef?: React.MutableRefObject<WeaponSystemState>;
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
  weaponSystemStateRef,
}: HumanPlayerProps) {
  const rootRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const weaponSocketRef = useRef<THREE.Group>(null);
  const slashRibbonRef = useRef<THREE.Mesh>(null);
  const inkRibbonRef = useRef<THREE.Mesh>(null);
  const bowstringRef = useRef<THREE.Mesh>(null);
  const nockedArrowRef = useRef<THREE.Group>(null);

  // Smoothed arm and weapon rotations to eliminate any snapping/jitter
  const rightArmRot = useRef(new THREE.Vector3(0.2, 0, 0));
  const leftArmRot = useRef(new THREE.Vector3(0, 0, 0));
  const weaponSocketRot = useRef(new THREE.Vector3(0.5, 0, 0));

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

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime() * 10;
    const timeSec = clock.getElapsedTime();

    // Live weapon state directly from ref for 60+ FPS frame-perfect animation
    const liveAttack = weaponSystemStateRef?.current?.activeAttack;
    const liveIsAttacking = isAttacking || !!liveAttack;
    const liveProgress = liveAttack ? liveAttack.progress : (attackProgress || 0);
    const liveCharge = weaponSystemStateRef?.current ? weaponSystemStateRef.current.chargeLevel : (chargeLevel || 0);
    const liveWeaponId = (weaponSystemStateRef?.current?.activeWeaponId ?? activeWeaponId) as WeaponId;

    // ── 1. Root Position & Heading (Direct ref sync, 60+ FPS zero stutter) ──
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

    // ── 2. Walking & Idle Breathing Animation ──
    const swing = Math.sin(t) * 0.42;
    const idle = Math.sin(timeSec * 2.4) * 0.025;

    if (isMoving) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (headRef.current) headRef.current.position.y = 1.35 + Math.abs(Math.sin(t)) * 0.035;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = 0;
      if (rightLegRef.current) rightLegRef.current.rotation.x = 0;
      if (headRef.current) headRef.current.position.y = 1.35 + idle;
    }

    // ── 3. Smooth IK Arm & Weapon Targets ──
    const targetRightArm = new THREE.Vector3();
    const targetLeftArm = new THREE.Vector3();
    const targetWeapon = new THREE.Vector3();

    if (liveIsAttacking) {
      if (liveWeaponId === "BLUE_SHARD_SWORD") {
        // Fluid, satisfying diagonal slash arc
        const slashPhase = Math.sin(liveProgress * Math.PI);
        targetRightArm.set(
          -1.2 + slashPhase * 2.3,
          -0.45 + slashPhase * 1.0,
          -0.3 + slashPhase * 0.7
        );
        targetLeftArm.set(0.2, 0.3, -0.2); // Left arm balances swing
        targetWeapon.set(0.35, -slashPhase * 0.6, -0.25 + slashPhase * 0.5);
      } else if (liveWeaponId === "BOW") {
        // Left arm extends bow forward, right arm draws string back
        const draw = (liveCharge || 0.1);
        targetLeftArm.set(-1.48, 0.15, 0.05);
        targetRightArm.set(-1.38, -0.35 - draw * 0.35, 0.18);
        targetWeapon.set(0.0, 0.0, 0.0);
      } else if (liveWeaponId === "HEAVENLY_PEN") {
        // Poetic calligraphy arc
        const strokePhase = Math.sin(liveProgress * Math.PI * 1.5);
        targetRightArm.set(-1.0 + strokePhase * 1.2, strokePhase * 0.6, -0.15);
        targetLeftArm.set(-0.2, 0.2, 0);
        targetWeapon.set(0.25, 0.1, 0.05);
      } else if (liveWeaponId === "SCYTHE") {
        // Wide sweeping scythe harvest strike
        const sweepPhase = Math.sin(liveProgress * Math.PI);
        targetRightArm.set(-1.3 + sweepPhase * 2.0, 0.7 - sweepPhase * 1.4, 0);
        targetLeftArm.set(-0.9 + sweepPhase * 1.2, 0.4, 0.2);
        targetWeapon.set(-0.15, 0, 0.2);
      } else if (liveWeaponId === "RPG") {
        // Shoulder recoil
        const recoil = Math.sin(liveProgress * Math.PI) * 0.2;
        targetRightArm.set(-1.42 + recoil, -0.12, 0.08);
        targetLeftArm.set(-1.25, 0.35, 0.2);
        targetWeapon.set(-0.05, 0, 0);
      }
    } else {
      // ── Natural Ready / Idle Posture (No clipping, zero floating) ──
      if (liveWeaponId === "BLUE_SHARD_SWORD") {
        // Blade resting naturally angled down and forward beside the hip
        targetRightArm.set(
          isMoving ? swing * 0.3 + 0.22 : 0.2 + idle * 1.2,
          -0.12,
          0.1
        );
        targetLeftArm.set(isMoving ? -swing * 0.6 : idle, 0, 0);
        targetWeapon.set(0.55, 0.1, -0.15); // Naturally angled forward-downward
      } else if (liveWeaponId === "BOW") {
        // Bow held gracefully in left hand, right arm relaxed
        targetLeftArm.set(isMoving ? -swing * 0.3 - 0.2 : -0.25 + idle, 0.1, -0.1);
        targetRightArm.set(isMoving ? swing * 0.5 : idle, 0, 0);
        targetWeapon.set(0, 0, 0);
      } else if (liveWeaponId === "HEAVENLY_PEN") {
        // Pen poised gracefully near waist
        targetRightArm.set(isMoving ? swing * 0.25 + 0.3 : 0.32 + idle * 1.2, -0.12, 0.08);
        targetLeftArm.set(isMoving ? -swing * 0.5 : idle, 0, 0);
        targetWeapon.set(0.4, 0.15, -0.1);
      } else if (liveWeaponId === "SCYTHE") {
        // Haft resting diagonally across body
        targetRightArm.set(isMoving ? swing * 0.2 + 0.35 : 0.38 + idle, -0.15, 0.1);
        targetLeftArm.set(-0.4, 0.2, 0.1);
        targetWeapon.set(0.35, 0.1, -0.15);
      } else if (liveWeaponId === "RPG") {
        // Rests comfortably on shoulder
        targetRightArm.set(-1.18 + (isMoving ? swing * 0.08 : idle * 0.4), -0.12, 0.12);
        targetLeftArm.set(-0.75, 0.25, 0.15);
        targetWeapon.set(-0.05, 0, 0);
      }
    }

    // ── 4. Exponential Smoothing on Arm & Socket Angles ──
    const armDampRate = liveIsAttacking ? 22 : 12;
    rightArmRot.current.x = THREE.MathUtils.damp(rightArmRot.current.x, targetRightArm.x, armDampRate, dt);
    rightArmRot.current.y = THREE.MathUtils.damp(rightArmRot.current.y, targetRightArm.y, armDampRate, dt);
    rightArmRot.current.z = THREE.MathUtils.damp(rightArmRot.current.z, targetRightArm.z, armDampRate, dt);

    leftArmRot.current.x = THREE.MathUtils.damp(leftArmRot.current.x, targetLeftArm.x, armDampRate, dt);
    leftArmRot.current.y = THREE.MathUtils.damp(leftArmRot.current.y, targetLeftArm.y, armDampRate, dt);
    leftArmRot.current.z = THREE.MathUtils.damp(leftArmRot.current.z, targetLeftArm.z, armDampRate, dt);

    weaponSocketRot.current.x = THREE.MathUtils.damp(weaponSocketRot.current.x, targetWeapon.x, armDampRate, dt);
    weaponSocketRot.current.y = THREE.MathUtils.damp(weaponSocketRot.current.y, targetWeapon.y, armDampRate, dt);
    weaponSocketRot.current.z = THREE.MathUtils.damp(weaponSocketRot.current.z, targetWeapon.z, armDampRate, dt);

    if (rightArmRef.current) {
      rightArmRef.current.rotation.set(rightArmRot.current.x, rightArmRot.current.y, rightArmRot.current.z);
    }
    if (leftArmRef.current) {
      leftArmRef.current.rotation.set(leftArmRot.current.x, leftArmRot.current.y, leftArmRot.current.z);
    }
    if (weaponSocketRef.current) {
      weaponSocketRef.current.rotation.set(weaponSocketRot.current.x, weaponSocketRot.current.y, weaponSocketRot.current.z);
    }

    // ── 5. Dynamic Slash Energy Ribbon ──
    if (slashRibbonRef.current) {
      if (liveIsAttacking && liveWeaponId === "BLUE_SHARD_SWORD" && liveProgress > 0.05 && liveProgress < 0.88) {
        slashRibbonRef.current.visible = true;
        const slashPhase = liveProgress;
        slashRibbonRef.current.rotation.set(0.35 + slashPhase * 0.4, -slashPhase * 0.85, -0.6 + slashPhase * 1.3);
        slashRibbonRef.current.scale.set(0.85 + slashPhase * 0.4, 0.85 + slashPhase * 0.4, 1.0);
        (slashRibbonRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(liveProgress * Math.PI) * 0.92;
      } else {
        slashRibbonRef.current.visible = false;
      }
    }

    // ── 6. Ink Flourish Ribbon ──
    if (inkRibbonRef.current) {
      if (liveIsAttacking && liveWeaponId === "HEAVENLY_PEN" && liveProgress > 0.05 && liveProgress < 0.9) {
        inkRibbonRef.current.visible = true;
        (inkRibbonRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(liveProgress * Math.PI) * 0.9;
        inkRibbonRef.current.rotation.z = liveProgress * Math.PI * 2;
        inkRibbonRef.current.scale.setScalar(0.7 + liveProgress * 0.6);
      } else {
        inkRibbonRef.current.visible = false;
      }
    }

    // ── 7. Real-Time Dynamic Bowstring & Arrow Draw (60+ FPS) ──
    if (bowstringRef.current) {
      bowstringRef.current.position.x = -0.18 + liveCharge * 0.15;
    }
    if (nockedArrowRef.current) {
      const isDrawing = liveIsAttacking || liveCharge > 0.05;
      nockedArrowRef.current.visible = isDrawing;
      nockedArrowRef.current.position.x = -0.18 + liveCharge * 0.15;
    }
  }, 1);

  const currentWeaponId = (weaponSystemStateRef?.current?.activeWeaponId ?? activeWeaponId) as WeaponId;

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

        {/* ── ETHEREAL LONGBOW (HELD SECURELY IN LEFT FIST) ── */}
        {currentWeaponId === "BOW" && (
          <group position={[0, -0.54, 0.08]} rotation={[0, Math.PI / 2, 0]}>
            {/* Bow Grip Handle (inside palm) */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.14, 8]} />
              <meshStandardMaterial color="#1f2937" roughness={0.7} />
            </mesh>
            {/* Bow Upper & Lower Stave */}
            <mesh position={[0, 0, 0]}>
              <torusGeometry args={[0.44, 0.02, 6, 24, Math.PI * 0.95]} />
              <meshStandardMaterial
                color="#4ade80"
                emissive="#22c55e"
                emissiveIntensity={1.4 + (chargeLevel || 0) * 1.5}
                roughness={0.4}
              />
            </mesh>
            {/* Bowstring (Real-time dynamic draw via ref) */}
            <mesh ref={bowstringRef} position={[-0.18, 0, 0]}>
              <boxGeometry args={[0.006, 0.82, 0.006]} />
              <meshBasicMaterial color="#d1fae5" />
            </mesh>
            {/* Nocked Arrow in Bow (Visible when drawing/charging, animated via ref) */}
            <group ref={nockedArrowRef} position={[-0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} visible={false}>
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.006, 0.006, 0.65, 6]} />
                <meshStandardMaterial color="#d1fae5" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.54, 0]}>
                <coneGeometry args={[0.018, 0.08, 6]} />
                <meshStandardMaterial color="#86efac" emissive="#4ade80" emissiveIntensity={2.5} />
              </mesh>
            </group>
          </group>
        )}
      </group>

      {/* RIGHT ARM WITH ANATOMICALLY SOCKETED HAND */}
      <group ref={rightArmRef} position={[0.28, 1.15, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <boxGeometry args={[0.13, 0.52, 0.14]} />
          <meshStandardMaterial color="#2c7a7b" roughness={0.7} />
        </mesh>
        {/* Hand Fist */}
        <mesh position={[0, -0.54, 0.02]} castShadow>
          <boxGeometry args={[0.09, 0.1, 0.1]} />
          <meshStandardMaterial color="#fbd38d" />
        </mesh>

        {/* ── HAND SOCKET: CENTERED DIRECTLY IN RIGHT PALM ── */}
        <group ref={weaponSocketRef} position={[0, -0.54, 0.02]}>
          {/* 1. BLUE SHARD KATANA */}
          {currentWeaponId === "BLUE_SHARD_SWORD" && (
            <group>
              {/* Wrapped Hilt (Centered inside palm) */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
                <meshStandardMaterial color="#1e293b" roughness={0.85} />
              </mesh>
              {/* Pommel */}
              <mesh position={[0, -0.11, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.025, 8]} />
                <meshStandardMaterial color="#0284c7" metalness={0.9} />
              </mesh>
              {/* Tsuba / Guard */}
              <mesh position={[0, 0.11, 0]}>
                <boxGeometry args={[0.11, 0.02, 0.07]} />
                <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.2} />
              </mesh>
              {/* Luminous Blue Shard Blade */}
              <mesh position={[0, 0.46, 0]} castShadow>
                <boxGeometry args={[0.034, 0.68, 0.018]} />
                <meshStandardMaterial
                  color="#bfdbfe"
                  emissive="#38bdf8"
                  emissiveIntensity={2.2 + (chargeLevel || 0) * 2.0}
                  metalness={0.95}
                  roughness={0.1}
                />
              </mesh>
              {/* Shard Blade Edge Glow */}
              <mesh position={[0, 0.46, 0.014]}>
                <boxGeometry args={[0.008, 0.66, 0.004]} />
                <meshBasicMaterial color="#e0f2fe" />
              </mesh>
              {/* Chiseled Crystal Tip */}
              <mesh position={[0, 0.82, 0]}>
                <coneGeometry args={[0.03, 0.09, 4]} />
                <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={3.0} />
              </mesh>
            </group>
          )}

          {/* 2. VOID CALLIGRAPHY PEN */}
          {currentWeaponId === "HEAVENLY_PEN" && (
            <group>
              {/* Bamboo & Gold Shaft held in fist */}
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.018, 0.014, 0.52, 8]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.4} metalness={0.8} />
              </mesh>
              {/* Calligraphy Brush Tip */}
              <mesh position={[0, 0.38, 0]}>
                <coneGeometry args={[0.02, 0.11, 8]} />
                <meshStandardMaterial color="#1c1917" metalness={0.9} />
              </mesh>
              {/* Glowing Ink droplet at tip */}
              <mesh position={[0, 0.44, 0]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={3.5} />
              </mesh>
            </group>
          )}

          {/* 3. REAPER SCYTHE */}
          {currentWeaponId === "SCYTHE" && (
            <group>
              {/* Long haft gripped in fist */}
              <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.018, 0.016, 1.1, 8]} />
                <meshStandardMaterial color="#312e81" metalness={0.6} />
              </mesh>
              {/* Curved scythe blade */}
              <mesh position={[0.18, 0.78, 0]} rotation={[0, 0, 0.8]}>
                <torusGeometry args={[0.34, 0.022, 6, 20, Math.PI * 0.7]} />
                <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={1.6} />
              </mesh>
            </group>
          )}

          {/* 4. RPG LAUNCHER */}
          {currentWeaponId === "RPG" && (
            <group position={[0, 0.15, -0.05]}>
              <mesh>
                <cylinderGeometry args={[0.05, 0.05, 0.82, 8]} />
                <meshStandardMaterial color="#374151" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.44, 0]}>
                <coneGeometry args={[0.06, 0.16, 8]} />
                <meshStandardMaterial color="#ea580c" emissive="#c2410c" emissiveIntensity={1.2} />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* SWORD SLASH ENERGY RIBBON */}
      <mesh ref={slashRibbonRef} position={[0.38, 1.05, 0.65]} rotation={[0.4, 0, -0.6]} visible={false}>
        <torusGeometry args={[0.72, 0.07, 4, 24, Math.PI * 0.65]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* CALLIGRAPHY INK FLOURISH RIBBON */}
      <mesh ref={inkRibbonRef} position={[0.25, 1.05, 0.55]} rotation={[0.2, 0.4, 0]} visible={false}>
        <torusGeometry args={[0.62, 0.06, 4, 24, Math.PI * 0.8]} />
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
