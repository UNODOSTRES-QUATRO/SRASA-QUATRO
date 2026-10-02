"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { QuatroMesh } from "../vehicle/QuatroMesh";
import { VehicleState } from "../vehicle/vehicleTypes";

interface HighwayDriveSceneProps {
  isVoidHighway?: boolean;
  vehicleState: VehicleState;
}

export function HighwayDriveScene({ isVoidHighway = false, vehicleState }: HighwayDriveSceneProps) {
  const roadScrollRef = useRef(0);
  const roadSegment1Ref = useRef<THREE.Group>(null);
  const roadSegment2Ref = useRef<THREE.Group>(null);
  const sceneryGroupRef = useRef<THREE.Group>(null);
  const wheelsAngleRef = useRef(0);

  const segmentLength = 120;

  useFrame((_, delta) => {
    roadScrollRef.current += vehicleState.speed * delta;
    wheelsAngleRef.current += vehicleState.speed * delta * 2;

    const offset = ((roadScrollRef.current % segmentLength) + segmentLength) % segmentLength;

    if (roadSegment1Ref.current) {
      roadSegment1Ref.current.position.z = -offset;
    }
    if (roadSegment2Ref.current) {
      roadSegment2Ref.current.position.z = -offset + segmentLength;
    }
  });

  const renderedVehicleState: VehicleState = {
    ...vehicleState,
    position: { ...vehicleState.position, z: 0 },
  };

  const roadColor = isVoidHighway ? "#110b29" : "#2d3748";
  const shoulderColor = isVoidHighway ? "#2e1065" : "#4a5568";
  const groundColor = isVoidHighway ? "#090514" : "#1a2e22";
  const stripeColor = isVoidHighway ? "#06b6d4" : "#fef08a";

  return (
    <group>
      {/* ========================================================
          1. INFINITE SCROLLING ROAD SEGMENTS
          ======================================================== */}
      {[roadSegment1Ref, roadSegment2Ref].map((ref, sIndex) => (
        <group key={`road-seg-${sIndex}`} ref={ref} position={[0, 0, sIndex * segmentLength]}>
          {/* Main Asphalt Surface */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[10, segmentLength]} />
            <meshStandardMaterial color={roadColor} roughness={0.8} />
          </mesh>

          {/* Road Shoulders / Curbs */}
          <mesh position={[-5.3, 0.05, 0]} receiveShadow>
            <boxGeometry args={[0.6, 0.15, segmentLength]} />
            <meshStandardMaterial color={shoulderColor} roughness={0.9} />
          </mesh>
          <mesh position={[5.3, 0.05, 0]} receiveShadow>
            <boxGeometry args={[0.6, 0.15, segmentLength]} />
            <meshStandardMaterial color={shoulderColor} roughness={0.9} />
          </mesh>

          {/* Yellow/Cyan Center Dashed Stripes */}
          {Array.from({ length: 15 }).map((_, i) => (
            <mesh
              key={`stripe-${i}`}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.01, -segmentLength / 2 + i * 8 + 4]}
            >
              <planeGeometry args={[0.3, 4]} />
              <meshBasicMaterial
                color={stripeColor}
                transparent={isVoidHighway}
                opacity={isVoidHighway ? 0.8 : 1}
              />
            </mesh>
          ))}

          {/* Guardrails (Side barriers) */}
          {[-5.8, 5.8].map((sideX, sIdx) => (
            <group key={`rail-${sIdx}`}>
              <mesh position={[sideX, 0.6, 0]}>
                <boxGeometry args={[0.1, 0.35, segmentLength]} />
                <meshStandardMaterial
                  color={isVoidHighway ? "#8b5cf6" : "#cbd5e0"}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
              {/* Rail Posts */}
              {Array.from({ length: 12 }).map((_, pIdx) => (
                <mesh
                  key={`post-${pIdx}`}
                  position={[sideX, 0.3, -segmentLength / 2 + pIdx * 10]}
                >
                  <boxGeometry args={[0.12, 0.6, 0.12]} />
                  <meshStandardMaterial color="#4a5568" metalness={0.5} />
                </mesh>
              ))}
            </group>
          ))}

          {/* Roadside Scenery (Trees / Streetlights or Void Runes) */}
          {Array.from({ length: 8 }).map((_, rIdx) => {
            const zP = -segmentLength / 2 + rIdx * 15 + 7;
            if (isVoidHighway) {
              // Floating Neon Crystals / Semicolon Pillars along void highway
              return (
                <group key={`void-prop-${rIdx}`}>
                  <mesh position={[-8.5, 3.0, zP]}>
                    <octahedronGeometry args={[0.8]} />
                    <meshStandardMaterial
                      color="#c084fc"
                      emissive="#a855f7"
                      emissiveIntensity={2.5}
                    />
                  </mesh>
                  <mesh position={[8.5, 3.0, zP]}>
                    <octahedronGeometry args={[0.8]} />
                    <meshStandardMaterial
                      color="#38bdf8"
                      emissive="#0284c7"
                      emissiveIntensity={2.5}
                    />
                  </mesh>
                </group>
              );
            }

            // Normal Highway: Pine Trees & Street Lamps
            return (
              <group key={`norm-prop-${rIdx}`}>
                {/* Street Lamp Left */}
                <group position={[-7.5, 0, zP]}>
                  <mesh position={[0, 2.5, 0]}>
                    <cylinderGeometry args={[0.08, 0.1, 5.0]} />
                    <meshStandardMaterial color="#2d3748" metalness={0.8} />
                  </mesh>
                  <mesh position={[0.6, 4.8, 0]} rotation={[0, 0, -0.4]}>
                    <cylinderGeometry args={[0.06, 0.06, 1.4]} />
                    <meshStandardMaterial color="#2d3748" />
                  </mesh>
                  {/* Lamp Head & Light */}
                  <mesh position={[1.1, 4.6, 0]}>
                    <boxGeometry args={[0.3, 0.15, 0.2]} />
                    <meshStandardMaterial
                      color="#fef08a"
                      emissive="#eab308"
                      emissiveIntensity={2.0}
                    />
                  </mesh>
                  <pointLight
                    position={[1.1, 4.4, 0]}
                    color="#fef08a"
                    intensity={1.8}
                    distance={12}
                    decay={2}
                  />
                </group>

                {/* Pine Tree Right */}
                <group position={[8.5, 0, zP]}>
                  <mesh position={[0, 1.2, 0]} castShadow>
                    <cylinderGeometry args={[0.18, 0.22, 2.4]} />
                    <meshStandardMaterial color="#4a3728" />
                  </mesh>
                  <mesh position={[0, 2.8, 0]} castShadow>
                    <coneGeometry args={[1.4, 2.2, 7]} />
                    <meshStandardMaterial color="#22543d" roughness={0.8} />
                  </mesh>
                  <mesh position={[0, 4.0, 0]} castShadow>
                    <coneGeometry args={[1.0, 1.8, 7]} />
                    <meshStandardMaterial color="#276749" roughness={0.8} />
                  </mesh>
                </group>
              </group>
            );
          })}

          {/* Infinite Ground Expanses */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
            <planeGeometry args={[160, segmentLength]} />
            <meshStandardMaterial color={groundColor} roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* ========================================================
          2. THE DRIVING CAR (QUATRO)
          ======================================================== */}
      <group position={[0, 0, 0]}>
        <QuatroMesh vehicleState={renderedVehicleState} isCatAlert={isVoidHighway} />
        {/* Headlights Beams Forward */}
        <spotLight
          position={[-0.7, 0.6, 2.2]}
          target-position={[-0.7, 0, 25]}
          color="#fffbeb"
          intensity={4.5}
          angle={0.4}
          penumbra={0.6}
          distance={40}
        />
        <spotLight
          position={[0.7, 0.6, 2.2]}
          target-position={[0.7, 0, 25]}
          color="#fffbeb"
          intensity={4.5}
          angle={0.4}
          penumbra={0.6}
          distance={40}
        />
      </group>

      {/* ========================================================
          3. DISTANT HORIZON BACKDROP
          ======================================================== */}
      {isVoidHighway ? (
        <group position={[0, 10, 80]}>
          {/* Floating Giant Semicolon Monolith in Void Sky */}
          <mesh position={[0, 8, 0]}>
            <boxGeometry args={[2.5, 4.5, 0.5]} />
            <meshStandardMaterial
              color="#e09f58"
              emissive="#fbbf24"
              emissiveIntensity={2.5}
            />
          </mesh>
          <pointLight color="#a855f7" intensity={4} distance={60} decay={2} />
        </group>
      ) : (
        <group position={[0, 0, 80]}>
          {/* Mountain Silhouette Layers */}
          {[-40, -10, 20, 50].map((mx, mi) => (
            <mesh key={`mtn-${mi}`} position={[mx, 8, 0]}>
              <coneGeometry args={[22, 18, 4]} />
              <meshStandardMaterial color="#1a202c" roughness={0.9} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}
