"use client";

import { VoxelRoad } from "./VoxelRoad";
import { VoxelScenery } from "./VoxelScenery";
import { WorkplaceBuilding } from "./WorkplaceBuilding";
import { VoxelPortal } from "./VoxelPortal";
import { CastleCourtyard } from "./CastleCourtyard";
import { TheGuardian } from "../character/TheGuardian";

interface WorldEnvironmentProps {
  dayNumber?: number;
  gateOpen?: boolean;
  puzzleSolved?: boolean;
}

export function WorldEnvironment({
  dayNumber = 1,
  gateOpen = false,
  puzzleSolved = false,
}: WorldEnvironmentProps) {
  return (
    <group>
      <VoxelRoad />
      <VoxelScenery dayNumber={dayNumber} />
      <WorkplaceBuilding dayNumber={dayNumber} />
      <VoxelPortal isActive={dayNumber === 3} />

      {/* Chapter 2 & 3: Castle Dimension (Visible on Day 3 or when exploring) */}
      {dayNumber === 3 && (
        <group>
          <CastleCourtyard gateOpen={gateOpen} puzzleSolved={puzzleSolved} />
          <TheGuardian position={[-3.8, 0, 131]} />
        </group>
      )}
    </group>
  );
}

