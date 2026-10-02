"use client";

export function VoxelRoad() {
  const roadLength = 360;
  const roadWidth = 9;

  return (
    <group position={[0, -0.05, 40]}>
      {/* MAIN ROAD ASPHALT */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, roadLength]} />
        <meshStandardMaterial
          color="#313745" /* Soft dark warm slate */
          roughness={0.88}
        />
      </mesh>

      {/* ROAD CURBS / EDGES (Left & Right) */}
      <mesh position={[-roadWidth / 2 - 0.25, 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.18, roadLength]} />
        <meshStandardMaterial color="#8a877f" roughness={0.9} />
      </mesh>
      <mesh position={[roadWidth / 2 + 0.25, 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.18, roadLength]} />
        <meshStandardMaterial color="#8a877f" roughness={0.9} />
      </mesh>

      {/* DASHED CENTER LANE LINES */}
      {Array.from({ length: 24 }).map((_, i) => {
        const zPos = -roadLength / 2 + i * 10 + 5;
        return (
          <mesh
            key={`centerline-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, zPos]}
          >
            <planeGeometry args={[0.3, 4]} />
            <meshStandardMaterial color="#e5e0d8" roughness={0.6} />
          </mesh>
        );
      })}

      {/* EXPANSIVE GROUND GRASS/EARTH */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[260, roadLength]} />
        <meshStandardMaterial
          color="#3c4a3e" /* Muted moss green */
          roughness={0.95}
        />
      </mesh>
    </group>
  );
}
