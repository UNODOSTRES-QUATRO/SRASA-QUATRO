import { LocationType } from "./gameStore";

type Footprint = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

const sceneFootprints: Partial<Record<Exclude<LocationType, "JALAN" | "DIMENSI_LAIN" | "END_SCREEN">, Footprint[]>> = {
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

const escapeRoomFootprints: Footprint[] = [
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