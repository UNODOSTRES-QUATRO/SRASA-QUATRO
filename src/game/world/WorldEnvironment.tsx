"use client";

import { VoxelRoad } from "./VoxelRoad";
import { VoxelScenery } from "./VoxelScenery";

export function WorldEnvironment() {
  return (
    <group>
      <VoxelRoad />
      <VoxelScenery />
    </group>
  );
}
