"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { QuatroMesh } from "../vehicle/QuatroMesh";
import { VehicleState } from "../vehicle/vehicleTypes";
import { TrafficCar } from "../vehicle/TrafficCar";

interface HighwayDriveSceneProps {
  isVoidHighway?: boolean;
  vehicleState: VehicleState;
}

// ── Drift Smoke Particle System ─────────────────────────────────────────────
interface SmokeParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
}

function DriftSmoke({
  vehicleState,
  isVoidHighway,
}: {
  vehicleState: VehicleState;
  isVoidHighway: boolean;
}) {
  const particles = useRef<SmokeParticle[]>([]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const MAX_PARTICLES = 60;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const { position, heading, speed, driftFactor, isHandbraking } = vehicleState;

    // Emit smoke from rear wheels when drifting
    if (driftFactor > 0.18 && Math.abs(speed) > 3) {
      const emitCount = isHandbraking ? 3 : 1;
      for (let e = 0; e < emitCount; e++) {
        if (particles.current.length < MAX_PARTICLES) {
          // Rear wheel positions
          const side = (Math.random() - 0.5) * 1.8;
          const rearX = position.x + Math.cos(heading) * side - Math.sin(heading) * 1.1;
          const rearZ = position.z - Math.sin(heading) * side - Math.cos(heading) * 1.1;

          particles.current.push({
            position: new THREE.Vector3(rearX, position.y + 0.22, rearZ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 1.2,
              Math.random() * 0.8 + 0.3,
              (Math.random() - 0.5) * 1.2
            ),
            life: 0,
            maxLife: 0.6 + Math.random() * 0.4,
            size: 0.35 + Math.random() * 0.25,
          });
        }
      }
    }

    // Update existing particles
    particles.current = particles.current.filter((p) => p.life < p.maxLife);

    const mesh = meshRef.current;
    if (!mesh) return;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles.current[i];
      if (!p) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      p.life += dt;
      p.velocity.y -= 0.3 * dt; // slight gravity
      p.position.addScaledVector(p.velocity, dt);

      const lifeRatio = p.life / p.maxLife;
      const scale = p.size * (0.4 + lifeRatio * 1.8); // grows as it disperses
      const opacity = 1.0 - lifeRatio;

      dummy.position.copy(p.position);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Update opacity via color (approximation with instanced)
      const color = isVoidHighway
        ? new THREE.Color().setHSL(0.75, 0.6, 0.3 + opacity * 0.3)
        : new THREE.Color(opacity * 0.8, opacity * 0.8, opacity * 0.8);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_PARTICLES]} renderOrder={1}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial transparent opacity={0.5} depthWrite={false} />
    </instancedMesh>
  );
}

// ── Traffic configuration ───────────────────────────────────────────────────
const TRAFFIC_CARS = [
  { lane: -3.2, startZ: 18, speed: 9.5, color: "#2a4a7f" },
  { lane: -1.0, startZ: 32, speed: 11.0, color: "#4a7a3a" },
  { lane: 1.0,  startZ: 25, speed: 8.5,  color: "#8a3a2a" },
  { lane: 3.2,  startZ: 44, speed: 10.0, color: "#5a4a7a" },
  { lane: -3.2, startZ: 55, speed: 9.0,  color: "#7a5a1a" },
  { lane: 1.0,  startZ: 68, speed: 12.0, color: "#3a6a5a" },
];

const VOID_TRAFFIC_CARS = [
  { lane: -3.2, startZ: 20, speed: 10.0, color: "#8b5cf6" },
  { lane: 1.0,  startZ: 35, speed: 8.0,  color: "#06b6d4" },
  { lane: 3.2,  startZ: 50, speed: 11.5, color: "#a855f7" },
  { lane: -1.0, startZ: 62, speed: 9.5,  color: "#7c3aed" },
];

export function HighwayDriveScene({ isVoidHighway = false, vehicleState }: HighwayDriveSceneProps) {
  const roadScrollRef = useRef(0);
  const roadSegment1Ref = useRef<THREE.Group>(null);
  const roadSegment2Ref = useRef<THREE.Group>(null);

  const segmentLength = 120;

  useFrame((_, delta) => {
    roadScrollRef.current += vehicleState.speed * delta;

    const offset = ((roadScrollRef.current % segmentLength) + segmentLength) % segmentLength;

    if (roadSegment1Ref.current) {
      roadSegment1Ref.current.position.z = -offset;
    }
    if (roadSegment2Ref.current) {
      roadSegment2Ref.current.position.z = -offset + segmentLength;
    }
  });

  // Vehicle stays centered, road scrolls past it
  const renderedVehicleState: VehicleState = {
    ...vehicleState,
    position: { ...vehicleState.position, z: 0 },
  };

  const roadColor = isVoidHighway ? "#110b29" : "#2d3748";
  const shoulderColor = isVoidHighway ? "#2e1065" : "#4a5568";
  const groundColor = isVoidHighway ? "#090514" : "#1a2e22";
  const stripeColor = isVoidHighway ? "#06b6d4" : "#fef08a";
  const laneStripeColor = isVoidHighway ? "#4c1d95" : "#9ca3af";

  const trafficCars = isVoidHighway ? VOID_TRAFFIC_CARS : TRAFFIC_CARS;

  return (
    <group>
      {/* ======================================================
          1. INFINITE SCROLLING ROAD SEGMENTS
          ====================================================== */}
      {[roadSegment1Ref, roadSegment2Ref].map((ref, sIndex) => (
        <group key={`road-seg-${sIndex}`} ref={ref} position={[0, 0, sIndex * segmentLength]}>
          {/* Main Asphalt Surface — wider for multi-lane highway */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <planeGeometry args={[15, segmentLength]} />
            <meshStandardMaterial color={roadColor} roughness={0.82} />
          </mesh>

          {/* Road Shoulders / Curbs */}
          <mesh position={[-8.0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[1.0, 0.15, segmentLength]} />
            <meshStandardMaterial color={shoulderColor} roughness={0.9} />
          </mesh>
          <mesh position={[8.0, 0.05, 0]} receiveShadow>
            <boxGeometry args={[1.0, 0.15, segmentLength]} />
            <meshStandardMaterial color={shoulderColor} roughness={0.9} />
          </mesh>

          {/* Center dashed stripes */}
          {Array.from({ length: 15 }).map((_, i) => (
            <mesh
              key={`center-stripe-${i}`}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.01, -segmentLength / 2 + i * 8 + 4]}
            >
              <planeGeometry args={[0.3, 4.5]} />
              <meshBasicMaterial
                color={stripeColor}
                transparent={isVoidHighway}
                opacity={isVoidHighway ? 0.85 : 1}
              />
            </mesh>
          ))}

          {/* Lane dividers (left of center) */}
          {[-2.2, 2.2].map((lx, li) =>
            Array.from({ length: 15 }).map((_, i) => (
              <mesh
                key={`lane-stripe-${li}-${i}`}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[lx, 0.008, -segmentLength / 2 + i * 8 + 4]}
              >
                <planeGeometry args={[0.18, 3.5]} />
                <meshBasicMaterial color={laneStripeColor} transparent opacity={0.55} />
              </mesh>
            ))
          )}

          {/* Guardrails */}
          {[-8.6, 8.6].map((sideX, sIdx) => (
            <group key={`rail-${sIdx}`}>
              <mesh position={[sideX, 0.6, 0]}>
                <boxGeometry args={[0.1, 0.35, segmentLength]} />
                <meshStandardMaterial
                  color={isVoidHighway ? "#8b5cf6" : "#cbd5e0"}
                  metalness={0.75}
                  roughness={0.25}
                />
              </mesh>
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

          {/* Roadside Scenery */}
          {Array.from({ length: 8 }).map((_, rIdx) => {
            const zP = -segmentLength / 2 + rIdx * 15 + 7;
            if (isVoidHighway) {
              return (
                <group key={`void-prop-${rIdx}`}>
                  <mesh position={[-11.5, 3.0, zP]}>
                    <octahedronGeometry args={[0.8]} />
                    <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={2.5} />
                  </mesh>
                  <mesh position={[11.5, 3.0, zP]}>
                    <octahedronGeometry args={[0.8]} />
                    <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.5} />
                  </mesh>
                </group>
              );
            }
            return (
              <group key={`norm-prop-${rIdx}`}>
                {/* Street Lamp Left */}
                <group position={[-10.5, 0, zP]}>
                  <mesh position={[0, 2.5, 0]}>
                    <cylinderGeometry args={[0.08, 0.1, 5.0]} />
                    <meshStandardMaterial color="#2d3748" metalness={0.8} />
                  </mesh>
                  <mesh position={[0.6, 4.8, 0]} rotation={[0, 0, -0.4]}>
                    <cylinderGeometry args={[0.06, 0.06, 1.4]} />
                    <meshStandardMaterial color="#2d3748" />
                  </mesh>
                  <mesh position={[1.1, 4.6, 0]}>
                    <boxGeometry args={[0.3, 0.15, 0.2]} />
                    <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={2.2} />
                  </mesh>
                  <pointLight position={[1.1, 4.4, 0]} color="#fef08a" intensity={2.2} distance={14} decay={2} />
                </group>
                {/* Pine Tree Right */}
                <group position={[12.0, 0, zP]}>
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

          {/* Infinite Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
            <planeGeometry args={[220, segmentLength]} />
            <meshStandardMaterial color={groundColor} roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* ======================================================
          2. PLAYER CAR + LIGHTS
          ====================================================== */}
      <group position={[0, 0, 0]}>
        <QuatroMesh vehicleState={renderedVehicleState} isCatAlert={isVoidHighway} />

        {/* Headlight beams */}
        <spotLight
          position={[-0.7, 0.65, 2.1]}
          target-position={[-0.7, 0, 28]}
          color="#fffbeb"
          intensity={6.0}
          angle={0.38}
          penumbra={0.6}
          distance={55}
          castShadow={false}
        />
        <spotLight
          position={[0.7, 0.65, 2.1]}
          target-position={[0.7, 0, 28]}
          color="#fffbeb"
          intensity={6.0}
          angle={0.38}
          penumbra={0.6}
          distance={55}
          castShadow={false}
        />

        {/* Brake light glow (red, rear) */}
        {vehicleState.isHandbraking && (
          <pointLight
            position={[0, 0.55, -1.9]}
            color="#ef4444"
            intensity={4.0}
            distance={6}
            decay={2}
          />
        )}
      </group>

      {/* ======================================================
          3. DRIFT SMOKE
          ====================================================== */}
      <DriftSmoke vehicleState={vehicleState} isVoidHighway={isVoidHighway} />

      {/* ======================================================
          4. AI TRAFFIC CARS
          ====================================================== */}
      {trafficCars.map((car, i) => (
        <TrafficCar
          key={`traffic-${i}`}
          laneX={car.lane}
          startZ={car.startZ}
          speed={car.speed}
          color={car.color}
          isVoidHighway={isVoidHighway}
        />
      ))}

      {/* ======================================================
          5. DISTANT HORIZON BACKDROP
          ====================================================== */}
      {isVoidHighway ? (
        <group position={[0, 10, 80]}>
          <mesh position={[0, 8, 0]}>
            <boxGeometry args={[2.5, 4.5, 0.5]} />
            <meshStandardMaterial color="#e09f58" emissive="#fbbf24" emissiveIntensity={2.5} />
          </mesh>
          <pointLight color="#a855f7" intensity={4} distance={60} decay={2} />
        </group>
      ) : (
        <group position={[0, 0, 80]}>
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
