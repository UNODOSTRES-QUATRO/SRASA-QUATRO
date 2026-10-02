"use client";

import { VoxelRoad } from "./VoxelRoad";
import { VoxelScenery } from "./VoxelScenery";
import { WorkplaceBuilding } from "./WorkplaceBuilding";
import { VoxelPortal } from "./VoxelPortal";

interface WorldEnvironmentProps {
  dayNumber?: number;
}

export function WorldEnvironment({ dayNumber = 1 }: WorldEnvironmentProps) {
  return (
    <group>
      <VoxelRoad />
      <VoxelScenery dayNumber={dayNumber} />
      <WorkplaceBuilding dayNumber={dayNumber} />
      <VoxelPortal isActive={dayNumber === 3} />
    </group>
  );
}
