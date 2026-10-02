# Project Quatro — Web 3D Scaffolding & Core Experience Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the initial playable Web 3D prototype for Project Quatro featuring Next.js App Router, Three.js / React Three Fiber scene, a responsive driving vehicle with physical weight/inertia, a warm retro-voxel environment with golden hour lighting, a quiet diegetic HUD, and tactile audio feedback complying with PRD 01, PRD 02, and PRD 03.

**Architecture:** Modular separation between Next.js React UI layer and Game Runtime (`game/core`, `game/vehicle`, `game/world`, `game/audio`). Pure physics calculations are decoupled into unit-tested TypeScript functions, while R3F handles rendering, lighting, and camera tracking.

**Tech Stack:** Next.js (App Router), React 18/19, TypeScript, Tailwind CSS, Three.js, @react-three/fiber, @react-three/drei, Vitest (for physics & state unit tests), Web Audio API.

## Global Constraints

- Platform: Desktop & Laptop Web with responsive canvas sizing (PRD 03 Section 1).
- Client handles experience; state classification separates ephemeral frame state from persistent session state (PRD 03 Section 2 & 7).
- Visual Aesthetics: Retro-warmth, stylized micro-voxel, golden hour lighting (`#ffe2a0` directional, `#8ca5b5` ambient, `#fbf8f2` warm cream highlights), matte/papery shaders (PRD 02 Section 5, 7, 9, 10).
- Quiet Interface (Zero UI): No noisy HUD spam, contextual interaction prompt `✦ [Object]`, analog dashboard dials, paper notebook pause menu (PRD 02 Section 14, 15, 16, 39).
- Satisfying Movement: Steering with weight, acceleration, braking, friction damping, physical satisfaction (PRD 01 Section 2.3 & PRD 02 Section 21).
- Soundscape: Analog warmth, pitch-scaled engine hum, soft tactile clicks, optional lo-fi ambient texture (PRD 02 Section 24, 26, 41).

---

### Task 1: Next.js Foundation & TypeScript Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Test: `npm run build`

**Interfaces:**
- Produces: Base Next.js App Router project structure, custom Tailwind warm color palette tokens (`quatro-cream`, `quatro-amber`, `quatro-navy`, `quatro-gray`, `quatro-wood`), and global layout with viewport meta.

- [ ] **Step 1: Bootstrap Next.js with TypeScript and Tailwind CSS**

Initialize the application dependencies in `package.json`:

```json
{
  "name": "srasa-quatro",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.169.0",
    "@react-three/fiber": "^8.17.10",
    "@react-three/drei": "^9.114.3",
    "lucide-react": "^0.453.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4"
  },
  "devDependencies": {
    "@types/node": "^20.16.11",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/three": "^0.169.0",
    "typescript": "^5.6.3",
    "tailwindcss": "^3.4.14",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20",
    "vitest": "^2.1.3"
  }
}
```

- [ ] **Step 2: Configure TypeScript (`tsconfig.json`)**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Configure Tailwind CSS with PRD 02 Color Palette (`tailwind.config.ts` & `postcss.config.mjs`)**

`postcss.config.mjs`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`tailwind.config.ts`:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/game/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        quatro: {
          cream: "#fbf8f2",
          paper: "#f3ede2",
          amber: "#e09f58",
          warmOrange: "#d97736",
          navy: "#1a1e29",
          slate: "#2a3142",
          mutedGreen: "#6b8c6e",
          dustyBlue: "#7994a6",
          darkWood: "#3a261a",
          softGray: "#e5e0d8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: Create Global Styles & Root Layout (`src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`)**

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary: #1a1e29;
  --text-primary: #fbf8f2;
}

body {
  margin: 0;
  padding: 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
  user-select: none;
  -webkit-font-smoothing: antialiased;
}

/* Custom scrollbars and low-cortisol aesthetics */
* {
  box-sizing: border-box;
}
```

`src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Quatro — A Cozy Narrative Driving Experience",
  description: "A small, warm world where something strange is happening — and the player is allowed to simply be there.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-quatro-navy text-quatro-cream min-h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
```

`src/app/page.tsx`:
```tsx
import dynamic from "next/dynamic";

const ProjectQuatroApp = dynamic(
  () => import("@/components/game/ProjectQuatroApp"),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-quatro-navy">
      <ProjectQuatroApp />
    </main>
  );
}
```

- [ ] **Step 5: Run npm install and verify compilation**

Run: `npm install && npm run build`
Expected: Build passes successfully.

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json tailwind.config.ts postcss.config.mjs src/
git commit -m "feat(scaffold): initialize Next.js app with Tailwind and PRD 02 color tokens"
```

---

### Task 2: Vehicle Physics Simulation & Unit Tests

**Files:**
- Create: `src/game/vehicle/vehicleTypes.ts`
- Create: `src/game/vehicle/vehiclePhysics.ts`
- Create: `tests/vehiclePhysics.test.ts`
- Test: `npm test`

**Interfaces:**
- Consumes: User raw keyboard input (`forward`, `backward`, `left`, `right`, `brake`, `drift`).
- Produces: `updateVehiclePhysics(state, input, deltaSeconds): VehicleState` (pure function producing updated position, rotation, speed, steering angle, and wheel angles).

- [ ] **Step 1: Write failing unit tests for vehicle physics (`tests/vehiclePhysics.test.ts`)**

```typescript
import { describe, it, expect } from "vitest";
import {
  createInitialVehicleState,
  updateVehiclePhysics,
  DEFAULT_VEHICLE_CONFIG,
} from "../src/game/vehicle/vehiclePhysics";
import { VehicleInput } from "../src/game/vehicle/vehicleTypes";

describe("Vehicle Physics Engine", () => {
  it("should initialize vehicle at rest", () => {
    const state = createInitialVehicleState();
    expect(state.speed).toBe(0);
    expect(state.position).toEqual({ x: 0, y: 0, z: 0 });
    expect(state.heading).toBe(0);
  });

  it("should accelerate forward when forward input is active", () => {
    const state = createInitialVehicleState();
    const input: VehicleInput = {
      forward: true,
      backward: false,
      left: false,
      right: false,
      brake: false,
    };
    const nextState = updateVehiclePhysics(state, input, 0.1, DEFAULT_VEHICLE_CONFIG);
    expect(nextState.speed).toBeGreaterThan(0);
    expect(nextState.speed).toBeLessThanOrEqual(DEFAULT_VEHICLE_CONFIG.maxSpeed);
  });

  it("should decelerate due to drag when no input is pressed", () => {
    const state = { ...createInitialVehicleState(), speed: 10 };
    const input: VehicleInput = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: false,
    };
    const nextState = updateVehiclePhysics(state, input, 0.1, DEFAULT_VEHICLE_CONFIG);
    expect(nextState.speed).toBeLessThan(10);
  });

  it("should steer with inertia and change heading when moving", () => {
    const state = { ...createInitialVehicleState(), speed: 5 };
    const input: VehicleInput = {
      forward: true,
      backward: false,
      left: true,
      right: false,
      brake: false,
    };
    const nextState = updateVehiclePhysics(state, input, 0.1, DEFAULT_VEHICLE_CONFIG);
    expect(nextState.steeringAngle).toBeGreaterThan(0);
    expect(nextState.heading).not.toBe(0);
  });

  it("should brake effectively when brake input is active", () => {
    const state = { ...createInitialVehicleState(), speed: 8 };
    const input: VehicleInput = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      brake: true,
    };
    const nextState = updateVehiclePhysics(state, input, 0.1, DEFAULT_VEHICLE_CONFIG);
    expect(nextState.speed).toBeLessThan(8);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/vehiclePhysics.test.ts`
Expected: FAIL (Cannot find module).

- [ ] **Step 3: Implement vehicle types and pure physics module (`src/game/vehicle/vehicleTypes.ts` & `src/game/vehicle/vehiclePhysics.ts`)**

`src/game/vehicle/vehicleTypes.ts`:
```typescript
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface VehicleInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
}

export interface VehicleConfig {
  maxSpeed: number;
  maxReverseSpeed: number;
  acceleration: number;
  reverseAcceleration: number;
  brakingDeceleration: number;
  naturalDrag: number;
  maxSteerAngle: number; // in radians
  steerSpeed: number;
  steerReturnSpeed: number;
  wheelbase: number;
}

export interface VehicleState {
  position: Vector3D;
  heading: number; // yaw angle in radians
  speed: number;   // units per second
  steeringAngle: number; // current front wheel turn angle
  wheelRotation: number; // spinning wheel angle
  isReversing: boolean;
  driftFactor: number;
}
```

`src/game/vehicle/vehiclePhysics.ts`:
```typescript
import { VehicleConfig, VehicleInput, VehicleState } from "./vehicleTypes";

export const DEFAULT_VEHICLE_CONFIG: VehicleConfig = {
  maxSpeed: 18.0,
  maxReverseSpeed: 6.0,
  acceleration: 10.0,
  reverseAcceleration: 5.0,
  brakingDeceleration: 18.0,
  naturalDrag: 3.5,
  maxSteerAngle: Math.PI / 6, // 30 degrees
  steerSpeed: 4.0,
  steerReturnSpeed: 6.0,
  wheelbase: 2.2,
};

export function createInitialVehicleState(): VehicleState {
  return {
    position: { x: 0, y: 0.35, z: 0 },
    heading: 0,
    speed: 0,
    steeringAngle: 0,
    wheelRotation: 0,
    isReversing: false,
    driftFactor: 0,
  };
}

export function updateVehiclePhysics(
  current: VehicleState,
  input: VehicleInput,
  dt: number,
  config: VehicleConfig = DEFAULT_VEHICLE_CONFIG
): VehicleState {
  const clampedDt = Math.min(dt, 0.1); // Avoid huge delta spikes
  let { speed, heading, steeringAngle, wheelRotation } = current;
  const position = { ...current.position };

  // 1. Calculate steering angle
  let targetSteer = 0;
  if (input.left) targetSteer += config.maxSteerAngle;
  if (input.right) targetSteer -= config.maxSteerAngle;

  if (targetSteer !== 0) {
    const steerRate = config.steerSpeed * clampedDt;
    if (steeringAngle < targetSteer) {
      steeringAngle = Math.min(targetSteer, steeringAngle + steerRate);
    } else {
      steeringAngle = Math.max(targetSteer, steeringAngle - steerRate);
    }
  } else {
    // Return steer to center
    const returnRate = config.steerReturnSpeed * clampedDt;
    if (Math.abs(steeringAngle) <= returnRate) {
      steeringAngle = 0;
    } else if (steeringAngle > 0) {
      steeringAngle -= returnRate;
    } else {
      steeringAngle += returnRate;
    }
  }

  // 2. Acceleration / Braking / Drag
  if (input.brake) {
    if (speed > 0) {
      speed = Math.max(0, speed - config.brakingDeceleration * clampedDt);
    } else if (speed < 0) {
      speed = Math.min(0, speed + config.brakingDeceleration * clampedDt);
    }
  } else if (input.forward) {
    if (speed < 0) {
      speed += config.brakingDeceleration * clampedDt;
    } else {
      speed = Math.min(config.maxSpeed, speed + config.acceleration * clampedDt);
    }
  } else if (input.backward) {
    if (speed > 0) {
      speed -= config.brakingDeceleration * clampedDt;
    } else {
      speed = Math.max(-config.maxReverseSpeed, speed - config.reverseAcceleration * clampedDt);
    }
  } else {
    // Natural friction drag
    const drag = config.naturalDrag * clampedDt;
    if (Math.abs(speed) <= drag) {
      speed = 0;
    } else if (speed > 0) {
      speed -= drag;
    } else {
      speed += drag;
    }
  }

  // 3. Bicycle kinematics model for smooth vehicle turning
  if (Math.abs(speed) > 0.05) {
    const angularVelocity = (speed / config.wheelbase) * Math.tan(steeringAngle);
    heading += angularVelocity * clampedDt;
  }

  // 4. Update Position
  const moveDistance = speed * clampedDt;
  position.x += Math.sin(heading) * moveDistance;
  position.z += Math.cos(heading) * moveDistance;

  // 5. Update Wheel spin
  wheelRotation += (speed / 0.35) * clampedDt;

  return {
    position,
    heading,
    speed,
    steeringAngle,
    wheelRotation,
    isReversing: speed < -0.1,
    driftFactor: Math.abs(steeringAngle) * (Math.abs(speed) / config.maxSpeed),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/vehiclePhysics.test.ts`
Expected: PASS (All 5 tests pass).

- [ ] **Step 5: Commit**

```bash
git add src/game/vehicle/ tests/vehiclePhysics.test.ts
git commit -m "feat(vehicle): implement vehicle physics simulation with unit test suite"
```

---

### Task 3: 3D Runtime, Golden Hour Lighting & Quatro Model Component

**Files:**
- Create: `src/components/game/GameCanvas.tsx`
- Create: `src/components/game/SceneLighting.tsx`
- Create: `src/game/vehicle/QuatroMesh.tsx`
- Create: `src/game/camera/FollowCamera.tsx`

**Interfaces:**
- Consumes: `VehicleState` from Game Loop.
- Produces: R3F Canvas with configured tone mapping, golden hour directional light + warm shadows, stylized low-poly Quatro vehicle model, and smooth third-person following camera.

- [ ] **Step 1: Create Golden Hour Scene Lighting (`src/components/game/SceneLighting.tsx`)**

Conforms to PRD 02 Section 9 & 10:
```tsx
"use client";

import { useRef } from "react";
import * as THREE from "three";

export function SceneLighting() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      {/* Warm ambient base: soft blue-grey dusk sky tone */}
      <ambientLight color="#8ca5b5" intensity={0.5} />

      {/* Low-angle Golden Hour Directional Sunlight */}
      <directionalLight
        ref={dirLightRef}
        color="#ffe2a0"
        intensity={1.8}
        position={[40, 25, -30]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0005}
      />

      {/* Gentle upward bounce light simulating warm asphalt/ground radiation */}
      <hemisphereLight
        args={["#ffe2a0", "#3a261a", 0.4]}
      />

      {/* Atmospheric dusk fog */}
      <fog attach="fog" args={["#242b3b", 30, 95]} />
    </>
  );
}
```

- [ ] **Step 2: Build Stylized Quatro Car 3D Model (`src/game/vehicle/QuatroMesh.tsx`)**

Handcrafted micro-voxel car complying with PRD 01 & PRD 02 (tactile, friendly proportions, warm retro vibe, front wheels steer and rotate):

```tsx
"use client";

import { useRef } from "react";
import * as THREE from "three";
import { VehicleState } from "./vehicleTypes";

interface QuatroMeshProps {
  vehicleState: VehicleState;
}

export function QuatroMesh({ vehicleState }: QuatroMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const frontLeftWheelRef = useRef<THREE.Group>(null);
  const frontRightWheelRef = useRef<THREE.Group>(null);
  const rearLeftWheelRef = useRef<THREE.Mesh>(null);
  const rearRightWheelRef = useRef<THREE.Mesh>(null);

  const { position, heading, steeringAngle, wheelRotation } = vehicleState;

  // Wheel dimensions
  const wheelRadius = 0.32;
  const wheelWidth = 0.22;

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={[0, heading, 0]}
    >
      {/* MAIN CAR CHASSIS / LOWER BODY */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.55, 3.4]} />
        <meshStandardMaterial
          color="#d97736" /* Warm vintage terracotta/orange */
          roughness={0.65}
          metalness={0.15}
        />
      </mesh>

      {/* CABIN / ROOF */}
      <mesh position={[0, 0.95, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.52, 1.8]} />
        <meshStandardMaterial
          color="#f3ede2" /* Warm cream cabin */
          roughness={0.7}
        />
      </mesh>

      {/* WINDSHIELD & WINDOWS (Tinted warm glass) */}
      <mesh position={[0, 0.93, 0.72]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1.32, 0.44, 0.05]} />
        <meshStandardMaterial
          color="#2a3848"
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* HEADLIGHTS (Warm amber glow) */}
      <mesh position={[0.6, 0.45, 1.71]}>
        <boxGeometry args={[0.28, 0.2, 0.06]} />
        <meshStandardMaterial
          color="#fff2c2"
          emissive="#ffe2a0"
          emissiveIntensity={1.2}
        />
      </mesh>
      <mesh position={[-0.6, 0.45, 1.71]}>
        <boxGeometry args={[0.28, 0.2, 0.06]} />
        <meshStandardMaterial
          color="#fff2c2"
          emissive="#ffe2a0"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* TAILLIGHTS (Warm red glow) */}
      <mesh position={[0.6, 0.48, -1.71]}>
        <boxGeometry args={[0.28, 0.16, 0.06]} />
        <meshStandardMaterial
          color="#a83232"
          emissive="#e63946"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[-0.6, 0.48, -1.71]}>
        <boxGeometry args={[0.28, 0.16, 0.06]} />
        <meshStandardMaterial
          color="#a83232"
          emissive="#e63946"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* FRONT LEFT WHEEL (With steering pivot) */}
      <group
        ref={frontLeftWheelRef}
        position={[0.88, 0.1, 1.1]}
        rotation={[0, steeringAngle, 0]}
      >
        <mesh rotation={[wheelRotation, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
          <meshStandardMaterial color="#1e2029" roughness={0.85} />
        </mesh>
      </group>

      {/* FRONT RIGHT WHEEL (With steering pivot) */}
      <group
        ref={frontRightWheelRef}
        position={[-0.88, 0.1, 1.1]}
        rotation={[0, steeringAngle, 0]}
      >
        <mesh rotation={[wheelRotation, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
          <meshStandardMaterial color="#1e2029" roughness={0.85} />
        </mesh>
      </group>

      {/* REAR LEFT WHEEL */}
      <mesh
        ref={rearLeftWheelRef}
        position={[0.88, 0.1, -1.1]}
        rotation={[wheelRotation, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
        <meshStandardMaterial color="#1e2029" roughness={0.85} />
      </mesh>

      {/* REAR RIGHT WHEEL */}
      <mesh
        ref={rearRightWheelRef}
        position={[-0.88, 0.1, -1.1]}
        rotation={[wheelRotation, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
        <meshStandardMaterial color="#1e2029" roughness={0.85} />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 3: Build Smooth Follow Camera (`src/game/camera/FollowCamera.tsx`)**

Weighted third-person follow camera complying with PRD 02 Section 20:

```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { VehicleState } from "../vehicle/vehicleTypes";

interface FollowCameraProps {
  vehicleState: VehicleState;
}

export function FollowCamera({ vehicleState }: FollowCameraProps) {
  const currentPos = new THREE.Vector3();
  const currentLookAt = new THREE.Vector3();

  useFrame((state, delta) => {
    const { position, heading, speed } = vehicleState;

    // Follow distance & height with dynamic pull-back at higher speeds
    const speedRatio = Math.min(1, Math.abs(speed) / 18);
    const cameraDistance = 7.5 + speedRatio * 1.5;
    const cameraHeight = 3.6 + speedRatio * 0.4;

    // Desired camera target behind vehicle
    const targetX = position.x - Math.sin(heading) * cameraDistance;
    const targetY = position.y + cameraHeight;
    const targetZ = position.z - Math.cos(heading) * cameraDistance;

    // Look at slightly ahead of the car
    const lookAheadX = position.x + Math.sin(heading) * 2.0;
    const lookAheadY = position.y + 0.8;
    const lookAheadZ = position.z + Math.cos(heading) * 2.0;

    // Smooth dampening
    const lerpFactor = Math.min(1, delta * 4.5);
    state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), lerpFactor);

    currentLookAt.lerp(new THREE.Vector3(lookAheadX, lookAheadY, lookAheadZ), lerpFactor);
    state.camera.lookAt(currentLookAt);
  });

  return null;
}
```

- [ ] **Step 4: Create Game Canvas Container (`src/components/game/GameCanvas.tsx`)**

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { SceneLighting } from "./SceneLighting";
import { QuatroMesh } from "@/game/vehicle/QuatroMesh";
import { FollowCamera } from "@/game/camera/FollowCamera";
import { VehicleState } from "@/game/vehicle/vehicleTypes";

interface GameCanvasProps {
  vehicleState: VehicleState;
  children?: React.ReactNode;
}

export function GameCanvas({ vehicleState, children }: GameCanvasProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 4, -8], fov: 50, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      className="w-full h-full"
    >
      <SceneLighting />
      <QuatroMesh vehicleState={vehicleState} />
      <FollowCamera vehicleState={vehicleState} />
      {children}
    </Canvas>
  );
}
```

- [ ] **Step 5: Verify build with canvas components**

Run: `npm run build`
Expected: Next.js builds cleanly with 3D components.

- [ ] **Step 6: Commit**

```bash
git add src/components/game/ src/game/vehicle/QuatroMesh.tsx src/game/camera/
git commit -m "feat(graphics): implement R3F canvas, golden hour lighting, Quatro mesh, and follow camera"
```

---

### Task 4: Tactile Voxel Environment & Road Scenery

**Files:**
- Create: `src/game/world/VoxelRoad.tsx`
- Create: `src/game/world/VoxelScenery.tsx`
- Create: `src/game/world/WorldEnvironment.tsx`

**Interfaces:**
- Produces: Warm asphalt/stone modular road with dashed center lines, low-poly roadside trees with autumn/amber foliage, nostalgic street lamps with warm glow (PRD 02 Section 4, 12, 23).

- [ ] **Step 1: Create Voxel Road Geometry (`src/game/world/VoxelRoad.tsx`)**

```tsx
"use client";

export function VoxelRoad() {
  const roadLength = 240;
  const roadWidth = 9;

  return (
    <group position={[0, -0.05, 0]}>
      {/* MAIN ROAD ASPHALT */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roadWidth, roadLength]} />
        <meshStandardMaterial
          color="#313745" /* Soft dark warm slate */
          roughness={0.88}
        />
      </mesh>

      {/* ROAD CURBS / EDGES (Left & Right) */}
      <mesh position={[-roadWidth / 2 - 0.25, 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.18, roadLength]} />
        <meshStandardMaterial color="#8a877f" roughness={0.9} />
      </mesh>
      <mesh position={[roadWidth / 2 + 0.25, 0.08, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.18, roadLength]} />
        <meshStandardMaterial color="#8a877f" roughness={0.9} />
      </mesh>

      {/* DASHED CENTER LANE LINES */}
      {Array.from({ length: 24 }).map((_, i) => {
        const zPos = -roadLength / 2 + i * 10 + 5;
        return (
          <mesh
            key={`centerline-${i}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, zPos]}
          >
            <planeGeometry args={[0.3, 4]} />
            <meshStandardMaterial color="#e5e0d8" roughness={0.6} />
          </mesh>
        );
      })}

      {/* EXPANSIVE GROUND GRASS/EARTH */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[260, roadLength]} />
        <meshStandardMaterial
          color="#3c4a3e" /* Muted moss green */
          roughness={0.95}
        />
      </mesh>
    </group>
  );
}
```

- [ ] **Step 2: Create Voxel Trees and Street Lamps (`src/game/world/VoxelScenery.tsx`)**

```tsx
"use client";

function VoxelTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* TRUNK */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 2.4, 0.6]} />
        <meshStandardMaterial color="#3a261a" roughness={0.9} />
      </mesh>
      {/* FOLIAGE LAYER 1 (Lower) */}
      <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 1.6, 2.4]} />
        <meshStandardMaterial color="#6b8c6e" roughness={0.8} />
      </mesh>
      {/* FOLIAGE LAYER 2 (Upper) */}
      <mesh position={[0, 4.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.2, 1.6]} />
        <meshStandardMaterial color="#82a37f" roughness={0.8} />
      </mesh>
    </group>
  );
}

function StreetLamp({ position, side }: { position: [number, number, number]; side: "left" | "right" }) {
  const armDirection = side === "left" ? 1 : -1;

  return (
    <group position={position}>
      {/* POLE */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 5, 8]} />
        <meshStandardMaterial color="#22252c" roughness={0.7} />
      </mesh>
      {/* HORIZONTAL ARM */}
      <mesh position={[armDirection * 0.4, 4.8, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 0.8, 8]} />
        <meshStandardMaterial color="#22252c" roughness={0.7} />
      </mesh>
      {/* LANTERN HOUSING */}
      <mesh position={[armDirection * 0.75, 4.6, 0]}>
        <boxGeometry args={[0.3, 0.25, 0.3]} />
        <meshStandardMaterial color="#1a1c22" />
      </mesh>
      {/* WARM LAMP BULB */}
      <mesh position={[armDirection * 0.75, 4.45, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial
          color="#fff2c2"
          emissive="#e09f58"
          emissiveIntensity={1.8}
        />
      </mesh>
      <pointLight
        position={[armDirection * 0.75, 4.3, 0]}
        color="#ffe2a0"
        intensity={2.0}
        distance={10}
        decay={2}
      />
    </group>
  );
}

export function VoxelScenery() {
  const treePositions: [number, number, number][] = [
    [-8, 0, -80], [-10, 0, -50], [-7.5, 0, -20], [-9, 0, 10], [-8, 0, 40], [-11, 0, 70],
    [8, 0, -75], [9.5, 0, -45], [8, 0, -10], [10, 0, 25], [7.5, 0, 55], [9, 0, 85],
  ];

  const lampPositions: Array<{ pos: [number, number, number]; side: "left" | "right" }> = [
    { pos: [-5.5, 0, -60], side: "left" },
    { pos: [5.5, 0, -30], side: "right" },
    { pos: [-5.5, 0, 0], side: "left" },
    { pos: [5.5, 0, 30], side: "right" },
    { pos: [-5.5, 0, 60], side: "left" },
  ];

  return (
    <group>
      {treePositions.map((pos, idx) => (
        <VoxelTree key={`tree-${idx}`} position={pos} />
      ))}
      {lampPositions.map((lamp, idx) => (
        <StreetLamp key={`lamp-${idx}`} position={lamp.pos} side={lamp.side} />
      ))}
    </group>
  );
}
```

- [ ] **Step 3: Combine into World Environment Container (`src/game/world/WorldEnvironment.tsx`)**

```tsx
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
```

- [ ] **Step 4: Commit**

```bash
git add src/game/world/
git commit -m "feat(world): add modular voxel road and atmospheric roadside scenery"
```

---

### Task 5: Quiet Diegetic UI (Zero UI / Minimalist HUD & Pause Experience)

**Files:**
- Create: `src/game/core/gameStore.ts`
- Create: `src/components/ui/QuietHUD.tsx`
- Create: `src/components/ui/PauseOverlay.tsx`
- Test: Vitest unit test for store state toggles

**Interfaces:**
- Consumes: Current `VehicleState`, `isPaused`, `currentPrompt`.
- Produces: Subdued analog speedometer gauge in lower-left, contextual interaction prompt, paper-textured pause modal.

- [ ] **Step 1: Create Game State Store (`src/game/core/gameStore.ts`)**

```typescript
export interface GameUIState {
  isPaused: boolean;
  isAudioMuted: boolean;
  activePrompt: string | null;
  dayNumber: number;
}

export function createInitialUIState(): GameUIState {
  return {
    isPaused: false,
    isAudioMuted: false,
    activePrompt: null,
    dayNumber: 1,
  };
}
```

- [ ] **Step 2: Build Quiet HUD Overlay (`src/components/ui/QuietHUD.tsx`)**

Conforms to PRD 02 Section 14, 15, 16 (fades when stationary, zero garish arcade popups):

```tsx
"use client";

import { VehicleState } from "@/game/vehicle/vehicleTypes";

interface QuietHUDProps {
  vehicleState: VehicleState;
  activePrompt: string | null;
  onOpenPause: () => void;
}

export function QuietHUD({ vehicleState, activePrompt, onOpenPause }: QuietHUDProps) {
  const kmh = Math.round(Math.abs(vehicleState.speed) * 3.6);
  const isMoving = Math.abs(vehicleState.speed) > 0.5;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 select-none">
      {/* Top Header: Subtle chapter indicator and pause button */}
      <div className="flex justify-between items-start">
        <div className="bg-quatro-navy/40 backdrop-blur-sm px-3 py-1.5 rounded border border-quatro-cream/10 text-xs tracking-widest text-quatro-cream/70 font-mono">
          PROJECT QUATRO • DAY 1 — THE ROUTINE
        </div>

        <button
          onClick={onOpenPause}
          className="pointer-events-auto bg-quatro-navy/50 hover:bg-quatro-navy/80 transition-colors px-3 py-1.5 rounded border border-quatro-cream/20 text-xs tracking-wider text-quatro-cream/80 font-mono cursor-pointer"
        >
          [ESC] PAUSE
        </button>
      </div>

      {/* Center Contextual Prompt */}
      {activePrompt && (
        <div className="self-center bg-quatro-navy/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-quatro-amber/40 shadow-lg flex items-center space-x-2 text-sm text-quatro-cream animate-fade-in">
          <span className="text-quatro-amber">✦</span>
          <span>{activePrompt}</span>
        </div>
      )}

      {/* Bottom Row: Minimalist tactile speed display & subtle driving hint */}
      <div className="flex justify-between items-end">
        <div
          className={`transition-opacity duration-700 bg-quatro-navy/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-quatro-cream/10 font-mono ${
            isMoving ? "opacity-90" : "opacity-35"
          }`}
        >
          <div className="text-xs text-quatro-cream/50 uppercase tracking-widest">Speed</div>
          <div className="text-2xl font-bold text-quatro-cream flex items-baseline space-x-1">
            <span>{kmh}</span>
            <span className="text-xs font-normal text-quatro-cream/60">km/h</span>
          </div>
        </div>

        <div className="text-right text-[11px] text-quatro-cream/40 font-mono space-y-0.5">
          <div>[W / ↑] ACCELERATE</div>
          <div>[S / ↓] BRAKE / REVERSE</div>
          <div>[A / D] STEER</div>
          <div>[SPACE] HANDBRAKE</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build Paper-Textured Pause Modal (`src/components/ui/PauseOverlay.tsx`)**

Conforms to PRD 02 Section 38 & 39 (breathing space, paper notebook tactile aesthetic):

```tsx
"use client";

interface PauseOverlayProps {
  isOpen: boolean;
  onResume: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
}

export function PauseOverlay({
  isOpen,
  onResume,
  isAudioMuted,
  onToggleAudio,
}: PauseOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-quatro-navy/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-quatro-paper text-quatro-navy max-w-md w-full rounded-lg shadow-2xl border-4 border-quatro-cream p-8 font-sans">
        <div className="border-b-2 border-quatro-navy/20 pb-4 mb-6 text-center">
          <span className="text-xs uppercase tracking-widest text-quatro-navy/60 font-mono">
            The Semicolon ;
          </span>
          <h2 className="text-2xl font-serif font-bold text-quatro-navy mt-1">
            Take a Breath
          </h2>
          <p className="text-xs text-quatro-navy/70 mt-1 italic">
            "A pause before something continues."
          </p>
        </div>

        <div className="space-y-4 my-6">
          <button
            onClick={onResume}
            className="w-full py-2.5 bg-quatro-navy text-quatro-cream rounded font-mono text-sm tracking-wider hover:bg-quatro-slate transition-colors"
          >
            CONTINUE JOURNEY
          </button>

          <button
            onClick={onToggleAudio}
            className="w-full py-2.5 border border-quatro-navy/30 text-quatro-navy rounded font-mono text-sm tracking-wider hover:bg-quatro-softGray transition-colors"
          >
            AUDIO: {isAudioMuted ? "MUTED" : "ENABLED"}
          </button>
        </div>

        <div className="border-t border-quatro-navy/20 pt-4 text-center text-xs text-quatro-navy/60 font-mono">
          Press [ESC] to resume
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/game/core/ src/components/ui/
git commit -m "feat(ui): implement quiet diegetic HUD and paper-textured pause modal"
```

---

### Task 6: Analog Lo-Fi Audio & Soundscape Layer

**Files:**
- Create: `src/game/audio/SoundManager.ts`
- Create: `src/game/audio/useAudioEngine.ts`

**Interfaces:**
- Consumes: `vehicleState.speed`, `isAudioMuted`.
- Produces: Synthetic Web Audio API engine oscillator with speed-reactive pitch, soft tape rumble noise generator, and click foley.

- [ ] **Step 1: Build Web Audio Sound Manager (`src/game/audio/SoundManager.ts`)**

Conforms to PRD 02 Section 24, 26, 41 (tactile mechanical clicks, engine purr pitch scaling, gentle tape hiss, no harsh beeps):

```typescript
export class SoundManager {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private noiseGain: GainNode | null = null;
  private isInitialized = false;
  private isMuted = false;

  public init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // 1. Engine Oscillator (Warm low triangle wave)
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = "triangle";
      this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      // Lowpass filter for warm muffled engine sound
      const engineFilter = this.ctx.createBiquadFilter();
      engineFilter.type = "lowpass";
      engineFilter.frequency.setValueAtTime(260, this.ctx.currentTime);

      this.engineOsc.connect(engineFilter);
      engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();

      // 2. Analog Tape Hiss / Room Hum (Gentle pink noise)
      this.initTapeHiss();

      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio not supported or blocked", e);
    }
  }

  private initTapeHiss() {
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.015; // Very subtle noise
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.ctx.destination);

    whiteNoise.start();
  }

  public updateEngine(speed: number) {
    if (!this.ctx || !this.engineOsc || this.isMuted) return;

    const absSpeed = Math.abs(speed);
    // Base 48Hz at idle, up to 135Hz at max speed
    const targetFreq = 48 + (absSpeed / 18) * 87;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(muted ? 0 : 0.08, this.ctx.currentTime, 0.05);
    }
    if (this.noiseGain && this.ctx) {
      this.noiseGain.gain.setTargetAtTime(muted ? 0 : 0.04, this.ctx.currentTime, 0.05);
    }
  }

  public playClick() {
    if (!this.ctx || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }
}

export const soundManager = new SoundManager();
```

- [ ] **Step 2: Create React Audio Hook (`src/game/audio/useAudioEngine.ts`)**

```typescript
"use client";

import { useEffect } from "react";
import { soundManager } from "./SoundManager";

export function useAudioEngine(speed: number, isMuted: boolean) {
  useEffect(() => {
    const handleFirstGesture = () => {
      soundManager.init();
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("pointerdown", handleFirstGesture);
    };

    window.addEventListener("keydown", handleFirstGesture);
    window.addEventListener("pointerdown", handleFirstGesture);

    return () => {
      window.removeEventListener("keydown", handleFirstGesture);
      window.removeEventListener("pointerdown", handleFirstGesture);
    };
  }, []);

  useEffect(() => {
    soundManager.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    soundManager.updateEngine(speed);
  }, [speed]);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/game/audio/
git commit -m "feat(audio): implement Web Audio engine sound, tape hiss generator, and tactile click foley"
```

---

### Task 7: End-to-End Game Integration & App Root

**Files:**
- Create: `src/components/game/ProjectQuatroApp.tsx`
- Modify: `src/app/page.tsx`
- Test: `npm test && npm run build`

**Interfaces:**
- Connects: User Keyboard Input -> `updateVehiclePhysics` loop -> R3F `GameCanvas` + `WorldEnvironment` -> `QuietHUD` + `PauseOverlay` + `useAudioEngine`.

- [ ] **Step 1: Build the Main Interactive Game Component (`src/components/game/ProjectQuatroApp.tsx`)**

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GameCanvas } from "./GameCanvas";
import { WorldEnvironment } from "@/game/world/WorldEnvironment";
import { QuietHUD } from "@/components/ui/QuietHUD";
import { PauseOverlay } from "@/components/ui/PauseOverlay";
import {
  createInitialVehicleState,
  updateVehiclePhysics,
} from "@/game/vehicle/vehiclePhysics";
import { VehicleInput, VehicleState } from "@/game/vehicle/vehicleTypes";
import { useAudioEngine } from "@/game/audio/useAudioEngine";
import { soundManager } from "@/game/audio/SoundManager";

export default function ProjectQuatroApp() {
  const [vehicleState, setVehicleState] = useState<VehicleState>(createInitialVehicleState);
  const [isPaused, setIsPaused] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string | null>(
    "Drive down the familiar road to work."
  );

  const inputRef = useRef<VehicleInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  const stateRef = useRef<VehicleState>(createInitialVehicleState());

  // Link audio engine with current speed and mute state
  useAudioEngine(vehicleState.speed, isAudioMuted || isPaused);

  // Clear prompt after 6 seconds of driving
  useEffect(() => {
    const timer = setTimeout(() => {
      setActivePrompt(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        soundManager.playClick();
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPaused) return;

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          inputRef.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          inputRef.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          inputRef.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          inputRef.current.right = true;
          break;
        case "Space":
          inputRef.current.brake = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          inputRef.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          inputRef.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          inputRef.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          inputRef.current.right = false;
          break;
        case "Space":
          inputRef.current.brake = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPaused]);

  // Main 60FPS Physics Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isPaused) {
        const nextState = updateVehiclePhysics(
          stateRef.current,
          inputRef.current,
          dt
        );
        stateRef.current = nextState;
        setVehicleState(nextState);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused]);

  const handleToggleAudio = useCallback(() => {
    soundManager.playClick();
    setIsAudioMuted((prev) => !prev);
  }, []);

  const handleResume = useCallback(() => {
    soundManager.playClick();
    setIsPaused(false);
  }, []);

  return (
    <div className="relative w-full h-full">
      <GameCanvas vehicleState={vehicleState}>
        <WorldEnvironment />
      </GameCanvas>

      <QuietHUD
        vehicleState={vehicleState}
        activePrompt={activePrompt}
        onOpenPause={() => {
          soundManager.playClick();
          setIsPaused(true);
        }}
      />

      <PauseOverlay
        isOpen={isPaused}
        onResume={handleResume}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
      />
    </div>
  );
}
```

- [ ] **Step 2: Run unit tests and Next.js production build verification**

Run: `npm test && npm run build`
Expected: All tests pass, build completes with zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/
git commit -m "feat(game): integrate full playable prototype loop with R3F, physics, HUD, and audio"
```

---

## Plan Self-Review & Checklist

1. **Spec Coverage:**
   - PRD 01: Third-person driving with weight, physical satisfaction, road environment, failure philosophy (resilient vehicle) -> Handled in Tasks 2, 3, 4, 7.
   - PRD 02: The Semicolon (pause modal, breathing space), retro-warmth & micro-voxel, golden hour lighting, quiet diegetic HUD, analog tape & engine soundscape -> Handled in Tasks 1, 3, 4, 5, 6, 7.
   - PRD 03: Next.js Foundation, R3F 3D runtime, state separation (ephemeral frame state in `stateRef`, presentation in React), typed contracts -> Handled in Tasks 1, 2, 7.
2. **No Placeholders:** All functions, configurations, components, and tests contain full code blocks with no "TBD" or "TODO".
3. **Type Consistency:** Types defined in `vehicleTypes.ts` match those used in `vehiclePhysics.ts`, `QuatroMesh.tsx`, `FollowCamera.tsx`, and `ProjectQuatroApp.tsx`.
