"use client";

import { VehicleState, CameraMode } from "@/game/vehicle/vehicleTypes";

interface DrivingHUDProps {
  vehicleState: VehicleState;
  cameraMode: CameraMode;
  onToggleCamera: () => void;
  isVoidHighway: boolean;
}

/**
 * Minimalist driving HUD — speedometer, gear indicator, drift meter, camera toggle.
 * Styled to match the game's quatro-navy/amber aesthetic.
 */
export function DrivingHUD({
  vehicleState,
  cameraMode,
  onToggleCamera,
  isVoidHighway,
}: DrivingHUDProps) {
  const { speed, driftFactor, isHandbraking, isReversing } = vehicleState;
  const speedKmh = Math.abs(Math.round(speed * 3.6)); // convert m/s → km/h approx
  const speedRatio = Math.min(1, Math.abs(speed) / 22);

  // Tachometer arc: 0..270 degrees
  const rpmAngle = speedRatio * 240 - 120; // -120 to 120 deg
  const needleRad = (rpmAngle * Math.PI) / 180;
  const needleX = 50 + Math.sin(needleRad) * 36;
  const needleY = 50 - Math.cos(needleRad) * 36;

  // Drift heat color
  const driftHue = isVoidHighway
    ? `hsl(${270 + driftFactor * 60}, 80%, ${40 + driftFactor * 30}%)`
    : `hsl(${40 - driftFactor * 40}, 95%, ${50 + driftFactor * 10}%)`;

  const gear = isReversing ? "R" : speed < 0.5 ? "N" : speed < 6 ? "1" : speed < 10 ? "2" : speed < 15 ? "3" : speed < 19 ? "4" : "5";

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30">
      {/* ── Speedometer cluster (bottom-right) ── */}
      <div className="absolute bottom-5 right-5 flex flex-col items-center gap-1">
        {/* Circular tachometer */}
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background arc */}
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            {/* Speed arc */}
            <circle
              cx="50" cy="50" r="38"
              fill="none"
              stroke={driftFactor > 0.3 ? driftHue : (isVoidHighway ? "#7c3aed" : "#d97706")}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${speedRatio * 180} 300`}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke 0.3s" }}
            />
            {/* Needle */}
            <line
              x1="50" y1="50"
              x2={needleX} y2={needleY}
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Center dot */}
            <circle cx="50" cy="50" r="3" fill="white" />
          </svg>

          {/* Speed number in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-lg font-bold leading-none text-white tabular-nums">
              {speedKmh}
            </span>
            <span className="font-mono text-[8px] text-white/50 uppercase tracking-wider">km/h</span>
          </div>
        </div>

        {/* Gear indicator */}
        <div
          className="font-mono text-2xl font-bold tabular-nums"
          style={{
            color: isReversing ? "#ef4444" : gear === "N" ? "rgba(255,255,255,0.4)" : "#fef08a",
            textShadow: `0 0 8px ${isReversing ? "#ef4444" : "#d97706"}`,
          }}
        >
          {gear}
        </div>
      </div>

      {/* ── Drift Meter (bottom-center) ── */}
      {driftFactor > 0.05 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
          {/* "DRIFT" label */}
          <div
            className="font-mono text-[9px] uppercase tracking-[0.25em] animate-pulse"
            style={{ color: driftHue }}
          >
            Drift
          </div>
          {/* Bar */}
          <div className="h-1 w-28 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${driftFactor * 100}%`,
                background: `linear-gradient(90deg, ${driftHue}, white)`,
                boxShadow: `0 0 6px ${driftHue}`,
              }}
            />
          </div>
          {/* Handbrake indicator */}
          {isHandbraking && (
            <div className="font-mono text-[8px] text-red-400 uppercase tracking-widest">
              Handbrake
            </div>
          )}
        </div>
      )}

      {/* ── Camera mode toggle (bottom-left) ── */}
      <div className="pointer-events-auto absolute bottom-5 left-5">
        <button
          onClick={onToggleCamera}
          className="flex items-center gap-2 border border-white/15 bg-black/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/70 backdrop-blur-sm transition-colors hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-amber-400"
          title="Toggle camera mode [C]"
        >
          <span className="text-amber-400 text-[11px]">C</span>
          {cameraMode === "CHASE" ? (
            <>
              <span className="inline-block w-3 h-2 border border-current rounded-sm opacity-70" />
              Chase
            </>
          ) : (
            <>
              <span className="inline-block w-2.5 h-2.5 rounded-full border border-current opacity-70" />
              Cockpit
            </>
          )}
        </button>
      </div>

      {/* ── Controls hint (fades after a few seconds would need state — keeping static) ── */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-4 font-mono text-[9px] text-white/35 uppercase tracking-wider">
        <span>W/↑ Throttle</span>
        <span className="text-white/15">·</span>
        <span>S/↓ Brake/Rev</span>
        <span className="text-white/15">·</span>
        <span>A/D Steer</span>
        <span className="text-white/15">·</span>
        <span>Shift Handbrake</span>
      </div>
    </div>
  );
}
