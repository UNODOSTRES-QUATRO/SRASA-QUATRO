"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CastleCourtyardProps {
  gateOpen: boolean;
  puzzleSolved: boolean;
}

export function CastleCourtyard({
  gateOpen,
  puzzleSolved,
}: CastleCourtyardProps) {
  const gateRef = useRef<THREE.Group>(null);
  const currentGateY = useRef(2.1);

  useFrame((_, delta) => {
    // Smooth gate lifting animation when unlocked
    const targetY = gateOpen ? 6.5 : 2.1;
    currentGateY.current = THREE.MathUtils.lerp(
      currentGateY.current,
      targetY,
      Math.min(1, delta * 3.5)
    );
    if (gateRef.current) {
      gateRef.current.position.y = currentGateY.current;
    }
  });

  const wallStoneColor = "#3d4454";
  const trimStoneColor = "#2a2f3d";
  const woodColor = "#4a3525";
  const ironColor = "#1e2229";

  return (
    <group>
      {/* ========================================================
          1. CASTLE GATEWAY WALLS & TOWERS (Z = 136)
          ======================================================== */}
      {/* Left Fortress Wall */}
      <mesh position={[-12, 3.5, 136]} castShadow receiveShadow>
        <boxGeometry args={[14, 7, 2.4]} />
        <meshStandardMaterial color={wallStoneColor} roughness={0.9} />
      </mesh>

      {/* Right Fortress Wall (Leaves small conduit gap at x=7.2) */}
      <mesh position={[5.8, 3.5, 136]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 7, 2.4]} />
        <meshStandardMaterial color={wallStoneColor} roughness={0.9} />
      </mesh>
      <mesh position={[14, 3.5, 136]} castShadow receiveShadow>
        <boxGeometry args={[12, 7, 2.4]} />
        <meshStandardMaterial color={wallStoneColor} roughness={0.9} />
      </mesh>

      {/* Conduit Arch Header over the small passage (x=7.2, y=2.8) */}
      <mesh position={[7.2, 4.0, 136]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 6.0, 2.4]} />
        <meshStandardMaterial color={wallStoneColor} roughness={0.9} />
      </mesh>
      {/* Conduit Warning Arch Border (Height ~ 0.55 clearance) */}
      <mesh position={[7.2, 0.75, 135.9]}>
        <boxGeometry args={[0.85, 0.12, 2.6]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Left Tower */}
      <group position={[-4.8, 0, 136]}>
        <mesh position={[0, 4.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 9.6, 3.2]} />
          <meshStandardMaterial color={trimStoneColor} roughness={0.85} />
        </mesh>
        {/* Tower Battlements */}
        <mesh position={[0, 9.9, 0]} castShadow>
          <boxGeometry args={[3.2, 0.8, 3.6]} />
          <meshStandardMaterial color={wallStoneColor} roughness={0.9} />
        </mesh>
        {/* Torch brazier */}
        <pointLight position={[0, 5.5, -1.8]} color="#ff9e3b" intensity={2.5} distance={10} decay={2} />
      </group>

      {/* Right Tower */}
      <group position={[4.2, 0, 136]}>
        <mesh position={[0, 4.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 9.6, 3.2]} />
          <meshStandardMaterial color={trimStoneColor} roughness={0.85} />
        </mesh>
        {/* Tower Battlements */}
        <mesh position={[0, 9.9, 0]} castShadow>
          <boxGeometry args={[3.2, 0.8, 3.6]} />
          <meshStandardMaterial color={wallStoneColor} roughness={0.9} />
        </mesh>
        {/* Torch brazier */}
        <pointLight position={[0, 5.5, -1.8]} color="#ff9e3b" intensity={2.5} distance={10} decay={2} />
      </group>

      {/* Massive Overhead Gate Arch Beam */}
      <mesh position={[0, 6.4, 136]} castShadow receiveShadow>
        <boxGeometry args={[6.8, 1.8, 2.6]} />
        <meshStandardMaterial color={trimStoneColor} roughness={0.85} />
      </mesh>

      {/* Castle Arch Crest (The Semicolon Crest) */}
      <mesh position={[0, 6.4, 134.6]} castShadow>
        <boxGeometry args={[1.2, 1.2, 0.2]} />
        <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ========================================================
          2. SLIDING MAIN CASTLE GATE (PORTCULLIS)
          ======================================================== */}
      <group ref={gateRef} position={[0, 2.1, 136]}>
        {/* Heavy Iron Portcullis Grille & Planks */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.8, 4.2, 0.35]} />
          <meshStandardMaterial color={woodColor} roughness={0.7} />
        </mesh>
        {/* Iron Reinforcements (Vertical bars) */}
        {[-2.2, -1.1, 0, 1.1, 2.2].map((x, i) => (
          <mesh key={`iron-bar-${i}`} position={[x, 0, 0.2]}>
            <boxGeometry args={[0.12, 4.3, 0.08]} />
            <meshStandardMaterial color={ironColor} roughness={0.5} metalness={0.8} />
          </mesh>
        ))}
        {/* Iron Studs Horizontal */}
        {[-1.5, 0, 1.5].map((y, i) => (
          <mesh key={`iron-horiz-${i}`} position={[0, y, 0.2]}>
            <boxGeometry args={[5.8, 0.14, 0.08]} />
            <meshStandardMaterial color={ironColor} roughness={0.5} metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* ========================================================
          3. DUAL-SCALE PUZZLE: SMALL CONDUIT & PRESSURE PLATE
          ======================================================== */}
      {/* Pressure plate inside the small conduit tunnel (x=7.2, z=141) */}
      <group position={[7.2, 0.06, 141]}>
        {/* Stone Base Ring */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <cylinderGeometry args={[0.55, 0.6, 0.1, 16]} />
          <meshStandardMaterial color="#2d3748" roughness={0.8} />
        </mesh>

        {/* Glowing Semicolon Mechanism Plate */}
        <mesh position={[0, puzzleSolved ? -0.02 : 0.04, 0]}>
          <cylinderGeometry args={[0.42, 0.45, 0.06, 16]} />
          <meshStandardMaterial
            color={puzzleSolved ? "#48bb78" : "#38bdf8"}
            emissive={puzzleSolved ? "#22c55e" : "#0284c7"}
            emissiveIntensity={puzzleSolved ? 2.2 : 1.2}
            roughness={0.3}
          />
        </mesh>

        {/* Plate Glow Light */}
        <pointLight
          color={puzzleSolved ? "#22c55e" : "#38bdf8"}
          intensity={puzzleSolved ? 3.0 : 1.8}
          distance={6}
          decay={2}
          position={[0, 0.3, 0]}
        />
      </group>

      {/* ========================================================
          4. INNER CASTLE COURTYARD (Z = 138 to 185)
          ======================================================== */}
      {/* Inner Cobblestone Courtyard Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 162]} receiveShadow>
        <planeGeometry args={[32, 50]} />
        <meshStandardMaterial color="#404654" roughness={0.85} />
      </mesh>

      {/* Courtyard Ancient Pillars (Left & Right Colonades) */}
      {[-8, -4, 4, 8].map((x) =>
        [146, 158, 170].map((z) => (
          <group key={`col-${x}-${z}`} position={[x, 0, z]}>
            <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.4, 0.45, 5.0, 12]} />
              <meshStandardMaterial color="#50586c" roughness={0.8} />
            </mesh>
            <mesh position={[0, 5.2, 0]} castShadow>
              <boxGeometry args={[1.1, 0.4, 1.1]} />
              <meshStandardMaterial color="#3d4454" roughness={0.9} />
            </mesh>
          </group>
        ))
      )}

      {/* Castle Rear Keep Wall (Courtyard Boundary at z=185) */}
      <mesh position={[0, 6, 185]} castShadow receiveShadow>
        <boxGeometry args={[36, 12, 3]} />
        <meshStandardMaterial color={trimStoneColor} roughness={0.9} />
      </mesh>
      {/* Inner Grand Sanctuary Arch */}
      <mesh position={[0, 4.5, 183.4]} castShadow>
        <boxGeometry args={[6, 9, 0.4]} />
        <meshStandardMaterial
          color="#fff4cc"
          emissive="#ffe2a0"
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
