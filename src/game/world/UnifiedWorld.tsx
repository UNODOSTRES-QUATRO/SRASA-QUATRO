"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HouseInterior } from "./HouseInterior";
import { WorkplaceInterior } from "./WorkplaceInterior";
import { MechanicShopScene } from "./MechanicShopScene";
import { CastleExteriorScene } from "./CastleExteriorScene";
import { CastleEscapeRoomScene } from "./CastleEscapeRoomScene";
import { QuatroMesh } from "../vehicle/QuatroMesh";
import { VehicleState, CameraMode } from "../vehicle/vehicleTypes";
import { AstralMonsterSystem } from "../character/AstralEntity";
import { RumahState, WorkplaceState, KastilState } from "../core/gameStore";

interface UnifiedWorldProps {
  playerMode: "ON_FOOT" | "DRIVING";
  humanPos: [number, number, number];
  humanHeading: number;
  vehicleState: VehicleState;
  vehicleStateRef?: React.MutableRefObject<VehicleState>;
  dayNumber: number;
  rumahState: RumahState;
  workplaceState: WorkplaceState;
  kastilState: KastilState;
  isEvening: boolean;
  isAttacking: boolean;
  activeWeaponId: string;
  weaponStateRef?: React.MutableRefObject<any>;
  humanPosRef?: React.MutableRefObject<{ x: number; y: number; z: number; heading: number }>;
  cameraMode?: CameraMode;
}

export function UnifiedWorld({
  playerMode,
  humanPos,
  humanHeading,
  vehicleState,
  vehicleStateRef,
  dayNumber,
  rumahState,
  workplaceState,
  kastilState,
  isEvening,
  isAttacking,
  activeWeaponId,
  weaponStateRef,
  humanPosRef,
  cameraMode,
}: UnifiedWorldProps) {
  // Roadway parameters
  const roadLength = 340; // From Z = -100 to Z = 240
  const roadCenterZ = 70;

  // Segmented guardrails & curbs for seamless driveway access
  // Right side openings:
  // - Home Driveway: Z = -60 to -44
  // - Office Parking: Z = 58 to 82
  // - Outskirts/Torii: Z = 120 to 240
  const rightRailSegments = [
    { startZ: -100, endZ: -60 }, // 40m
    { startZ: -44, endZ: 58 },   // 102m
    { startZ: 82, endZ: 120 },   // 38m
  ];

  // Left side openings:
  // - Bengkel Apron: Z = -14 to 14
  // - Outskirts/Torii: Z = 120 to 240
  const leftRailSegments = [
    { startZ: -100, endZ: -14 }, // 86m
    { startZ: 14, endZ: 120 },   // 106m
  ];

  return (
    <group>
      {/* ========================================================
          1. CONTINUOUS CENTRAL HIGHWAY & ROAD NETWORK
          ======================================================== */}
      {/* Main Asphalt Road (2-Lane Highway from Z = -100 to 240) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, roadCenterZ]}
        receiveShadow
      >
        <planeGeometry args={[14, roadLength]} />
        <meshStandardMaterial color="#262d3d" roughness={0.82} />
      </mesh>

      {/* Segmented Curbs - Left Side */}
      {leftRailSegments.map((seg, i) => {
        const len = seg.endZ - seg.startZ;
        const cz = (seg.startZ + seg.endZ) / 2;
        return (
          <mesh key={`curb-l-${i}`} position={[-7.2, 0.08, cz]} receiveShadow>
            <boxGeometry args={[0.5, 0.18, len]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
        );
      })}

      {/* Segmented Curbs - Right Side */}
      {rightRailSegments.map((seg, i) => {
        const len = seg.endZ - seg.startZ;
        const cz = (seg.startZ + seg.endZ) / 2;
        return (
          <mesh key={`curb-r-${i}`} position={[7.2, 0.08, cz]} receiveShadow>
            <boxGeometry args={[0.5, 0.18, len]} />
            <meshStandardMaterial color="#475569" roughness={0.9} />
          </mesh>
        );
      })}

      {/* Segmented Highway Guardrails with Posts - Left Side */}
      {leftRailSegments.map((seg, sIdx) => {
        const len = seg.endZ - seg.startZ;
        const cz = (seg.startZ + seg.endZ) / 2;
        const numPosts = Math.max(2, Math.floor(len / 8));
        return (
          <group key={`guardrail-l-${sIdx}`}>
            <mesh position={[-7.8, 0.55, cz]}>
              <boxGeometry args={[0.08, 0.32, len]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.3} />
            </mesh>
            {Array.from({ length: numPosts }).map((_, pIdx) => (
              <mesh
                key={`post-l-${sIdx}-${pIdx}`}
                position={[-7.8, 0.28, seg.startZ + (pIdx * len) / (numPosts - 1)]}
              >
                <boxGeometry args={[0.12, 0.58, 0.12]} />
                <meshStandardMaterial color="#334155" metalness={0.6} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Segmented Highway Guardrails with Posts - Right Side */}
      {rightRailSegments.map((seg, sIdx) => {
        const len = seg.endZ - seg.startZ;
        const cz = (seg.startZ + seg.endZ) / 2;
        const numPosts = Math.max(2, Math.floor(len / 8));
        return (
          <group key={`guardrail-r-${sIdx}`}>
            <mesh position={[7.8, 0.55, cz]}>
              <boxGeometry args={[0.08, 0.32, len]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.3} />
            </mesh>
            {Array.from({ length: numPosts }).map((_, pIdx) => (
              <mesh
                key={`post-r-${sIdx}-${pIdx}`}
                position={[7.8, 0.28, seg.startZ + (pIdx * len) / (numPosts - 1)]}
              >
                <boxGeometry args={[0.12, 0.58, 0.12]} />
                <meshStandardMaterial color="#334155" metalness={0.6} />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Road Center Dashed Yellow Stripes */}
      {Array.from({ length: 42 }).map((_, i) => (
        <mesh
          key={`center-stripe-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.015, -100 + i * 8 + 4]}
        >
          <planeGeometry args={[0.26, 4.5]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}

      {/* Outer White Lane Edge Lines */}
      {[-5.8, 5.8].map((lx, li) => (
        <mesh
          key={`edge-line-${li}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lx, 0.012, roadCenterZ]}
        >
          <planeGeometry args={[0.18, roadLength]} />
          <meshBasicMaterial color="#e2e8f0" transparent opacity={0.75} />
        </mesh>
      ))}

      {/* Aesthetic Roadside Directional Signs */}
      {/* 1. Home Exit Sign */}
      <group position={[8.5, 0, -62]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 3.0]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.7, 0]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[1.8, 0.7, 0.08]} />
          <meshStandardMaterial color="#065f46" roughness={0.4} />
        </mesh>
      </group>

      {/* 2. Bengkel Exit Sign */}
      <group position={[-8.5, 0, -16]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 3.0]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.7, 0]} rotation={[0, 0.2, 0]}>
          <boxGeometry args={[2.0, 0.7, 0.08]} />
          <meshStandardMaterial color="#991b1b" roughness={0.4} />
        </mesh>
      </group>

      {/* 3. Office Exit Sign */}
      <group position={[8.5, 0, 54]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 3.0]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 2.7, 0]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[2.0, 0.7, 0.08]} />
          <meshStandardMaterial color="#1e40af" roughness={0.4} />
        </mesh>
      </group>

      {/* Streetlamps along highway */}
      {Array.from({ length: 18 }).map((_, lIdx) => {
        const zPos = -90 + lIdx * 18;
        const sideX = lIdx % 2 === 0 ? -9.5 : 9.5;
        const isLeft = sideX < 0;
        return (
          <group key={`lamp-${lIdx}`} position={[sideX, 0, zPos]}>
            {/* Pole */}
            <mesh position={[0, 2.8, 0]}>
              <cylinderGeometry args={[0.08, 0.12, 5.6]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} />
            </mesh>
            {/* Curved Arm over road */}
            <mesh position={[isLeft ? 0.9 : -0.9, 5.4, 0]} rotation={[0, 0, isLeft ? -0.4 : 0.4]}>
              <cylinderGeometry args={[0.06, 0.06, 2.0]} />
              <meshStandardMaterial color="#1e293b" />
            </mesh>
            {/* Lamp Head */}
            <mesh position={[isLeft ? 1.7 : -1.7, 5.1, 0]}>
              <boxGeometry args={[0.45, 0.16, 0.28]} />
              <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={2.2} />
            </mesh>
            <pointLight
              position={[isLeft ? 1.7 : -1.7, 4.8, 0]}
              color="#fef08a"
              intensity={2.8}
              distance={16}
              decay={2}
            />
          </group>
        );
      })}

      {/* Endless Natural Landscape & Surrounding Foothills */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, roadCenterZ]} receiveShadow>
        <planeGeometry args={[260, roadLength + 80]} />
        <meshStandardMaterial color="#15241b" roughness={0.95} />
      </mesh>

      {/* Surrounding Mountain Silhouettes in Horizon */}
      {[-70, -35, 35, 70].map((mx, mi) => (
        <mesh key={`bg-mtn-${mi}`} position={[mx, 12, 230]}>
          <coneGeometry args={[35, 26, 5]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
      ))}

      {/* ========================================================
          2. LOCATION 1: COZY HOME (RUMAH) AT [X = 20, Z = -60]
          ======================================================== */}
      {/* Driveway connecting Home to Highway */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[13.5, -0.005, -52]}
        receiveShadow
      >
        <planeGeometry args={[13, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>

      {/* Home Structure Exterior & Interior */}
      <group position={[20, 0, -60]}>
        {/* Exterior Foundation Pavement */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
          <planeGeometry args={[14, 14]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        {/* Exterior Siding & Roof */}
        <mesh position={[0, 4.2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[8.5, 3.2, 4]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
        {/* Porch Columns & Welcome Porch */}
        <mesh position={[-2.2, 1.8, 5.2]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 3.6]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
        <mesh position={[2.2, 1.8, 5.2]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 3.6]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>

        {/* Home Interior Layout (Bed, Stove, Dining, Shower) */}
        <HouseInterior
          rumahState={rumahState}
          dayNumber={dayNumber}
          playerPos={humanPos}
          isEvening={isEvening}
        />
      </group>

      {/* ========================================================
          3. LOCATION 2: MECHANIC SHOP (BENGKEL) AT [X = -18, Z = 0]
          ======================================================== */}
      {/* Paved Garage Apron connecting Shop to Highway */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-12, -0.005, 0]}
        receiveShadow
      >
        <planeGeometry args={[12, 22]} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>
      {/* Shop Entrance Sign */}
      <group position={[-11, 0, 8]}>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3.0]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        <mesh position={[0, 2.8, 0]}>
          <boxGeometry args={[1.8, 0.65, 0.1]} />
          <meshStandardMaterial color="#dc2626" emissive="#b91c1c" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Mechanic Shop Interior & Pak Montir */}
      <group position={[-18, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <MechanicShopScene playerPos={humanPos} />
      </group>

      {/* ========================================================
          4. LOCATION 3: TECH WORKPLACE (TEMPAT KERJA) AT [X = 18, Z = 70]
          ======================================================== */}
      {/* Parking Lot Apron with Yellow Painted Bays */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[12, -0.005, 70]}
        receiveShadow
      >
        <planeGeometry args={[12, 24]} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>
      {/* Yellow Parking Bays */}
      {[-8, -4, 0, 4, 8].map((pz, pi) => (
        <mesh
          key={`parking-bay-${pi}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[11, 0.015, 70 + pz]}
        >
          <planeGeometry args={[6.5, 0.16]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}

      {/* Office Building Exterior & Modern Entrance */}
      <group position={[18, 0, 70]}>
        {/* Exterior Building Upper Shell */}
        <mesh position={[0, 7.5, 0]} castShadow>
          <boxGeometry args={[16, 7.0, 16]} />
          <meshStandardMaterial color={dayNumber === 3 ? "#1e293b" : "#334155"} roughness={0.7} />
        </mesh>
        {/* Warm Window Glow on Upper Floors */}
        {[-4, 0, 4].map((wz, wi) => (
          <mesh key={`win-${wi}`} position={[-8.05, 8.5, wz]}>
            <boxGeometry args={[0.1, 2.0, 2.5]} />
            <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.5} />
          </mesh>
        ))}

        {/* Full Interactive Workplace Interior (Workstations, PCs, Semicolon Portal) */}
        <WorkplaceInterior
          workplaceState={workplaceState}
          dayNumber={dayNumber}
          playerPos={humanPos}
        />
      </group>

      {/* ========================================================
          5. LOCATION 4: CYBER ALLEYWAY & CASTLE OUTSKIRTS (Z = 130 to 220)
          ======================================================== */}
      {/* Glowing Cyber Torii & Archways leading into Mystical Realm */}
      {[-8, 8].map((tx, ti) => (
        <group key={`torii-${ti}`} position={[tx, 0, 125]}>
          <mesh position={[0, 3.2, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 6.4]} />
            <meshStandardMaterial color="#1e1b4b" emissive="#4338ca" emissiveIntensity={0.6} />
          </mesh>
          <pointLight color="#818cf8" intensity={2.5} distance={10} />
        </group>
      ))}
      {/* Torii Crossbeam */}
      <mesh position={[0, 6.0, 125]}>
        <boxGeometry args={[18, 0.5, 0.8]} />
        <meshStandardMaterial color="#4338ca" emissive="#6366f1" emissiveIntensity={1.2} />
      </mesh>

      {/* Castle Grounds & Courtyard (Jeffrey, Vespera, Barnaby, Fountain, Keep Door) */}
      <group position={[0, 0, 180]}>
        <CastleExteriorScene
          kastilState={kastilState}
          playerPos={humanPos}
        />
      </group>

      {/* Castle Great Keep Hall / Escape Room physically inside the Fortress (Z = 205) */}
      <group position={[0, 0, 205]} rotation={[0, Math.PI, 0]}>
        <CastleEscapeRoomScene
          escapeRoomState={kastilState.escapeRoom}
          playerPos={humanPos}
        />
      </group>

      {/* ========================================================
          6. PEACEFUL ASTRAL MONSTERS SYSTEM (OUTSKIRTS & FIELDS)
          ======================================================== */}
      <AstralMonsterSystem
        playerPos={humanPos}
        humanPosRef={humanPosRef}
        isAttacking={isAttacking}
        weaponType={activeWeaponId}
        weaponStateRef={weaponStateRef}
        playerMode={playerMode}
        vehicleStateRef={vehicleStateRef}
      />

      {/* ========================================================
          7. THE QUATRO VEHICLE IN CONTINUOUS WORLD
          ======================================================== */}
      {/* Render the car at its actual world coordinate */}
      <QuatroMesh
        vehicleState={vehicleState}
        vehicleStateRef={vehicleStateRef}
        isCatAlert={dayNumber >= 2}
        isCockpit={playerMode === "DRIVING" && cameraMode === "COCKPIT"}
      />

      {/* Car Headlights Beams cast into continuous world */}
      <CarHeadlights
        vehicleState={vehicleState}
        vehicleStateRef={vehicleStateRef}
        playerMode={playerMode}
      />
    </group>
  );
}

function CarHeadlights({
  vehicleState,
  vehicleStateRef,
  playerMode,
}: {
  vehicleState: VehicleState;
  vehicleStateRef?: React.MutableRefObject<VehicleState>;
  playerMode: "ON_FOOT" | "DRIVING";
}) {
  const leftLightRef = useRef<THREE.SpotLight>(null);
  const rightLightRef = useRef<THREE.SpotLight>(null);
  const leftTargetRef = useRef<THREE.Object3D>(null);
  const rightTargetRef = useRef<THREE.Object3D>(null);

  useFrame(() => {
    const live = vehicleStateRef?.current ?? vehicleState;
    const sinH = Math.sin(live.heading);
    const cosH = Math.cos(live.heading);

    // Front bumper forward offset (1.8m)
    const forwardX = live.position.x + sinH * 1.8;
    const forwardZ = live.position.z + cosH * 1.8;

    // Perpendicular vector for left/right lateral offset (0.52m)
    const lateralX = cosH * 0.52;
    const lateralZ = -sinH * 0.52;

    const leftX = forwardX - lateralX;
    const leftZ = forwardZ - lateralZ;
    const rightX = forwardX + lateralX;
    const rightZ = forwardZ + lateralZ;

    if (leftLightRef.current) {
      leftLightRef.current.position.set(leftX, live.position.y + 0.52, leftZ);
    }
    if (rightLightRef.current) {
      rightLightRef.current.position.set(rightX, live.position.y + 0.52, rightZ);
    }

    if (leftTargetRef.current) {
      leftTargetRef.current.position.set(leftX + sinH * 38, 0, leftZ + cosH * 38);
      leftTargetRef.current.updateMatrixWorld();
    }
    if (rightTargetRef.current) {
      rightTargetRef.current.position.set(rightX + sinH * 38, 0, rightZ + cosH * 38);
      rightTargetRef.current.updateMatrixWorld();
    }
  }, 1);

  const intensity = playerMode === "DRIVING" ? 6.5 : 2.5;

  return (
    <>
      <object3D ref={leftTargetRef} position={[vehicleState.position.x - 0.5, 0, vehicleState.position.z + 35]} />
      <object3D ref={rightTargetRef} position={[vehicleState.position.x + 0.5, 0, vehicleState.position.z + 35]} />
      <spotLight
        ref={leftLightRef}
        target={leftTargetRef.current ?? undefined}
        color="#fffbeb"
        intensity={intensity}
        angle={0.42}
        penumbra={0.6}
        distance={60}
      />
      <spotLight
        ref={rightLightRef}
        target={rightTargetRef.current ?? undefined}
        color="#fffbeb"
        intensity={intensity}
        angle={0.42}
        penumbra={0.6}
        distance={60}
      />
    </>
  );
}
