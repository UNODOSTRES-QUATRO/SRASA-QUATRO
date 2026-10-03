"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RumahState } from "../core/gameStore";

interface HouseInteriorProps {
  rumahState: RumahState;
  dayNumber: number;
  playerPos?: [number, number, number];
  isEvening: boolean;
}

export const HouseInterior = React.memo(function HouseInterior({
  rumahState,
  dayNumber,
  isEvening,
}: HouseInteriorProps) {
  const clockRef = useRef(0);
  const lampLightRef = useRef<THREE.PointLight>(null);
  const stoveFlameRef = useRef<THREE.PointLight>(null);
  const frontDoorRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    clockRef.current += delta;
    if (lampLightRef.current) {
      const targetIntensity = isEvening ? 2.4 : 0.18;
      lampLightRef.current.intensity = THREE.MathUtils.damp(
        lampLightRef.current.intensity,
        targetIntensity + Math.sin(clockRef.current * 3) * (isEvening ? 0.1 : 0.015),
        2,
        delta
      );
    }
    if (stoveFlameRef.current && rumahState.hasCooked) {
      stoveFlameRef.current.intensity = 1.5 + Math.sin(clockRef.current * 10) * 0.3;
    }
    if (frontDoorRef.current) {
      const targetRotation = !isEvening && rumahState.canExitHouse ? -Math.PI * 0.42 : 0;
      frontDoorRef.current.rotation.y = THREE.MathUtils.damp(
        frontDoorRef.current.rotation.y,
        targetRotation,
        2.4,
        delta
      );
    }
  });

  const woodFloorColor = "#c29b68";
  const tileFloorColor = "#cbd5e1";
  const wallColor = "#f1ede6";
  const wallTrimColor = "#5c4033";

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. FLOORS
          ======================================================== */}
      {/* Living Room & Kitchen Wood Floor (X: -4 to 4, Z: -4 to 4) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[8.8, 8.8]} />
        <meshStandardMaterial color={woodFloorColor} roughness={0.7} />
      </mesh>

      {/* Bathroom Tile Floor (X: 1.8 to 4.2, Z: -4.2 to -1.2) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.0, 0.02, -2.7]} receiveShadow>
        <planeGeometry args={[2.5, 3.0]} />
        <meshStandardMaterial color={tileFloorColor} roughness={0.3} />
      </mesh>

      {/* ========================================================
          2. OUTER WALLS & PARTITIONS
          ======================================================== */}
      {/* Back Wall (Z = -4.4) */}
      <mesh position={[0, 1.8, -4.4]} receiveShadow>
        <boxGeometry args={[8.8, 3.6, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Left Wall (X = -4.4) */}
      <mesh position={[-4.4, 1.8, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3.6, 8.8]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Right Wall (X = 4.4) */}
      <mesh position={[4.4, 1.8, 0]} receiveShadow>
        <boxGeometry args={[0.2, 3.6, 8.8]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Front Wall (Z = 4.4) with Doorway at X = 0 */}
      <mesh position={[-2.4, 1.8, 4.4]} receiveShadow>
        <boxGeometry args={[3.8, 3.6, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[2.4, 1.8, 4.4]} receiveShadow>
        <boxGeometry args={[3.8, 3.6, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.1, 4.4]} receiveShadow>
        <boxGeometry args={[1.2, 1.0, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Bedroom Divider Wall (Z = -1.2, X: -4.4 to -0.5) */}
      <mesh position={[-2.45, 1.8, -1.2]} receiveShadow>
        <boxGeometry args={[3.9, 3.6, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Bathroom divider with a walk-through opening */}
      <mesh position={[1.75, 1.8, -3.78]} receiveShadow>
        <boxGeometry args={[0.2, 3.6, 1.04]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[1.75, 1.8, -1.57]} receiveShadow>
        <boxGeometry args={[0.2, 3.6, 0.54]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[1.75, 3.0, -2.6]} receiveShadow>
        <boxGeometry args={[0.2, 1.2, 1.38]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      {/* Bathroom Front Divider Wall (Z = -1.2, X: 1.75 to 4.4) with Door gap */}
      <mesh position={[3.6, 1.8, -1.2]} receiveShadow>
        <boxGeometry args={[1.4, 3.6, 0.2]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>

      {/* Baseboards / Trims */}
      <mesh position={[0, 0.1, -4.28]}>
        <boxGeometry args={[8.8, 0.2, 0.05]} />
        <meshStandardMaterial color={wallTrimColor} />
      </mesh>

      {/* ========================================================
          3. KAMAR TIDUR (BEDROOM: X: -4.2 to -0.6, Z: -4.2 to -1.4)
          ======================================================== */}
      {/* Bed Base */}
      <mesh position={[-2.4, 0.25, -3.2]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.5, 2.1]} />
        <meshStandardMaterial color="#4a3728" roughness={0.8} />
      </mesh>
      {/* Mattress & Sheet */}
      <mesh position={[-2.4, 0.55, -3.2]} castShadow>
        <boxGeometry args={[1.75, 0.2, 1.95]} />
        <meshStandardMaterial color="#f7fafc" roughness={0.9} />
      </mesh>
      {/* Warm Blanket / Quilt */}
      <mesh position={[-2.4, 0.58, -2.8]} castShadow>
        <boxGeometry args={[1.76, 0.22, 1.2]} />
        <meshStandardMaterial color="#319795" roughness={0.8} />
      </mesh>
      {/* Pillows */}
      <mesh position={[-2.85, 0.68, -3.8]} castShadow>
        <boxGeometry args={[0.65, 0.15, 0.45]} />
        <meshStandardMaterial color="#edf2f7" roughness={0.9} />
      </mesh>
      <mesh position={[-1.95, 0.68, -3.8]} castShadow>
        <boxGeometry args={[0.65, 0.15, 0.45]} />
        <meshStandardMaterial color="#edf2f7" roughness={0.9} />
      </mesh>

      {/* Nightstand & Lamp */}
      <mesh position={[-3.8, 0.35, -3.8]} castShadow>
        <boxGeometry args={[0.6, 0.7, 0.6]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      {/* Bedroom Lamp Base & Shade */}
      <mesh position={[-3.8, 0.75, -3.8]}>
        <cylinderGeometry args={[0.04, 0.08, 0.18]} />
        <meshStandardMaterial color="#d69e2e" metalness={0.7} />
      </mesh>
      <mesh position={[-3.8, 0.95, -3.8]}>
        <coneGeometry args={[0.2, 0.25, 12]} />
        <meshStandardMaterial
          color="#ffeedb"
          emissive="#f6ad55"
          emissiveIntensity={isEvening ? 1.2 : 0.12}
        />
      </mesh>
      <pointLight
        ref={lampLightRef}
        position={[-3.8, 1.1, -3.8]}
        color={isEvening ? "#f6ad55" : "#ffe6b7"}
        intensity={isEvening ? 2.2 : 0.18}
        distance={7}
      />

      <group position={[-2.1, 2.0, -4.27]}>
        <mesh>
          <planeGeometry args={[1.4, 1.05]} />
          <meshBasicMaterial
            color={isEvening ? "#27324a" : "#b9d6df"}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[1.55, 1.18, 0.06]} />
          <meshStandardMaterial color="#5c4033" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.07, 1.05, 0.04]} />
          <meshStandardMaterial color="#5c4033" />
        </mesh>
        <pointLight
          position={[0, 0, 0.5]}
          color={isEvening ? "#22314a" : "#c8e5ee"}
          intensity={isEvening ? 0.25 : 1.1}
          distance={5}
        />
      </group>

      {/* ========================================================
          4. DAPUR KECIL (KITCHEN: X: -4.2 to -1.5, Z: 0.5 to 3.5)
          ======================================================== */}
      {/* Counter L-Shape Unit */}
      <mesh position={[-3.8, 0.45, 1.8]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.9, 3.4]} />
        <meshStandardMaterial color="#2d3748" roughness={0.7} />
      </mesh>
      {/* Counter Top Marble */}
      <mesh position={[-3.8, 0.92, 1.8]} receiveShadow>
        <boxGeometry args={[0.95, 0.06, 3.45]} />
        <meshStandardMaterial color="#f7fafc" roughness={0.3} />
      </mesh>

      {/* Stove Cooktop (Kompor) at X=-3.8, Z=1.0 */}
      <mesh position={[-3.8, 0.96, 1.0]}>
        <boxGeometry args={[0.65, 0.02, 0.8]} />
        <meshStandardMaterial color="#1a202c" metalness={0.8} />
      </mesh>
      {/* Stove Burners */}
      {[-0.18, 0.18].map((dz, idx) => (
        <mesh key={`burner-${idx}`} position={[-3.8, 0.98, 1.0 + dz]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
          <meshStandardMaterial
            color={rumahState.hasCooked ? "#e53e3e" : "#4a5568"}
            emissive={rumahState.hasCooked ? "#dd6b20" : "#000000"}
            emissiveIntensity={rumahState.hasCooked ? 1.5 : 0}
          />
        </mesh>
      ))}
      {/* Frying Pan on stove */}
      <group position={[-3.8, 1.02, 1.0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.16, 0.14, 0.05, 16]} />
          <meshStandardMaterial color="#171923" metalness={0.7} />
        </mesh>
        <mesh position={[0.22, 0.02, 0]}>
          <boxGeometry args={[0.18, 0.03, 0.04]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>
      </group>
      {/* Stove Flame Glow Light */}
      <pointLight
        ref={stoveFlameRef}
        position={[-3.8, 1.15, 1.0]}
        color="#ed8936"
        intensity={rumahState.hasCooked ? 1.5 : 0.2}
        distance={4}
      />

      {/* Kitchen Sink at X=-3.8, Z=2.2 */}
      <mesh position={[-3.8, 0.94, 2.2]}>
        <boxGeometry args={[0.45, 0.03, 0.55]} />
        <meshStandardMaterial color="#a0aec0" metalness={0.8} />
      </mesh>
      {/* Faucet */}
      <mesh position={[-4.1, 1.08, 2.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.24]} />
        <meshStandardMaterial color="#cbd5e0" metalness={0.9} />
      </mesh>

      {/* Fridge at X=-3.8, Z=3.2 */}
      <mesh position={[-3.8, 0.95, 3.2]} castShadow>
        <boxGeometry args={[0.85, 1.9, 0.85]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* ========================================================
          5. RUANG TAMU & MEJA MAKAN (LIVING/DINING: X: 0 to 3.8, Z: 0.5 to 3.8)
          ======================================================== */}
      {/* Dining Table at X=0.8, Z=1.6 */}
      <group position={[0.8, 0, 1.6]}>
        {/* Table Top */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.08, 1.0]} />
          <meshStandardMaterial color="#5c4033" roughness={0.7} />
        </mesh>
        {/* Table Legs */}
        {[
          [-0.65, -0.4],
          [0.65, -0.4],
          [-0.65, 0.4],
          [0.65, 0.4],
        ].map(([lx, lz], i) => (
          <mesh key={`t-leg-${i}`} position={[lx, 0.35, lz]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.7]} />
            <meshStandardMaterial color="#3d2817" />
          </mesh>
        ))}
        {/* Plate / Food on Table */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.18, 0.16, 0.02, 16]} />
          <meshStandardMaterial color="#edf2f7" />
        </mesh>
        {rumahState.hasCooked && !(isEvening ? rumahState.hasEatenEvening : rumahState.hasEaten) && (
          <mesh position={[0, 0.83, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 12]} />
            <meshStandardMaterial color="#d69e2e" roughness={0.6} />
          </mesh>
        )}
      </group>

      {/* Living Room Cozy Sofa at X=2.8, Z=1.6 */}
      <group position={[2.8, 0, 1.6]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Sofa Base */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[1.8, 0.4, 0.85]} />
          <meshStandardMaterial color="#2c5282" roughness={0.8} />
        </mesh>
        {/* Sofa Backrest */}
        <mesh position={[0, 0.65, -0.32]} castShadow>
          <boxGeometry args={[1.8, 0.5, 0.22]} />
          <meshStandardMaterial color="#2c5282" roughness={0.8} />
        </mesh>
        {/* Sofa Cushions */}
        <mesh position={[-0.45, 0.35, 0.05]} castShadow>
          <boxGeometry args={[0.8, 0.16, 0.6]} />
          <meshStandardMaterial color="#2b6cb0" roughness={0.7} />
        </mesh>
        <mesh position={[0.45, 0.35, 0.05]} castShadow>
          <boxGeometry args={[0.8, 0.16, 0.6]} />
          <meshStandardMaterial color="#2b6cb0" roughness={0.7} />
        </mesh>
      </group>

      {/* TV Stand & 2000s CRT/Flat TV at X=2.8, Z=3.6 */}
      <mesh position={[2.8, 0.3, 3.6]} castShadow>
        <boxGeometry args={[1.6, 0.5, 0.5]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      <mesh position={[2.8, 0.8, 3.6]} castShadow>
        <boxGeometry args={[1.2, 0.65, 0.15]} />
        <meshStandardMaterial color="#1a202c" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* TV Screen Glow */}
      <mesh position={[2.8, 0.8, 3.52]}>
        <planeGeometry args={[1.1, 0.55]} />
        <meshBasicMaterial color="#2b6cb0" opacity={0.6} transparent />
      </mesh>

      {/* Living Room Area Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.4, 0.015, 2.4]}>
        <planeGeometry args={[2.4, 2.0]} />
        <meshStandardMaterial color="#b7791f" roughness={0.9} />
      </mesh>

      {/* ========================================================
          6. KAMAR MANDI (BATHROOM: X: 1.8 to 4.2, Z: -4.2 to -1.4)
          ======================================================== */}
      {/* Glass Shower Stall at X=3.4, Z=-3.4 */}
      <group position={[3.4, 0, -3.4]}>
        {/* Shower Base / Tray */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.15, 1.2]} />
          <meshStandardMaterial color="#f7fafc" />
        </mesh>
        {/* Glass Screen */}
        <mesh position={[-0.6, 1.0, 0]}>
          <boxGeometry args={[0.04, 1.9, 1.2]} />
          <meshStandardMaterial
            color="#bee3f8"
            transparent
            opacity={0.35}
            roughness={0.1}
          />
        </mesh>
        {/* Shower Column & Head */}
        <mesh position={[0.45, 1.1, 0.45]}>
          <cylinderGeometry args={[0.02, 0.02, 1.8]} />
          <meshStandardMaterial color="#cbd5e0" metalness={0.9} />
        </mesh>
        <mesh position={[0.3, 1.9, 0.3]}>
          <cylinderGeometry args={[0.1, 0.1, 0.04]} />
          <meshStandardMaterial color="#cbd5e0" metalness={0.9} />
        </mesh>
        {/* Water Stream when showered */}
        {(isEvening ? rumahState.hasShoweredEvening : rumahState.hasShowered) && (
          <mesh position={[0.3, 1.0, 0.3]}>
            <cylinderGeometry args={[0.14, 0.18, 1.7, 8]} />
            <meshBasicMaterial color="#63b3ed" transparent opacity={0.35} />
          </mesh>
        )}
      </group>

      {/* Toilet facing the back wall, tucked beside the shower */}
      <group position={[2.35, 0, -3.68]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.22, 0.08]} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.34, 0.78]} />
          <meshStandardMaterial color="#e8e4dc" roughness={0.32} />
        </mesh>
        <mesh position={[0, 0.42, 0.26]} castShadow>
          <cylinderGeometry args={[0.27, 0.3, 0.4, 12]} />
          <meshStandardMaterial color="#f5f2eb" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.68, -0.24]} castShadow>
          <boxGeometry args={[0.52, 0.55, 0.18]} />
          <meshStandardMaterial color="#f5f2eb" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.72, -0.14]}>
          <boxGeometry args={[0.35, 0.08, 0.025]} />
          <meshStandardMaterial color="#c8c2b7" metalness={0.35} roughness={0.4} />
        </mesh>
      </group>

      {/* Bathroom Vanity Sink at X=2.2, Z=-1.8 */}
      <mesh position={[2.2, 0.45, -1.8]} castShadow>
        <boxGeometry args={[0.7, 0.85, 0.55]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {/* Bathroom Mirror */}
      <mesh position={[2.2, 1.3, -1.45]}>
        <boxGeometry args={[0.55, 0.65, 0.02]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* ========================================================
          7. PINTU DEPAN (FRONT DOOR: X=0, Z=4.3)
          ======================================================== */}
      <group ref={frontDoorRef} position={[0, 1.3, 4.3]}>
        {/* Door Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 2.5, 0.1]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
        {/* Door Leaf (Wood) */}
        <mesh position={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[1.05, 2.35, 0.08]} />
          <meshStandardMaterial color="#4a2c11" roughness={0.7} />
        </mesh>
        {/* Brass Doorknob */}
        <mesh position={[0.42, -0.1, 0.08]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshStandardMaterial color="#d69e2e" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {/* Front Doormat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 3.7]}>
        <planeGeometry args={[1.2, 0.7]} />
        <meshStandardMaterial color="#744210" roughness={0.9} />
      </mesh>

      {/* ========================================================
          8. CEILING CHANDELIER & AMBIENT WARM LIGHT
          ======================================================== */}
      <pointLight
        position={[0, 2.8, 0]}
        color={isEvening ? "#f4bd79" : "#fffaf0"}
        intensity={isEvening ? 1.8 : 2.8}
        distance={14}
      />
      <pointLight
        position={[2.4, 2.5, 2.0]}
        color={isEvening ? "#f6c07a" : "#feebc8"}
        intensity={isEvening ? 2.2 : 1.1}
        distance={8}
      />

      {/* ========================================================
          9. 3D INTERACTIVE HIGHLIGHT BEACONS ABOVE OBJECTS
          ======================================================== */}
      {/* Bed Beacon (if waking up or evening sleep) */}
      {((!isEvening && !rumahState.wokenUp) || (isEvening && rumahState.canSleepEvening)) && (
        <group position={[-2.4, 1.3, -3.2]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      )}

      {/* Stove Beacon (if needs to cook) */}
      {!isEvening && rumahState.wokenUp && !rumahState.hasCooked && (
        <group position={[-3.8, 1.4, 1.0]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#d97706"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      )}

      {/* Dining Table Beacon (if cooked and needs to eat) */}
      {!isEvening && rumahState.hasCooked && !rumahState.hasEaten && (
        <group position={[0.8, 1.3, 1.6]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#16a34a"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      )}

      {/* Shower Beacon (if eaten and needs to shower) */}
      {!isEvening && rumahState.hasEaten && !rumahState.hasShowered && (
        <group position={[3.4, 1.6, -3.4]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#0891b2"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      )}

      {isEvening && rumahState.hasShoweredEvening && !rumahState.hasEatenEvening && (
        <group position={[0.8, 1.3, 1.6]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial color="#d8a45c" emissive="#a36c2d" emissiveIntensity={1.4} />
          </mesh>
        </group>
      )}

      {isEvening && !rumahState.hasShoweredEvening && (
        <group position={[3.4, 1.6, -3.4]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
            <octahedronGeometry args={[0.15]} />
            <meshStandardMaterial color="#9bc8d3" emissive="#4b8d9a" emissiveIntensity={1.2} />
          </mesh>
        </group>
      )}

      {/* Front Door Beacon (if ready to exit) */}
      {!isEvening && rumahState.canExitHouse && (
        <group position={[0, 2.0, 4.0]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
            <octahedronGeometry args={[0.18]} />
            <meshStandardMaterial
              color="#a855f7"
              emissive="#7e22ce"
              emissiveIntensity={2.5}
            />
          </mesh>
        </group>
      )}
    </group>
  );
});
