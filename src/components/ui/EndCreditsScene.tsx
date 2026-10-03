"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RotateCcw } from "lucide-react";
import { soundManager } from "@/game/audio/SoundManager";

type CreditsPhase = "credits" | "endcard" | "fade";

const dotShape = new THREE.Shape();
dotShape.absarc(0, 0, 0.26, 0, Math.PI * 2, false);
const commaShape = new THREE.Shape();
commaShape.moveTo(-0.27, -0.28);
commaShape.bezierCurveTo(-0.05, -0.46, 0.15, -0.62, 0.13, -0.91);
commaShape.bezierCurveTo(0.12, -1.12, -0.02, -1.3, -0.18, -1.42);
commaShape.bezierCurveTo(-0.02, -1.2, -0.11, -1.05, -0.34, -0.92);
commaShape.bezierCurveTo(-0.58, -0.78, -0.51, -0.47, -0.27, -0.28);

const glyphExtrude = {
  depth: 0.16,
  bevelEnabled: true,
  bevelSegments: 3,
  steps: 1,
  bevelSize: 0.035,
  bevelThickness: 0.035,
  curveSegments: 24,
};
const dotGeometry = new THREE.ExtrudeGeometry(dotShape, glyphExtrude);
const commaGeometry = new THREE.ExtrudeGeometry(commaShape, glyphExtrude);
const goldMaterial = new THREE.MeshPhysicalMaterial({
  color: "#c79243",
  metalness: 0.72,
  roughness: 0.28,
  clearcoat: 0.34,
  clearcoatRoughness: 0.32,
  emissive: "#5c3510",
  emissiveIntensity: 0.2,
});

const semicolonLayout = [
  { position: [-3.15, 0.7, -2.1] as [number, number, number], scale: 1.22 },
  { position: [-2.25, -1.55, -5.5] as [number, number, number], scale: 0.9 },
  { position: [-4.05, -0.9, -9] as [number, number, number], scale: 0.78 },
  { position: [2.2, 1.7, -12] as [number, number, number], scale: 0.66 },
];

function FloatingSemicolon({
  index,
  position,
  scale,
  isFinal,
}: {
  index: number;
  position: [number, number, number];
  scale: number;
  isFinal: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    const object = group.current;
    if (!object) return;

    const time = clock.elapsedTime;
    const isHero = index === 0;
    const destination = isFinal && isHero ? new THREE.Vector3(0, 1.9, 0) : new THREE.Vector3(...position);
    const driftX = isFinal ? 0 : Math.sin(time * 0.16 + index * 2.4) * 0.11;
    const driftY = isFinal ? 0 : Math.sin(time * 0.22 + index) * 0.12;
    object.position.x = THREE.MathUtils.damp(object.position.x, destination.x + driftX, 0.42, delta);
    object.position.y = THREE.MathUtils.damp(object.position.y, destination.y + driftY, 0.42, delta);
    object.position.z = THREE.MathUtils.damp(object.position.z, destination.z, 0.42, delta);

    const targetScale = isFinal ? (isHero ? 1.75 : 0) : scale;
    const floatScale = isFinal ? 1 : 1 + Math.sin(time * 0.3 + index) * 0.025;
    const nextScale = THREE.MathUtils.damp(object.scale.x, targetScale * floatScale, 0.5, delta);
    object.scale.setScalar(nextScale);
    if (isFinal && isHero) {
      object.rotation.x = THREE.MathUtils.damp(object.rotation.x, 0.08, 0.18, delta);
      object.rotation.y = THREE.MathUtils.damp(object.rotation.y, 0.1, 0.18, delta);
    } else {
      object.rotation.x += delta * (0.035 + index * 0.008);
      object.rotation.y += delta * (index % 2 === 0 ? 0.08 : -0.065);
    }
    object.rotation.z = Math.sin(time * 0.14 + index * 1.8) * 0.07;
  });

  return (
    <group ref={group} position={position} scale={scale}>
      <mesh geometry={dotGeometry} material={goldMaterial} position={[0, 0.42, 0]} />
      <mesh geometry={commaGeometry} material={goldMaterial} position={[0, 0, 0]} />
    </group>
  );
}

function DustField() {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(34 * 3);
    for (let index = 0; index < 34; index += 1) {
      positions[index * 3] = Math.sin(index * 91.7) * 7;
      positions[index * 3 + 1] = Math.cos(index * 37.1) * 4.5;
      positions[index * 3 + 2] = -1 - ((index * 13) % 17);
    }
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return buffer;
  }, []);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.006;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color="#edcf91" size={0.045} transparent opacity={0.48} depthWrite={false} />
    </points>
  );
}

function DistantWorld() {
  return (
    <group position={[0, -3.15, -11]}>
      <mesh position={[0, -1.25, 0]} receiveShadow>
        <boxGeometry args={[42, 0.18, 24]} />
        <meshStandardMaterial color="#28251f" roughness={0.94} />
      </mesh>
      {[
        [-6.8, 0.25, -1.6, 2.1, 4.1, 1.7],
        [-3.8, -0.1, 0.2, 1.8, 3.4, 1.8],
        [4.9, 0.15, -0.7, 2.5, 3.8, 2.2],
        [7.8, -0.25, 0.4, 1.6, 3.2, 1.4],
        [0.5, -0.5, -2.5, 2.8, 2.8, 1.5],
      ].map(([x, y, z, width, height, depth], index) => (
        <mesh key={index} position={[x, y, z]}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color={index % 2 ? "#373026" : "#302d27"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function CinematicCamera({ isFinal }: { isFinal: boolean }) {
  useFrame(({ camera, clock }, delta) => {
    const time = clock.elapsedTime;
    goldMaterial.emissiveIntensity = THREE.MathUtils.damp(
      goldMaterial.emissiveIntensity,
      isFinal ? 0.36 : 0.2,
      0.7,
      delta
    );
    camera.position.x = THREE.MathUtils.damp(camera.position.x, Math.sin(time * 0.045) * 0.22, 0.16, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, Math.sin(time * 0.035) * 0.1, 0.16, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, isFinal ? 9.8 : 13, 0.12, delta);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function CreditsWorld({ isFinal, isMobile }: { isFinal: boolean; isMobile: boolean }) {
  const semicolons = isMobile ? semicolonLayout.slice(0, 2) : semicolonLayout;

  return (
    <Canvas
      camera={{ position: [0, 0, 13], fov: 38, near: 0.1, far: 80 }}
      dpr={isMobile ? [1, 1.2] : [1, 1.5]}
      gl={{ antialias: false, powerPreference: "low-power", alpha: false }}
      fallback={<div className="credits-canvas-fallback" />}
    >
      <color attach="background" args={["#171713"]} />
      <fog attach="fog" args={["#171713", 12, 38]} />
      <ambientLight color="#b4a184" intensity={0.42} />
      <pointLight color="#f5c477" intensity={27} distance={23} decay={2} position={[-4, 4, 2]} />
      <pointLight color="#9c743e" intensity={12} distance={18} decay={2} position={[5, -0.5, -1]} />
      <DistantWorld />
      <DustField />
      {semicolons.map((item, index) => (
        <FloatingSemicolon key={index} index={index} {...item} isFinal={isFinal} />
      ))}
      <CinematicCamera isFinal={isFinal} />
    </Canvas>
  );
}

export function EndCreditsScene({ onPlayAgain }: { onPlayAgain: () => void }) {
  const [phase, setPhase] = useState<CreditsPhase>("credits");
  const [isMobile, setIsMobile] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [sceneArrived, setSceneArrived] = useState(false);

  useEffect(() => {
    soundManager.setCinematicMode(true);
    const frame = window.requestAnimationFrame(() => setSceneArrived(true));
    const mobileQuery = window.matchMedia("(max-width: 680px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMobile = () => setIsMobile(mobileQuery.matches);
    const updateMotion = () => setIsReducedMotion(motionQuery.matches);
    updateMobile();
    updateMotion();
    mobileQuery.addEventListener("change", updateMobile);
    motionQuery.addEventListener("change", updateMotion);

    return () => {
      window.cancelAnimationFrame(frame);
      mobileQuery.removeEventListener("change", updateMobile);
      motionQuery.removeEventListener("change", updateMotion);
      soundManager.setCinematicMode(false);
    };
  }, []);

  useEffect(() => {
    if (phase !== "endcard") return;
    const timeout = window.setTimeout(() => setPhase("fade"), 14000);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  const revealEndCard = () => {
    if (phase !== "credits") return;
    soundManager.playEndingChime();
    setPhase("endcard");
  };

  const handleRestart = () => {
    soundManager.playClick();
    onPlayAgain();
  };

  return (
    <main className={`credits-scene${sceneArrived ? " scene-arrived" : ""}${isReducedMotion ? " reduced-motion" : ""}`}>
      <div className="credits-world">
        <CreditsWorld isFinal={phase !== "credits"} isMobile={isMobile} />
      </div>
      <div className={`credits-intro-veil${phase === "fade" ? " credits-blackout" : ""}`} />

      {phase === "credits" && (
        <div className="credits-viewport" aria-label="End credits">
          <div className="credits-track" onAnimationEnd={revealEndCard}>
            <section className="credit-section credit-cast">
              <p className="credit-heading">CAST</p>
              <div className="cast-list">
                <p><span>3</span>Aizat Fahim Firmansyah</p>
                <p><span>12</span>Dzaki Rizqulloh Mudo</p>
                <p><span>18</span>Jason Christopher Hukom</p>
                <p><span>24</span>Muhammad Hanan Razikananda</p>
              </div>
            </section>

            <section className="credit-section credit-github">
              <p className="credit-heading">GITHUB</p>
              <div className="github-list">
                <p><span>Muhammad Hanan Razikananda</span><small>HanssGud</small></p>
                <p><span>Jason Christopher Hukom</span><small>jasonhukom</small></p>
                <p><span>Aizat Fahim Firmansyah</span><small>AIZATFIR</small></p>
                <p><span>Dzaki Rizqulloh Mudo</span><small>Zhask12</small></p>
              </div>
            </section>

            <section className="credit-section credit-development">
              <p className="credit-heading">DEVELOPMENT CREDITS</p>
              <div className="development-list">
                <p><small>Developer Brainstorming</small><span>Aizat · Jason · Hanan</span></p>
                <p><small>Developer Web Game</small><span>Aizat</span></p>
                <p><small>Developer GitHub</small><span>Dzaki</span></p>
                <p><small>Developer Supabase</small><span>Jason</span></p>
                <p><small>Developer Vercel</small><span>Hanan</span></p>
              </div>
            </section>

            <section className="credit-section credit-technology">
              <p className="credit-heading">BUILT WITH</p>
              <p className="technology-line">GitHub <i>·</i> Vercel <i>·</i> Supabase</p>
            </section>
          </div>
        </div>
      )}

      {phase === "endcard" || phase === "fade" ? (
        <div className={`credits-endcard${phase === "fade" ? " endcard-fading" : ""}`}>
          <div className="endcard-copy">
            <p className="endcard-title">SRASA-QUATRO</p>
            <p className="endcard-subtitle">A UNODOSTRES-QUATRO creation</p>
            <p className="endcard-built">Built with GitHub <i>·</i> Vercel <i>·</i> Supabase <i>·</i> Antigravity <i>·</i> GitHub Copilot <i>·</i> ChatGPT <i>·</i> Gemini</p>
            <p className="endcard-continuation">THE JOURNEY CONTINUES<span>;</span></p>
          </div>
        </div>
      ) : null}

      {phase === "credits" && (
        <button className="credits-skip" onClick={revealEndCard} type="button">
          SKIP CREDITS
        </button>
      )}
      {phase !== "credits" && (
        <button className="credits-replay" onClick={handleRestart} type="button">
          <RotateCcw size={14} aria-hidden="true" />
          <span>PLAY AGAIN</span>
        </button>
      )}

      <style jsx global>{`
        .credits-scene {
          position: fixed;
          inset: 0;
          z-index: 40;
          overflow: hidden;
          isolation: isolate;
          color: #f1e8d5;
          background: #171713;
          font-family: Georgia, 'Times New Roman', serif;
          user-select: none;
        }
        .credits-world,
        .credits-world canvas,
        .credits-canvas-fallback {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .credits-canvas-fallback { background: #171713; }
        .credits-intro-veil {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: #11110f;
          opacity: 1;
          transition: opacity 5.5s ease;
          pointer-events: none;
        }
        .scene-arrived .credits-intro-veil { opacity: 0.12; }
        .credits-intro-veil.credits-blackout {
          opacity: 1;
          transition-duration: 6s;
        }
        .credits-viewport {
          position: absolute;
          z-index: 2;
          inset: 0;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to bottom, transparent 1%, #000 14%, #000 83%, transparent 99%);
          mask-image: linear-gradient(to bottom, transparent 1%, #000 14%, #000 83%, transparent 99%);
        }
        .credits-track {
          position: absolute;
          top: 0;
          left: max(44%, calc(50% - 160px));
          width: min(540px, 48vw);
          padding: 0 24px;
          text-align: center;
          transform: translateY(100vh);
          animation: credits-rise 68s linear 1.1s forwards;
        }
        @keyframes credits-rise {
          from { transform: translateY(100vh); }
          to { transform: translateY(-100%); }
        }
        .credit-section { margin: 0 auto 15vh; opacity: 0.97; }
        .credit-heading {
          margin: 0 0 30px;
          color: #c9a66b;
          font: 500 11px/1.4 Arial, sans-serif;
          letter-spacing: 0.25em;
          text-transform: uppercase;
        }
        .cast-list,
        .github-list,
        .development-list { display: grid; gap: 17px; }
        .cast-list p,
        .github-list p,
        .development-list p { margin: 0; }
        .cast-list p { color: #f1e8d5; font-size: 17px; line-height: 1.5; }
        .cast-list span {
          display: inline-block;
          min-width: 34px;
          margin-right: 12px;
          color: #b89155;
          font-size: 13px;
          text-align: right;
        }
        .github-list p,
        .development-list p { display: grid; gap: 5px; }
        .github-list span,
        .development-list span { color: #f1e8d5; font-size: 16px; line-height: 1.4; }
        .github-list small,
        .development-list small {
          color: #a99f8c;
          font: 11px/1.4 Arial, sans-serif;
          letter-spacing: 0.04em;
        }
        .development-list { gap: 21px; }
        .development-list small { color: #c9a66b; letter-spacing: 0.08em; }
        .technology-line {
          margin: 0;
          color: #f1e8d5;
          font-size: 18px;
          line-height: 1.6;
        }
        .technology-line i,
        .endcard-built i { color: #c9a66b; font-style: normal; padding: 0 5px; }
        .credits-endcard {
          position: absolute;
          z-index: 2;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0 18px max(14vh, 88px);
          text-align: center;
          animation: endcard-arrive 3.5s ease both;
        }
        @keyframes endcard-arrive {
          from { opacity: 0; transform: translateY(9px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .endcard-copy { padding: 24px; transition: opacity 6s ease; }
        .endcard-title {
          margin: 0;
          color: #f1e8d5;
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 400;
          letter-spacing: 0.16em;
        }
        .endcard-subtitle { margin: 13px 0 0; color: #d0c3a9; font-size: 15px; }
        .endcard-built { margin: 25px 0 0; color: #b9ad98; font: 11px/1.5 Arial, sans-serif; letter-spacing: 0.04em; }
        .endcard-continuation { margin: 47px 0 0; color: #b4a58a; font: 10px/1.5 Arial, sans-serif; letter-spacing: 0.19em; }
        .endcard-continuation span { color: #d8ad65; font: 22px/0 Georgia, serif; margin-left: 3px; }
        .endcard-fading .endcard-copy { opacity: 0; }
        .credits-skip,
        .credits-replay {
          position: absolute;
          z-index: 4;
          right: max(22px, env(safe-area-inset-right));
          color: #e7dcc7;
          background: transparent;
          border: 0;
          cursor: pointer;
          font: 10px/1 Arial, sans-serif;
          letter-spacing: 0.16em;
          opacity: 0.48;
          transition: opacity 180ms ease, color 180ms ease;
        }
        .credits-skip { top: max(24px, env(safe-area-inset-top)); padding: 12px 0 12px 12px; }
        .credits-replay {
          right: auto;
          left: 50%;
          bottom: max(26px, env(safe-area-inset-bottom));
          display: inline-flex;
          align-items: center;
          gap: 9px;
          transform: translateX(-50%);
          padding: 14px;
        }
        .credits-skip:hover,
        .credits-replay:hover { color: #e3bb78; opacity: 1; }
        .credits-skip:focus-visible,
        .credits-replay:focus-visible { outline: 1px solid #c9a66b; outline-offset: 4px; opacity: 1; }
        .reduced-motion .credits-viewport { overflow-y: auto; }
        .reduced-motion .credits-track {
          position: relative;
          left: auto;
          width: min(540px, 90vw);
          margin: 0 auto;
          padding-top: 14vh;
          transform: none;
          animation: none;
        }
        .reduced-motion .credit-section { margin-bottom: 8vh; }
        @media (max-width: 680px) {
          .credits-track {
            left: 50%;
            width: min(490px, 92vw);
            padding: 0 14px;
            transform: translate(-50%, 100vh);
            animation-name: credits-rise-mobile;
            animation-duration: 64s;
          }
          @keyframes credits-rise-mobile {
            from { transform: translate(-50%, 100vh); }
            to { transform: translate(-50%, -100%); }
          }
          .credit-section { margin-bottom: 12vh; }
          .cast-list p { font-size: 15px; }
          .github-list span,
          .development-list span { font-size: 14px; }
          .technology-line { font-size: 16px; }
          .credits-endcard { padding-bottom: max(13vh, 96px); }
          .endcard-copy { padding: 20px; }
          .endcard-title { font-size: 25px; letter-spacing: 0.12em; }
          .endcard-subtitle { font-size: 13px; }
          .credits-skip { right: 18px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .credits-scene *,
          .credits-scene *::before,
          .credits-scene *::after { scroll-behavior: auto !important; }
          .credits-intro-veil { transition-duration: 1ms; }
          .credits-endcard { animation-duration: 1ms; }
          .endcard-copy { transition-duration: 1ms; }
        }
      `}</style>
    </main>
  );
}