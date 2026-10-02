// ─── Weapon Archetype Definitions ────────────────────────────────────────────

export type WeaponId =
  | "BLUE_SHARD_SWORD"
  | "RPG"
  | "BOW"
  | "SCYTHE"
  | "HEAVENLY_PEN";

export interface WeaponDef {
  id: WeaponId;
  name: string;
  description: string;
  type: "MELEE" | "RANGED" | "CHARGE";
  damage: number;
  /** How fast the primary attack resolves (seconds) */
  attackSpeed: number;
  /** For charge weapons: how long to full charge (seconds) */
  chargeTime?: number;
  /** For melee: sweep arc in radians */
  sweepArc?: number;
  /** For ranged: projectile speed */
  projectileSpeed?: number;
  /** Effect color (hex) */
  color: string;
  accentColor: string;
  emoji: string;
}

export const WEAPON_DEFS: Record<WeaponId, WeaponDef> = {
  BLUE_SHARD_SWORD: {
    id: "BLUE_SHARD_SWORD",
    name: "Blue Shard Sword",
    description: "Fast, crisp deflection slashes with crystalline energy. Press attack rapidly for combos.",
    type: "MELEE",
    damage: 35,
    attackSpeed: 0.22, // Very fast – 9 Sols deflect feel
    sweepArc: Math.PI * 0.55,
    color: "#38bdf8",
    accentColor: "#bfdbfe",
    emoji: "🗡️",
  },
  RPG: {
    id: "RPG",
    name: "Rocket Launcher",
    description: "Satisfying trajectory arc with a bone-shaking blast on impact.",
    type: "RANGED",
    damage: 120,
    attackSpeed: 1.4,
    projectileSpeed: 18,
    color: "#f97316",
    accentColor: "#fef3c7",
    emoji: "🚀",
  },
  BOW: {
    id: "BOW",
    name: "Longbow",
    description: "Draw back, feel the tension build, release for a clean piercing shot.",
    type: "CHARGE",
    damage: 65,
    attackSpeed: 0.8,
    chargeTime: 1.2,
    projectileSpeed: 28,
    sweepArc: 0,
    color: "#86efac",
    accentColor: "#d1fae5",
    emoji: "🏹",
  },
  SCYTHE: {
    id: "SCYTHE",
    name: "Reaper's Scythe",
    description: "Wide arc sweeping strike that cuts through groups of enemies.",
    type: "MELEE",
    damage: 55,
    attackSpeed: 0.55,
    sweepArc: Math.PI * 1.4, // Nearly full 180° sweep
    color: "#a78bfa",
    accentColor: "#ede9fe",
    emoji: "⚔️",
  },
  HEAVENLY_PEN: {
    id: "HEAVENLY_PEN",
    name: "Heavenly Pen",
    description: "Mystical calligraphy strikes leave ink-energy glyphs that explode on enemies.",
    type: "CHARGE",
    damage: 90,
    attackSpeed: 0.9,
    chargeTime: 0.8,
    projectileSpeed: 22,
    color: "#fbbf24",
    accentColor: "#fffbeb",
    emoji: "✒️",
  },
};

export const WEAPON_ORDER: WeaponId[] = [
  "BLUE_SHARD_SWORD",
  "RPG",
  "BOW",
  "SCYTHE",
  "HEAVENLY_PEN",
];

// ─── Attack State ─────────────────────────────────────────────────────────────

export interface ActiveAttack {
  weaponId: WeaponId;
  /** 0..1 progress */
  progress: number;
  chargeLevel: number; // 0..1 for charge weapons
  isCharging: boolean;
}

export interface Projectile {
  id: string;
  weaponId: WeaponId;
  position: [number, number, number];
  velocity: [number, number, number];
  age: number;
  maxAge: number;
  chargeLevel: number;
}

export interface HitEffect {
  id: string;
  weaponId: WeaponId;
  position: [number, number, number];
  age: number;
  maxAge: number;
}
