"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface TrafficCarProps {
  laneX: number;           // lane X position (-3.2, -1.0, 1.0, 3.2)
  startZ: number;          // initial Z position in world (ahead of player)
  speed: number;           // this car's base cruising speed (units/s)
  color: string;
  isVoidHighway?: boolean;
}

/**
 * Simple AI traffic car that loops along the highway.
 * Gives the player cars to overtake and adds interstate vibe.
 */
export function TrafficCar({
  laneX,
  startZ,
  speed,
  color,
  isVoidHighway = false,
}: TrafficCarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const zRef = useRef(startZ);
  const wheelRef = useRef(0);
  const laneChangeTimer = useRef(Math.random() * 12 + 5); // seconds until next lane change
  const currentLane = useRef(laneX);
  const targetLane = useRef(laneX);

  // Available lanes (right-side drive, player in center)
  const LANES = [-3.2, -1.0, 1.0, 3.2];

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Move forward (scroll toward camera)
    zRef.current -= speed * dt;
    wheelRef.current += (speed / 0.32) * dt;

    // Loop when too far behind camera
    if (zRef.current < -60) {
      zRef.current = 80 + Math.random() * 40;
    }

    // Occasional lane change
    laneChangeTimer.current -= dt;
    if (laneChangeTimer.current <= 0) {
      const otherLanes = LANES.filter((l) => l !== currentLane.current);
      targetLane.current = otherLanes[Math.floor(Math.random() * otherLanes.length)];
      laneChangeTimer.current = Math.random() * 15 + 8;
    }

    // Smooth lane transition
    currentLane.current = THREE.MathUtils.lerp(
      currentLane.current,
      targetLane.current,
      Math.min(1, dt * 1.2)
    );

    groupRef.current.position.set(currentLane.current, 0, zRef.current);
  });

  const trimColor = "#1a1c22";
  const glassColor = isVoidHighway ? "#1a0a3d" : "#1a2030";
  const lightColor = isVoidHighway ? color : "#fff6dd";
  const tailColor = isVoidHighway ? "#c084fc" : "#dc2626";
  const wheelColor = "#1a1c22";

  return (
    <group ref={groupRef} position={[laneX, 0, startZ]}>
      {/* ── BODY ── */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.38, 3.2]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Cabin / roof */}
      <mesh position={[0, 0.82, -0.1]} castShadow>
        <boxGeometry args={[1.28, 0.34, 1.7]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Windshield */}
      <mesh position={[0, 0.78, 0.58]} rotation={[-0.38, 0, 0]}>
        <boxGeometry args={[1.2, 0.46, 0.04]} />
        <meshStandardMaterial color={glassColor} roughness={0.1} metalness={0.85} />
      </mesh>

      {/* Rear window */}
      <mesh position={[0, 0.76, -0.9]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[1.18, 0.4, 0.04]} />
        <meshStandardMaterial color={glassColor} roughness={0.1} metalness={0.85} />
      </mesh>

      {/* Headlights */}
      <mesh position={[0.42, 0.44, 1.62]}>
        <boxGeometry args={[0.3, 0.14, 0.04]} />
        <meshStandardMaterial color={lightColor} emissive={lightColor} emissiveIntensity={1.6} roughness={0.2} />
      </mesh>
      <mesh position={[-0.42, 0.44, 1.62]}>
        <boxGeometry args={[0.3, 0.14, 0.04]} />
        <meshStandardMaterial color={lightColor} emissive={lightColor} emissiveIntensity={1.6} roughness={0.2} />
      </mesh>

      {/* Taillights */}
      <mesh position={[0.44, 0.44, -1.62]}>
        <boxGeometry args={[0.28, 0.12, 0.04]} />
        <meshStandardMaterial color={tailColor} emissive={tailColor} emissiveIntensity={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-0.44, 0.44, -1.62]}>
        <boxGeometry args={[0.28, 0.12, 0.04]} />
        <meshStandardMaterial color={tailColor} emissive={tailColor} emissiveIntensity={0.9} roughness={0.3} />
      </mesh>

      {/* ── WHEELS ── */}
      {([
        [0.79, 0.28, 0.95],
        [-0.79, 0.28, 0.95],
        [0.79, 0.28, -0.95],
        [-0.79, 0.28, -0.95],
      ] as [number, number, number][]).map(([wx, wy, wz], i) => (
        <group key={i} position={[wx, wy, wz]}>
          <mesh rotation={[wheelRef.current, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.22, 14]} />
            <meshStandardMaterial color={wheelColor} roughness={0.9} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[wheelRef.current, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.17, 0.24, 8]} />
            <meshStandardMaterial color="#c0c0c8" metalness={0.75} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
