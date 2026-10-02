"use client";

import { VehicleState } from "@/game/vehicle/vehicleTypes";

interface QuietHUDProps {
  vehicleState: VehicleState;
  activePrompt: string | null;
  dayNumber: number;
  catAlert: boolean;
  pocketUnlocked?: boolean;
  onOpenPause: () => void;
  onPromptAction?: () => void;
  onTogglePocketMode?: () => void;
}

export function QuietHUD({
  vehicleState,
  activePrompt,
  dayNumber,
  catAlert,
  pocketUnlocked = false,
  onOpenPause,
  onPromptAction,
  onTogglePocketMode,
}: QuietHUDProps) {
  const kmh = Math.round(Math.abs(vehicleState.speed) * 3.6);
  const isMoving = Math.abs(vehicleState.speed) > 0.5;
  const isPocket = vehicleState.scaleMode === "POCKET";

  const dayTitle =
    dayNumber === 1
      ? "DAY 1 — THE ROUTINE"
      : dayNumber === 2
      ? "DAY 2 — THE SHIFT"
      : "DAY 3 — THE VOXEL DIMENSION";

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 select-none font-mono">
      {/* Top Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className="bg-quatro-navy/60 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-quatro-cream/15 text-xs tracking-widest text-quatro-cream/90 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-quatro-amber animate-pulse" />
            <span>PROJECT QUATRO • {dayTitle}</span>
          </div>

          {/* Semicolon companion status badge */}
          <div className="bg-quatro-navy/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-quatro-cream/10 text-[11px] text-quatro-cream/70 flex items-center space-x-1.5">
            <span>🐾 Semicolon:</span>
            <span className={catAlert ? "text-quatro-amber" : "text-quatro-mutedGreen"}>
              {catAlert ? "Alert (sensing anomalies)" : "Purring peacefully"}
            </span>
          </div>

          {/* Pocket Mode Indicator / Quick Toggle */}
          {(pocketUnlocked || dayNumber === 3) && (
            <button
              onClick={onTogglePocketMode}
              className={`pointer-events-auto px-3 py-1.5 rounded-lg border text-xs tracking-wider transition-all duration-200 cursor-pointer flex items-center space-x-2 ${
                isPocket
                  ? "bg-amber-500/25 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                  : "bg-quatro-navy/40 border-quatro-cream/15 text-quatro-cream/80 hover:bg-quatro-navy/60"
              }`}
            >
              <span>{isPocket ? "🚗 [Q] POCKET CAR" : "🚙 [Q] BIG CAR"}</span>
              <span className="text-[10px] bg-quatro-cream/10 px-1.5 py-0.5 rounded">
                TOGGLE
              </span>
            </button>
          )}
        </div>

        <button
          onClick={onOpenPause}
          className="pointer-events-auto bg-quatro-navy/60 hover:bg-quatro-navy/90 transition-colors px-3 py-1.5 rounded-lg border border-quatro-cream/20 text-xs tracking-wider text-quatro-cream/80 cursor-pointer"
        >
          [ESC] PAUSE
        </button>
      </div>

      {/* Center Contextual Prompt */}
      {activePrompt && (
        <div
          onClick={onPromptAction}
          className={`self-center bg-quatro-navy/85 backdrop-blur-md px-6 py-3 rounded-full border border-quatro-amber/60 shadow-2xl flex items-center space-x-3 text-sm text-quatro-cream transition-all duration-300 ${
            onPromptAction ? "pointer-events-auto cursor-pointer hover:border-quatro-amber hover:scale-105" : ""
          }`}
        >
          <span className="text-quatro-amber text-lg animate-pulse">✦</span>
          <span>{activePrompt}</span>
          {onPromptAction && (
            <span className="text-xs bg-quatro-amber text-quatro-navy font-bold px-2.5 py-0.5 rounded shadow">
              PRESS SPACE / E
            </span>
          )}
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex justify-between items-end">
        <div className="flex items-end space-x-3">
          <div
            className={`transition-opacity duration-700 bg-quatro-navy/60 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-quatro-cream/15 ${
              isMoving ? "opacity-95" : "opacity-40"
            }`}
          >
            <div className="text-[10px] text-quatro-cream/50 uppercase tracking-widest">Speed</div>
            <div className="text-2xl font-bold text-quatro-cream flex items-baseline space-x-1">
              <span>{kmh}</span>
              <span className="text-xs font-normal text-quatro-cream/60">km/h</span>
            </div>
          </div>

          {/* Scale mode indicator pill */}
          <div className="bg-quatro-navy/40 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-quatro-cream/10 text-[11px] text-quatro-cream/60">
            <span>SCALE: </span>
            <span className={isPocket ? "text-amber-300 font-bold" : "text-quatro-cream/80"}>
              {isPocket ? "POCKET (1:5)" : "NORMAL (1:1)"}
            </span>
          </div>
        </div>

        <div className="text-right text-[11px] text-quatro-cream/45 space-y-0.5 bg-quatro-navy/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-quatro-cream/10">
          <div>[W / ↑] ACCELERATE</div>
          <div>[S / ↓] BRAKE / REVERSE</div>
          <div>[A / D] DRIFT & STEER</div>
          <div>[Q] TRANSFORM CAR SCALE</div>
          <div>[SPACE / E] INTERACT</div>
        </div>
      </div>
    </div>
  );
}
