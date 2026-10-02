"use client";

import { useRef, useEffect, useCallback } from "react";
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

// ─── Individual Weapon Meshes ─────────────────────────────────────────────────

function BlueshardSwordMesh({ chargeLevel = 0, attackProgress = 0 }: { chargeLevel?: number; attackProgress?: number }) {
  const bladeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bladeRef.current) {
      // Idle shimmer rotation on y-axis
      bladeRef.current.rotation.y = Math.sin(t * 2.2) * 0.06;
    }
    if (glowRef.current) {
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.3 + Math.sin(t * 4) * 0.15 + chargeLevel * 0.5;
    }
  });

  const swingAngle = attackProgress < 0.5
    ? attackProgress * 2 * Math.PI * 0.55
    : (1 - (attackProgress - 0.5) * 2) * Math.PI * 0.55;

  return (
    <group rotation={[0, swingAngle, -0.3]}>
      {/* Blade */}
      <mesh ref={bladeRef} position={[0.0, 0.55, 0.22]} rotation={[0.3, 0, 0.1]} castShadow>
        <boxGeometry args={[0.06, 0.72, 0.04]} />
        <meshStandardMaterial color="#bfdbfe" emissive="#38bdf8" emissiveIntensity={1.2 + chargeLevel * 2} metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Crystal shard tip */}
      <mesh position={[0.0, 0.95, 0.22]} rotation={[0.3, 0, 0.1]}>
        <tetrahedronGeometry args={[0.09]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#7dd3fc" emissiveIntensity={2.0 + chargeLevel * 3} />
      </mesh>
      {/* Guard crosspiece */}
      <mesh position={[0.0, 0.16, 0.22]}>
        <boxGeometry args={[0.24, 0.04, 0.04]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.0, 0.05, 0.22]}>
        <boxGeometry args={[0.05, 0.2, 0.04]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* Energy glow aura */}
      <mesh ref={glowRef} position={[0.0, 0.55, 0.22]} rotation={[0.3, 0, 0.1]}>
        <boxGeometry args={[0.14, 0.82, 0.12]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} depthWrite={false} />
      </mesh>
    </group>
  );
}

function RPGMesh({ attackProgress = 0 }: { attackProgress?: number }) {
  const recoil = Math.sin(attackProgress * Math.PI) * -0.08;
  return (
    <group rotation={[-0.15, -0.12, 0]} position={[0, recoil, 0]}>
      {/* Main tube */}
      <mesh position={[0.3, 0.08, 0.3]} rotation={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.055, 0.062, 0.85, 10]} />
        <meshStandardMaterial color="#4a5568" metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Warhead */}
      <mesh position={[0.64, 0.08, 0.06]} rotation={[0, 0.35, 0]}>
        <coneGeometry args={[0.07, 0.22, 8]} />
        <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={0.4} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Grip */}
      <mesh position={[0.3, -0.08, 0.28]}>
        <boxGeometry args={[0.06, 0.2, 0.06]} />
        <meshStandardMaterial color="#2d3748" roughness={0.9} />
      </mesh>
      {/* Scope */}
      <mesh position={[0.32, 0.14, 0.26]} rotation={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.18, 8]} />
        <meshStandardMaterial color="#1a202c" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

function BowMesh({ chargeLevel = 0, attackProgress = 0 }: { chargeLevel?: number; attackProgress?: number }) {
  const drawback = chargeLevel * 0.22;
  const releaseSnap = attackProgress < 0.15 ? attackProgress / 0.15 : 0;
  const bowFlex = chargeLevel * 0.28;

  return (
    <group rotation={[0, 0.2, -0.1]}>
      {/* Bow body */}
      <mesh position={[0.08, 0.15, 0.28]} rotation={[bowFlex * 0.4, 0, bowFlex]}>
        <torusGeometry args={[0.28, 0.018, 8, 24, Math.PI * 1.1]} />
        <meshStandardMaterial color="#86efac" emissive="#4ade80" emissiveIntensity={0.3 + chargeLevel * 0.6} roughness={0.5} />
      </mesh>
      {/* String */}
      <mesh position={[0.08 - drawback * 0.5, 0.15, 0.28]}>
        <boxGeometry args={[0.005, 0.54, 0.005]} />
        <meshStandardMaterial color="#d1fae5" emissive="#86efac" emissiveIntensity={chargeLevel} />
      </mesh>
      {/* Arrow */}
      {chargeLevel > 0.05 && !attackProgress && (
        <group position={[0.08 - drawback, 0.15, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.006, 0.006, 0.55, 6]} />
            <meshStandardMaterial color="#d1fae5" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.018, 0.08, 6]} />
            <meshStandardMaterial color="#86efac" emissive="#4ade80" emissiveIntensity={1.5} />
          </mesh>
        </group>
      )}
      {/* Charge glow ring */}
      {chargeLevel > 0.3 && (
        <mesh position={[0.08, 0.15, 0.28]}>
          <torusGeometry args={[0.35 + chargeLevel * 0.1, 0.04, 6, 18]} />
          <meshBasicMaterial color="#86efac" transparent opacity={chargeLevel * 0.6} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function ScytheMesh({ attackProgress = 0 }: { attackProgress?: number }) {
  const sweepAngle = attackProgress * Math.PI * 1.35; // wide arc
  return (
    <group rotation={[0, sweepAngle - 0.2, 0]}>
      {/* Staff */}
      <mesh position={[0, 0.3, 0.18]} rotation={[0.18, 0, 0.08]} castShadow>
        <cylinderGeometry args={[0.022, 0.018, 0.95, 8]} />
        <meshStandardMaterial color="#2d1b69" roughness={0.7} metalness={0.3} />
      </mesh>
      {/* Scythe blade */}
      <mesh position={[0.18, 0.76, 0.18]} rotation={[0.18, -0.6, 0.8]}>
        <torusGeometry args={[0.32, 0.025, 6, 20, Math.PI * 0.7]} />
        <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={1.2} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Inner blade edge */}
      <mesh position={[0.18, 0.76, 0.18]} rotation={[0.18, -0.6, 0.8]}>
        <torusGeometry args={[0.28, 0.01, 4, 16, Math.PI * 0.7]} />
        <meshBasicMaterial color="#ede9fe" />
      </mesh>
      {/* Energy trail during swing */}
      {attackProgress > 0.05 && attackProgress < 0.9 && (
        <mesh position={[0.18, 0.76, 0.18]} rotation={[0.18, -0.6, 0.8]}>
          <torusGeometry args={[0.34, 0.06, 4, 16, Math.PI * 0.65]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={(1 - attackProgress) * 0.5} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function HeavenlyPenMesh({ chargeLevel = 0, attackProgress = 0 }: { chargeLevel?: number; attackProgress?: number }) {
  const bobRef = useRef<THREE.Group>(null);
  const inkRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (bobRef.current) {
      bobRef.current.position.y = Math.sin(t * 3) * 0.012;
      bobRef.current.rotation.z = Math.sin(t * 1.8) * 0.04;
    }
    if (inkRef.current) {
      (inkRef.current.material as THREE.MeshBasicMaterial).opacity =
        chargeLevel * 0.8 + Math.sin(t * 5) * 0.1 * chargeLevel;
    }
  });

  const strikeFlash = attackProgress < 0.35 ? attackProgress / 0.35 : 1 - (attackProgress - 0.35) / 0.65;

  return (
    <group ref={bobRef} rotation={[-0.15, 0.12, -0.35]}>
      {/* Pen body */}
      <mesh position={[0.15, 0.28, 0.28]} rotation={[0.5, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.025, 0.018, 0.62, 8]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6 + chargeLevel * 1.5} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Nib tip */}
      <mesh position={[0.15, 0.6, 0.28]} rotation={[0.5, 0, 0.3]}>
        <coneGeometry args={[0.025, 0.1, 6]} />
        <meshStandardMaterial color="#1c1917" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Ink drop at tip */}
      <mesh position={[0.15, 0.63, 0.28]}>
        <sphereGeometry args={[0.028, 6, 6]} />
        <meshStandardMaterial color="#1c1917" emissive="#fbbf24" emissiveIntensity={chargeLevel * 3} />
      </mesh>

      {/* Charge glyph orb */}
      {chargeLevel > 0.15 && (
        <>
          <mesh ref={inkRef} position={[0.15, 0.62, 0.28]}>
            <sphereGeometry args={[0.05 + chargeLevel * 0.12, 8, 8]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={chargeLevel * 0.7} depthWrite={false} />
          </mesh>
          {/* Orbiting ink strokes */}
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                0.15 + Math.cos((i / 3) * Math.PI * 2) * 0.12 * chargeLevel,
                0.62 + Math.sin((i / 3) * Math.PI * 2) * 0.08 * chargeLevel,
                0.28,
              ]}
            >
              <boxGeometry args={[0.04, 0.008, 0.008]} />
              <meshBasicMaterial color="#fffbeb" transparent opacity={chargeLevel * 0.8} />
            </mesh>
          ))}
        </>
      )}

      {/* Strike flash */}
      {attackProgress > 0 && (
        <mesh position={[0.15, 0.62, 0.28]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={strikeFlash * 0.8} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

// ─── Projectile Meshes ────────────────────────────────────────────────────────

function ProjectileMesh({ projectile }: { projectile: Projectile }) {
  const def = WEAPON_DEFS[projectile.weaponId];
  const lifeRatio = projectile.age / projectile.maxAge;

  if (projectile.weaponId === "RPG") {
    return (
      <group
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
      <group position={projectile.position}>
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
    <mesh position={projectile.position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={def.color} emissive={def.color} emissiveIntensity={2} />
    </mesh>
  );
}

// ─── Hit Effect Meshes ────────────────────────────────────────────────────────

function HitEffectMesh({ effect }: { effect: HitEffect }) {
  const def = WEAPON_DEFS[effect.weaponId];
  const ratio = effect.age / effect.maxAge;
  const scale = 0.3 + ratio * 1.8;

  if (effect.weaponId === "RPG") {
    // Blast sphere
    return (
      <group position={effect.position}>
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
      <group position={effect.position}>
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
    <mesh position={effect.position} scale={[scale, scale, scale]}>
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
