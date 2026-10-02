"use client";

import { VehicleState } from "@/game/vehicle/vehicleTypes";

interface QuietHUDProps {
  vehicleState: VehicleState;
  activePrompt: string | null;
  dayNumber: number;
  catAlert: boolean;
  onOpenPause: () => void;
  onPromptAction?: () => void;
}

export function QuietHUD({
  vehicleState,
  activePrompt,
  dayNumber,
  catAlert,
  onOpenPause,
  onPromptAction,
}: QuietHUDProps) {
  const kmh = Math.round(Math.abs(vehicleState.speed) * 3.6);
  const isMoving = Math.abs(vehicleState.speed) > 0.5;

  const dayTitle =
    dayNumber === 1
      ? "DAY 1 — THE ROUTINE"
      : dayNumber === 2
      ? "DAY 2 — THE SHIFT"
      : "DAY 3 — THE ANOMALIES";

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
          className={`self-center bg-quatro-navy/80 backdrop-blur-md px-6 py-3 rounded-full border border-quatro-amber/50 shadow-2xl flex items-center space-x-3 text-sm text-quatro-cream transition-all duration-300 ${
            onPromptAction ? "pointer-events-auto cursor-pointer hover:border-quatro-amber hover:scale-105" : ""
          }`}
        >
          <span className="text-quatro-amber text-lg">✦</span>
          <span>{activePrompt}</span>
          {onPromptAction && (
            <span className="text-xs bg-quatro-amber text-quatro-navy font-bold px-2 py-0.5 rounded">
              CLICK OR SPACE
            </span>
          )}
        </div>
      )}

      {/* Bottom Row */}
      <div className="flex justify-between items-end">
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

        <div className="text-right text-[11px] text-quatro-cream/45 space-y-0.5 bg-quatro-navy/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-quatro-cream/10">
          <div>[W / ↑] ACCELERATE</div>
          <div>[S / ↓] BRAKE / REVERSE</div>
          <div>[A / D] STEER</div>
          <div>[SPACE] BRAKE / INTERACT</div>
        </div>
      </div>
    </div>
  );
}
