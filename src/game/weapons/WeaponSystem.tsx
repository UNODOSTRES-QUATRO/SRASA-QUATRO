"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  WeaponId,
  WEAPON_DEFS,
  WEAPON_ORDER,
  ActiveAttack,
  Projectile,
  HitEffect,
} from "./weaponTypes";
import { soundManager } from "../audio/SoundManager";

// ─── Projectile & Hit Visuals ────────────────────────────────────────────────

// ─── Projectile Meshes ────────────────────────────────────────────────────────

function ProjectileMesh({ projectile }: { projectile: Projectile }) {
  const groupRef = useRef<THREE.Group>(null);
  const def = WEAPON_DEFS[projectile.weaponId];

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(projectile.position[0], projectile.position[1], projectile.position[2]);
      const vx = projectile.velocity[0];
      const vy = projectile.velocity[1];
      const vz = projectile.velocity[2];
      const pitch = Math.atan2(-vy, Math.hypot(vx, vz));
      const yaw = Math.atan2(vx, vz);
      groupRef.current.rotation.set(pitch, yaw, 0);
    }
  });

  const lifeRatio = projectile.age / projectile.maxAge;

  if (projectile.weaponId === "RPG") {
    return (
      <group
        ref={groupRef}
        position={projectile.position}
        rotation={[
          Math.atan2(
            -projectile.velocity[1],
            Math.hypot(projectile.velocity[0], projectile.velocity[2])
          ),
          Math.atan2(projectile.velocity[0], projectile.velocity[2]),
          0,
        ]}
      >
        {/* Rocket body */}
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
          <meshStandardMaterial color="#4a5568" metalness={0.8} />
        </mesh>
        {/* Warhead */}
        <mesh position={[0, 0.28, 0]}>
          <coneGeometry args={[0.07, 0.2, 8]} />
          <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.8} />
        </mesh>
        {/* Exhaust trail */}
        <pointLight position={[0, -0.3, 0]} color="#f97316" intensity={4} distance={4} decay={2} />
      </group>
    );
  }

  if (projectile.weaponId === "BOW") {
    return (
      <group
        ref={groupRef}
        position={projectile.position}
        rotation={[
          Math.atan2(
            -projectile.velocity[1],
            Math.hypot(projectile.velocity[0], projectile.velocity[2])
          ),
          Math.atan2(projectile.velocity[0], projectile.velocity[2]),
          0,
        ]}
      >
        <mesh>
          <cylinderGeometry args={[0.007, 0.007, 0.6, 6]} />
          <meshStandardMaterial color="#d1fae5" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <coneGeometry args={[0.02, 0.1, 6]} />
          <meshStandardMaterial color="#86efac" emissive="#4ade80" emissiveIntensity={2.0} />
        </mesh>
        {/* Arrow energy trail */}
        <mesh position={[0, -0.2, 0]}>
          <coneGeometry args={[0.018, 0.35, 6]} />
          <meshBasicMaterial color="#86efac" transparent opacity={0.45} depthWrite={false} />
        </mesh>
      </group>
    );
  }

  // Heavenly Pen ink glyph projectile
  if (projectile.weaponId === "HEAVENLY_PEN") {
    return (
      <group ref={groupRef} position={projectile.position}>
        <mesh>
          <sphereGeometry args={[0.12 + projectile.chargeLevel * 0.08, 8, 8]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={2.5} />
        </mesh>
        {/* Orbiting ink strokes */}
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 4) * Math.PI * 2) * 0.22,
              Math.sin((i / 4) * Math.PI * 2) * 0.22,
              0,
            ]}
            rotation={[0, 0, (i / 4) * Math.PI * 2]}
          >
            <boxGeometry args={[0.1, 0.018, 0.018]} />
            <meshBasicMaterial color="#fffbeb" transparent opacity={0.9 - lifeRatio * 0.3} />
          </mesh>
        ))}
        <pointLight color="#fbbf24" intensity={3} distance={3} decay={2} />
      </group>
    );
  }

  // Generic energy orb for other ranged types
  return (
    <mesh ref={groupRef as any} position={projectile.position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={def.color} emissive={def.color} emissiveIntensity={2} />
    </mesh>
  );
}

// ─── Hit Effect Meshes ────────────────────────────────────────────────────────

function HitEffectMesh({ effect }: { effect: HitEffect }) {
  const groupRef = useRef<THREE.Group>(null);
  const def = WEAPON_DEFS[effect.weaponId];
  const ratio = effect.age / effect.maxAge;
  const scale = 0.3 + ratio * 1.8;

  useFrame(() => {
    if (groupRef.current) {
      const liveRatio = Math.min(1.0, effect.age / effect.maxAge);
      const liveScale = 0.3 + liveRatio * 1.8;
      groupRef.current.position.set(effect.position[0], effect.position[1], effect.position[2]);
      groupRef.current.scale.set(liveScale, liveScale, liveScale);
    }
  });

  if (effect.weaponId === "RPG") {
    // Blast sphere
    return (
      <group ref={groupRef} position={effect.position}>
        <mesh scale={[scale * 1.8, scale * 1.8, scale * 1.8]}>
          <sphereGeometry args={[0.4, 12, 12]} />
          <meshBasicMaterial color="#f97316" transparent opacity={(1 - ratio) * 0.85} depthWrite={false} />
        </mesh>
        <mesh scale={[scale * 0.9, scale * 0.9, scale * 0.9]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshBasicMaterial color="#fef3c7" transparent opacity={(1 - ratio) * 0.5} depthWrite={false} />
        </mesh>
        <pointLight color="#f97316" intensity={(1 - ratio) * 8} distance={8} decay={2} />
      </group>
    );
  }

  if (effect.weaponId === "BLUE_SHARD_SWORD") {
    return (
      <group ref={groupRef} position={effect.position}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 5) * Math.PI * 2) * scale * 0.5,
              0,
              Math.sin((i / 5) * Math.PI * 2) * scale * 0.5,
            ]}
          >
            <tetrahedronGeometry args={[0.1 * (1 - ratio)]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={1 - ratio} />
          </mesh>
        ))}
      </group>
    );
  }

  // Generic flash
  return (
    <mesh ref={groupRef as any} position={effect.position} scale={[scale, scale, scale]}>
      <sphereGeometry args={[0.25, 8, 8]} />
      <meshBasicMaterial color={def.color} transparent opacity={(1 - ratio) * 0.7} depthWrite={false} />
    </mesh>
  );
}

// ─── Weapon System Hook ───────────────────────────────────────────────────────

interface WeaponSystemState {
  activeWeaponIndex: number;
  activeWeaponId: WeaponId;
  activeAttack: ActiveAttack | null;
  projectiles: Projectile[];
  hitEffects: HitEffect[];
  chargeLevel: number;
}

let _projectileCounter = 0;

export function useWeaponSystem() {
  const stateRef = useRef<WeaponSystemState>({
    activeWeaponIndex: 0,
    activeWeaponId: WEAPON_ORDER[0],
    activeAttack: null,
    projectiles: [],
    hitEffects: [],
    chargeLevel: 0,
  });

  const nextWeapon = useCallback(() => {
    const s = stateRef.current;
    const next = (s.activeWeaponIndex + 1) % WEAPON_ORDER.length;
    stateRef.current = {
      ...s,
      activeWeaponIndex: next,
      activeWeaponId: WEAPON_ORDER[next],
      activeAttack: null,
      chargeLevel: 0,
    };
  }, []);

  const prevWeapon = useCallback(() => {
    const s = stateRef.current;
    const prev = (s.activeWeaponIndex - 1 + WEAPON_ORDER.length) % WEAPON_ORDER.length;
    stateRef.current = {
      ...s,
      activeWeaponIndex: prev,
      activeWeaponId: WEAPON_ORDER[prev],
      activeAttack: null,
      chargeLevel: 0,
    };
  }, []);

  const startAttack = useCallback((playerPos: [number, number, number], playerHeading: number) => {
    const s = stateRef.current;
    const def = WEAPON_DEFS[s.activeWeaponId];
    if (s.activeAttack && s.activeAttack.progress < 0.9) return; // Busy

    if (def.type === "CHARGE") {
      // Start charging
      if (s.activeWeaponId === "HEAVENLY_PEN") {
        soundManager.playInkStroke();
      }
      stateRef.current = {
        ...s,
        activeAttack: {
          weaponId: s.activeWeaponId,
          progress: 0,
          chargeLevel: s.chargeLevel,
          isCharging: true,
        },
      };
    } else {
      // Instant attack SFX
      if (s.activeWeaponId === "BLUE_SHARD_SWORD" || s.activeWeaponId === "SCYTHE") {
        soundManager.playSwordSlash();
      }
      const newAttack: ActiveAttack = {
        weaponId: s.activeWeaponId,
        progress: 0,
        chargeLevel: 1.0,
        isCharging: false,
      };

      // Spawn projectiles for ranged
      const newProjectiles = [...s.projectiles];
      if (def.type === "RANGED" && def.projectileSpeed) {
        const id = `proj-${_projectileCounter++}`;
        newProjectiles.push({
          id,
          weaponId: s.activeWeaponId,
          position: [
            playerPos[0] + Math.sin(playerHeading) * 0.8,
            playerPos[1] + 1.2,
            playerPos[2] + Math.cos(playerHeading) * 0.8,
          ],
          velocity: [
            Math.sin(playerHeading) * def.projectileSpeed,
            (s.activeWeaponId === "RPG" ? 2.5 : 0), // RPG has arc
            Math.cos(playerHeading) * def.projectileSpeed,
          ],
          age: 0,
          maxAge: s.activeWeaponId === "RPG" ? 3.0 : 2.0,
          chargeLevel: 1.0,
        });
      }

      stateRef.current = {
        ...s,
        activeAttack: newAttack,
        projectiles: newProjectiles,
      };
    }
  }, []);

  const releaseAttack = useCallback((playerPos: [number, number, number], playerHeading: number) => {
    const s = stateRef.current;
    if (!s.activeAttack?.isCharging) return;

    const def = WEAPON_DEFS[s.activeWeaponId];
    const chargeLevel = s.chargeLevel;

    if (s.activeWeaponId === "BOW") {
      soundManager.playBowRelease();
    }

    // Spawn projectile on release for charge weapons
    const newProjectiles = [...s.projectiles];
    if (def.projectileSpeed) {
      const id = `proj-${_projectileCounter++}`;
      newProjectiles.push({
        id,
        weaponId: s.activeWeaponId,
        position: [
          playerPos[0] + Math.sin(playerHeading) * 0.8,
          playerPos[1] + 1.2,
          playerPos[2] + Math.cos(playerHeading) * 0.8,
        ],
        velocity: [
          Math.sin(playerHeading) * def.projectileSpeed * (0.5 + chargeLevel * 0.5),
          0,
          Math.cos(playerHeading) * def.projectileSpeed * (0.5 + chargeLevel * 0.5),
        ],
        age: 0,
        maxAge: 2.5,
        chargeLevel,
      });
    }

    stateRef.current = {
      ...s,
      activeAttack: {
        ...s.activeAttack,
        isCharging: false,
        chargeLevel,
      },
      chargeLevel: 0,
      projectiles: newProjectiles,
    };
  }, []);

  return {
    stateRef,
    nextWeapon,
    prevWeapon,
    startAttack,
    releaseAttack,
  };
}

// ─── WeaponSystem R3F Component ───────────────────────────────────────────────

interface WeaponSystemProps {
  playerPos: [number, number, number];
  playerHeading: number;
  stateRef: React.MutableRefObject<WeaponSystemState>;
  isAttacking: React.MutableRefObject<boolean>;
  isChargingRef: React.MutableRefObject<boolean>;
}

export function WeaponSystem3D({
  playerPos,
  playerHeading,
  stateRef,
  isAttacking,
  isChargingRef,
}: WeaponSystemProps) {
  const [, setTick] = useState(0);
  const prevCountRef = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = stateRef.current;
    const def = WEAPON_DEFS[s.activeWeaponId];

    // ── Update charge level ────────────────────────────────────────────────
    if (s.activeAttack?.isCharging && def.chargeTime) {
      const newCharge = Math.min(1.0, s.chargeLevel + dt / def.chargeTime);
      stateRef.current.chargeLevel = newCharge;
      if (s.activeAttack) {
        s.activeAttack.chargeLevel = newCharge;
      }
    }

    // ── Update attack progress ─────────────────────────────────────────────
    if (s.activeAttack && !s.activeAttack.isCharging) {
      const speed = 1.0 / def.attackSpeed;
      s.activeAttack.progress = Math.min(1.0, s.activeAttack.progress + dt * speed);
      if (s.activeAttack.progress >= 1.0) {
        stateRef.current.activeAttack = null;
      }
    }

    // ── Update projectiles ─────────────────────────────────────────────────
    const newProjectiles = [];
    for (const p of s.projectiles) {
      p.age += dt;
      if (p.age >= p.maxAge) continue;

      // Gravity for RPG arc
      if (p.weaponId === "RPG") {
        p.velocity[1] -= 6.0 * dt; // gravity
      }

      p.position[0] += p.velocity[0] * dt;
      p.position[1] += p.velocity[1] * dt;
      p.position[2] += p.velocity[2] * dt;

      // Hit ground → create impact effect
      if (p.position[1] <= 0.1 || p.age > p.maxAge * 0.98) {
        const effect: HitEffect = {
          id: `hit-${p.id}`,
          weaponId: p.weaponId,
          position: [...p.position],
          age: 0,
          maxAge: p.weaponId === "RPG" ? 0.8 : 0.4,
        };
        stateRef.current.hitEffects = [...stateRef.current.hitEffects, effect];
        continue;
      }

      newProjectiles.push(p);
    }
    stateRef.current.projectiles = newProjectiles;

    // ── Update hit effects ─────────────────────────────────────────────────
    stateRef.current.hitEffects = stateRef.current.hitEffects.filter((e) => {
      e.age += dt;
      return e.age < e.maxAge;
    });

    const activeCount = s.projectiles.length + s.hitEffects.length;
    if (activeCount !== prevCountRef.current || activeCount > 0) {
      prevCountRef.current = activeCount;
      setTick((t) => (t + 1) % 1000000);
    }
  });

  const s = stateRef.current;
  const def = WEAPON_DEFS[s.activeWeaponId];
  const attack = s.activeAttack;

  return (
    <group>
      {/* ── Active Projectiles in flight ── */}
      {s.projectiles.map((p) => (
        <ProjectileMesh key={p.id} projectile={p} />
      ))}

      {/* ── Hit & Impact Effects ── */}
      {s.hitEffects.map((e) => (
        <HitEffectMesh key={e.id} effect={e} />
      ))}
    </group>
  );
}

// Re-export for external use
export { ProjectileMesh, HitEffectMesh };
export type { WeaponSystemState };
