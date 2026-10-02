"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { soundManager } from "../audio/SoundManager";

export interface AstralMonsterData {
  id: string;
  name: string;
  basePosition: [number, number, number];
  wanderRadius: number;
  color: string;
  accentColor: string;
  maxHp: number;
  hp: number;
  isDefeated: boolean;
  respawnTime: number;
}

interface AstralMonsterSystemProps {
  playerPos: [number, number, number];
  isAttacking: boolean;
  weaponType?: string;
  onMonsterDefeated?: (monster: AstralMonsterData) => void;
}

export function AstralMonsterSystem({
  playerPos,
  isAttacking,
  weaponType = "BLUE_SHARD_SWORD",
  onMonsterDefeated,
}: AstralMonsterSystemProps) {
  // Pre-configured peaceful wandering astral entities in the outskirts / cyber alley
  const [monsters, setMonsters] = useState<AstralMonsterData[]>([
    {
      id: "astral-1",
      name: "Astral Scribe",
      basePosition: [-8, 1.2, 135],
      wanderRadius: 4.5,
      color: "#818cf8",
      accentColor: "#c084fc",
      maxHp: 80,
      hp: 80,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-2",
      name: "Ethereal Wisp",
      basePosition: [10, 1.5, 155],
      wanderRadius: 5.0,
      color: "#38bdf8",
      accentColor: "#67e8f9",
      maxHp: 60,
      hp: 60,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-3",
      name: "Void Guardian Wisp",
      basePosition: [-12, 1.6, 180],
      wanderRadius: 6.0,
      color: "#c084fc",
      accentColor: "#f472b6",
      maxHp: 100,
      hp: 100,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-4",
      name: "Celestial Sentinel",
      basePosition: [8, 1.4, 195],
      wanderRadius: 4.0,
      color: "#fbbf24",
      accentColor: "#fde047",
      maxHp: 75,
      hp: 75,
      isDefeated: false,
      respawnTime: 0,
    },
  ]);

  const lastHitTimeRef = useRef(0);

  // Check player melee proximity attack
  const handleMeleeHitCheck = (monsterId: string, monsterPos: THREE.Vector3) => {
    const now = performance.now();
    if (now - lastHitTimeRef.current < 260) return; // Debounce hit

    const dist = monsterPos.distanceTo(new THREE.Vector3(playerPos[0], playerPos[1] + 1.0, playerPos[2]));
    if (dist < 2.8) {
      lastHitTimeRef.current = now;
      soundManager.playHarmonicChime();

      setMonsters((prev) =>
        prev.map((m) => {
          if (m.id !== monsterId || m.isDefeated) return m;
          const nextHp = Math.max(0, m.hp - 35);
          const defeated = nextHp <= 0;
          if (defeated) {
            soundManager.playCrystalShatter();
            onMonsterDefeated?.(m);
          }
          return {
            ...m,
            hp: nextHp,
            isDefeated: defeated,
            respawnTime: defeated ? 18.0 : 0,
          };
        })
      );
    }
  };

  return (
    <group>
      {monsters.map((m) => (
        <SingleAstralEntity
          key={m.id}
          data={m}
          playerPos={playerPos}
          isPlayerAttacking={isAttacking}
          onHitCheck={handleMeleeHitCheck}
        />
      ))}
    </group>
  );
}

function SingleAstralEntity({
  data,
  playerPos,
  isPlayerAttacking,
  onHitCheck,
}: {
  data: AstralMonsterData;
  playerPos: [number, number, number];
  isPlayerAttacking: boolean;
  onHitCheck: (id: string, pos: THREE.Vector3) => void;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const rippleRef = useRef<THREE.Mesh>(null);

  const [hitShudder, setHitShudder] = useState(0);
  const currentPos = useRef(new THREE.Vector3(...data.basePosition));

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();

    if (data.isDefeated) {
      if (rootRef.current) rootRef.current.visible = false;
      return;
    }
    if (rootRef.current) rootRef.current.visible = true;

    // Gentle wandering path around base position
    const wanderX = data.basePosition[0] + Math.sin(t * 0.4 + Number(data.id.slice(-1))) * data.wanderRadius;
    const wanderZ = data.basePosition[2] + Math.cos(t * 0.3 + Number(data.id.slice(-1))) * (data.wanderRadius * 0.7);
    const hoverY = data.basePosition[1] + Math.sin(t * 1.8) * 0.22;

    currentPos.current.set(wanderX, hoverY, wanderZ);

    if (rootRef.current) {
      // Soft orientation towards player if nearby
      const dx = playerPos[0] - wanderX;
      const dz = playerPos[2] - wanderZ;
      const distToPlayer = Math.hypot(dx, dz);

      if (distToPlayer < 10) {
        const lookAngle = Math.atan2(dx, dz);
        rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, lookAngle, 4, dt);
      } else {
        rootRef.current.rotation.y = t * 0.5;
      }

      rootRef.current.position.copy(currentPos.current);
    }

    // Spin celestial rings
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.8;
      ringRef.current.rotation.y = t * 1.2;
    }

    // Check hit if player is actively attacking
    if (isPlayerAttacking) {
      onHitCheck(data.id, currentPos.current);
    }
  });

  return (
    <group ref={rootRef} position={data.basePosition}>
      {/* Bioluminescent Outer Halo */}
      <mesh scale={[1.4, 1.8, 1.4]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial
          color={data.accentColor}
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>

      {/* Glowing Inner Core (Soul of the Spirit) */}
      <mesh ref={coreRef} castShadow>
        <octahedronGeometry args={[0.38, 2]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.accentColor}
          emissiveIntensity={2.5}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Orbiting Sacred Geometry Rings */}
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[0.65, 0.02, 6, 24]} />
          <meshBasicMaterial color={data.accentColor} transparent opacity={0.6} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.78, 0.015, 6, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
        </mesh>
        {/* Floating crystal shards around body */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI * 2) / 3) * 0.72,
              Math.sin((i * Math.PI * 2) / 3) * 0.35,
              0,
            ]}
          >
            <tetrahedronGeometry args={[0.08]} />
            <meshStandardMaterial color={data.accentColor} emissive={data.color} emissiveIntensity={3} />
          </mesh>
        ))}
      </group>

      {/* Atmospheric Point Light cast on surroundings */}
      <pointLight color={data.accentColor} intensity={2.2} distance={6} decay={2} />

      {/* Soothing Harmonic Health Ring above head */}
      {data.hp < data.maxHp && (
        <group position={[0, 0.9, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.22, 0.28, 24, 1, 0, (data.hp / data.maxHp) * Math.PI * 2]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}
