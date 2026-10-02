"use client";

function VoxelTree({ position }: { position: [number, number, number] }) {
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
        <meshStandardMaterial color="#6b8c6e" roughness={0.8} />
      </mesh>
      {/* FOLIAGE LAYER 2 (Upper) */}
      <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.2, 1.6]} />
        <meshStandardMaterial color="#82a37f" roughness={0.8} />
      </mesh>
    </group>
  );
}

function StreetLamp({ position, side }: { position: [number, number, number]; side: "left" | "right" }) {
  const armDirection = side === "left" ? 1 : -1;

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
          color="#fff2c2"
          emissive="#e09f58"
          emissiveIntensity={1.8}
        />
      </mesh>
      <pointLight
        position={[armDirection * 0.75, 4.3, 0]}
        color="#ffe2a0"
        intensity={2.0}
        distance={10}
        decay={2}
      />
    </group>
  );
}

export function VoxelScenery() {
  const treePositions: [number, number, number][] = [
    [-8, 0, -80], [-10, 0, -50], [-7.5, 0, -20], [-9, 0, 10], [-8, 0, 40], [-11, 0, 70],
    [8, 0, -75], [9.5, 0, -45], [8, 0, -10], [10, 0, 25], [7.5, 0, 55], [9, 0, 85],
  ];

  const lampPositions: Array<{ pos: [number, number, number]; side: "left" | "right" }> = [
    { pos: [-5.5, 0, -60], side: "left" },
    { pos: [5.5, 0, -30], side: "right" },
    { pos: [-5.5, 0, 0], side: "left" },
    { pos: [5.5, 0, 30], side: "right" },
    { pos: [-5.5, 0, 60], side: "left" },
  ];

  return (
    <group>
      {treePositions.map((pos, idx) => (
        <VoxelTree key={`tree-${idx}`} position={pos} />
      ))}
      {lampPositions.map((lamp, idx) => (
        <StreetLamp key={`lamp-${idx}`} position={lamp.pos} side={lamp.side} />
      ))}
    </group>
  );
}
