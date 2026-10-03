"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { soundManager } from "../audio/SoundManager";

import type { WeaponSystemState } from "../weapons/WeaponSystem";

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
  weaponStateRef?: React.MutableRefObject<WeaponSystemState>;
  onMonsterDefeated?: (monster: AstralMonsterData) => void;
  humanPosRef?: React.MutableRefObject<{ x: number; y: number; z: number; heading: number }>;
  playerMode?: "ON_FOOT" | "DRIVING";
  vehicleStateRef?: React.MutableRefObject<any>;
}

export function AstralMonsterSystem({
  playerPos,
  isAttacking,
  weaponType = "BLUE_SHARD_SWORD",
  weaponStateRef,
  onMonsterDefeated,
  humanPosRef,
  playerMode = "ON_FOOT",
  vehicleStateRef,
}: AstralMonsterSystemProps) {
  // Peaceful wandering astral entities along outskirts, cyber alley, and fields
  const [monsters, setMonsters] = useState<AstralMonsterData[]>([
    {
      id: "astral-meadow-1",
      name: "Meadow Wisp",
      basePosition: [-14, 1.3, 28],
      wanderRadius: 3.5,
      color: "#38bdf8",
      accentColor: "#7dd3fc",
      maxHp: 50,
      hp: 50,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-office-alley",
      name: "Cyber Alley Phantom",
      basePosition: [23, 1.4, 85],
      wanderRadius: 4.0,
      color: "#a855f7",
      accentColor: "#c084fc",
      maxHp: 65,
      hp: 65,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-0",
      name: "Torii Gatekeeper Spirit",
      basePosition: [11, 1.5, 122],
      wanderRadius: 4.2,
      color: "#6366f1",
      accentColor: "#a5b4fc",
      maxHp: 75,
      hp: 75,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-1",
      name: "Astral Scribe",
      basePosition: [-11, 1.4, 142],
      wanderRadius: 4.8,
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
      basePosition: [12, 1.6, 162],
      wanderRadius: 5.0,
      color: "#06b6d4",
      accentColor: "#67e8f9",
      maxHp: 60,
      hp: 60,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-3",
      name: "Void Guardian Shade",
      basePosition: [-13, 1.7, 182],
      wanderRadius: 5.5,
      color: "#c084fc",
      accentColor: "#f472b6",
      maxHp: 95,
      hp: 95,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-4",
      name: "Celestial Sentinel",
      basePosition: [10, 1.5, 202],
      wanderRadius: 4.5,
      color: "#fbbf24",
      accentColor: "#fde047",
      maxHp: 85,
      hp: 85,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-ruins",
      name: "Starlight Drifter",
      basePosition: [-14, 1.6, 214],
      wanderRadius: 4.0,
      color: "#34d399",
      accentColor: "#6ee7b7",
      maxHp: 70,
      hp: 70,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-orchard",
      name: "Orchard Spirit",
      basePosition: [-18, 1.4, -12],
      wanderRadius: 3.8,
      color: "#34d399",
      accentColor: "#a7f3d0",
      maxHp: 60,
      hp: 60,
      isDefeated: false,
      respawnTime: 0,
    },
    {
      id: "astral-dawn",
      name: "Dawn Wisp",
      basePosition: [16, 1.3, -34],
      wanderRadius: 3.5,
      color: "#f59e0b",
      accentColor: "#fde68a",
      maxHp: 55,
      hp: 55,
      isDefeated: false,
      respawnTime: 0,
    },
  ]);

  const lastHitTimeRef = useRef(0);
  const respawnTimersRef = useRef<Record<string, number>>({});

  // Check player proximity attack (melee or ranged impact)
  const handleHit = (monsterId: string, monsterPos: THREE.Vector3, specificWeapon?: string) => {
    const now = performance.now();
    if (now - lastHitTimeRef.current < 200) return; // Debounce hit

    lastHitTimeRef.current = now;
    soundManager.playHarmonicChime();

    const usedWeapon = specificWeapon || weaponStateRef?.current?.activeWeaponId || weaponType;
    const damage =
      usedWeapon === "RPG"
        ? 75
        : usedWeapon === "SCYTHE"
        ? 55
        : usedWeapon === "BOW"
        ? 45
        : usedWeapon === "HEAVENLY_PEN"
        ? 50
        : usedWeapon === "VEHICLE"
        ? 45
        : 38;

    setMonsters((prev) =>
      prev.map((m) => {
        if (m.id !== monsterId || m.isDefeated) return m;
        const nextHp = Math.max(0, m.hp - damage);
        const defeated = nextHp <= 0;
        if (defeated) {
          soundManager.playCrystalShatter();
          respawnTimersRef.current[m.id] = 18.0; // 18 seconds respawn
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
  };

  const handleMeleeHitCheck = (monsterId: string, monsterPos: THREE.Vector3) => {
    const px = humanPosRef?.current?.x ?? playerPos[0];
    const py = humanPosRef?.current?.y ?? playerPos[1];
    const pz = humanPosRef?.current?.z ?? playerPos[2];
    const heading = humanPosRef?.current?.heading ?? 0;
    const playerVec = new THREE.Vector3(px, py + 1.0, pz);
    const dist = monsterPos.distanceTo(playerVec);

    // Melee range with directional arc
    if (dist < 3.5) {
      const toMonsterX = monsterPos.x - px;
      const toMonsterZ = monsterPos.z - pz;
      const fwdX = Math.sin(heading);
      const fwdZ = Math.cos(heading);
      const dot = (toMonsterX * fwdX + toMonsterZ * fwdZ) / Math.max(0.001, dist);

      // Scythe has wide 270-degree sweep; sword and others have generous 180-degree front arc
      const minDot = weaponType === "SCYTHE" ? -0.5 : -0.15;
      if (dot >= minDot || dist < 1.4) {
        handleHit(monsterId, monsterPos);
      }
    }
  };

  // Respawn loop & Projectile hit check in frame
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    // 1. Tick respawn timers
    let hasRespawned = false;
    Object.keys(respawnTimersRef.current).forEach((id) => {
      respawnTimersRef.current[id] -= dt;
      if (respawnTimersRef.current[id] <= 0) {
        delete respawnTimersRef.current[id];
        hasRespawned = true;
      }
    });

    if (hasRespawned) {
      setMonsters((prev) =>
        prev.map((m) => {
          if (m.isDefeated && !respawnTimersRef.current[m.id]) {
            return {
              ...m,
              hp: m.maxHp,
              isDefeated: false,
              respawnTime: 0,
            };
          }
            return m;
        })
      );
    }
  });

  return (
    <group>
      {monsters.map((m) => (
        <SingleAstralEntity
          key={m.id}
          data={m}
          playerPos={playerPos}
          humanPosRef={humanPosRef}
          isPlayerAttacking={isAttacking}
          weaponStateRef={weaponStateRef}
          playerMode={playerMode}
          vehicleStateRef={vehicleStateRef}
          onHitCheck={handleMeleeHitCheck}
          onDirectHit={handleHit}
        />
      ))}
    </group>
  );
}

function SingleAstralEntity({
  data,
  playerPos,
  humanPosRef,
  isPlayerAttacking,
  weaponStateRef,
  playerMode,
  vehicleStateRef,
  onHitCheck,
  onDirectHit,
}: {
  data: AstralMonsterData;
  playerPos: [number, number, number];
  humanPosRef?: React.MutableRefObject<{ x: number; y: number; z: number; heading: number }>;
  isPlayerAttacking: boolean;
  weaponStateRef?: React.MutableRefObject<WeaponSystemState>;
  playerMode?: "ON_FOOT" | "DRIVING";
  vehicleStateRef?: React.MutableRefObject<any>;
  onHitCheck: (id: string, pos: THREE.Vector3) => void;
  onDirectHit: (id: string, pos: THREE.Vector3, specificWeapon?: string) => void;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  const shadowTailRef = useRef<THREE.Group>(null);
  const defeatBloomRef = useRef<THREE.Group>(null);
  const rippleRingRef = useRef<THREE.Mesh>(null);

  const prevHpRef = useRef(data.hp);
  const hitShudderRef = useRef(0);
  const rippleScaleRef = useRef(0);
  const defeatProgressRef = useRef(0);

  const currentPos = useRef(new THREE.Vector3(...data.basePosition));

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();

    // Check hit trigger for harmonic shudder
    if (data.hp < prevHpRef.current && !data.isDefeated) {
      hitShudderRef.current = 0.22;
      rippleScaleRef.current = 0.1;
    }
    prevHpRef.current = data.hp;

    if (hitShudderRef.current > 0) {
      hitShudderRef.current -= dt;
    }

    if (rippleScaleRef.current > 0) {
      rippleScaleRef.current += dt * 5.0;
      if (rippleRingRef.current) {
        rippleRingRef.current.scale.set(rippleScaleRef.current, rippleScaleRef.current, rippleScaleRef.current);
        (rippleRingRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(
          0,
          0.8 - rippleScaleRef.current * 0.4
        );
      }
      if (rippleScaleRef.current > 2.0) {
        rippleScaleRef.current = 0;
      }
    }

    if (data.isDefeated) {
      defeatProgressRef.current += dt;
      if (defeatBloomRef.current) {
        if (defeatProgressRef.current < 3.2) {
          defeatBloomRef.current.visible = true;
          defeatBloomRef.current.scale.addScalar(dt * 1.2);
          defeatBloomRef.current.position.y += dt * 1.8;
          defeatBloomRef.current.rotation.y += dt * 1.6;
        } else {
          defeatBloomRef.current.visible = false;
        }
      }
      if (coreRef.current) coreRef.current.visible = false;
      if (ringRef.current) ringRef.current.visible = false;
      if (leftWingRef.current) leftWingRef.current.visible = false;
      if (rightWingRef.current) rightWingRef.current.visible = false;
      if (shadowTailRef.current) shadowTailRef.current.visible = false;
      return;
    }

    defeatProgressRef.current = 0;
    if (coreRef.current) coreRef.current.visible = true;
    if (ringRef.current) ringRef.current.visible = true;
    if (leftWingRef.current) leftWingRef.current.visible = true;
    if (rightWingRef.current) rightWingRef.current.visible = true;
    if (shadowTailRef.current) shadowTailRef.current.visible = true;
    if (defeatBloomRef.current) {
      defeatBloomRef.current.visible = false;
      defeatBloomRef.current.scale.set(1, 1, 1);
      defeatBloomRef.current.position.set(0, 0, 0);
    }

    // Gentle wandering sinusoidal path around base position (deterministic phase per monster)
    const idHash = data.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 20;
    const wanderX = data.basePosition[0] + Math.sin(t * 0.35 + idHash) * data.wanderRadius;
    const wanderZ = data.basePosition[2] + Math.cos(t * 0.28 + idHash * 1.3) * (data.wanderRadius * 0.75);
    const px = humanPosRef?.current?.x ?? playerPos[0];
    const pz = humanPosRef?.current?.z ?? playerPos[2];
    const dx = px - wanderX;
    const dz = pz - wanderZ;
    const distToPlayer = Math.hypot(dx, dz);

    const proximityLift = distToPlayer < 6 ? (1 - distToPlayer / 6) * 0.38 : 0;
    const hoverY = data.basePosition[1] + Math.sin(t * 1.6 + idHash) * 0.24 + proximityLift;

    // Add subtle hit shudder offset
    const shudderX = hitShudderRef.current > 0 ? (Math.random() - 0.5) * 0.08 : 0;
    const shudderY = hitShudderRef.current > 0 ? (Math.random() - 0.5) * 0.08 : 0;

    currentPos.current.set(wanderX + shudderX, hoverY + shudderY, wanderZ);

    if (rootRef.current) {
      // Soft orientation towards player if nearby (60+ FPS real-time tracking)
      if (distToPlayer < 14) {
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

    // Gentle wing undulations
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = 0.35 + Math.sin(t * 2.2 + idHash) * 0.22;
      leftWingRef.current.rotation.y = Math.cos(t * 1.8 + idHash) * 0.15;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -0.35 - Math.sin(t * 2.2 + idHash) * 0.22;
      rightWingRef.current.rotation.y = -Math.cos(t * 1.8 + idHash) * 0.15;
    }

    // Pulsing core breathing with hit flash
    if (coreRef.current) {
      const breathe = (1.0 + Math.sin(t * 3.0) * 0.08) * (hitShudderRef.current > 0 ? 1.2 : 1.0);
      coreRef.current.scale.setScalar(breathe);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = hitShudderRef.current > 0 ? 4.5 : 2.8;
      }
    }

    // 1. Check melee hit if player is actively attacking
    const liveAttack = weaponStateRef?.current?.activeAttack;
    const isSwinging =
      isPlayerAttacking ||
      (liveAttack &&
        !liveAttack.isCharging &&
        liveAttack.progress > 0.08 &&
        liveAttack.progress < 0.88);
    if (isSwinging) {
      onHitCheck(data.id, currentPos.current);
    }

    // 2. Check ranged projectile collisions from flight
    if (weaponStateRef?.current?.projectiles) {
      const projs = weaponStateRef.current.projectiles;
      for (let i = 0; i < projs.length; i++) {
        const p = projs[i];
        const dist = currentPos.current.distanceTo(
          new THREE.Vector3(p.position[0], p.position[1], p.position[2])
        );
        if (dist < 1.6) {
          p.age = p.maxAge; // Consume projectile
          onDirectHit(data.id, currentPos.current, p.weaponId);
          break;
        }
      }
    }

    // 3. Check vehicle collision in driving mode (harmonic spirit contact)
    if (playerMode === "DRIVING" && vehicleStateRef?.current && !data.isDefeated) {
      const v = vehicleStateRef.current;
      if (Math.abs(v.speed) > 2.5) {
        const carVec = new THREE.Vector3(v.position.x, 1.0, v.position.z);
        const distToCar = currentPos.current.distanceTo(carVec);
        if (distToCar < 2.6) {
          onDirectHit(data.id, currentPos.current, "VEHICLE");
        }
      }
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
          emissiveIntensity={2.8}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Ethereal Floating Mantles / Celestial Wings */}
      <mesh ref={leftWingRef} position={[-0.48, 0.05, 0]}>
        <coneGeometry args={[0.2, 0.95, 4]} />
        <meshStandardMaterial
          color={data.accentColor}
          emissive={data.color}
          emissiveIntensity={1.8}
          transparent
          opacity={0.45}
        />
      </mesh>
      <mesh ref={rightWingRef} position={[0.48, 0.05, 0]}>
        <coneGeometry args={[0.2, 0.95, 4]} />
        <meshStandardMaterial
          color={data.accentColor}
          emissive={data.color}
          emissiveIntensity={1.8}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Ethereal Shadow Cowl / Floating Shadow Tail */}
      <group ref={shadowTailRef} position={[0, -0.32, 0]}>
        <mesh>
          <coneGeometry args={[0.26, 0.72, 8, 1, true]} />
          <meshStandardMaterial
            color="#090d16"
            emissive={data.color}
            emissiveIntensity={0.5}
            transparent
            opacity={0.65}
            roughness={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Floating subtle shadow embers */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={`shadow-ember-${i}`}
            position={[
              Math.sin(i * 2.1) * 0.16,
              -0.42 - i * 0.14,
              Math.cos(i * 2.1) * 0.16,
            ]}
          >
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color={data.color} transparent opacity={0.45} />
          </mesh>
        ))}
      </group>

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

      {/* Harmonic Resonance Ripple Ring (Triggered on Hit) */}
      <mesh ref={rippleRingRef} rotation={[-Math.PI / 2, 0, 0]} scale={[0.1, 0.1, 0.1]}>
        <ringGeometry args={[0.8, 0.95, 24]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Harmonic Impact Sparkles (Burst outward when hit) */}
      {hitShudderRef.current > 0 && (
        <group>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI * 2) / 6;
            const dist = 0.35 + (0.22 - hitShudderRef.current) * 2.8;
            return (
              <mesh
                key={`sparkle-${i}`}
                position={[Math.cos(angle) * dist, Math.sin(angle * 2) * 0.2, Math.sin(angle) * dist]}
              >
                <octahedronGeometry args={[0.06]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive={data.accentColor}
                  emissiveIntensity={4.5}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Defeat Harmonic Crystallization Bloom (Ascending Stars Effect) */}
      <group ref={defeatBloomRef} visible={false}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
          <mesh
            key={`crystal-bloom-${i}`}
            position={[
              Math.cos((i * Math.PI * 2) / 16) * 0.75,
              Math.sin((i * Math.PI * 2) / 16) * 0.55 + (i % 4) * 0.18,
              Math.sin((i * Math.PI * 2) / 8) * 0.35,
            ]}
            rotation={[i * 0.4, i * 0.6, i * 0.2]}
          >
            <tetrahedronGeometry args={[0.12]} />
            <meshBasicMaterial color={data.accentColor} transparent opacity={0.85} />
          </mesh>
        ))}
        <pointLight color={data.accentColor} intensity={5.0} distance={12} decay={2} />
      </group>

      {/* Atmospheric Point Light cast on surroundings */}
      <pointLight color={data.accentColor} intensity={2.6} distance={8} decay={2} />

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
