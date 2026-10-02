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
  // Peaceful wandering astral entities along outskirts, cyber alley, and fields
  const [monsters, setMonsters] = useState<AstralMonsterData[]>([
    {
      id: "astral-0",
      name: "Torii Gatekeeper Spirit",
      basePosition: [12, 1.4, 125],
      wanderRadius: 4.0,
      color: "#6366f1",
      accentColor: "#a5b4fc",
      maxHp: 70,
      hp: 70,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-1",
      name: "Astral Scribe",
      basePosition: [-9, 1.3, 138],
      wanderRadius: 5.0,
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
      basePosition: [11, 1.6, 158],
      wanderRadius: 5.5,
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
      basePosition: [-13, 1.7, 182],
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
      basePosition: [9, 1.5, 200],
      wanderRadius: 4.5,
      color: "#fbbf24",
      accentColor: "#fde047",
      maxHp: 85,
      hp: 85,
      isDefeated: false,
      respawnTime: 0,
    },
  ]);

  const lastHitTimeRef = useRef(0);

  // Check player proximity attack (melee or ranged impact)
  const handleMeleeHitCheck = (monsterId: string, monsterPos: THREE.Vector3) => {
    const now = performance.now();
    if (now - lastHitTimeRef.current < 240) return; // Debounce hit

    const playerVec = new THREE.Vector3(playerPos[0], playerPos[1] + 1.0, playerPos[2]);
    const dist = monsterPos.distanceTo(playerVec);

    // Melee range or broad shockwave
    if (dist < 3.2) {
      lastHitTimeRef.current = now;
      soundManager.playHarmonicChime();

      setMonsters((prev) =>
        prev.map((m) => {
          if (m.id !== monsterId || m.isDefeated) return m;
          const damage = weaponType === "RPG" ? 70 : weaponType === "SCYTHE" ? 45 : 35;
          const nextHp = Math.max(0, m.hp - damage);
          const defeated = nextHp <= 0;
          if (defeated) {
            soundManager.playCrystalShatter();
            onMonsterDefeated?.(m);
          }
          return {
            ...m,
            hp: nextHp,
            isDefeated: defeated,
            respawnTime: defeated ? 20.0 : 0,
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
  const defeatBloomRef = useRef<THREE.Group>(null);

  const [defeatTimer, setDefeatTimer] = useState(0);
  const currentPos = useRef(new THREE.Vector3(...data.basePosition));

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();

    if (data.isDefeated) {
      if (defeatBloomRef.current) {
        defeatBloomRef.current.visible = true;
        defeatBloomRef.current.scale.addScalar(dt * 1.5);
        defeatBloomRef.current.position.y += dt * 0.8;
      }
      if (coreRef.current) coreRef.current.visible = false;
      if (ringRef.current) ringRef.current.visible = false;
      return;
    }

    if (coreRef.current) coreRef.current.visible = true;
    if (ringRef.current) ringRef.current.visible = true;
    if (defeatBloomRef.current) defeatBloomRef.current.visible = false;

    // Gentle wandering sinusoidal path around base position
    const wanderX = data.basePosition[0] + Math.sin(t * 0.35 + Number(data.id.slice(-1))) * data.wanderRadius;
    const wanderZ = data.basePosition[2] + Math.cos(t * 0.28 + Number(data.id.slice(-1))) * (data.wanderRadius * 0.75);
    const hoverY = data.basePosition[1] + Math.sin(t * 1.6) * 0.24;

    currentPos.current.set(wanderX, hoverY, wanderZ);

    if (rootRef.current) {
      // Soft orientation towards player if nearby
      const dx = playerPos[0] - wanderX;
      const dz = playerPos[2] - wanderZ;
      const distToPlayer = Math.hypot(dx, dz);

      if (distToPlayer < 12) {
        const lookAngle = Math.atan2(dx, dz);
        rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, lookAngle, 3.5, dt);
      } else {
        rootRef.current.rotation.y = t * 0.4;
      }

      rootRef.current.position.copy(currentPos.current);
    }

    // Spin celestial rings smoothly
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.7;
      ringRef.current.rotation.y = t * 1.1;
    }

    // Pulsing core breathing
    if (coreRef.current) {
      const breathe = 1.0 + Math.sin(t * 3.0) * 0.08;
      coreRef.current.scale.setScalar(breathe);
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
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>

      {/* Glowing Inner Core (Soul of the Spirit) */}
      <mesh ref={coreRef} castShadow>
        <octahedronGeometry args={[0.38, 2]} />
        <meshStandardMaterial
          color={data.color}
          emissive={data.accentColor}
          emissiveIntensity={2.8}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Orbiting Sacred Geometry Rings */}
      <group ref={ringRef}>
        <mesh>
          <torusGeometry args={[0.65, 0.022, 6, 24]} />
          <meshBasicMaterial color={data.accentColor} transparent opacity={0.65} />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.78, 0.016, 6, 24]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>
        {/* Floating crystal shards around body */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i * Math.PI * 2) / 4) * 0.75,
              Math.sin((i * Math.PI * 2) / 4) * 0.35,
              0,
            ]}
          >
            <tetrahedronGeometry args={[0.08]} />
            <meshStandardMaterial color={data.accentColor} emissive={data.color} emissiveIntensity={3} />
          </mesh>
        ))}
      </group>

      {/* Defeat Harmonic Crystallization Bloom (Reward Effect) */}
      <group ref={defeatBloomRef} visible={false}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={`crystal-bloom-${i}`}
            position={[
              Math.cos((i * Math.PI * 2) / 6) * 0.6,
              Math.sin((i * Math.PI * 2) / 6) * 0.6,
              0,
            ]}
          >
            <tetrahedronGeometry args={[0.12]} />
            <meshBasicMaterial color={data.accentColor} transparent opacity={0.7} />
          </mesh>
        ))}
        <pointLight color={data.accentColor} intensity={3.5} distance={8} decay={2} />
      </group>

      {/* Atmospheric Point Light cast on surroundings */}
      <pointLight color={data.accentColor} intensity={2.4} distance={7} decay={2} />

      {/* Soothing Harmonic Health Ring above head */}
      {data.hp < data.maxHp && (
        <group position={[0, 0.95, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.24, 0.3, 24, 1, 0, (data.hp / data.maxHp) * Math.PI * 2]} />
            <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}
