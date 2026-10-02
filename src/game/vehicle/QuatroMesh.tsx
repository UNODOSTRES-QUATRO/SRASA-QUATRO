"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { VehicleState } from "./vehicleTypes";
import { SemicolonCat } from "../character/SemicolonCat";

interface QuatroMeshProps {
  vehicleState: VehicleState;
  isCatAlert?: boolean;
}

// Deep-dish rally wheel component with visible brake rotor and caliper
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
  const camber = isLeft ? 0.05 : -0.05; // Subtle FR Legends negative camber

  return (
    <group rotation={[0, steeringAngle, camber]}>
      {/* Outer tire with rotation */}
      <group rotation={[rotation, 0, Math.PI / 2]}>
        {/* Rubber Tire */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 20]} />
          <meshStandardMaterial color="#1a1c22" roughness={0.9} metalness={0.1} />
        </mesh>

        {/* Deep Dish Rim Lip */}
        <mesh position={[0, isLeft ? 0.06 : -0.06, 0]}>
          <cylinderGeometry args={[0.27, 0.25, 0.08, 16]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Wheel Spokes (Classic 5-spoke rally star) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            rotation={[0, (i * Math.PI * 2) / 5, 0]}
            position={[0, isLeft ? 0.1 : -0.1, 0]}
          >
            <boxGeometry args={[0.045, 0.03, 0.22]} />
            <meshStandardMaterial color="#f3f4f6" roughness={0.35} metalness={0.7} />
          </mesh>
        ))}

        {/* Center Hub & Nut */}
        <mesh position={[0, isLeft ? 0.12 : -0.12, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 12]} />
          <meshStandardMaterial color="#374151" roughness={0.5} metalness={0.9} />
        </mesh>
      </group>

      {/* Non-rotating Brake Rotor & Caliper */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[isLeft ? -0.04 : 0.04, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 16]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.4} metalness={0.85} />
      </mesh>
      {/* Sport Caliper (Red) */}
      <mesh position={[isLeft ? -0.04 : 0.04, 0.14, 0]}>
        <boxGeometry args={[0.05, 0.09, 0.07]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} metalness={0.4} />
      </mesh>
    </group>
  );
}

export function QuatroMesh({
  vehicleState,
  isCatAlert = false,
}: QuatroMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { position, heading, steeringAngle, wheelRotation, scaleFactor } = vehicleState;
  const currentScale = useRef(1.0);

  useFrame((_: unknown, delta: number) => {
    const targetScale = scaleFactor || 1.0;
    currentScale.current = THREE.MathUtils.lerp(
      currentScale.current,
      targetScale,
      Math.min(1, delta * 8)
    );
    if (groupRef.current) {
      groupRef.current.scale.setScalar(currentScale.current);
    }
  });

  // Color Palette (Audi Sport Rally Terracotta & Classic Cream)
  const bodyColor = "#d65d28"; // Warm vintage rally terracotta
  const accentColor = "#f4eee1"; // Heritage warm off-white
  const trimColor = "#1f2229"; // Dark matte plastic / rubber
  const glassColor = "#1a222d"; // Smoked glass

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={[0, heading, 0]}
    >
      {/* ========================================================
          1. MAIN CHASSIS & SIGNATURE AUDI QUATTRO BOX-FLARES
          ======================================================== */}
      {/* Central lower body */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.42, 3.5]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} metalness={0.2} />
      </mesh>

      {/* Front Aggressive Blister Fenders (Box Flares) */}
      <mesh position={[0, 0.44, 1.08]} castShadow receiveShadow>
        <boxGeometry args={[1.82, 0.38, 1.15]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} metalness={0.2} />
      </mesh>

      {/* Rear Aggressive Blister Fenders (Box Flares) */}
      <mesh position={[0, 0.44, -1.08]} castShadow receiveShadow>
        <boxGeometry args={[1.84, 0.38, 1.15]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} metalness={0.2} />
      </mesh>

      {/* Aerodynamic Side Skirts with dark trim */}
      <mesh position={[0.82, 0.28, 0]}>
        <boxGeometry args={[0.06, 0.1, 1.3]} />
        <meshStandardMaterial color={trimColor} roughness={0.8} />
      </mesh>
      <mesh position={[-0.82, 0.28, 0]}>
        <boxGeometry args={[0.06, 0.1, 1.3]} />
        <meshStandardMaterial color={trimColor} roughness={0.8} />
      </mesh>

      {/* ========================================================
          2. FRONT END (QUATTRO GRILLE, QUAD LIGHTS, CHIN SPOILER)
          ======================================================== */}
      {/* Front Rally Chin Bumper with dual ducts */}
      <mesh position={[0, 0.26, 1.76]} castShadow>
        <boxGeometry args={[1.72, 0.22, 0.16]} />
        <meshStandardMaterial color={trimColor} roughness={0.7} />
      </mesh>
      {/* Lower Air Intake Ducts */}
      <mesh position={[0.4, 0.24, 1.84]}>
        <boxGeometry args={[0.34, 0.1, 0.04]} />
        <meshStandardMaterial color="#0c0e12" roughness={0.9} />
      </mesh>
      <mesh position={[-0.4, 0.24, 1.84]}>
        <boxGeometry args={[0.34, 0.1, 0.04]} />
        <meshStandardMaterial color="#0c0e12" roughness={0.9} />
      </mesh>

      {/* Recessed Matte Black Front Grille */}
      <mesh position={[0, 0.48, 1.75]}>
        <boxGeometry args={[1.56, 0.22, 0.08]} />
        <meshStandardMaterial color="#16181f" roughness={0.9} />
      </mesh>
      {/* Center Emblem Accent */}
      <mesh position={[0, 0.48, 1.8]}>
        <boxGeometry args={[0.18, 0.05, 0.02]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* QUAD RECTANGULAR RALLY HEADLIGHTS (Inner + Outer pairs) */}
      {/* Right Headlights */}
      <mesh position={[0.48, 0.48, 1.78]}>
        <boxGeometry args={[0.22, 0.15, 0.04]} />
        <meshStandardMaterial
          color="#fff6dd"
          emissive="#ffe599"
          emissiveIntensity={1.3}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0.24, 0.48, 1.78]}>
        <boxGeometry args={[0.18, 0.15, 0.04]} />
        <meshStandardMaterial
          color="#fff6dd"
          emissive="#ffe599"
          emissiveIntensity={1.1}
          roughness={0.2}
        />
      </mesh>
      {/* Right Amber Turn Signal */}
      <mesh position={[0.67, 0.48, 1.76]}>
        <boxGeometry args={[0.12, 0.15, 0.04]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Left Headlights */}
      <mesh position={[-0.48, 0.48, 1.78]}>
        <boxGeometry args={[0.22, 0.15, 0.04]} />
        <meshStandardMaterial
          color="#fff6dd"
          emissive="#ffe599"
          emissiveIntensity={1.3}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[-0.24, 0.48, 1.78]}>
        <boxGeometry args={[0.18, 0.15, 0.04]} />
        <meshStandardMaterial
          color="#fff6dd"
          emissive="#ffe599"
          emissiveIntensity={1.1}
          roughness={0.2}
        />
      </mesh>
      {/* Left Amber Turn Signal */}
      <mesh position={[-0.67, 0.48, 1.76]}>
        <boxGeometry args={[0.12, 0.15, 0.04]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* ========================================================
          3. HOOD & VENTS
          ======================================================== */}
      {/* Slanted Hood Panel */}
      <mesh position={[0, 0.65, 0.95]} rotation={[-0.08, 0, 0]} castShadow>
        <boxGeometry args={[1.48, 0.06, 1.3]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} />
      </mesh>
      {/* Dual Hood Heat Extractors (Rally Vents) */}
      <mesh position={[0.34, 0.68, 0.7]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.24, 0.03, 0.4]} />
        <meshStandardMaterial color={trimColor} roughness={0.9} />
      </mesh>
      <mesh position={[-0.34, 0.68, 0.7]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.24, 0.03, 0.4]} />
        <meshStandardMaterial color={trimColor} roughness={0.9} />
      </mesh>

      {/* ========================================================
          4. CABIN, PILLARS, WINDOWS & ROOF
          ======================================================== */}
      {/* Cabin Roof Shell (Classic Quattro 2-Tone Warm Cream) */}
      <mesh position={[0, 1.05, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[1.34, 0.08, 1.75]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} />
      </mesh>

      {/* Front Windshield (Angled Rally Rake) */}
      <mesh position={[0, 0.88, 0.52]} rotation={[-0.42, 0, 0]}>
        <boxGeometry args={[1.3, 0.55, 0.04]} />
        <meshStandardMaterial color={glassColor} roughness={0.15} metalness={0.8} />
      </mesh>

      {/* Side Windows (Tinted glass) */}
      <mesh position={[0.67, 0.86, -0.2]}>
        <boxGeometry args={[0.04, 0.42, 1.5]} />
        <meshStandardMaterial color={glassColor} roughness={0.2} metalness={0.7} />
      </mesh>
      <mesh position={[-0.67, 0.86, -0.2]}>
        <boxGeometry args={[0.04, 0.42, 1.5]} />
        <meshStandardMaterial color={glassColor} roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Thick Audi Quattro Angled C-Pillars */}
      <mesh position={[0.67, 0.86, -0.92]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.06, 0.46, 0.35]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} />
      </mesh>
      <mesh position={[-0.67, 0.86, -0.92]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.06, 0.46, 0.35]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} />
      </mesh>

      {/* Rear Slanted Windshield */}
      <mesh position={[0, 0.86, -0.98]} rotation={[0.42, 0, 0]}>
        <boxGeometry args={[1.26, 0.48, 0.04]} />
        <meshStandardMaterial color={glassColor} roughness={0.15} metalness={0.8} />
      </mesh>

      {/* Side Mirrors on Door Mounts */}
      <group position={[0.76, 0.76, 0.42]}>
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.08, 0.14]} />
          <meshStandardMaterial color={trimColor} roughness={0.6} />
        </mesh>
        <mesh position={[0.061, 0, 0]}>
          <boxGeometry args={[0.005, 0.06, 0.11]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>
      <group position={[-0.76, 0.76, 0.42]}>
        <mesh castShadow>
          <boxGeometry args={[0.12, 0.08, 0.14]} />
          <meshStandardMaterial color={trimColor} roughness={0.6} />
        </mesh>
        <mesh position={[-0.061, 0, 0]}>
          <boxGeometry args={[0.005, 0.06, 0.11]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* ========================================================
          5. INTERIOR & COMPANION
          ======================================================== */}
      {/* Interior Dashboard & Steering Wheel */}
      <mesh position={[0, 0.68, 0.35]}>
        <boxGeometry args={[1.2, 0.18, 0.35]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>
      {/* Steering Wheel (Driver is on the left) */}
      <mesh position={[-0.34, 0.78, 0.22]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.11, 0.02, 8, 16]} />
        <meshStandardMaterial color="#1f2937" roughness={0.7} />
      </mesh>
      {/* Roll Cage / B-Pillar Bar (Rally Touch) */}
      <mesh position={[0, 0.88, -0.3]}>
        <cylinderGeometry args={[0.02, 0.02, 1.25, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* SEMICOLON COMPANION CAT IN PASSENGER SEAT */}
      <SemicolonCat position={[0.35, 0.64, -0.1]} isAlert={isCatAlert} />

      {/* ========================================================
          6. REAR END, SPOILER & TWIN EXHAUST
          ======================================================== */}
      {/* Iconic Quattro Ducktail Rally Rear Spoiler */}
      <group position={[0, 0.84, -1.55]}>
        {/* Spoiler Wing Blade */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[1.56, 0.06, 0.3]} />
          <meshStandardMaterial color={trimColor} roughness={0.6} />
        </mesh>
        {/* Left & Right Spoiler Mounts */}
        <mesh position={[0.55, 0, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.18]} />
          <meshStandardMaterial color={trimColor} roughness={0.6} />
        </mesh>
        <mesh position={[-0.55, 0, 0]}>
          <boxGeometry args={[0.08, 0.12, 0.18]} />
          <meshStandardMaterial color={trimColor} roughness={0.6} />
        </mesh>
      </group>

      {/* Horizontal Taillight Housing */}
      <mesh position={[0, 0.52, -1.76]}>
        <boxGeometry args={[1.56, 0.18, 0.04]} />
        <meshStandardMaterial color="#0f1117" roughness={0.9} />
      </mesh>
      {/* Right Red Taillight Cluster */}
      <mesh position={[0.52, 0.52, -1.78]}>
        <boxGeometry args={[0.42, 0.14, 0.04]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#ef4444"
          emissiveIntensity={0.85}
          roughness={0.3}
        />
      </mesh>
      {/* Left Red Taillight Cluster */}
      <mesh position={[-0.52, 0.52, -1.78]}>
        <boxGeometry args={[0.42, 0.14, 0.04]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive="#ef4444"
          emissiveIntensity={0.85}
          roughness={0.3}
        />
      </mesh>
      {/* Center License Plate Area ("QUATRO ;") */}
      <mesh position={[0, 0.48, -1.77]}>
        <boxGeometry args={[0.45, 0.13, 0.03]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>

      {/* Rear Bumper & Diffuser */}
      <mesh position={[0, 0.28, -1.76]} castShadow>
        <boxGeometry args={[1.74, 0.22, 0.16]} />
        <meshStandardMaterial color={trimColor} roughness={0.7} />
      </mesh>

      {/* Twin Polished Stainless Steel Exhaust Tips */}
      <group position={[0.48, 0.2, -1.82]} rotation={[0.05, 0.08, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.2, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.02, 16]} />
          <meshStandardMaterial color="#090a0f" roughness={1.0} />
        </mesh>
      </group>
      <group position={[0.36, 0.2, -1.82]} rotation={[0.05, 0.08, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.2, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.032, 0.02, 16]} />
          <meshStandardMaterial color="#090a0f" roughness={1.0} />
        </mesh>
      </group>

      {/* ========================================================
          7. HIGH-DETAIL DEEP-DISH RALLY WHEELS (FR LEGENDS STANCE)
          ======================================================== */}
      {/* Front Left Wheel with Steering */}
      <group position={[0.88, 0.32, 1.1]}>
        <RallyWheel
          rotation={wheelRotation}
          steeringAngle={steeringAngle}
          isLeft={true}
        />
      </group>

      {/* Front Right Wheel with Steering */}
      <group position={[-0.88, 0.32, 1.1]}>
        <RallyWheel
          rotation={wheelRotation}
          steeringAngle={steeringAngle}
          isLeft={false}
        />
      </group>

      {/* Rear Left Wheel */}
      <group position={[0.9, 0.32, -1.1]}>
        <RallyWheel rotation={wheelRotation} isLeft={true} />
      </group>

      {/* Rear Right Wheel */}
      <group position={[-0.9, 0.32, -1.1]}>
        <RallyWheel rotation={wheelRotation} isLeft={false} />
      </group>
    </group>
  );
}

