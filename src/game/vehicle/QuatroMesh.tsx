"use client";

import { useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { VehicleState } from "./vehicleTypes";
import { SemicolonCat } from "../character/SemicolonCat";
import { soundManager } from "../audio/SoundManager";

interface QuatroMeshProps {
  vehicleState: VehicleState;
  isCatAlert?: boolean;
  bodyColor?: string;
}

// Deep-dish rally wheel with visible rotor, caliper, and camber
function RallyWheel({
  rotation,
  steeringAngle = 0,
  isLeft = false,
}: {
  rotation: number;
  steeringAngle?: number;
  isLeft?: boolean;
}) {
  const wheelRadius = 0.34;
  const wheelWidth = 0.26;
  const camber = isLeft ? 0.055 : -0.055; // Subtle FR Legends negative camber

  return (
    <group rotation={[0, steeringAngle, camber]}>
      {/* Outer tire with rotation */}
      <group rotation={[rotation, 0, Math.PI / 2]}>
        {/* Rubber Tire */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 20]} />
          <meshStandardMaterial color="#14171d" roughness={0.88} metalness={0.12} />
        </mesh>

        {/* Deep Dish Rim Lip (Polished Bronze/Silver) */}
        <mesh position={[0, isLeft ? 0.06 : -0.06, 0]}>
          <cylinderGeometry args={[0.27, 0.25, 0.08, 18]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* 5-Spoke Star Design */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            rotation={[0, (i * Math.PI * 2) / 5, 0]}
            position={[0, isLeft ? 0.1 : -0.1, 0]}
          >
            <boxGeometry args={[0.045, 0.03, 0.22]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}

        {/* Center Nut */}
        <mesh position={[0, isLeft ? 0.12 : -0.12, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.9} />
        </mesh>
      </group>

      {/* Non-rotating Brake Rotor */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[isLeft ? -0.04 : 0.04, 0, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.02, 16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.35} metalness={0.9} />
      </mesh>
      {/* Sport Caliper (Crimson Red) */}
      <mesh position={[isLeft ? -0.04 : 0.04, 0.14, 0]}>
        <boxGeometry args={[0.05, 0.09, 0.07]} />
        <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.2} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function QuatroMesh({
  vehicleState,
  isCatAlert = false,
  bodyColor = "#d65d28",
}: QuatroMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const chassisRef = useRef<THREE.Group>(null);
  const exhaustFlameRef = useRef<THREE.Group>(null);

  const { position, heading, steeringAngle, wheelRotation, speed, driftFactor = 0, lateralSpeed = 0, scaleFactor = 1.0, isHandbraking } = vehicleState;

  // Suspension & dynamics state
  const prevSpeed = useRef(speed);
  const chassisPitch = useRef(0);
  const chassisRoll = useRef(0);
  const exhaustTimer = useRef(0);
  const currentScale = useRef(1.0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);

    // Scale lerp
    const targetScale = scaleFactor || 1.0;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 1.0 - Math.exp(-8 * dt));
    if (groupRef.current) {
      groupRef.current.scale.setScalar(currentScale.current);
    }

    // ── Suspension Dynamics (Pitch on Accel/Brake, Roll on Turn/Drift) ──────
    const accel = (speed - prevSpeed.current) / dt;
    prevSpeed.current = speed;

    // Squat on throttle, nose dive on brake
    const targetPitch = THREE.MathUtils.clamp(-accel * 0.005, -0.06, 0.06);
    chassisPitch.current = THREE.MathUtils.damp(chassisPitch.current, targetPitch, 8, dt);

    // Body roll in cornering & drift counter-lean
    const targetRoll = THREE.MathUtils.clamp(
      (lateralSpeed * 0.02) + (steeringAngle * -0.03),
      -0.08,
      0.08
    );
    chassisRoll.current = THREE.MathUtils.damp(chassisRoll.current, targetRoll, 7, dt);

    // Subtle road surface bounce
    const bounce = Math.sin(state.clock.getElapsedTime() * 22) * Math.min(0.012, Math.abs(speed) * 0.0008);

    if (chassisRef.current) {
      chassisRef.current.rotation.x = chassisPitch.current;
      chassisRef.current.rotation.z = chassisRoll.current;
      chassisRef.current.position.y = bounce;
    }

    // ── Exhaust Pops on Deceleration ────────────────────────────────────────
    if (accel < -6.0 && Math.abs(speed) > 5 && Math.random() < 0.14) {
      exhaustTimer.current = 0.16;
      soundManager.playExhaustPop();
    }
    if (exhaustTimer.current > 0) {
      exhaustTimer.current -= dt;
      if (exhaustFlameRef.current) {
        exhaustFlameRef.current.visible = true;
      }
    } else if (exhaustFlameRef.current) {
      exhaustFlameRef.current.visible = false;
    }
  });

  const accentColor = "#f8f4eb"; // Heritage warm off-white
  const trimColor = "#1a1c22"; // Dark matte aero trim
  const glassColor = "#151b24"; // Smoked glass

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={[0, heading, 0]}
    >
      {/* ========================================================
          CYBER UNDERGLOW NEON (Aesthetic Cyan/Amber Glow)
          ======================================================== */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 3.2]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.35 + driftFactor * 0.3}
          depthWrite={false}
        />
      </mesh>
      <pointLight position={[0, 0.15, 0]} color="#38bdf8" intensity={1.8 + driftFactor * 1.5} distance={3.8} />

      {/* ========================================================
          DYNAMIC SUSPENSION CHASSIS GROUP
          ======================================================== */}
      <group ref={chassisRef}>
        {/* 1. MAIN CHASSIS & SIGNATURE AUDI QUATTRO BOX-FLARES */}
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.42, 3.5]} />
          <meshStandardMaterial color={bodyColor} roughness={0.38} metalness={0.25} />
        </mesh>

        {/* Front Box Flares */}
        <mesh position={[0, 0.44, 1.08]} castShadow receiveShadow>
          <boxGeometry args={[1.84, 0.38, 1.15]} />
          <meshStandardMaterial color={bodyColor} roughness={0.38} metalness={0.25} />
        </mesh>

        {/* Rear Box Flares */}
        <mesh position={[0, 0.44, -1.08]} castShadow receiveShadow>
          <boxGeometry args={[1.86, 0.38, 1.15]} />
          <meshStandardMaterial color={bodyColor} roughness={0.38} metalness={0.25} />
        </mesh>

        {/* Side Aero Skirts with neon accent line */}
        <mesh position={[0.84, 0.28, 0]}>
          <boxGeometry args={[0.06, 0.1, 1.3]} />
          <meshStandardMaterial color={trimColor} roughness={0.8} />
        </mesh>
        <mesh position={[-0.84, 0.28, 0]}>
          <boxGeometry args={[0.06, 0.1, 1.3]} />
          <meshStandardMaterial color={trimColor} roughness={0.8} />
        </mesh>

        {/* 2. FRONT END & CYBER LIGHTBAR */}
        {/* Front Chin Spoiler with Air Splitters */}
        <mesh position={[0, 0.25, 1.76]} castShadow>
          <boxGeometry args={[1.74, 0.22, 0.18]} />
          <meshStandardMaterial color={trimColor} roughness={0.7} />
        </mesh>
        <mesh position={[0.4, 0.24, 1.84]}>
          <boxGeometry args={[0.34, 0.1, 0.04]} />
          <meshStandardMaterial color="#0c0e12" roughness={0.9} />
        </mesh>
        <mesh position={[-0.4, 0.24, 1.84]}>
          <boxGeometry args={[0.34, 0.1, 0.04]} />
          <meshStandardMaterial color="#0c0e12" roughness={0.9} />
        </mesh>

        {/* Matte Black Front Grille */}
        <mesh position={[0, 0.48, 1.75]}>
          <boxGeometry args={[1.56, 0.22, 0.08]} />
          <meshStandardMaterial color="#12141a" roughness={0.9} />
        </mesh>

        {/* Cyber Center LED Lightbar */}
        <mesh position={[0, 0.54, 1.79]}>
          <boxGeometry args={[0.7, 0.03, 0.02]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.5} />
        </mesh>

        {/* Quad Projector Headlights (Outer + Inner) */}
        {[-0.52, -0.26, 0.26, 0.52].map((lx, idx) => (
          <mesh key={`headlight-${idx}`} position={[lx, 0.48, 1.78]}>
            <boxGeometry args={[0.2, 0.14, 0.04]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive="#fef08a"
              emissiveIntensity={2.0}
              roughness={0.15}
            />
          </mesh>
        ))}

        {/* Front Turn Signal Accents */}
        {[-0.7, 0.7].map((tx, idx) => (
          <mesh key={`turn-${idx}`} position={[tx, 0.48, 1.76]}>
            <boxGeometry args={[0.1, 0.14, 0.04]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
          </mesh>
        ))}

        {/* 3. HOOD & VENTS */}
        <mesh position={[0, 0.65, 0.95]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[1.48, 0.06, 1.3]} />
          <meshStandardMaterial color={accentColor} roughness={0.45} />
        </mesh>
        {/* Dual Hood Heat Extractors */}
        <mesh position={[0.34, 0.68, 0.7]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.24, 0.03, 0.4]} />
          <meshStandardMaterial color={trimColor} roughness={0.9} />
        </mesh>
        <mesh position={[-0.34, 0.68, 0.7]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.24, 0.03, 0.4]} />
          <meshStandardMaterial color={trimColor} roughness={0.9} />
        </mesh>

        {/* 4. CABIN & ROOF */}
        <mesh position={[0, 1.05, -0.22]} castShadow receiveShadow>
          <boxGeometry args={[1.34, 0.08, 1.75]} />
          <meshStandardMaterial color={accentColor} roughness={0.45} />
        </mesh>
        {/* Front Windshield */}
        <mesh position={[0, 0.88, 0.52]} rotation={[-0.42, 0, 0]}>
          <boxGeometry args={[1.3, 0.55, 0.04]} />
          <meshStandardMaterial color={glassColor} roughness={0.1} metalness={0.85} />
        </mesh>
        {/* Side Windows */}
        <mesh position={[0.67, 0.86, -0.2]}>
          <boxGeometry args={[0.04, 0.42, 1.5]} />
          <meshStandardMaterial color={glassColor} roughness={0.15} metalness={0.8} />
        </mesh>
        <mesh position={[-0.67, 0.86, -0.2]}>
          <boxGeometry args={[0.04, 0.42, 1.5]} />
          <meshStandardMaterial color={glassColor} roughness={0.15} metalness={0.8} />
        </mesh>
        {/* C-Pillars */}
        <mesh position={[0.67, 0.86, -0.92]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.06, 0.46, 0.35]} />
          <meshStandardMaterial color={bodyColor} roughness={0.4} />
        </mesh>
        <mesh position={[-0.67, 0.86, -0.92]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.06, 0.46, 0.35]} />
          <meshStandardMaterial color={bodyColor} roughness={0.4} />
        </mesh>
        {/* Rear Windshield */}
        <mesh position={[0, 0.86, -0.98]} rotation={[0.42, 0, 0]}>
          <boxGeometry args={[1.26, 0.48, 0.04]} />
          <meshStandardMaterial color={glassColor} roughness={0.1} metalness={0.85} />
        </mesh>

        {/* 5. INTERIOR & COMPANION CAT */}
        <mesh position={[0, 0.68, 0.35]}>
          <boxGeometry args={[1.2, 0.18, 0.35]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
        <mesh position={[-0.34, 0.78, 0.22]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.11, 0.02, 8, 16]} />
          <meshStandardMaterial color="#1f2937" roughness={0.7} />
        </mesh>
        <SemicolonCat position={[0.35, 0.64, -0.1]} isAlert={isCatAlert} />

        {/* 6. REAR SPOILER & OLED TAILLIGHT BAR */}
        <group position={[0, 0.84, -1.55]}>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[1.58, 0.06, 0.3]} />
            <meshStandardMaterial color={trimColor} roughness={0.5} />
          </mesh>
          <mesh position={[0.55, 0, 0]}>
            <boxGeometry args={[0.08, 0.12, 0.18]} />
            <meshStandardMaterial color={trimColor} roughness={0.5} />
          </mesh>
          <mesh position={[-0.55, 0, 0]}>
            <boxGeometry args={[0.08, 0.12, 0.18]} />
            <meshStandardMaterial color={trimColor} roughness={0.5} />
          </mesh>
        </group>

        {/* Full-Width OLED Neon Taillight Bar */}
        <mesh position={[0, 0.52, -1.76]}>
          <boxGeometry args={[1.58, 0.16, 0.04]} />
          <meshStandardMaterial color="#0c0e14" roughness={0.9} />
        </mesh>
        {/* Continuous LED Light Stripe */}
        <mesh position={[0, 0.52, -1.78]}>
          <boxGeometry args={[1.5, 0.1, 0.02]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={isHandbraking || driftFactor > 0.2 ? 3.5 : 1.2}
            roughness={0.2}
          />
        </mesh>

        {/* Rear Diffuser */}
        <mesh position={[0, 0.28, -1.76]} castShadow>
          <boxGeometry args={[1.74, 0.22, 0.16]} />
          <meshStandardMaterial color={trimColor} roughness={0.7} />
        </mesh>

        {/* Twin Polished Stainless Steel Exhausts */}
        <group position={[0.48, 0.2, -1.82]} rotation={[0.05, 0.08, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.2, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
        <group position={[0.34, 0.2, -1.82]} rotation={[0.05, 0.08, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.2, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* Animated Exhaust Flame Bursts on Backfire */}
        <group ref={exhaustFlameRef} visible={false}>
          <mesh position={[0.48, 0.2, -1.98]}>
            <coneGeometry args={[0.08, 0.24, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0.34, 0.2, -1.98]}>
            <coneGeometry args={[0.08, 0.24, 8]} />
            <meshBasicMaterial color="#fb923c" transparent opacity={0.85} />
          </mesh>
          <pointLight position={[0.41, 0.2, -2.0]} color="#38bdf8" intensity={4.0} distance={4} />
        </group>
      </group>

      {/* ========================================================
          7. HIGH-DETAIL DEEP-DISH RALLY WHEELS (FR LEGENDS STANCE)
          ======================================================== */}
      {/* Front Left Wheel with Steering */}
      <group position={[0.9, 0.32, 1.1]}>
        <RallyWheel
          rotation={wheelRotation}
          steeringAngle={steeringAngle}
          isLeft={true}
        />
      </group>

      {/* Front Right Wheel with Steering */}
      <group position={[-0.9, 0.32, 1.1]}>
        <RallyWheel
          rotation={wheelRotation}
          steeringAngle={steeringAngle}
          isLeft={false}
        />
      </group>

      {/* Rear Left Wheel */}
      <group position={[0.92, 0.32, -1.1]}>
        <RallyWheel rotation={wheelRotation} isLeft={true} />
      </group>

      {/* Rear Right Wheel */}
      <group position={[-0.92, 0.32, -1.1]}>
        <RallyWheel rotation={wheelRotation} isLeft={false} />
      </group>
    </group>
  );
}
