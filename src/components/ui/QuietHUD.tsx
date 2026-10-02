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
        <div className="self-center bg-quatro-navy/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-quatro-amber/40 shadow-lg flex items-center space-x-2 text-sm text-quatro-cream transition-all duration-500">
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
