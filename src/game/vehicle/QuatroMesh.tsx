"use client";

import { useRef } from "react";
import * as THREE from "three";
import { VehicleState } from "./vehicleTypes";
import { SemicolonCat } from "../character/SemicolonCat";

interface QuatroMeshProps {
  vehicleState: VehicleState;
  isCatAlert?: boolean;
}

export function QuatroMesh({
  vehicleState,
  isCatAlert = false,
}: QuatroMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frontLeftWheelRef = useRef<THREE.Group>(null);
  const frontRightWheelRef = useRef<THREE.Group>(null);
  const rearLeftWheelRef = useRef<THREE.Mesh>(null);
  const rearRightWheelRef = useRef<THREE.Mesh>(null);

  const { position, heading, steeringAngle, wheelRotation } = vehicleState;

  const wheelRadius = 0.32;
  const wheelWidth = 0.22;

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={[0, heading, 0]}
    >
      {/* MAIN CAR CHASSIS / LOWER BODY */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.55, 3.4]} />
        <meshStandardMaterial
          color="#d97736" /* Warm vintage terracotta/orange */
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>

      {/* CABIN / ROOF */}
      <mesh position={[0, 0.95, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.52, 1.8]} />
        <meshStandardMaterial
          color="#f3ede2" /* Warm cream cabin */
          roughness={0.7}
        />
      </mesh>

      {/* SEMICOLON COMPANION CAT IN PASSENGER SEAT */}
      <SemicolonCat position={[0.38, 0.65, -0.1]} isAlert={isCatAlert} />

      {/* WINDSHIELD & WINDOWS (Tinted warm glass) */}
      <mesh position={[0, 0.93, 0.72]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1.32, 0.44, 0.05]} />
        <meshStandardMaterial
          color="#2a3848"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* HEADLIGHTS (Warm amber glow) */}
      <mesh position={[0.6, 0.45, 1.71]}>
        <boxGeometry args={[0.28, 0.2, 0.06]} />
        <meshStandardMaterial
          color="#fff2c2"
          emissive="#ffe2a0"
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh position={[-0.6, 0.45, 1.71]}>
        <boxGeometry args={[0.28, 0.2, 0.06]} />
        <meshStandardMaterial
          color="#fff2c2"
          emissive="#ffe2a0"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* TAILLIGHTS (Warm red glow) */}
      <mesh position={[0.6, 0.48, -1.71]}>
        <boxGeometry args={[0.28, 0.16, 0.06]} />
        <meshStandardMaterial
          color="#a83232"
          emissive="#e63946"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[-0.6, 0.48, -1.71]}>
        <boxGeometry args={[0.28, 0.16, 0.06]} />
        <meshStandardMaterial
          color="#a83232"
          emissive="#e63946"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* FRONT LEFT WHEEL (With steering pivot) */}
      <group
        ref={frontLeftWheelRef}
        position={[0.88, 0.1, 1.1]}
        rotation={[0, steeringAngle, 0]}
      >
        <mesh rotation={[wheelRotation, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
          <meshStandardMaterial color="#1e2029" roughness={0.85} />
        </mesh>
      </group>

      {/* FRONT RIGHT WHEEL (With steering pivot) */}
      <group
        ref={frontRightWheelRef}
        position={[-0.88, 0.1, 1.1]}
        rotation={[0, steeringAngle, 0]}
      >
        <mesh rotation={[wheelRotation, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
          <meshStandardMaterial color="#1e2029" roughness={0.85} />
        </mesh>
      </group>

      {/* REAR LEFT WHEEL */}
      <mesh
        ref={rearLeftWheelRef}
        position={[0.88, 0.1, -1.1]}
        rotation={[wheelRotation, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
        <meshStandardMaterial color="#1e2029" roughness={0.85} />
      </mesh>

      {/* REAR RIGHT WHEEL */}
      <mesh
        ref={rearRightWheelRef}
        position={[-0.88, 0.1, -1.1]}
        rotation={[wheelRotation, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
        <meshStandardMaterial color="#1e2029" roughness={0.85} />
      </mesh>
    </group>
  );
}
