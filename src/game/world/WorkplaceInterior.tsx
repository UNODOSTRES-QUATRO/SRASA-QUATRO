"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WorkplaceState } from "../core/gameStore";

interface WorkplaceInteriorProps {
  workplaceState: WorkplaceState;
  dayNumber: number;
  playerPos: [number, number, number];
}

export function WorkplaceInterior({
  workplaceState,
  dayNumber,
  playerPos,
}: WorkplaceInteriorProps) {
  const clockRef = useRef(0);
  const portalGlowRef = useRef<THREE.PointLight>(null);
  const anomalyFlickerRef = useRef<THREE.PointLight>(null);

  useFrame((_, delta) => {
    clockRef.current += delta;
    if (portalGlowRef.current) {
      portalGlowRef.current.intensity = 3.5 + Math.sin(clockRef.current * 5) * 1.0;
    }
    if (anomalyFlickerRef.current) {
      const flicker = dayNumber === 2 ? Math.sin(clockRef.current * 12) : Math.sin(clockRef.current * 25);
      anomalyFlickerRef.current.intensity = dayNumber >= 2 ? 1.5 + flicker * 0.8 : 0;
    }
  });

  const carpetColor = "#4a5568"; // 2000s office dark gray/blue carpet
  const wallColor = "#cbd5e1"; // Slate gray office walls
  const cubicleColor = "#718096"; // Fabric gray partitions
  const deskWood = "#a0aec0"; // Gray laminate desk tops
  const pcBeige = "#d6d3d1"; // Classic 2000s beige/off-white PC

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. FLOOR & WALLS
          ======================================================== */}
      {/* Office Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={carpetColor} roughness={0.9} />
      </mesh>

      {/* Back Wall (Z = -7) */}
      <mesh position={[0, 2.0, -7]} receiveShadow>
        <boxGeometry args={[14, 4.0, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* Left Wall (X = -7) */}
      <mesh position={[-7, 2.0, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.0, 14]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* Right Wall (X = 7) */}
      <mesh position={[7, 2.0, 0]} receiveShadow>
        <boxGeometry args={[0.2, 4.0, 14]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* Front Wall (Z = 7) with Exit Doorway at X=0 */}
      <mesh position={[-4.0, 2.0, 7]} receiveShadow>
        <boxGeometry args={[6.0, 4.0, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      <mesh position={[4.0, 2.0, 7]} receiveShadow>
        <boxGeometry args={[6.0, 4.0, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.4, 7]} receiveShadow>
        <boxGeometry args={[2.0, 1.2, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* Office Entrance: Modern Sliding Glass Doors (Parted Open for Seamless Entry) */}
      <group position={[0, 1.4, 6.9]}>
        {/* Door Frame Header */}
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[2.4, 0.15, 0.15]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
        {/* Left Open Glass Door */}
        <mesh position={[-0.85, 0, 0]} castShadow>
          <boxGeometry args={[0.7, 2.65, 0.04]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} roughness={0.1} />
        </mesh>
        {/* Right Open Glass Door */}
        <mesh position={[0.85, 0, 0]} castShadow>
          <boxGeometry args={[0.7, 2.65, 0.04]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} roughness={0.1} />
        </mesh>
        {/* Exit / Welcome Sign */}
        <mesh position={[0, 1.55, 0.06]}>
          <boxGeometry args={[0.8, 0.22, 0.04]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#16a34a"
            emissiveIntensity={1.8}
          />
        </mesh>
      </group>

      {/* ========================================================
          2. CUBICLES & 2000s PC DESKS (GRID OF WORKSTATIONS)
          ======================================================== */}
      {/* 4 Cubicle Pods: [-3, -2], [3, -2], [-3, 2.5], [3, 2.5] */}
      {[
        { x: -3, z: -2, isPlayer: false },
        { x: 3, z: -2, isPlayer: true }, // PLAYER'S WORKSTATION!
        { x: -3, z: 2.5, isPlayer: false },
        { x: 3, z: 2.5, isPlayer: false },
      ].map((cube, idx) => (
        <group key={`cubicle-${idx}`} position={[cube.x, 0, cube.z]}>
          {/* Partition Wall Back */}
          <mesh position={[0, 0.8, -1.2]} castShadow>
            <boxGeometry args={[2.6, 1.6, 0.1]} />
            <meshStandardMaterial color={cubicleColor} roughness={0.9} />
          </mesh>
          {/* Partition Wall Side */}
          <mesh position={[-1.25, 0.8, 0]} castShadow>
            <boxGeometry args={[0.1, 1.6, 2.4]} />
            <meshStandardMaterial color={cubicleColor} roughness={0.9} />
          </mesh>

          {/* Desk Surface */}
          <mesh position={[0, 0.72, -0.4]} castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.06, 1.2]} />
            <meshStandardMaterial color={deskWood} roughness={0.5} />
          </mesh>
          {/* Desk Metal Legs */}
          {[-1.0, 1.0].map((lx, li) => (
            <mesh key={`leg-${li}`} position={[lx, 0.35, -0.4]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.7]} />
              <meshStandardMaterial color="#4a5568" metalness={0.7} />
            </mesh>
          ))}

          {/* 2000s CRT Monitor */}
          <mesh position={[0, 1.05, -0.7]} castShadow>
            <boxGeometry args={[0.55, 0.45, 0.48]} />
            <meshStandardMaterial color={pcBeige} roughness={0.6} />
          </mesh>
          {/* CRT Screen Curved Face */}
          <mesh position={[0, 1.05, -0.45]}>
            <planeGeometry args={[0.42, 0.34]} />
            <meshBasicMaterial
              color={
                cube.isPlayer
                  ? workplaceState.allTasksDone
                    ? "#22c55e"
                    : "#38bdf8"
                  : dayNumber >= 2
                  ? "#a855f7"
                  : "#1e293b"
              }
            />
          </mesh>
          {/* CRT Base Stand */}
          <mesh position={[0, 0.78, -0.7]}>
            <cylinderGeometry args={[0.14, 0.16, 0.06, 16]} />
            <meshStandardMaterial color={pcBeige} />
          </mesh>

          {/* Beige PC Tower Under/Beside Desk */}
          <mesh position={[0.8, 0.35, -0.6]} castShadow>
            <boxGeometry args={[0.22, 0.55, 0.48]} />
            <meshStandardMaterial color={pcBeige} roughness={0.7} />
          </mesh>

          {/* Keyboard & Mouse on Desk */}
          <mesh position={[0, 0.76, -0.2]}>
            <boxGeometry args={[0.48, 0.02, 0.18]} />
            <meshStandardMaterial color={pcBeige} />
          </mesh>
          <mesh position={[0.35, 0.76, -0.2]}>
            <boxGeometry args={[0.08, 0.03, 0.12]} />
            <meshStandardMaterial color={pcBeige} />
          </mesh>

          {/* Office Swivel Chair */}
          <group position={[0, 0, 0.4]} rotation={[0, Math.PI, 0]}>
            {/* Seat */}
            <mesh position={[0, 0.48, 0]} castShadow>
              <boxGeometry args={[0.5, 0.08, 0.5]} />
              <meshStandardMaterial color="#2d3748" roughness={0.8} />
            </mesh>
            {/* Backrest */}
            <mesh position={[0, 0.8, -0.22]} castShadow>
              <boxGeometry args={[0.46, 0.48, 0.08]} />
              <meshStandardMaterial color="#2d3748" roughness={0.8} />
            </mesh>
            {/* Swivel Stem */}
            <mesh position={[0, 0.24, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.48]} />
              <meshStandardMaterial color="#1a202c" metalness={0.9} />
            </mesh>
          </group>

          {/* Player Workstation Floating Interactive Beacon */}
          {cube.isPlayer && !workplaceState.allTasksDone && (
            <group position={[0, 1.6, -0.5]}>
              <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
                <octahedronGeometry args={[0.18]} />
                <meshStandardMaterial
                  color="#e09f58"
                  emissive="#fbbf24"
                  emissiveIntensity={2.5}
                />
              </mesh>
              <pointLight color="#fbbf24" intensity={2} distance={4} />
            </group>
          )}
        </group>
      ))}

      {/* ========================================================
          3. OFFICE PROPS (Water Cooler, Filing Cabinets, Plant)
          ======================================================== */}
      {/* Water Cooler at X=-6.0, Z=0 */}
      <group position={[-6.0, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[0.45, 1.0, 0.45]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.55, 12]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Metal Filing Cabinets at X=-6.0, Z=-5.0 */}
      <mesh position={[-6.0, 0.9, -5.0]} castShadow>
        <boxGeometry args={[0.7, 1.8, 1.2]} />
        <meshStandardMaterial color="#4a5568" metalness={0.6} />
      </mesh>

      {/* Office Clock on Wall */}
      <mesh position={[0, 3.2, -6.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 24]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* ========================================================
          4. FLUORESCENT CEILING LIGHTS & AMBIENT
          ======================================================== */}
      <pointLight position={[0, 3.2, 0]} color="#f1f5f9" intensity={2.8} distance={16} />
      <pointLight position={[0, 3.2, -4]} color="#f1f5f9" intensity={2.2} distance={14} />

      {/* ========================================================
          5. DAY 2 & DAY 3 ANOMALIES (Glitch lights, Floating Semicolons)
          ======================================================== */}
      {dayNumber >= 2 && (
        <group>
          <pointLight
            ref={anomalyFlickerRef}
            position={[2, 2.5, 0]}
            color="#a855f7"
            intensity={2.0}
            distance={10}
          />
          {/* Floating glowing semicolon symbol in air on Day 2 & 3 */}
          <group position={[-1.2, 1.8 + Math.sin(clockRef.current * 2) * 0.15, -1]}>
            {/* Top Dot of ; */}
            <mesh position={[0, 0.14, 0]}>
              <sphereGeometry args={[0.06, 12, 12]} />
              <meshStandardMaterial
                color="#e09f58"
                emissive="#f59e0b"
                emissiveIntensity={3}
              />
            </mesh>
            {/* Bottom Tail of ; */}
            <mesh position={[0, -0.06, 0]} rotation={[0, 0, 0.3]}>
              <cylinderGeometry args={[0.04, 0.01, 0.18]} />
              <meshStandardMaterial
                color="#e09f58"
                emissive="#f59e0b"
                emissiveIntensity={3}
              />
            </mesh>
          </group>
        </group>
      )}

      {/* ========================================================
          6. DAY 3 PORTAL TO DIMENSI LAIN AT OFFICE EXIT DOOR!
          ======================================================== */}
      {dayNumber === 3 && workplaceState.allTasksDone && (
        <group position={[0, 1.4, 5.8]}>
          {/* Pulsating Semicolon Aura Portal Gate */}
          <pointLight
            ref={portalGlowRef}
            position={[0, 0, 0]}
            color="#c084fc"
            intensity={4.5}
            distance={10}
            decay={2}
          />
          <pointLight position={[0, 0, 0]} color="#38bdf8" intensity={3.5} distance={8} />

          {/* Swirling Voxel Outer Ring */}
          <mesh rotation={[0, 0, clockRef.current * 1.5]}>
            <torusGeometry args={[1.1, 0.12, 8, 24]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#c084fc"
              emissiveIntensity={3.5}
            />
          </mesh>
          {/* Counter Swirling Inner Ring */}
          <mesh rotation={[0, 0, -clockRef.current * 2.2]}>
            <torusGeometry args={[0.8, 0.08, 8, 20]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={3}
            />
          </mesh>
          {/* Portal Center Semicolon Core */}
          <mesh>
            <planeGeometry args={[1.4, 2.0]} />
            <meshBasicMaterial
              color="#3b0764"
              transparent
              opacity={0.88}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Central Giant Pulsing Semicolon Glyph */}
          <group position={[0, 0, 0.05]} scale={1 + Math.sin(clockRef.current * 4) * 0.1}>
            <mesh position={[0, 0.28, 0]}>
              <sphereGeometry args={[0.14, 12, 12]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#f59e0b"
                emissiveIntensity={4}
              />
            </mesh>
            <mesh position={[0, -0.15, 0]} rotation={[0, 0, 0.35]}>
              <cylinderGeometry args={[0.08, 0.02, 0.45]} />
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#f59e0b"
                emissiveIntensity={4}
              />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}
