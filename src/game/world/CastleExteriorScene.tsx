"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { KastilState } from "../core/gameStore";

interface CastleExteriorSceneProps {
  kastilState: KastilState;
  playerPos?: [number, number, number];
}

function CastleBanner({ position, color }: { position: [number, number, number]; color: string }) {
  const clothRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (clothRef.current) {
      clothRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.8 + position[0]) * 0.045;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 1.7, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 3.4, 8]} />
        <meshStandardMaterial color="#453a31" roughness={0.8} />
      </mesh>
      <group ref={clothRef} position={[0.04, 2.8, 0]}>
        <mesh position={[0.5, -0.45, 0]} castShadow>
          <boxGeometry args={[0.95, 1.25, 0.07]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh position={[0.5, -0.45, 0.05]}>
          <boxGeometry args={[0.16, 0.52, 0.015]} />
          <meshStandardMaterial color="#d3ac65" metalness={0.25} roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

export const CastleExteriorScene = React.memo(function CastleExteriorScene({ kastilState }: CastleExteriorSceneProps) {
  const clockRef = useRef(0);
  const waterRef = useRef<THREE.Mesh>(null);
  const torchLight1Ref = useRef<THREE.PointLight>(null);
  const torchLight2Ref = useRef<THREE.PointLight>(null);
  const jeffreyRef = useRef<THREE.Group>(null);
  const vesperaRef = useRef<THREE.Group>(null);
  const barnabyRef = useRef<THREE.Group>(null);
  const jeffreyHeadRef = useRef<THREE.Mesh>(null);
  const vesperaHeadRef = useRef<THREE.Mesh>(null);
  const barnabyHeadRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    clockRef.current += delta;
    if (waterRef.current) {
      waterRef.current.position.y = 0.45 + Math.sin(clockRef.current * 3) * 0.02;
    }
    if (torchLight1Ref.current) {
      torchLight1Ref.current.intensity = 2.5 + Math.sin(clockRef.current * 10) * 0.3;
    }
    if (torchLight2Ref.current) {
      torchLight2Ref.current.intensity = 2.5 + Math.cos(clockRef.current * 12) * 0.3;
    }
    if (jeffreyRef.current) {
      jeffreyRef.current.position.y = Math.sin(clockRef.current * 1.8) * 0.025;
      jeffreyRef.current.rotation.y = Math.sin(clockRef.current * 0.35) * 0.045;
    }
    if (vesperaRef.current) {
      vesperaRef.current.position.y = Math.sin(clockRef.current * 1.4 + 1) * 0.035;
      vesperaRef.current.rotation.y = Math.sin(clockRef.current * 0.5 + 1) * 0.06;
    }
    if (barnabyRef.current) {
      barnabyRef.current.position.y = Math.sin(clockRef.current * 1.6 + 2) * 0.02;
      barnabyRef.current.rotation.y = Math.sin(clockRef.current * 0.28 + 2) * 0.04;
    }
    if (jeffreyHeadRef.current) jeffreyHeadRef.current.rotation.y = Math.sin(clockRef.current * 0.8) * 0.1;
    if (vesperaHeadRef.current) vesperaHeadRef.current.rotation.y = Math.sin(clockRef.current * 0.55 + 1) * 0.08;
    if (barnabyHeadRef.current) barnabyHeadRef.current.rotation.x = Math.sin(clockRef.current * 0.65 + 2) * 0.07;
  });

  const stoneWall = "#334155";
  const stoneTrim = "#1e293b";
  const cobbleFloor = "#475569";
  const woodColor = "#78350f";

  return (
    <group position={[0, 0, 0]}>
      {/* ========================================================
          1. COBBLESTONE COURTYARD FLOOR
          ======================================================== */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 6]} receiveShadow>
        <planeGeometry args={[26, 36]} />
        <meshStandardMaterial color={cobbleFloor} roughness={0.85} />
      </mesh>

      <CastleBanner position={[-6.2, 0, 16.8]} color="#70433a" />
      <CastleBanner position={[6.2, 0, 16.8]} color="#53634f" />

      <group position={[-8.0, 0, 5.1]} rotation={[0, 0.16, 0]}>
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[1.2, 0.9, 1.0]} />
          <meshStandardMaterial color="#684a32" roughness={0.9} />
        </mesh>
        <mesh position={[1.0, 0.3, -0.15]} castShadow>
          <cylinderGeometry args={[0.28, 0.32, 0.6, 10]} />
          <meshStandardMaterial color="#563d2b" roughness={0.92} />
        </mesh>
        <mesh position={[1.0, 0.62, -0.15]}>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 10]} />
          <meshStandardMaterial color="#392b20" roughness={0.9} />
        </mesh>
      </group>

      {/* ========================================================
          2. MASSIVE MEDIEVAL CASTLE WALLS & TOWERS (HOGWARTS STYLE)
          ======================================================== */}
      {/* North Fortress Keep Wall with Grand Entrance Door (Z = 18, World Z = 198) */}
      <mesh position={[0, 5.0, 18.0]} castShadow receiveShadow>
        <boxGeometry args={[26, 10, 2.5]} />
        <meshStandardMaterial color={stoneWall} roughness={0.9} />
      </mesh>

      {/* Left Tower */}
      <group position={[-10, 0, 18.0]}>
        <mesh position={[0, 7.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.5, 15, 16]} />
          <meshStandardMaterial color={stoneTrim} roughness={0.85} />
        </mesh>
        {/* Tower Conical Roof (Hogwarts Spire) */}
        <mesh position={[0, 16.5, 0]} castShadow>
          <coneGeometry args={[2.6, 5.5, 16]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.6} />
        </mesh>
      </group>

      {/* Right Tower */}
      <group position={[10, 0, 18.0]}>
        <mesh position={[0, 7.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.2, 2.5, 15, 16]} />
          <meshStandardMaterial color={stoneTrim} roughness={0.85} />
        </mesh>
        {/* Tower Conical Roof */}
        <mesh position={[0, 16.5, 0]} castShadow>
          <coneGeometry args={[2.6, 5.5, 16]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.6} />
        </mesh>
      </group>

      {/* Grand Castle Entrance Arch & Double Doors at X=0, Z=17.5 (World Z = 197.5) */}
      <group position={[0, 3.2, 17.5]}>
        {/* Arch Frame */}
        <mesh>
          <boxGeometry args={[5.2, 6.4, 0.6]} />
          <meshStandardMaterial color={stoneTrim} />
        </mesh>
        {/* Massive Double Wood Doors */}
        <mesh position={[0, 0, -0.05]} castShadow>
          <boxGeometry args={[4.4, 5.8, 0.25]} />
          <meshStandardMaterial color="#3b1d11" roughness={0.7} />
        </mesh>
        {/* Iron Hinges & Studs */}
        {[-1.8, 1.8].map((hx, hi) => (
          <group key={`hinge-${hi}`}>
            <mesh position={[hx, 1.5, -0.2]}>
              <boxGeometry args={[0.7, 0.12, 0.08]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
            <mesh position={[hx, -1.5, -0.2]}>
              <boxGeometry args={[0.7, 0.12, 0.08]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Castle Door Semicolon Royal Crest */}
        <mesh position={[0, 3.5, -0.2]}>
          <boxGeometry args={[1.2, 1.2, 0.15]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Interactive Beacon over Castle Door */}
        <group position={[0, 3.8, -0.6]}>
          <mesh position={[0, Math.sin(clockRef.current * 4) * 0.1, 0]}>
            <octahedronGeometry args={[0.25]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#d97706"
              emissiveIntensity={3}
            />
          </mesh>
        </group>
      </group>

      {/* Flanking Torches & Braziers at Entrance */}
      <group position={[-3.2, 3.5, 17.0]}>
        <pointLight ref={torchLight1Ref} color="#ffedd5" intensity={2.8} distance={10} />
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>
      <group position={[3.2, 3.5, 17.0]}>
        <pointLight ref={torchLight2Ref} color="#ffedd5" intensity={2.8} distance={10} />
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* ========================================================
          3. COURTYARD FOUNTAIN (AIR MANCUR) at X=0, Z=-1.0 (World Z = 179)
          ======================================================== */}
      <group position={[0, 0, -1.0]}>
        {/* Stone Basin Outer Rim */}
        <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[2.5, 2.7, 0.6, 24]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        {/* Inner Water Mesh */}
        <mesh
          ref={waterRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.45, 0]}
        >
          <circleGeometry args={[2.3, 24]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.1}
            metalness={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
        {/* Fountain Central Spire Pillar */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.5, 1.4, 16]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Upper Tier Water Bowl */}
        <mesh position={[0, 1.7, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.3, 0.35, 16]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Water Spout Particle/Sphere */}
        <mesh position={[0, 2.05, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial
            color="#bae6fd"
            emissive="#38bdf8"
            emissiveIntensity={1.5}
          />
        </mesh>
        {/* Easter Egg Semicolon #1 inside Fountain */}
        {!kastilState.easterEggs.fountain && (
          <group position={[0, 2.5, 0]}>
            <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
              <octahedronGeometry args={[0.16]} />
              <meshStandardMaterial
                color="#e09f58"
                emissive="#f59e0b"
                emissiveIntensity={3}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* ========================================================
          4. WOODEN CART (GEROBAK KAYU) at X=-5.5, Z=2.0
          ======================================================== */}
      <group position={[-5.5, 0, 2.0]} rotation={[0, 0.4, 0]}>
        {/* Cart Bed */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[1.5, 0.5, 2.2]} />
          <meshStandardMaterial color={woodColor} roughness={0.8} />
        </mesh>
        {/* Wheels Left & Right */}
        <mesh position={[-0.85, 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.12, 16]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
        <mesh position={[0.85, 0.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.45, 0.45, 0.12, 16]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
        {/* Wooden Handles */}
        <mesh position={[-0.4, 0.6, 1.4]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.0]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
        <mesh position={[0.4, 0.6, 1.4]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.0]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
      </group>

      {/* ========================================================
          5. HAY BALES (TUMPUKAN JERAMI) at X=5.5, Z=3.0
          ======================================================== */}
      <group position={[5.5, 0, 3.0]}>
        {/* Bottom Bales */}
        <mesh position={[-0.5, 0.35, -0.4]} castShadow>
          <boxGeometry args={[0.9, 0.7, 1.2]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.9} />
        </mesh>
        <mesh position={[0.5, 0.35, -0.4]} castShadow>
          <boxGeometry args={[0.9, 0.7, 1.2]} />
          <meshStandardMaterial color="#d97706" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.35, 0.5]} castShadow>
          <boxGeometry args={[1.2, 0.7, 0.9]} />
          <meshStandardMaterial color="#ca8a04" roughness={0.9} />
        </mesh>
        {/* Top Bale */}
        <mesh position={[0, 0.95, -0.1]} castShadow>
          <boxGeometry args={[0.9, 0.65, 1.1]} />
          <meshStandardMaterial color="#eab308" roughness={0.9} />
        </mesh>
        {/* Easter Egg Semicolon #2 hidden behind hay bales */}
        {!kastilState.easterEggs.hayBales && (
          <group position={[0.7, 0.8, 0.8]}>
            <mesh position={[0, Math.sin(clockRef.current * 4) * 0.08, 0]}>
              <octahedronGeometry args={[0.16]} />
              <meshStandardMaterial
                color="#e09f58"
                emissive="#f59e0b"
                emissiveIntensity={3}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* ========================================================
          6. RANDOM TALKING NPCS (LORE KEEPERS)
          ======================================================== */}
      {/* NPC 1: SIR JEFFREY (Castle Sentinel Guard) at X=-3.5, Z=-4.0 */}
      <group ref={jeffreyRef} position={[-3.5, 0, -4.0]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.25]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} />
        </mesh>
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.45, 0.55, 0.3]} />
          <meshStandardMaterial color="#475569" metalness={0.8} />
        </mesh>
        {/* Iron Helmet */}
        <mesh ref={jeffreyHeadRef} position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.32, 0.35, 0.32]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} />
        </mesh>
        {/* Halberd / Spear */}
        <mesh position={[0.3, 1.2, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 2.4]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Speech Indicator */}
        <group position={[0, 1.9, 0]}>
          <mesh position={[0, Math.sin(clockRef.current * 3) * 0.05, 0]}>
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2} />
          </mesh>
        </group>
      </group>

      {/* NPC 2: LADY VESPERA (Court Mage) at X=3.5, Z=-4.0 */}
      <group ref={vesperaRef} position={[3.5, 0, -4.0]}>
        {/* Violet Robe */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <coneGeometry args={[0.42, 1.2, 8]} />
          <meshStandardMaterial color="#4c1d95" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.15, 0]} castShadow>
          <boxGeometry args={[0.35, 0.45, 0.25]} />
          <meshStandardMaterial color="#581c87" />
        </mesh>
        <mesh ref={vesperaHeadRef} position={[0, 1.45, 0]} castShadow>
          <boxGeometry args={[0.26, 0.26, 0.26]} />
          <meshStandardMaterial color="#fed7aa" />
        </mesh>
        {/* Mage Pointed Hat */}
        <mesh position={[0, 1.75, 0]} castShadow>
          <coneGeometry args={[0.32, 0.6, 8]} />
          <meshStandardMaterial color="#3b0764" />
        </mesh>
        {/* Glowing Staff */}
        <mesh position={[0.3, 1.0, 0.1]}>
          <cylinderGeometry args={[0.025, 0.025, 2.0]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0.3, 2.05, 0.1]}>
          <octahedronGeometry args={[0.1]} />
          <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={3} />
        </mesh>
        {/* Speech Indicator */}
        <group position={[0, 2.1, 0]}>
          <mesh position={[0, Math.sin(clockRef.current * 3 + 1) * 0.05, 0]}>
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={2} />
          </mesh>
        </group>
      </group>

      {/* NPC 3: BARNABY (Wandering Scholar) at X=-5.0, Z=0 */}
      <group ref={barnabyRef} position={[-5.0, 0, 0]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.3, 0.8, 0.25]} />
          <meshStandardMaterial color="#713f12" />
        </mesh>
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.42, 0.52, 0.28]} />
          <meshStandardMaterial color="#854d0e" />
        </mesh>
        <mesh ref={barnabyHeadRef} position={[0, 1.42, 0]} castShadow>
          <boxGeometry args={[0.28, 0.28, 0.28]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
        {/* Glasses & Beret */}
        <mesh position={[0, 1.58, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.22, 0.08, 12]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
        {/* Book / Tome in hand */}
        <mesh position={[0.28, 0.95, 0.15]} rotation={[0.4, 0.2, 0]}>
          <boxGeometry args={[0.25, 0.35, 0.08]} />
          <meshStandardMaterial color="#b91c1c" />
        </mesh>
        {/* Speech Indicator */}
        <group position={[0, 1.85, 0]}>
          <mesh position={[0, Math.sin(clockRef.current * 3 + 2) * 0.05, 0]}>
            <octahedronGeometry args={[0.12]} />
            <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={2} />
          </mesh>
        </group>
      </group>

      {/* ATMOSPHERIC COURTYARD LIGHTING */}
      <ambientLight intensity={0.6} color="#e0e7ff" />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#fed7aa" castShadow />
    </group>
  );
});
