"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { VehicleState } from "./vehicleTypes";
import { SemicolonCat } from "../character/SemicolonCat";
import { soundManager } from "../audio/SoundManager";

interface QuatroMeshProps {
  vehicleState: VehicleState;
  vehicleStateRef?: React.MutableRefObject<VehicleState>;
  isCatAlert?: boolean;
  bodyColor?: string;
}

// Deep-dish rally wheel with visible rotor, caliper, and camber
function RallyWheel({
  isLeft = false,
  steerRef,
  spinRef,
  initialRotation = 0,
  initialSteering = 0,
}: {
  isLeft?: boolean;
  steerRef?: React.RefObject<THREE.Group>;
  spinRef?: React.RefObject<THREE.Group>;
  initialRotation?: number;
  initialSteering?: number;
}) {
  const wheelRadius = 0.34;
  const wheelWidth = 0.26;
  const camber = isLeft ? 0.055 : -0.055; // Subtle FR Legends negative camber (-3.5 deg)

  return (
    <group ref={steerRef} rotation={[0, initialSteering, camber]}>
      {/* Outer tire with rotation */}
      <group ref={spinRef} rotation={[initialRotation, 0, Math.PI / 2]}>
        {/* Rubber Tire */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 24]} />
          <meshStandardMaterial color="#14171d" roughness={0.85} metalness={0.15} />
        </mesh>

        {/* Deep Dish Rim Lip (Polished Bronze/Silver) */}
        <mesh position={[0, isLeft ? 0.06 : -0.06, 0]}>
          <cylinderGeometry args={[0.27, 0.25, 0.08, 20]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* 5-Spoke Star Design */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh
            key={i}
            rotation={[0, (i * Math.PI * 2) / 5, 0]}
            position={[0, isLeft ? 0.1 : -0.1, 0]}
          >
            <boxGeometry args={[0.045, 0.03, 0.22]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}

        {/* Center Nut */}
        <mesh position={[0, isLeft ? 0.12 : -0.12, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.04, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.9} />
        </mesh>
      </group>

      {/* Non-rotating Brake Rotor */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[isLeft ? -0.04 : 0.04, 0, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.02, 16]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.35} metalness={0.9} />
      </mesh>
      {/* Sport Caliper (Crimson Red) */}
      <mesh position={[isLeft ? -0.04 : 0.04, 0.14, 0]}>
        <boxGeometry args={[0.05, 0.09, 0.07]} />
        <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={0.2} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function QuatroMesh({
  vehicleState,
  vehicleStateRef,
  isCatAlert = false,
  bodyColor = "#d65d28",
}: QuatroMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const chassisRef = useRef<THREE.Group>(null);
  const driverDoorRef = useRef<THREE.Group>(null);
  const exhaustFlameRef = useRef<THREE.Group>(null);
  const driftSmokeRef = useRef<THREE.Group>(null);

  // Wheel refs for zero-jitter, 60+ FPS direct rotation
  const flSteerRef = useRef<THREE.Group>(null);
  const frSteerRef = useRef<THREE.Group>(null);
  const flSpinRef = useRef<THREE.Group>(null);
  const frSpinRef = useRef<THREE.Group>(null);
  const rlSpinRef = useRef<THREE.Group>(null);
  const rrSpinRef = useRef<THREE.Group>(null);

  // Suspension & dynamics state
  const prevSpeed = useRef(vehicleState.speed);
  const chassisPitch = useRef(0);
  const chassisRoll = useRef(0);
  const exhaustTimer = useRef(0);
  const currentScale = useRef(1.0);
  const currentDoorAngle = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const live = vehicleStateRef?.current ?? vehicleState;

    if (groupRef.current) {
      groupRef.current.position.set(live.position.x, live.position.y, live.position.z);
      groupRef.current.rotation.y = live.heading;
    }

    // Scale lerp
    const targetScale = live.scaleFactor || 1.0;
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 1.0 - Math.exp(-8 * dt));
    if (groupRef.current) {
      groupRef.current.scale.setScalar(currentScale.current);
    }

    // ── Update Wheel Steer & Rotation directly in render frame (Zero Stutter) ──
    if (flSteerRef.current) flSteerRef.current.rotation.y = live.steeringAngle;
    if (frSteerRef.current) frSteerRef.current.rotation.y = live.steeringAngle;
    if (flSpinRef.current) flSpinRef.current.rotation.x = live.wheelRotation;
    if (frSpinRef.current) frSpinRef.current.rotation.x = live.wheelRotation;
    if (rlSpinRef.current) rlSpinRef.current.rotation.x = live.wheelRotation;
    if (rrSpinRef.current) rrSpinRef.current.rotation.x = live.wheelRotation;

    // ── Driver Door Smooth Mount/Dismount Animation ─────────────────────────
    const targetDoor = live.doorAngle ?? 0;
    currentDoorAngle.current = THREE.MathUtils.damp(currentDoorAngle.current, targetDoor, 10, dt);
    if (driverDoorRef.current) {
      driverDoorRef.current.rotation.y = -currentDoorAngle.current;
    }

    // ── Suspension Dynamics (Pitch on Accel/Brake, Roll on Turn/Drift) ──────
    const accel = (live.speed - prevSpeed.current) / dt;
    prevSpeed.current = live.speed;

    // Squat on throttle, nose dive on brake
    const targetPitch = THREE.MathUtils.clamp(-accel * 0.007, -0.09, 0.09);
    chassisPitch.current = THREE.MathUtils.damp(chassisPitch.current, targetPitch, 9, dt);

    // Body roll in cornering & drift counter-lean
    const targetRoll = THREE.MathUtils.clamp(
      (live.lateralSpeed * 0.026) + (live.steeringAngle * -0.038),
      -0.11,
      0.11
    );
    chassisRoll.current = THREE.MathUtils.damp(chassisRoll.current, targetRoll, 8.5, dt);

    // Subtle road surface vibration
    const bounce = Math.sin(state.clock.getElapsedTime() * 24) * Math.min(0.015, Math.abs(live.speed) * 0.0009);

    if (chassisRef.current) {
      chassisRef.current.rotation.x = chassisPitch.current;
      chassisRef.current.rotation.z = chassisRoll.current;
      chassisRef.current.position.y = bounce;
    }

    // ── Exhaust Pops on Deceleration ────────────────────────────────────────
    if (accel < -5.5 && Math.abs(live.speed) > 4 && Math.random() < 0.18) {
      exhaustTimer.current = 0.18;
      soundManager.playExhaustPop();
    }
    if (exhaustTimer.current > 0) {
      exhaustTimer.current -= dt;
      if (exhaustFlameRef.current) {
        exhaustFlameRef.current.visible = true;
      }
    } else if (exhaustFlameRef.current) {
      exhaustFlameRef.current.visible = false;
    }

    // ── Drift Tire Smoke & Friction Dynamics ─────────────────────────────────
    if (driftSmokeRef.current) {
      if ((live.driftFactor ?? 0) > 0.10 && Math.abs(live.speed) > 2.0) {
        driftSmokeRef.current.visible = true;
        const s = THREE.MathUtils.lerp(0.85, 2.0, live.driftFactor ?? 0);
        driftSmokeRef.current.scale.set(s, s, s);
      } else {
        driftSmokeRef.current.visible = false;
      }
    }
  });

  const accentColor = "#f8f4eb"; // Heritage warm off-white
  const trimColor = "#1a1c22"; // Dark matte aero trim
  const glassColor = "#151b24"; // Smoked glass

  return (
    <group
      ref={groupRef}
      position={[vehicleState.position.x, vehicleState.position.y, vehicleState.position.z]}
      rotation={[0, vehicleState.heading, 0]}
    >
      {/* ========================================================
          CYBER UNDERGLOW NEON (Aesthetic Cyan/Amber Glow)
          ======================================================== */}
      {/* Inner vibrant core underglow */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.7, 3.2]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.55 + (vehicleState.driftFactor ?? 0) * 0.4}
          depthWrite={false}
        />
      </mesh>
      {/* Outer soft ambient bleed */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 4.0]} />
        <meshBasicMaterial
          color="#0284c7"
          transparent
          opacity={0.28 + (vehicleState.driftFactor ?? 0) * 0.3}
          depthWrite={false}
        />
      </mesh>
      <pointLight position={[0, 0.15, 0]} color="#38bdf8" intensity={3.5 + (vehicleState.driftFactor ?? 0) * 3.0} distance={5.5} />

      {/* ========================================================
          DYNAMIC SUSPENSION CHASSIS GROUP
          ======================================================== */}
      <group ref={chassisRef}>
        {/* 1. MAIN CHASSIS & SIGNATURE AUDI QUATTRO BOX-FLARES */}
        <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.42, 3.5]} />
          <meshStandardMaterial color={bodyColor} roughness={0.38} metalness={0.25} />
        </mesh>

        {/* Front Box Flares */}
        <mesh position={[0, 0.44, 1.08]} castShadow receiveShadow>
          <boxGeometry args={[1.84, 0.38, 1.15]} />
          <meshStandardMaterial color={bodyColor} roughness={0.38} metalness={0.25} />
        </mesh>

        {/* Rear Box Flares */}
        <mesh position={[0, 0.44, -1.08]} castShadow receiveShadow>
          <boxGeometry args={[1.86, 0.38, 1.15]} />
          <meshStandardMaterial color={bodyColor} roughness={0.38} metalness={0.25} />
        </mesh>

        {/* Right Side Aero Skirt with Cyber Neon Strip */}
        <mesh position={[0.84, 0.28, 0]}>
          <boxGeometry args={[0.06, 0.1, 1.3]} />
          <meshStandardMaterial color={trimColor} roughness={0.8} />
        </mesh>
        <mesh position={[0.87, 0.28, 0]}>
          <boxGeometry args={[0.015, 0.03, 1.25]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.5} />
        </mesh>

        {/* Left Side Aero Skirt with Cyber Neon Strip */}
        <mesh position={[-0.84, 0.28, 0]}>
          <boxGeometry args={[0.06, 0.1, 1.3]} />
          <meshStandardMaterial color={trimColor} roughness={0.8} />
        </mesh>
        <mesh position={[-0.87, 0.28, 0]}>
          <boxGeometry args={[0.015, 0.03, 1.25]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={2.5} />
        </mesh>

        {/* 2. FRONT END & CYBER LIGHTBAR */}
        {/* Front Chin Spoiler with Air Splitters */}
        <mesh position={[0, 0.25, 1.76]} castShadow>
          <boxGeometry args={[1.74, 0.22, 0.18]} />
          <meshStandardMaterial color={trimColor} roughness={0.7} />
        </mesh>
        <mesh position={[0.4, 0.24, 1.84]}>
          <boxGeometry args={[0.34, 0.1, 0.04]} />
          <meshStandardMaterial color="#0c0e12" roughness={0.9} />
        </mesh>
        <mesh position={[-0.4, 0.24, 1.84]}>
          <boxGeometry args={[0.34, 0.1, 0.04]} />
          <meshStandardMaterial color="#0c0e12" roughness={0.9} />
        </mesh>

        {/* Matte Black Front Grille */}
        <mesh position={[0, 0.48, 1.75]}>
          <boxGeometry args={[1.56, 0.22, 0.08]} />
          <meshStandardMaterial color="#12141a" roughness={0.9} />
        </mesh>

        {/* Illuminated Quattro Badge on Grille */}
        <mesh position={[0, 0.44, 1.8]}>
          <boxGeometry args={[0.22, 0.045, 0.02]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={2.8} />
        </mesh>

        {/* Cyber Center LED Lightbar */}
        <mesh position={[0, 0.54, 1.79]}>
          <boxGeometry args={[0.75, 0.035, 0.02]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={3.2} />
        </mesh>

        {/* Quad Projector Headlights (Outer + Inner) */}
        {[-0.52, -0.26, 0.26, 0.52].map((lx, idx) => (
          <mesh key={`headlight-${idx}`} position={[lx, 0.48, 1.78]}>
            <boxGeometry args={[0.2, 0.14, 0.04]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive="#fef08a"
              emissiveIntensity={2.0}
              roughness={0.15}
            />
          </mesh>
        ))}

        {/* Front Turn Signal Accents */}
        {[-0.7, 0.7].map((tx, idx) => (
          <mesh key={`turn-${idx}`} position={[tx, 0.48, 1.76]}>
            <boxGeometry args={[0.1, 0.14, 0.04]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.8} />
          </mesh>
        ))}

        {/* 3. HOOD & VENTS */}
        <mesh position={[0, 0.65, 0.95]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[1.48, 0.06, 1.3]} />
          <meshStandardMaterial color={accentColor} roughness={0.45} />
        </mesh>
        {/* Dual Hood Heat Extractors */}
        <mesh position={[0.34, 0.68, 0.7]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.24, 0.03, 0.4]} />
          <meshStandardMaterial color={trimColor} roughness={0.9} />
        </mesh>
        <mesh position={[-0.34, 0.68, 0.7]} rotation={[-0.08, 0, 0]}>
          <boxGeometry args={[0.24, 0.03, 0.4]} />
          <meshStandardMaterial color={trimColor} roughness={0.9} />
        </mesh>

        {/* 4. CABIN & ROOF */}
        <mesh position={[0, 1.05, -0.22]} castShadow receiveShadow>
          <boxGeometry args={[1.34, 0.08, 1.75]} />
          <meshStandardMaterial color={accentColor} roughness={0.45} />
        </mesh>
        {/* Roof Aerodynamic Scoop */}
        <mesh position={[0, 1.12, -0.05]} castShadow>
          <boxGeometry args={[0.42, 0.08, 0.45]} />
          <meshStandardMaterial color={trimColor} roughness={0.6} />
        </mesh>
        {/* Front Windshield */}
        <mesh position={[0, 0.88, 0.52]} rotation={[-0.42, 0, 0]}>
          <boxGeometry args={[1.3, 0.55, 0.04]} />
          <meshStandardMaterial color={glassColor} roughness={0.1} metalness={0.85} />
        </mesh>
        {/* Passenger Side Windows */}
        <mesh position={[0.67, 0.86, -0.2]}>
          <boxGeometry args={[0.04, 0.42, 1.5]} />
          <meshStandardMaterial color={glassColor} roughness={0.15} metalness={0.8} />
        </mesh>

        {/* ── SEAMLESS ANIMATED DRIVER DOOR (LEFT SIDE) ───────────────────── */}
        {/* Hinge located at front of door frame at [-0.82, 0.6, 0.48] */}
        <group ref={driverDoorRef} position={[-0.82, 0.6, 0.48]}>
          {/* Main door panel (offset relative to hinge) */}
          <mesh position={[0, -0.05, -0.48]} castShadow receiveShadow>
            <boxGeometry args={[0.08, 0.46, 0.94]} />
            <meshStandardMaterial color={bodyColor} roughness={0.38} metalness={0.25} />
          </mesh>
          {/* Driver Window glass */}
          <mesh position={[0.02, 0.28, -0.48]}>
            <boxGeometry args={[0.03, 0.38, 0.88]} />
            <meshStandardMaterial color={glassColor} roughness={0.15} metalness={0.8} />
          </mesh>
          {/* Driver Side Mirror */}
          <mesh position={[-0.12, 0.18, -0.08]} castShadow>
            <boxGeometry args={[0.14, 0.09, 0.16]} />
            <meshStandardMaterial color={trimColor} roughness={0.6} />
          </mesh>
          {/* Recessed Flush Door Handle */}
          <mesh position={[-0.045, -0.02, -0.78]}>
            <boxGeometry args={[0.02, 0.04, 0.14]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Interior Door Card / Armrest */}
          <mesh position={[0.05, -0.08, -0.48]}>
            <boxGeometry args={[0.04, 0.32, 0.86]} />
            <meshStandardMaterial color="#1f2937" roughness={0.9} />
          </mesh>
        </group>

        {/* C-Pillars */}
        <mesh position={[0.67, 0.86, -0.92]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.06, 0.46, 0.35]} />
          <meshStandardMaterial color={bodyColor} roughness={0.4} />
        </mesh>
        <mesh position={[-0.67, 0.86, -0.92]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.06, 0.46, 0.35]} />
          <meshStandardMaterial color={bodyColor} roughness={0.4} />
        </mesh>
        {/* Rear Windshield */}
        <mesh position={[0, 0.86, -0.98]} rotation={[0.42, 0, 0]}>
          <boxGeometry args={[1.26, 0.48, 0.04]} />
          <meshStandardMaterial color={glassColor} roughness={0.1} metalness={0.85} />
        </mesh>

        {/* 5. INTERIOR & COMPANION CAT */}
        <mesh position={[0, 0.68, 0.35]}>
          <boxGeometry args={[1.2, 0.18, 0.35]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
        <mesh position={[-0.34, 0.78, 0.22]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.11, 0.02, 8, 16]} />
          <meshStandardMaterial color="#1f2937" roughness={0.7} />
        </mesh>
        <SemicolonCat position={[0.35, 0.64, -0.1]} isAlert={isCatAlert} />

        {/* 6. REAR SPOILER & OLED TAILLIGHT BAR */}
        <group position={[0, 0.84, -1.55]}>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[1.58, 0.06, 0.3]} />
            <meshStandardMaterial color={trimColor} roughness={0.5} />
          </mesh>
          <mesh position={[0.55, 0, 0]}>
            <boxGeometry args={[0.08, 0.12, 0.18]} />
            <meshStandardMaterial color={trimColor} roughness={0.5} />
          </mesh>
          <mesh position={[-0.55, 0, 0]}>
            <boxGeometry args={[0.08, 0.12, 0.18]} />
            <meshStandardMaterial color={trimColor} roughness={0.5} />
          </mesh>
        </group>

        {/* Full-Width OLED Neon Taillight Bar */}
        <mesh position={[0, 0.52, -1.76]}>
          <boxGeometry args={[1.58, 0.16, 0.04]} />
          <meshStandardMaterial color="#0c0e14" roughness={0.9} />
        </mesh>
        {/* Continuous LED Light Stripe */}
        <mesh position={[0, 0.52, -1.78]}>
          <boxGeometry args={[1.5, 0.1, 0.02]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={vehicleState.isHandbraking || (vehicleState.driftFactor ?? 0) > 0.2 ? 3.5 : 1.4}
            roughness={0.2}
          />
        </mesh>
        {/* Rear taillight glow wash onto ground & road */}
        <pointLight
          position={[0, 0.52, -2.1]}
          color="#ef4444"
          intensity={vehicleState.isHandbraking || (vehicleState.driftFactor ?? 0) > 0.15 ? 4.2 : 1.5}
          distance={5.0}
        />

        {/* Rear Diffuser */}
        <mesh position={[0, 0.28, -1.76]} castShadow>
          <boxGeometry args={[1.74, 0.22, 0.16]} />
          <meshStandardMaterial color={trimColor} roughness={0.7} />
        </mesh>

        {/* Twin Polished Stainless Steel Exhausts */}
        <group position={[0.48, 0.2, -1.82]} rotation={[0.05, 0.08, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.2, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>
        <group position={[0.34, 0.2, -1.82]} rotation={[0.05, 0.08, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.048, 0.048, 0.2, 16]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.15} />
          </mesh>
        </group>

        {/* Animated Exhaust Flame Bursts on Backfire */}
        <group ref={exhaustFlameRef} visible={false}>
          <mesh position={[0.48, 0.2, -1.98]}>
            <coneGeometry args={[0.08, 0.24, 8]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0.34, 0.2, -1.98]}>
            <coneGeometry args={[0.08, 0.24, 8]} />
            <meshBasicMaterial color="#fb923c" transparent opacity={0.85} />
          </mesh>
          <pointLight position={[0.41, 0.2, -2.0]} color="#38bdf8" intensity={4.0} distance={4} />
        </group>
      </group>

      {/* ========================================================
          7. HIGH-DETAIL DEEP-DISH RALLY WHEELS (FR LEGENDS STANCE)
          ======================================================== */}
      {/* Front Left Wheel with Steering (direct ref updates) */}
      <group position={[0.9, 0.32, 1.1]}>
        <RallyWheel
          steerRef={flSteerRef}
          spinRef={flSpinRef}
          initialRotation={vehicleState.wheelRotation}
          initialSteering={vehicleState.steeringAngle}
          isLeft={true}
        />
      </group>

      {/* Front Right Wheel with Steering (direct ref updates) */}
      <group position={[-0.9, 0.32, 1.1]}>
        <RallyWheel
          steerRef={frSteerRef}
          spinRef={frSpinRef}
          initialRotation={vehicleState.wheelRotation}
          initialSteering={vehicleState.steeringAngle}
          isLeft={false}
        />
      </group>

      {/* Rear Left Wheel (direct ref updates) */}
      <group position={[0.92, 0.32, -1.1]}>
        <RallyWheel
          spinRef={rlSpinRef}
          initialRotation={vehicleState.wheelRotation}
          isLeft={true}
        />
      </group>

      {/* Rear Right Wheel (direct ref updates) */}
      <group position={[-0.92, 0.32, -1.1]}>
        <RallyWheel
          spinRef={rrSpinRef}
          initialRotation={vehicleState.wheelRotation}
          isLeft={false}
        />
      </group>

      {/* ── FR Legends Drift Tire Smoke & Sparks Emitter ── */}
      <group ref={driftSmokeRef} visible={false}>
        {[-0.92, 0.92].map((wx, wi) => (
          <group key={`drift-smoke-${wi}`} position={[wx, 0.14, -1.35]}>
            {/* White/gray smoke cloud puff */}
            <mesh scale={[0.45, 0.28, 0.75]}>
              <sphereGeometry args={[0.35, 8, 8]} />
              <meshBasicMaterial
                color="#cbd5e1"
                transparent
                opacity={0.35 + (vehicleState.driftFactor ?? 0) * 0.3}
                depthWrite={false}
              />
            </mesh>
            {/* Cyan/amber friction spark */}
            <mesh position={[0, -0.06, -0.22]}>
              <sphereGeometry args={[0.07, 6, 6]} />
              <meshBasicMaterial color={(vehicleState.driftFactor ?? 0) > 0.4 ? "#38bdf8" : "#fbbf24"} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
