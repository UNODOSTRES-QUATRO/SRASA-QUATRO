"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { QuatroMesh } from "../vehicle/QuatroMesh";
import { VehicleState } from "../vehicle/vehicleTypes";

interface MechanicShopSceneProps {
  playerPos: [number, number, number];
}

export function MechanicShopScene({ playerPos }: MechanicShopSceneProps) {
  const lampLightRef = useRef<THREE.PointLight>(null);

  const mockVehicleState: VehicleState = {
    position: { x: -2.5, y: 0.35, z: 0 },
    heading: 0,
    speed: 0,
    lateralSpeed: 0,
    angularVelocity: 0,
    scaleMode: "BIG",
    scaleFactor: 1.0,
    steeringAngle: 0,
    wheelRotation: 0,
    isReversing: false,
    isHandbraking: false,
    driftFactor: 0,
  };

  return (
    <group position={[0, 0, 0]}>
      {/* GARAGE CONCRETE FLOOR */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>

      {/* WALLS */}
      {/* Back Wall */}
      <mesh position={[0, 2.0, -6]} receiveShadow>
        <boxGeometry args={[12, 4.0, 0.2]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-6, 2.0, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.0, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
      {/* Right Wall */}
      <mesh position={[6, 2.0, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.0, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>

      {/* ROLL-UP GARAGE DOOR AT FRONT (Z = 6) */}
      <mesh position={[0, 2.2, 6]}>
        <boxGeometry args={[6.5, 3.8, 0.1]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* QUATRO IN SERVICE BAY */}
      <group position={[0, 0, 0]}>
        <QuatroMesh vehicleState={mockVehicleState} />
      </group>

      {/* HYDRAULIC TWO-POST LIFT (Left of car) */}
      {[-4.2, -0.8].map((lx, li) => (
        <group key={`lift-col-${li}`} position={[lx, 0, 0]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <boxGeometry args={[0.25, 3.6, 0.35]} />
            <meshStandardMaterial color="#dc2626" roughness={0.6} />
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
      </group>

      {/* STACK OF TIRES */}
      <group position={[4.5, 0, 2.0]}>
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
