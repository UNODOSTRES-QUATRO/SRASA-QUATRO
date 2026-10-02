"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MechanicShopSceneProps {
  playerPos: [number, number, number];
}

export function MechanicShopScene({ playerPos }: MechanicShopSceneProps) {
  const lampLightRef = useRef<THREE.PointLight>(null);

  return (
    <group position={[0, 0, 0]}>
      {/* GARAGE CONCRETE FLOOR */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* SERVICE BAY SAFETY CHEVRON MARKINGS */}
      {[-2.2, 2.2].map((lx, li) => (
        <mesh
          key={`hazard-line-${li}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lx, 0.015, 0]}
        >
          <planeGeometry args={[0.22, 7.5]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}

      {/* WALLS */}
      {/* Back Wall (Z = -6) */}
      <mesh position={[0, 2.0, -6]} receiveShadow>
        <boxGeometry args={[12, 4.0, 0.2]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* Left Wall (X = -6) */}
      <mesh position={[-6, 2.0, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.0, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* Right Wall (X = 6) */}
      <mesh position={[6, 2.0, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.0, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {/* Front Wall with Wide Open Roll-Up Bay Entrance */}
      <mesh position={[-4.5, 2.0, 6]} receiveShadow>
        <boxGeometry args={[3.0, 4.0, 0.2]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      <mesh position={[4.5, 2.0, 6]} receiveShadow>
        <boxGeometry args={[3.0, 4.0, 0.2]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* Rolled-up industrial steel garage door at header */}
      <mesh position={[0, 3.85, 6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 6.4, 16]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* HYDRAULIC TWO-POST LIFT (Left and Right of open bay) */}
      {[-2.6, 2.6].map((lx, li) => (
        <group key={`lift-col-${li}`} position={[lx, 0, 0]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <boxGeometry args={[0.28, 3.6, 0.38]} />
            <meshStandardMaterial color="#dc2626" roughness={0.5} metalness={0.4} />
          </mesh>
          {/* Base plate */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.65, 0.1, 0.65]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} />
          </mesh>
          {/* Lift arm pointing toward center */}
          <mesh position={[li === 0 ? 0.7 : -0.7, 0.45, 0]} castShadow>
            <boxGeometry args={[1.2, 0.1, 0.18]} />
            <meshStandardMaterial color="#eab308" metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* TOOL CHEST & WORKBENCH */}
      <group position={[3.5, 0, -4.8]}>
        {/* Red Heavy Toolbox */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.6, 1.2, 0.8]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.5} />
        </mesh>
        {/* Stainless Steel Top */}
        <mesh position={[0, 1.22, 0]}>
          <boxGeometry args={[1.65, 0.05, 0.85]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
        </mesh>
        {/* Bench Grinder */}
        <mesh position={[-0.4, 1.35, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.24, 12]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* Pegboard on Wall */}
        <mesh position={[0, 2.2, -0.45]}>
          <boxGeometry args={[1.8, 1.1, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
        </mesh>
        {/* Wrenches hanging on pegboard */}
        {[-0.5, -0.2, 0.1, 0.4].map((wx, wi) => (
          <mesh key={`wrench-${wi}`} position={[wx, 2.2, -0.41]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.04, 0.35 + wi * 0.06, 0.02]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* OIL DRUMS */}
      <group position={[-4.5, 0, -4.5]}>
        {[-0.4, 0.4].map((ox, oi) => (
          <mesh key={`drum-${oi}`} position={[ox, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 1.1, 16]} />
            <meshStandardMaterial color={oi === 0 ? "#1e40af" : "#047857"} roughness={0.6} metalness={0.3} />
          </mesh>
        ))}
      </group>

      {/* STACK OF TIRES */}
      <group position={[4.6, 0, 2.0]}>
        {[0.2, 0.6, 1.0].map((ty, ti) => (
          <mesh key={`tire-${ti}`} position={[0, ty, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.18, 12, 24]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* PAK MONTIR (MECHANIC NPC) at X = 2.0, Z = -1.5 */}
      <group position={[2.0, 0, -1.5]}>
        {/* Overalls Legs */}
        <mesh position={[-0.14, 0.35, 0]} castShadow>
          <boxGeometry args={[0.18, 0.7, 0.2]} />
          <meshStandardMaterial color="#1d4ed8" />
        </mesh>
        <mesh position={[0.14, 0.35, 0]} castShadow>
          <boxGeometry args={[0.18, 0.7, 0.2]} />
          <meshStandardMaterial color="#1d4ed8" />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.48, 0.6, 0.3]} />
          <meshStandardMaterial color="#1e40af" />
        </mesh>
        {/* Head */}
        <mesh position={[0, 1.45, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#fed7aa" />
        </mesh>
        {/* Mechanic Cap */}
        <mesh position={[0, 1.62, 0.05]} castShadow>
          <boxGeometry args={[0.34, 0.1, 0.4]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        {/* Wrench in Hand */}
        <mesh position={[0.35, 0.85, 0.1]} rotation={[0.4, 0, 0.2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.35]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>

        {/* NPC Interactive Speech Bubble / Beacon */}
        <group position={[0, 2.0, 0]}>
          <mesh position={[0, 0, 0]}>
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d97706"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      </group>

      {/* OVERHEAD WARM WORKSHOP LIGHTING */}
      <pointLight position={[0, 3.2, 0]} color="#fef08a" intensity={3.5} distance={14} />
      <pointLight position={[3, 2.8, -4]} color="#fef08a" intensity={2.0} distance={8} />
    </group>
  );
}
