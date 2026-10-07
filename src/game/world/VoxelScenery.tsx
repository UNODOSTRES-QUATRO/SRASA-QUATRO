"use client";

import { useMemo } from "react";

interface VoxelSceneryProps {
  dayNumber?: number;
}

function VoxelTree({
  position,
  dayNumber = 1,
}: {
  position: [number, number, number];
  dayNumber?: number;
}) {
  // Day 1: Muted moss green; Day 2: Autumn amber/lilac; Day 3: Digital glitch cyan/deep teal
  const foliageColor1 =
    dayNumber === 1 ? "#6b8c6e" : dayNumber === 2 ? "#b88a58" : "#3b7a8a";
  const foliageColor2 =
    dayNumber === 1 ? "#82a37f" : dayNumber === 2 ? "#8f5e7a" : "#4fa1a8";

  return (
    <group position={position}>
      {/* TRUNK */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 2.4, 0.6]} />
        <meshStandardMaterial color="#3a261a" roughness={0.9} />
      </mesh>

      {/* FOLIAGE LAYER 1 (Lower) */}
      <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.6, 2.4]} />
        <meshStandardMaterial
          color={foliageColor1}
          roughness={0.8}
          emissive={dayNumber === 3 ? "#1e4d58" : "#000000"}
          emissiveIntensity={dayNumber === 3 ? 0.4 : 0}
        />
      </mesh>

      {/* FOLIAGE LAYER 2 (Upper) */}
      <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.2, 1.6]} />
        <meshStandardMaterial
          color={foliageColor2}
          roughness={0.8}
          emissive={dayNumber === 3 ? "#286875" : "#000000"}
          emissiveIntensity={dayNumber === 3 ? 0.5 : 0}
        />
      </mesh>

      {/* DAY 3: FLOATING GLITCH DATA PIXEL */}
      {dayNumber === 3 && (
        <mesh position={[0.8, 5.2, 0.5]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial
            color="#ffe2a0"
            emissive="#e09f58"
            emissiveIntensity={1.5}
          />
        </mesh>
      )}
    </group>
  );
}

function StreetLamp({
  position,
  side,
  dayNumber = 1,
}: {
  position: [number, number, number];
  side: "left" | "right";
  dayNumber?: number;
}) {
  const armDirection = side === "left" ? 1 : -1;
  const lampColor = dayNumber === 3 ? "#9dd9d2" : "#fff2c2";
  const emissiveColor = dayNumber === 3 ? "#4fa1a8" : "#e09f58";

  return (
    <group position={position}>
      {/* POLE */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 5, 8]} />
        <meshStandardMaterial color="#22252c" roughness={0.7} />
      </mesh>

      {/* HORIZONTAL ARM */}
      <mesh position={[armDirection * 0.4, 4.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
        <meshStandardMaterial color="#22252c" roughness={0.7} />
      </mesh>

      {/* LANTERN HOUSING */}
      <mesh position={[armDirection * 0.75, 4.6, 0]}>
        <boxGeometry args={[0.3, 0.25, 0.3]} />
        <meshStandardMaterial color="#1a1c22" />
      </mesh>

      {/* WARM LAMP BULB */}
      <mesh position={[armDirection * 0.75, 4.45, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial
          color={lampColor}
          emissive={emissiveColor}
          emissiveIntensity={1.8}
        />
      </mesh>
    </group>
  );
}

export function VoxelScenery({ dayNumber = 1 }: VoxelSceneryProps) {
  // Day 2 subtle anomaly: trees displace slightly
  const treeDisplacement = dayNumber === 2 ? 1.5 : dayNumber === 3 ? 2.8 : 0;

  const treePositions = useMemo<[number, number, number][]>(() => {
    return [
      [-12.0 - treeDisplacement, 0, -80],
      [-13.5 + treeDisplacement * 0.5, 0, -50],
      [-12.5, 0, -25 - treeDisplacement],
      [-12.0 + treeDisplacement, 0, 15],
      [-12.5, 0, 45 + treeDisplacement],
      [-14.0 - treeDisplacement, 0, 85],
      [12.0 + treeDisplacement, 0, -75],
      [13.5 - treeDisplacement * 0.5, 0, -35],
      [12.5, 0, -10 + treeDisplacement],
      [13.0 - treeDisplacement, 0, 25],
      [12.5, 0, 50 - treeDisplacement],
      [13.5 + treeDisplacement, 0, 95],
    ];
  }, [treeDisplacement]);

  // Decorative verge lamps set comfortably along the outer footpaths
  const lampPositions: Array<{ pos: [number, number, number]; side: "left" | "right" }> = [
    { pos: [-11.5, 0, -65], side: "left" },
    { pos: [11.5, 0, -30], side: "right" },
    { pos: [-11.5, 0, 20], side: "left" },
    { pos: [11.5, 0, 45], side: "right" },
    { pos: [-11.5, 0, 95], side: "left" },
  ];

  return (
    <group>
      {treePositions.map((pos, idx) => (
        <VoxelTree key={`tree-${idx}`} position={pos} dayNumber={dayNumber} />
      ))}
      {lampPositions.map((lamp, idx) => (
        <StreetLamp
          key={`lamp-${idx}`}
          position={lamp.pos}
          side={lamp.side}
          dayNumber={dayNumber}
        />
      ))}
    </group>
  );
}
