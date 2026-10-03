"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { KastilState } from "../core/gameStore";

interface CastleEscapeRoomSceneProps {
  escapeRoomState: KastilState["escapeRoom"];
  playerPos?: [number, number, number];
}

export const CastleEscapeRoomScene = React.memo(function CastleEscapeRoomScene({
  escapeRoomState,
}: CastleEscapeRoomSceneProps) {
  const clockRef = useRef(0);
  const hearthFireRef = useRef<THREE.PointLight>(null);
  const secretWallOffsetRef = useRef(0);
  const secretStoneRef = useRef<THREE.Mesh>(null);
  const exitDoorRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    clockRef.current += delta;
    if (hearthFireRef.current) {
      hearthFireRef.current.intensity = 2.4 + Math.sin(clockRef.current * 14) * 0.4;
    }
    // Smooth sliding of secret wall when revealed
    const targetOffset = escapeRoomState.secretWallRevealed ? 1.4 : 0;
    secretWallOffsetRef.current = THREE.MathUtils.lerp(
      secretWallOffsetRef.current,
      targetOffset,
      delta * 3.0
    );
    if (secretStoneRef.current) {
      secretStoneRef.current.position.x = 1.4 - secretWallOffsetRef.current;
    }
    if (exitDoorRef.current) {
      const targetRotation = escapeRoomState.doorUnlocked ? -Math.PI * 0.48 : 0;
      exitDoorRef.current.rotation.y = THREE.MathUtils.damp(
        exitDoorRef.current.rotation.y,
        targetRotation,
        2.4,
        delta
      );
    }
  });

  const stoneDark = "#1e293b";
  const stoneMid = "#334155";
  const woodArmoire = "#451a03";

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. STONE DUNGEON/HALL FLOOR & CEILING
          ======================================================== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Back Wall (Z = -6.5) */}
      <mesh position={[0, 2.5, -6.5]} receiveShadow>
        <boxGeometry args={[14, 5.0, 0.4]} />
        <meshStandardMaterial color={stoneDark} roughness={0.9} />
      </mesh>

      {/* Left Wall (X = -6.5) */}
      <mesh position={[-6.5, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.4, 5.0, 14]} />
        <meshStandardMaterial color={stoneDark} roughness={0.9} />
      </mesh>

      {/* Right Wall (X = 6.5) */}
      <mesh position={[6.5, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.4, 5.0, 14]} />
        <meshStandardMaterial color={stoneDark} roughness={0.9} />
      </mesh>

      {/* Front Wall (Z = 6.5) with Heavy Slammed Entrance Gate */}
      <mesh position={[0, 2.5, 6.5]} receiveShadow>
        <boxGeometry args={[14, 5.0, 0.4]} />
        <meshStandardMaterial color={stoneDark} roughness={0.9} />
      </mesh>

      {/* Entrance Door (Z = 6.3) — LOCKED SLAMMED SHUT WITH HEAVY CHAINS */}
      <group position={[0, 1.8, 6.3]}>
        <mesh castShadow>
          <boxGeometry args={[3.2, 3.6, 0.2]} />
          <meshStandardMaterial color="#1c1917" roughness={0.8} />
        </mesh>
        {/* Heavy Iron Bars & Cross Chains */}
        <mesh position={[0, 0, -0.12]}>
          <boxGeometry args={[3.4, 0.2, 0.1]} />
          <meshStandardMaterial color="#78716c" metalness={0.9} />
        </mesh>
        <mesh position={[0, 0.8, -0.12]}>
          <boxGeometry args={[3.4, 0.2, 0.1]} />
          <meshStandardMaterial color="#78716c" metalness={0.9} />
        </mesh>
        {/* Locked Sign */}
        <mesh position={[0, 1.4, -0.15]}>
          <boxGeometry args={[1.6, 0.4, 0.05]} />
          <meshStandardMaterial color="#b91c1c" emissive="#991b1b" emissiveIntensity={0.6} />
        </mesh>
      </group>

      {/* Stone Pillars In Room */}
      {[-3.5, 3.5].map((px) =>
        [-2.5, 2.5].map((pz) => (
          <group key={`pill-${px}-${pz}`} position={[px, 0, pz]}>
            <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.35, 0.4, 5.0, 12]} />
              <meshStandardMaterial color={stoneMid} roughness={0.85} />
            </mesh>
          </group>
        ))
      )}

      {/* ========================================================
          2. ESCAPE ROOM ELEMENT 1: LEMARI & LACI ANTIK (CABINET)
          ======================================================== */}
      <group position={[-5.8, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Cabinet Main Frame */}
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[2.0, 2.8, 0.8]} />
          <meshStandardMaterial color={woodArmoire} roughness={0.7} />
        </mesh>
        {/* Left & Right Cabinet Doors */}
        <mesh position={[-0.48, 1.5, 0.42]} castShadow>
          <boxGeometry args={[0.9, 2.2, 0.06]} />
          <meshStandardMaterial color="#5c2605" roughness={0.6} />
        </mesh>
        <mesh position={[0.48, 1.5, 0.42]} castShadow>
          <boxGeometry args={[0.9, 2.2, 0.06]} />
          <meshStandardMaterial color="#5c2605" roughness={0.6} />
        </mesh>
        {/* Brass Handles */}
        <mesh position={[-0.1, 1.5, 0.47]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} />
        </mesh>
        <mesh position={[0.1, 1.5, 0.47]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} />
        </mesh>
        {/* Interactive Beacon over Cabinet */}
        <group position={[0, 3.2, 0]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
            <octahedronGeometry args={[0.16]} />
            <meshStandardMaterial
              color={escapeRoomState.cabinetSearched ? "#22c55e" : "#f59e0b"}
              emissive={escapeRoomState.cabinetSearched ? "#16a34a" : "#d97706"}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          3. ESCAPE ROOM ELEMENT 2: DAPUR & KOMPOR KASTIL (STOVE)
          ======================================================== */}
      <group position={[5.8, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Stone Hearth Fireplace Structure */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[2.4, 2.4, 1.0]} />
          <meshStandardMaterial color={stoneMid} roughness={0.9} />
        </mesh>
        {/* Hearth Fire Cavity */}
        <mesh position={[0, 0.7, 0.1]}>
          <boxGeometry args={[1.5, 1.1, 0.8]} />
          <meshStandardMaterial color="#0c0a09" />
        </mesh>
        {/* Cast Iron Stove / Pot in Fireplace */}
        <mesh position={[0, 0.6, 0.2]} castShadow>
          <cylinderGeometry args={[0.3, 0.25, 0.4, 16]} />
          <meshStandardMaterial color="#1c1917" metalness={0.8} />
        </mesh>
        {/* Glowing Hearth Fire / Embers */}
        <pointLight
          ref={hearthFireRef}
          position={[0, 0.8, 0.2]}
          color="#ea580c"
          intensity={2.8}
          distance={6}
        />
        {/* Interactive Beacon over Stove */}
        <group position={[0, 2.7, 0]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
            <octahedronGeometry args={[0.16]} />
            <meshStandardMaterial
              color={escapeRoomState.stoveChecked ? "#22c55e" : "#f97316"}
              emissive={escapeRoomState.stoveChecked ? "#16a34a" : "#ea580c"}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          4. ESCAPE ROOM ELEMENT 3: TEMBOK RAHASIA (SECRET BRICK WALL)
          ======================================================== */}
      <group position={[-2.8, 0, -6.1]}>
        {/* Bookshelf & Secret Stone Partition */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[2.0, 3.2, 0.6]} />
          <meshStandardMaterial color="#3b1d11" roughness={0.8} />
        </mesh>
        {/* Ancient Books on Shelves */}
        {[-0.6, 0, 0.6].map((by, bIdx) => (
          <mesh key={`books-${bIdx}`} position={[0, 1.6 + by, 0.15]}>
            <boxGeometry args={[1.7, 0.38, 0.3]} />
            <meshStandardMaterial
              color={bIdx === 0 ? "#7f1d1d" : bIdx === 1 ? "#14532d" : "#1e3a8a"}
            />
          </mesh>
        ))}
        {/* Displaced / Loose Secret Stone on Wall beside bookshelf */}
        <mesh ref={secretStoneRef} position={[1.4, 1.2, 0.05]} castShadow>
          <boxGeometry args={[0.45, 0.3, 0.15]} />
          <meshStandardMaterial
            color={escapeRoomState.secretWallRevealed ? "#10b981" : "#64748b"}
            roughness={0.7}
          />
        </mesh>

        {/* Hidden Wall Safe (Revealed when secret stone pressed!) */}
        {escapeRoomState.secretWallRevealed && (
          <group position={[1.4, 1.8, 0.05]}>
            {/* Safe Iron Box */}
            <mesh castShadow>
              <boxGeometry args={[0.8, 0.8, 0.25]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} />
            </mesh>
            {/* Safe Combination Dials */}
            <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.06, 16]} />
              <meshStandardMaterial
                color="#d97706"
                metalness={0.8}
                emissive="#f59e0b"
                emissiveIntensity={1.2}
              />
            </mesh>
          </group>
        )}

        {/* Interactive Beacon over Secret Wall */}
        <group position={[1.4, 2.5, 0]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
            <octahedronGeometry args={[0.16]} />
            <meshStandardMaterial
              color={escapeRoomState.puzzleSolved ? "#22c55e" : "#a855f7"}
              emissive={escapeRoomState.puzzleSolved ? "#16a34a" : "#9333ea"}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================
          5. ESCAPE ROOM ELEMENT 4: GRAND EXIT GATE TO END SCREEN!
          ======================================================== */}
      <group position={[2.0, 1.8, -6.1]}>
        {/* Exit Door Arch */}
        <mesh>
          <boxGeometry args={[2.4, 3.6, 0.3]} />
          <meshStandardMaterial color={stoneDark} />
        </mesh>
        {/* Exit Door Leaf */}
        <mesh ref={exitDoorRef} position={[0, 0, 0.04]} castShadow>
          <boxGeometry args={[2.1, 3.3, 0.12]} />
          <meshStandardMaterial color="#292524" roughness={0.7} />
        </mesh>

        {/* Master Semicolon Padlock */}
        <group position={[0, 0, 0.14]}>
          <mesh>
            <boxGeometry args={[0.4, 0.45, 0.1]} />
            <meshStandardMaterial
              color={escapeRoomState.hasMasterKey ? "#22c55e" : "#e09f58"}
              emissive={escapeRoomState.hasMasterKey ? "#16a34a" : "#f59e0b"}
              emissiveIntensity={2.5}
            />
          </mesh>
        </group>

        {/* Floating Master Key Beacon */}
        <group position={[0, 2.3, 0.3]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.1, 0]}>
            <octahedronGeometry args={[0.22]} />
            <meshStandardMaterial
              color={escapeRoomState.hasMasterKey ? "#22c55e" : "#fbbf24"}
              emissive={escapeRoomState.hasMasterKey ? "#16a34a" : "#d97706"}
              emissiveIntensity={3}
            />
          </mesh>
        </group>
      </group>

      {/* TORCH WALL LIGHTING */}
      <pointLight position={[-4, 3.2, 0]} color="#fed7aa" intensity={2.2} distance={10} />
      <pointLight position={[4, 3.2, 0]} color="#fed7aa" intensity={2.2} distance={10} />
      <pointLight position={[0, 3.5, -4]} color="#fde047" intensity={2.0} distance={12} />
    </group>
  );
});
