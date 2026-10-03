"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WeaponId } from "../weapons/weaponTypes";
import type { WeaponSystemState } from "../weapons/WeaponSystem";
import { CharacterId } from "@/components/ui/CharacterPortraits";

interface HumanPlayerProps {
  position: [number, number, number];
  heading: number; // in radians
  isMoving: boolean;
  characterId?: CharacterId;
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
  characterId = "ORIGINAL",
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
        // Multi-phase dynamic cutting stroke (windup -> swift cutting arc -> ease-out follow-through)
        let armX: number;
        let armY: number;
        let armZ: number;
        let wX: number;
        let wY: number;
        let wZ: number;

        if (liveProgress < 0.22) {
          // Phase 1: High coiled windup (raising blade up to right shoulder)
          const p = liveProgress / 0.22;
          armX = THREE.MathUtils.lerp(0.2, -1.1, p);
          armY = THREE.MathUtils.lerp(-0.12, -0.5, p);
          armZ = THREE.MathUtils.lerp(0.1, 0.45, p);
          wX = THREE.MathUtils.lerp(0.55, -0.4, p);
          wY = THREE.MathUtils.lerp(0.1, 0.35, p);
          wZ = THREE.MathUtils.lerp(-0.15, -0.5, p);
        } else if (liveProgress < 0.72) {
          // Phase 2: High-speed cutting slash diagonally downward across torso
          const p = (liveProgress - 0.22) / 0.50;
          const easeSwing = Math.sin(p * Math.PI * 0.5); // fast start, accelerating through contact
          armX = THREE.MathUtils.lerp(-1.1, 1.25, easeSwing);
          armY = THREE.MathUtils.lerp(-0.5, 0.65, easeSwing);
          armZ = THREE.MathUtils.lerp(0.45, -0.35, easeSwing);
          wX = THREE.MathUtils.lerp(-0.4, 0.85, easeSwing);
          wY = THREE.MathUtils.lerp(0.35, -0.65, easeSwing);
          wZ = THREE.MathUtils.lerp(-0.5, 0.4, easeSwing);
        } else {
          // Phase 3: Deceleration, follow-through & return to guard
          const p = (liveProgress - 0.72) / 0.28;
          armX = THREE.MathUtils.lerp(1.25, 0.2, p);
          armY = THREE.MathUtils.lerp(0.65, -0.12, p);
          armZ = THREE.MathUtils.lerp(-0.35, 0.1, p);
          wX = THREE.MathUtils.lerp(0.85, 0.55, p);
          wY = THREE.MathUtils.lerp(-0.65, 0.1, p);
          wZ = THREE.MathUtils.lerp(0.4, -0.15, p);
        }

        targetRightArm.set(armX, armY, armZ);
        targetLeftArm.set(0.15, 0.25, -0.15); // Left arm balances natural swing
        targetWeapon.set(wX, wY, wZ);
      } else if (liveWeaponId === "BOW") {
        // Left arm extends bow forward, right arm draws string back
        const draw = (liveCharge || 0.1);
        targetLeftArm.set(-1.45, 0.12, 0.05);
        targetRightArm.set(-1.35, -0.32 - draw * 0.32, 0.16);
        targetWeapon.set(0.0, 0.0, 0.0);
      } else if (liveWeaponId === "HEAVENLY_PEN") {
        // Poetic calligraphy arc
        const strokePhase = Math.sin(liveProgress * Math.PI * 1.5);
        targetRightArm.set(-1.0 + strokePhase * 1.2, strokePhase * 0.6, -0.15);
        targetLeftArm.set(-0.2, 0.2, 0);
        targetWeapon.set(0.25, 0.1, 0.05);
      } else if (liveWeaponId === "SCYTHE") {
        // Wide sweeping scythe harvest strike across full forward arc
        const p = Math.sin(liveProgress * Math.PI);
        targetRightArm.set(-1.35 + p * 2.2, 0.75 - p * 1.5, 0.1);
        targetLeftArm.set(-0.95 + p * 1.3, 0.45, 0.25);
        targetWeapon.set(-0.2, -p * 0.3, 0.25);
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
      if (liveIsAttacking && liveWeaponId === "BLUE_SHARD_SWORD" && liveProgress >= 0.20 && liveProgress <= 0.75) {
        slashRibbonRef.current.visible = true;
        const slashP = (liveProgress - 0.20) / 0.55;
        slashRibbonRef.current.rotation.set(0.35 + slashP * 0.35, -slashP * 0.9, -0.65 + slashP * 1.4);
        slashRibbonRef.current.scale.set(0.85 + slashP * 0.45, 0.85 + slashP * 0.45, 1.0);
        (slashRibbonRef.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(slashP * Math.PI) * 0.95;
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
  });

  const currentWeaponId = (weaponSystemStateRef?.current?.activeWeaponId ?? activeWeaponId) as WeaponId;

  const style = CHARACTER_PRESETS[characterId] ?? CHARACTER_PRESETS.ORIGINAL;

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
        <meshStandardMaterial color={style.pantsColor} roughness={0.8} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.12, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.65, 0.16]} />
        <meshStandardMaterial color={style.pantsColor} roughness={0.8} />
      </mesh>

      {/* SHOES */}
      <mesh position={[-0.12, 0.06, 0.04]} castShadow>
        <boxGeometry args={[0.16, 0.12, 0.24]} />
        <meshStandardMaterial color={style.shoesColor} roughness={0.9} />
      </mesh>
      <mesh position={[0.12, 0.06, 0.04]} castShadow>
        <boxGeometry args={[0.16, 0.12, 0.24]} />
        <meshStandardMaterial color={style.shoesColor} roughness={0.9} />
      </mesh>

      {/* TORSO / JACKET */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.26]} />
        <meshStandardMaterial color={style.jacketColor} roughness={0.7} />
      </mesh>

      {/* COLLAR / INNER SHIRT */}
      <mesh position={[0, 1.15, 0.11]} castShadow>
        <boxGeometry args={[0.18, 0.15, 0.06]} />
        <meshStandardMaterial color={style.collarColor} roughness={0.8} />
      </mesh>

      {/* TIE (for ORIGINAL) */}
      {style.tieColor && (
        <mesh position={[0, 0.96, 0.13]} castShadow>
          <boxGeometry args={[0.06, 0.26, 0.02]} />
          <meshStandardMaterial color={style.tieColor} roughness={0.6} />
        </mesh>
      )}

      {/* LEFT ARM */}
      <group ref={leftArmRef} position={[-0.28, 1.15, 0]}>
        <mesh position={[0, -0.26, 0]} castShadow>
          <boxGeometry args={[0.13, 0.52, 0.14]} />
          <meshStandardMaterial color={style.sleeveColor} roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.54, 0.02]} castShadow>
          <boxGeometry args={[0.09, 0.1, 0.1]} />
          <meshStandardMaterial color={style.skinColor} />
        </mesh>

        {/* ── ETHEREAL LONGBOW (HELD SECURELY IN LEFT FIST) ── */}
        {currentWeaponId === "BOW" && (
          <group position={[0, -0.54, 0.08]} rotation={[0, Math.PI / 2, 0]}>
            {/* Bow Grip Handle (inside palm) */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.022, 0.022, 0.14, 8]} />
              <meshStandardMaterial color="#1f2937" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <torusGeometry args={[0.44, 0.02, 6, 24, Math.PI * 0.95]} />
              <meshStandardMaterial
                color="#4ade80"
                emissive="#22c55e"
                emissiveIntensity={1.4 + (chargeLevel || 0) * 1.5}
                roughness={0.4}
              />
            </mesh>
            <mesh ref={bowstringRef} position={[-0.18, 0, 0]}>
              <boxGeometry args={[0.006, 0.82, 0.006]} />
              <meshBasicMaterial color="#d1fae5" />
            </mesh>
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
          <meshStandardMaterial color={style.sleeveColor} roughness={0.7} />
        </mesh>
        {/* Hand Fist */}
        <mesh position={[0, -0.54, 0.02]} castShadow>
          <boxGeometry args={[0.09, 0.1, 0.1]} />
          <meshStandardMaterial color={style.skinColor} />
        </mesh>

        {/* HAND SOCKET */}
        <group ref={weaponSocketRef} position={[0, -0.54, 0.02]}>
          {currentWeaponId === "BLUE_SHARD_SWORD" && (
            <group>
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
                <meshStandardMaterial color="#1e293b" roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.11, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.025, 8]} />
                <meshStandardMaterial color="#0284c7" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.11, 0]}>
                <boxGeometry args={[0.11, 0.02, 0.07]} />
                <meshStandardMaterial color="#0284c7" metalness={0.95} roughness={0.2} />
              </mesh>
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
              <mesh position={[0, 0.46, 0.014]}>
                <boxGeometry args={[0.008, 0.66, 0.004]} />
                <meshBasicMaterial color="#e0f2fe" />
              </mesh>
              <mesh position={[0, 0.82, 0]}>
                <coneGeometry args={[0.03, 0.09, 4]} />
                <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={3.0} />
              </mesh>
            </group>
          )}

          {currentWeaponId === "HEAVENLY_PEN" && (
            <group>
              <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.018, 0.014, 0.52, 8]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.4} metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.38, 0]}>
                <coneGeometry args={[0.02, 0.11, 8]} />
                <meshStandardMaterial color="#1c1917" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.44, 0]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={3.5} />
              </mesh>
            </group>
          )}

          {currentWeaponId === "SCYTHE" && (
            <group>
              <mesh position={[0, 0.25, 0]}>
                <cylinderGeometry args={[0.018, 0.016, 1.1, 8]} />
                <meshStandardMaterial color="#312e81" metalness={0.6} />
              </mesh>
              <mesh position={[0.18, 0.78, 0]} rotation={[0, 0, 0.8]}>
                <torusGeometry args={[0.34, 0.022, 6, 20, Math.PI * 0.7]} />
                <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={1.6} />
              </mesh>
            </group>
          )}

          {currentWeaponId === "RPG" && (
            <group position={[0, 0.10, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[0.045, 0.045, 0.82, 8]} />
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
        {/* Face Base */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color={style.skinColor} roughness={0.7} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.07, 0.12, 0.145]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial color="#1a202c" />
        </mesh>
        <mesh position={[0.07, 0.12, 0.145]}>
          <boxGeometry args={[0.04, 0.04, 0.01]} />
          <meshBasicMaterial color="#1a202c" />
        </mesh>

        {/* Hijab Covering for Muslimah */}
        {style.hasHijab ? (
          <group>
            {/* Hijab head wrap */}
            <mesh position={[0, 0.14, -0.02]} castShadow>
              <boxGeometry args={[0.34, 0.36, 0.34]} />
              <meshStandardMaterial color={style.hairColor} roughness={0.7} />
            </mesh>
            {/* Hijab drape over shoulders */}
            <mesh position={[0, -0.08, 0]} castShadow>
              <boxGeometry args={[0.44, 0.16, 0.32]} />
              <meshStandardMaterial color={style.hairColor} roughness={0.7} />
            </mesh>
          </group>
        ) : (
          <group>
            {/* Hair Top */}
            <mesh position={[0, 0.25, -0.02]} castShadow>
              <boxGeometry args={[0.3, 0.12, 0.32]} />
              <meshStandardMaterial color={style.hairColor} roughness={0.9} />
            </mesh>
            {/* Hair Back */}
            <mesh position={[0, 0.14, -0.13]} castShadow>
              <boxGeometry args={[0.3, 0.2, 0.08]} />
              <meshStandardMaterial color={style.hairColor} roughness={0.9} />
            </mesh>
          </group>
        )}

        {/* Long hair ponytail for LONG_HAIR_GIRL */}
        {style.hasLongHair && (
          <group position={[0, 0.05, -0.16]}>
            <mesh castShadow>
              <boxGeometry args={[0.22, 0.48, 0.12]} />
              <meshStandardMaterial color={style.hairColor} roughness={0.9} />
            </mesh>
            {/* Red hairclip */}
            <mesh position={[0.08, 0.18, 0.02]}>
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshStandardMaterial color="#f43f5e" />
            </mesh>
          </group>
        )}

        {/* Glasses for GLASSES_GUY */}
        {style.hasGlasses && (
          <group position={[0, 0.12, 0.155]}>
            <mesh position={[-0.07, 0, 0]}>
              <boxGeometry args={[0.07, 0.05, 0.01]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.9} />
            </mesh>
            <mesh position={[0.07, 0, 0]}>
              <boxGeometry args={[0.07, 0.05, 0.01]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.9} />
            </mesh>
            <mesh position={[0, 0.01, 0]}>
              <boxGeometry args={[0.04, 0.01, 0.01]} />
              <meshStandardMaterial color="#38bdf8" metalness={0.9} />
            </mesh>
          </group>
        )}

        {/* Headphones for HOODIE_GUY */}
        {style.hasHeadphones && (
          <group position={[0, -0.04, 0]}>
            {/* Left earpad */}
            <mesh position={[-0.17, 0.08, 0]}>
              <boxGeometry args={[0.05, 0.1, 0.1]} />
              <meshStandardMaterial color="#06b6d4" />
            </mesh>
            {/* Right earpad */}
            <mesh position={[0.17, 0.08, 0]}>
              <boxGeometry args={[0.05, 0.1, 0.1]} />
              <meshStandardMaterial color="#06b6d4" />
            </mesh>
            {/* Neck band */}
            <mesh position={[0, 0, -0.08]}>
              <torusGeometry args={[0.16, 0.02, 6, 16, Math.PI]} />
              <meshStandardMaterial color="#0891b2" />
            </mesh>
          </group>
        )}

        {/* Ear stud for SHORT_HAIR_GIRL */}
        {style.hasEarStud && (
          <mesh position={[0.15, 0.1, 0]}>
            <sphereGeometry args={[0.02, 6, 6]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} />
          </mesh>
        )}
      </group>
    </group>
  );
}

const CHARACTER_PRESETS: Record<
  CharacterId,
  {
    pantsColor: string;
    jacketColor: string;
    collarColor: string;
    sleeveColor: string;
    skinColor: string;
    hairColor: string;
    shoesColor: string;
    tieColor?: string;
    hasGlasses?: boolean;
    hasLongHair?: boolean;
    hasHijab?: boolean;
    hasHeadphones?: boolean;
    hasEarStud?: boolean;
  }
> = {
  ORIGINAL: {
    pantsColor: "#1e293b",
    jacketColor: "#334155",
    collarColor: "#f1f5f9",
    sleeveColor: "#334155",
    skinColor: "#ffedd5",
    hairColor: "#0f172a",
    shoesColor: "#0f172a",
    tieColor: "#0284c7",
  },
  GLASSES_GUY: {
    pantsColor: "#0f172a",
    jacketColor: "#1e3a5f",
    collarColor: "#38bdf8",
    sleeveColor: "#1e3a5f",
    skinColor: "#fef3c7",
    hairColor: "#1e293b",
    shoesColor: "#1e293b",
    hasGlasses: true,
  },
  LONG_HAIR_GIRL: {
    pantsColor: "#451a03",
    jacketColor: "#d97706",
    collarColor: "#fef3c7",
    sleeveColor: "#b45309",
    skinColor: "#ffedd5",
    hairColor: "#78350f",
    shoesColor: "#451a03",
    hasLongHair: true,
  },
  MUSLIMAH_GIRL: {
    pantsColor: "#064e3b",
    jacketColor: "#047857",
    collarColor: "#d1fae5",
    sleeveColor: "#047857",
    skinColor: "#fde68a",
    hairColor: "#059669",
    shoesColor: "#1e293b",
    hasHijab: true,
  },
  SHORT_HAIR_GIRL: {
    pantsColor: "#292524",
    jacketColor: "#7c2d12",
    collarColor: "#ea580c",
    sleeveColor: "#7c2d12",
    skinColor: "#fef3c7",
    hairColor: "#451a03",
    shoesColor: "#1c1917",
    hasEarStud: true,
  },
  HOODIE_GUY: {
    pantsColor: "#18181b",
    jacketColor: "#27272a",
    collarColor: "#3f3f46",
    sleeveColor: "#27272a",
    skinColor: "#ffedd5",
    hairColor: "#18181b",
    shoesColor: "#09090b",
    hasHeadphones: true,
  },
};

