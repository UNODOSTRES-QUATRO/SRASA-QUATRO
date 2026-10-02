"use client";

interface WorkplaceBuildingProps {
  dayNumber?: number;
}

export function WorkplaceBuilding({ dayNumber = 1 }: WorkplaceBuildingProps) {
  const buildingColor = dayNumber === 3 ? "#34424f" : "#4a3c31"; // Glitches darker on Day 3

  return (
    <group position={[14, 0, 70]}>
      {/* MAIN OFFICE BUILDING */}
      <mesh position={[0, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 10, 16]} />
        <meshStandardMaterial color={buildingColor} roughness={0.85} />
      </mesh>

      {/* OFFICE WINDOWS (Warm glow) */}
      {Array.from({ length: 3 }).map((_, floor) => (
        <group key={`floor-${floor}`} position={[-5.05, 2.5 + floor * 2.8, 0]}>
          {[-5, -1.8, 1.8, 5].map((zOffset, i) => (
            <mesh key={`win-${i}`} position={[0, 0, zOffset]}>
              <boxGeometry args={[0.1, 1.4, 1.8]} />
              <meshStandardMaterial
                color="#ffe2a0"
                emissive="#e09f58"
                emissiveIntensity={1.2}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* OFFICE ENTRANCE AWNING */}
      <mesh position={[-6, 1.8, 0]} castShadow>
        <boxGeometry args={[2.5, 0.25, 4.5]} />
        <meshStandardMaterial color="#22252c" roughness={0.7} />
      </mesh>

      {/* ENTRANCE GLASS DOOR */}
      <mesh position={[-5.05, 0.9, 0]}>
        <boxGeometry args={[0.1, 1.8, 2.2]} />
        <meshStandardMaterial color="#2a3848" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* PARKING BAY SIGN */}
      <mesh position={[-6.5, 0.8, -4]}>
        <boxGeometry args={[0.08, 1.6, 0.08]} />
        <meshStandardMaterial color="#22252c" />
      </mesh>
      <mesh position={[-6.5, 1.4, -4]}>
        <boxGeometry args={[0.4, 0.4, 0.05]} />
        <meshStandardMaterial
          color="#fbf8f2"
          emissive="#e09f58"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* PARKING LOT PAVEMENT & ROAD CONNECTOR */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.02, 0]} receiveShadow>
        <planeGeometry args={[8, 12]} />
        <meshStandardMaterial color="#353b47" roughness={0.8} />
      </mesh>

      {/* PARKING LINES (Warm Yellow) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.03, -2.5]}>
        <planeGeometry args={[5, 0.18]} />
        <meshStandardMaterial color="#e09f58" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5, 0.03, 2.5]}>
        <planeGeometry args={[5, 0.18]} />
        <meshStandardMaterial color="#e09f58" />
      </mesh>
    </group>
  );
}
