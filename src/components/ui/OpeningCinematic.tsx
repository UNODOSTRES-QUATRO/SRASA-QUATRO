"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLocalization } from "@/game/localization/useLocalization";
import { soundManager } from "@/game/audio/SoundManager";

function Semicolon3D() {
  const dotRef = useRef<THREE.Group>(null);
  const commaRef = useRef<THREE.Group>(null);
  const glowLightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (dotRef.current) {
      dotRef.current.position.y = 0.85 + Math.sin(t * 1.5) * 0.05;
      dotRef.current.rotation.y = t * 0.3;
    }
    if (commaRef.current) {
      commaRef.current.position.y = -0.65 + Math.sin(t * 1.5 + 0.6) * 0.05;
      commaRef.current.rotation.y = t * 0.3;
    }
    if (glowLightRef.current) {
      glowLightRef.current.intensity = 2.5 + Math.sin(t * 2.0) * 0.8;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Upper Dot of Semicolon */}
      <group ref={dotRef} position={[0, 0.85, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.92}
            roughness={0.18}
            envMapIntensity={1.5}
          />
        </mesh>
        {/* Subtle amber rim glow */}
        <mesh scale={1.05}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.15} wireframe />
        </mesh>
      </group>

      {/* Lower Comma of Semicolon */}
      <group ref={commaRef} position={[0, -0.65, 0]}>
        {/* Head of comma */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.92}
            roughness={0.18}
            envMapIntensity={1.5}
          />
        </mesh>
        {/* Tail sweeping downward-left */}
        <mesh position={[-0.22, -0.65, 0]} rotation={[0, 0, 0.45]} castShadow>
          <coneGeometry args={[0.38, 1.25, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.92}
            roughness={0.18}
          />
        </mesh>
        <mesh scale={1.05}>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.15} wireframe />
        </mesh>
      </group>

      {/* Central mystical glow */}
      <pointLight ref={glowLightRef} position={[0, 0, 1.5]} color="#f59e0b" intensity={3.0} distance={8} />
      <pointLight position={[0, 2, 2]} color="#38bdf8" intensity={1.2} distance={6} />
      <ambientLight intensity={0.4} />
    </group>
  );
}

function SubtleParticles() {
  const count = 45;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  const particles = useRef(
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 6,
      y: (Math.random() - 0.5) * 6,
      z: (Math.random() - 0.5) * 4,
      vy: 0.003 + Math.random() * 0.006,
      rotSpeed: 0.01 + Math.random() * 0.02,
    }))
  );

  useFrame(() => {
    if (!meshRef.current) return;
    particles.current.forEach((p, i) => {
      p.y += p.vy;
      if (p.y > 3) p.y = -3;
      dummy.current.position.set(p.x, p.y, p.z);
      dummy.current.scale.setScalar(0.04 + Math.sin(p.y * 3) * 0.015);
      dummy.current.rotation.x += p.rotSpeed;
      dummy.current.rotation.y += p.rotSpeed;
      dummy.current.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.current.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.65} />
    </instancedMesh>
  );
}

interface OpeningCinematicProps {
  onComplete: () => void;
}

export function OpeningCinematic({ onComplete }: OpeningCinematicProps) {
  const { t } = useLocalization();
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);
  // 0: Darkness / Initial ambience
  // 1: Semicolon appears with Quote
  // 2: Title "PROJECT QUATRO" reveals
  // 3: Ready to transition

  useEffect(() => {
    soundManager.init();
    soundManager.ensureAudioContext();

    const t1 = setTimeout(() => {
      setStage(1);
    }, 1200);

    const t2 = setTimeout(() => {
      setStage(2);
    }, 5500);

    const t3 = setTimeout(() => {
      setStage(3);
    }, 8500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const handleSkipOrProceed = () => {
    soundManager.playClick();
    onComplete();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter" || e.code === "Escape") {
        handleSkipOrProceed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onComplete]);

  return (
    <div
      onClick={handleSkipOrProceed}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black select-none font-mono cursor-pointer"
    >
      {/* 3D Semicolon Dimensional Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5.2], fov: 45 }}>
          <Semicolon3D />
          <SubtleParticles />
        </Canvas>
      </div>

      {/* Overlay Typography */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-16 px-6 max-w-3xl pointer-events-none text-center">
        {/* Top Spacer */}
        <div />

        {/* Center Philosophy Quote */}
        <div
          className={`transition-opacity duration-1000 ${
            stage >= 1 && stage < 2 ? "opacity-100" : stage >= 2 ? "opacity-0" : "opacity-0"
          }`}
        >
          <p className="text-sm md:text-base font-serif italic text-amber-200/90 tracking-wide leading-relaxed drop-shadow-md">
            “{t("cinematic_quote")}”
          </p>
        </div>

        {/* Title Reveal */}
        <div
          className={`transition-all duration-1000 transform ${
            stage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-3xl md:text-5xl font-black tracking-widest text-slate-100 drop-shadow-2xl">
            {t("cinematic_title")}
          </h1>
          <p className="mt-2 text-xs md:text-sm font-mono tracking-widest uppercase text-amber-400/90">
            {t("cinematic_subtitle")}
          </p>

          <div className="mt-8 animate-pulse text-[11px] font-mono tracking-wider text-slate-400">
            {t("cinematic_press_start")}
          </div>
        </div>

        {/* Bottom Skip Indicator */}
        <div className="text-[10px] text-slate-500 font-mono tracking-wider">
          {t("cinematic_skip")}
        </div>
      </div>
    </div>
  );
}
