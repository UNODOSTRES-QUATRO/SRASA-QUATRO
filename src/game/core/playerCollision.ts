import { LocationType } from "./gameStore";

export type Footprint = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export const sceneFootprints: Partial<Record<Exclude<LocationType, "JALAN" | "DIMENSI_LAIN" | "END_SCREEN">, Footprint[]>> = {
  RUMAH: [
    { minX: -4.5, maxX: 4.5, minZ: -4.55, maxZ: -4.25 },
    { minX: -4.55, maxX: -4.25, minZ: -4.3, maxZ: 4.3 },
    { minX: 4.25, maxX: 4.55, minZ: -4.3, maxZ: 4.3 },
    { minX: -4.5, maxX: -0.55, minZ: 4.25, maxZ: 4.55 },
    { minX: 0.55, maxX: 4.5, minZ: 4.25, maxZ: 4.55 },
    { minX: -4.5, maxX: -0.45, minZ: -1.35, maxZ: -1.05 },
    { minX: 1.6, maxX: 1.9, minZ: -4.35, maxZ: -3.26 },
    { minX: 1.6, maxX: 1.9, minZ: -1.84, maxZ: -1.35 },
    { minX: 2.85, maxX: 4.35, minZ: -1.35, maxZ: -1.05 },
    { minX: -3.35, maxX: -1.45, minZ: -4.25, maxZ: -2.1 },
    { minX: -4.3, maxX: -3.3, minZ: 0.1, maxZ: 3.55 },
    { minX: -4.3, maxX: -3.3, minZ: 2.75, maxZ: 3.7 },
    { minX: -4.25, maxX: -3.35, minZ: 2.75, maxZ: 3.7 },
    { minX: 0.0, maxX: 1.6, minZ: 1.0, maxZ: 2.2 },
    { minX: 1.8, maxX: 3.8, minZ: 0.9, maxZ: 2.35 },
    { minX: 3.0, maxX: 3.8, minZ: -4.1, maxZ: -2.7 },
    { minX: 2.0, maxX: 2.7, minZ: -4.1, maxZ: -3.2 },
    { minX: 1.8, maxX: 2.6, minZ: -2.15, maxZ: -1.45 },
  ],
  TEMPAT_KERJA: [
    { minX: -7.2, maxX: 7.2, minZ: -7.2, maxZ: -6.8 },
    { minX: -7.2, maxX: -6.8, minZ: -6.8, maxZ: 6.8 },
    { minX: 6.8, maxX: 7.2, minZ: -6.8, maxZ: 6.8 },
    { minX: -7.2, maxX: -1.0, minZ: 6.8, maxZ: 7.2 },
    { minX: 1.0, maxX: 7.2, minZ: 6.8, maxZ: 7.2 },
    { minX: -4.4, maxX: -1.6, minZ: -3.3, maxZ: -0.7 },
    { minX: -4.3, maxX: -1.7, minZ: 1.7, maxZ: 3.3 },
    { minX: 1.7, maxX: 4.3, minZ: 1.7, maxZ: 3.3 },
    { minX: 1.7, maxX: 4.3, minZ: -3.3, maxZ: -0.7 },
    { minX: 2.0, maxX: 4.0, minZ: -0.95, maxZ: -0.35 },
    { minX: -6.5, maxX: -5.5, minZ: -5.7, maxZ: -4.3 },
  ],
  BENGKEL: [
    { minX: -6.2, maxX: 6.2, minZ: -6.2, maxZ: -5.8 },
    { minX: -6.2, maxX: -5.8, minZ: -5.8, maxZ: 5.8 },
    { minX: 5.8, maxX: 6.2, minZ: -5.8, maxZ: 5.8 },
    { minX: -6.2, maxX: -3.3, minZ: 5.8, maxZ: 6.2 },
    { minX: 3.3, maxX: 6.2, minZ: 5.8, maxZ: 6.2 },
    { minX: -4.6, maxX: -0.4, minZ: -1.25, maxZ: 1.25 },
    { minX: 2.6, maxX: 4.4, minZ: -5.3, maxZ: -4.3 },
    { minX: 4.0, maxX: 5.0, minZ: 1.3, maxZ: 2.7 },
    { minX: 1.55, maxX: 2.45, minZ: -2.0, maxZ: -1.0 },
  ],
  KASTIL: [
    { minX: -13.2, maxX: 13.2, minZ: -10.6, maxZ: -9.4 },
    { minX: -12.5, maxX: -7.5, minZ: -11.5, maxZ: -6.5 },
    { minX: 7.5, maxX: 12.5, minZ: -11.5, maxZ: -6.5 },
    { minX: -1.8, maxX: 1.8, minZ: -0.8, maxZ: 2.8 },
    { minX: -6.7, maxX: -4.3, minZ: -0.8, maxZ: 0.8 },
    { minX: -6.5, maxX: -4.5, minZ: -1.2, maxZ: 1.2 },
    { minX: 4.6, maxX: 6.4, minZ: 2.0, maxZ: 4.0 },
    { minX: -4.0, maxX: -3.0, minZ: -4.5, maxZ: -3.5 },
    { minX: 3.0, maxX: 4.0, minZ: -4.5, maxZ: -3.5 },
    { minX: -5.6, maxX: -4.4, minZ: -0.6, maxZ: 0.6 },
    { minX: -0.9, maxX: 0.9, minZ: -3.0, maxZ: -1.0 },
    { minX: 0.8, maxX: 3.2, minZ: -6.7, maxZ: -5.4 },
    { minX: -6.45, maxX: -5.95, minZ: -8.45, maxZ: -7.95 },
    { minX: 5.95, maxX: 6.45, minZ: -8.45, maxZ: -7.95 },
    { minX: -8.7, maxX: -6.6, minZ: 4.3, maxZ: 5.9 },
  ],
};

export const escapeRoomFootprints: Footprint[] = [
  { minX: -7.2, maxX: 0.8, minZ: -6.8, maxZ: -6.2 },
  { minX: 3.2, maxX: 7.2, minZ: -6.8, maxZ: -6.2 },
  { minX: -6.8, maxX: -6.2, minZ: -6.2, maxZ: 6.2 },
  { minX: 6.2, maxX: 6.8, minZ: -6.2, maxZ: 6.2 },
  { minX: -7.2, maxX: -1.7, minZ: 6.2, maxZ: 6.8 },
  { minX: 1.7, maxX: 7.2, minZ: 6.2, maxZ: 6.8 },
  { minX: -5.0, maxX: -3.8, minZ: -3.1, maxZ: -1.4 },
  { minX: 3.8, maxX: 5.0, minZ: -3.1, maxZ: -1.4 },
  { minX: -4.0, maxX: -3.0, minZ: 1.8, maxZ: 3.2 },
  { minX: 3.0, maxX: 4.0, minZ: 1.8, maxZ: 3.2 },
  { minX: -6.2, maxX: -5.4, minZ: -1.2, maxZ: 1.2 },
  { minX: 5.4, maxX: 6.2, minZ: -1.2, maxZ: 1.2 },
  { minX: -3.9, maxX: -1.7, minZ: -6.5, maxZ: -5.4 },
  { minX: -1.5, maxX: 0.1, minZ: -6.5, maxZ: -5.4 },
  { minX: 0.8, maxX: 3.2, minZ: -6.5, maxZ: -5.4 },
];

function overlapsFootprint(x: number, z: number, radius: number, footprint: Footprint) {
  const closestX = Math.max(footprint.minX, Math.min(x, footprint.maxX));
  const closestZ = Math.max(footprint.minZ, Math.min(z, footprint.maxZ));
  const distanceX = x - closestX;
  const distanceZ = z - closestZ;
  return distanceX * distanceX + distanceZ * distanceZ < radius * radius;
}

// Check if moving from cur to des moves further away from the collider
function isMovingAway(cur: number, des: number, minBound: number, maxBound: number): boolean {
  const mid = (minBound + maxBound) / 2;
  const curDist = Math.abs(cur - mid);
  const desDist = Math.abs(des - mid);
  return desDist > curDist;
}

export function resolvePlayerPosition(
  current: [number, number, number],
  desired: [number, number, number],
  location: LocationType,
  isInsideEscapeRoom: boolean,
  radius = 0.32,
  isEscapeDoorUnlocked = false
): [number, number, number] {
  if (location === "JALAN" || location === "DIMENSI_LAIN" || location === "END_SCREEN") {
    return desired;
  }

  const footprints = location === "KASTIL" && isInsideEscapeRoom
    ? isEscapeDoorUnlocked
      ? escapeRoomFootprints.slice(0, -1)
      : escapeRoomFootprints
    : sceneFootprints[location] ?? [];
  let x = desired[0];
  let z = current[2];

  if (footprints.some((footprint) => overlapsFootprint(x, z, radius, footprint))) {
    x = current[0];
  }

  z = desired[2];
  if (footprints.some((footprint) => overlapsFootprint(x, z, radius, footprint))) {
    z = current[2];
  }

  return [x, desired[1], z];
}

// ── World-Coordinate Native Collision Footprints ──────────────────────────────
export const WORLD_COLLISION_FOOTPRINTS: Footprint[] = [
  // ── 1. COZY HOME AT [20, 0, -60] ──
  { minX: 15.5, maxX: 24.5, minZ: -64.55, maxZ: -64.25 },
  { minX: 15.45, maxX: 15.75, minZ: -64.3, maxZ: -55.7 },
  { minX: 24.25, maxX: 24.55, minZ: -64.3, maxZ: -55.7 },
  { minX: 15.5, maxX: 19.45, minZ: -55.75, maxZ: -55.45 },
  { minX: 20.55, maxX: 24.5, minZ: -55.75, maxZ: -55.45 },
  { minX: 15.5, maxX: 19.55, minZ: -61.35, maxZ: -61.05 },
  { minX: 21.6, maxX: 21.9, minZ: -64.35, maxZ: -63.26 },
  { minX: 21.6, maxX: 21.9, minZ: -61.84, maxZ: -61.35 },
  { minX: 22.85, maxX: 24.35, minZ: -61.35, maxZ: -61.05 },
  { minX: 16.65, maxX: 18.55, minZ: -64.25, maxZ: -62.1 },
  { minX: 15.7, maxX: 16.7, minZ: -59.9, maxZ: -56.45 },
  { minX: 20.0, maxX: 21.6, minZ: -59.0, maxZ: -57.8 },

  // ── 2. MECHANIC SHOP AT [-18, 0, 0] ──
  { minX: -24.2, maxX: -23.8, minZ: -6.0, maxZ: 6.0 },
  { minX: -24.0, maxX: -12.0, minZ: 5.8, maxZ: 6.2 },
  { minX: -24.0, maxX: -12.0, minZ: -6.2, maxZ: -5.8 },
  { minX: -12.2, maxX: -11.8, minZ: 1.8, maxZ: 6.0 },  // Front north pillar
  { minX: -12.2, maxX: -11.8, minZ: -6.0, maxZ: -1.8 }, // Front south pillar
  { minX: -16.0, maxX: -13.0, minZ: -5.4, maxZ: -4.2 },

  // ── 3. TECH WORKPLACE AT [18, 0, 70] ──
  { minX: 11.0, maxX: 25.0, minZ: 62.8, maxZ: 63.2 },
  { minX: 10.8, maxX: 11.2, minZ: 63.0, maxZ: 68.5 }, // West wall north of entrance
  { minX: 10.8, maxX: 11.2, minZ: 71.5, maxZ: 77.0 }, // West wall south of entrance
  { minX: 24.8, maxX: 25.2, minZ: 63.0, maxZ: 77.0 },
  { minX: 11.0, maxX: 17.0, minZ: 76.8, maxZ: 77.2 },
  { minX: 19.0, maxX: 25.0, minZ: 76.8, maxZ: 77.2 },
  { minX: 13.6, maxX: 16.4, minZ: 66.7, maxZ: 69.3 },
  { minX: 19.6, maxX: 22.4, minZ: 66.7, maxZ: 69.3 },

  // ── 4. CASTLE WALLS & KEEP AT Z = 170 to 215 ──
  // Courtyard south walls flanking the central highway entrance archway (opening from X = -5.0 to 5.0)
  { minX: -14.0, maxX: -5.0, minZ: 169.4, maxZ: 170.6 },
  { minX: 5.0, maxX: 14.0, minZ: 169.4, maxZ: 170.6 },
  { minX: -14.0, maxX: -12.0, minZ: 170.0, maxZ: 215.0 },
  { minX: 12.0, maxX: 14.0, minZ: 170.0, maxZ: 215.0 },
  { minX: -7.0, maxX: 7.0, minZ: 211.5, maxZ: 212.5 },
];

export function resolvePlayerWorldPosition(
  current: [number, number, number],
  desired: [number, number, number],
  radius = 0.32,
  isDoorClosed = false
): [number, number, number] {
  let x = desired[0];
  let z = current[2];

  const doorFootprint: Footprint | null = isDoorClosed
    ? { minX: 19.4, maxX: 20.6, minZ: -55.75, maxZ: -55.45 }
    : null;

  const testX = (fp: Footprint) => overlapsFootprint(x, z, radius, fp) && !isMovingAway(current[0], desired[0], fp.minX, fp.maxX);
  if (WORLD_COLLISION_FOOTPRINTS.some(testX) || (doorFootprint && testX(doorFootprint))) {
    x = current[0];
  }

  z = desired[2];
  const testZ = (fp: Footprint) => overlapsFootprint(x, z, radius, fp) && !isMovingAway(current[2], desired[2], fp.minZ, fp.maxZ);
  if (WORLD_COLLISION_FOOTPRINTS.some(testZ) || (doorFootprint && testZ(doorFootprint))) {
    z = current[2];
  }

  return [x, desired[1], z];
}

// ── Highway Guardrail Collisions for Vehicles ─────────────────────────────────
export const HIGHWAY_GUARDRAILS_FOOTPRINTS: Footprint[] = [
  // Left side guardrails (openings at Bengkel Z: -14 to 14 and Outskirts Z >= 120)
  { minX: -8.1, maxX: -7.5, minZ: -100, maxZ: -14 },
  { minX: -8.1, maxX: -7.5, minZ: 14, maxZ: 120 },

  // Right side guardrails (openings at Home Z: -60 to -44, Office Z: 58 to 82, Outskirts Z >= 120)
  { minX: 7.5, maxX: 8.1, minZ: -100, maxZ: -60 },
  { minX: 7.5, maxX: 8.1, minZ: -44, maxZ: 58 },
  { minX: 7.5, maxX: 8.1, minZ: 82, maxZ: 120 },
];

export function resolveVehicleWorldPosition(
  current: { x: number; y: number; z: number },
  desired: { x: number; y: number; z: number },
  radius = 1.15
): { position: { x: number; y: number; z: number }; collided: boolean } {
  let x = desired.x;
  let z = current.z;
  let collided = false;

  const vehicleColliders = [...WORLD_COLLISION_FOOTPRINTS, ...HIGHWAY_GUARDRAILS_FOOTPRINTS];

  const testX = (fp: Footprint) => overlapsFootprint(x, z, radius, fp) && !isMovingAway(current.x, desired.x, fp.minX, fp.maxX);
  if (vehicleColliders.some(testX)) {
    x = current.x;
    collided = true;
  }

  z = desired.z;
  const testZ = (fp: Footprint) => overlapsFootprint(x, z, radius, fp) && !isMovingAway(current.z, desired.z, fp.minZ, fp.maxZ);
  if (vehicleColliders.some(testZ)) {
    z = current.z;
    collided = true;
  }

  return {
    position: { x, y: desired.y, z },
    collided,
  };
}