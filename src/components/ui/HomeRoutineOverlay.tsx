"use client";

import { RumahState } from "@/game/core/gameStore";
import { CheckCircle2, Circle, Flame, Utensils, Droplets, Bed, DoorOpen } from "lucide-react";

interface HomeRoutineOverlayProps {
  dayNumber: number;
  rumahState: RumahState;
  isEvening: boolean;
  onAction?: (actionType: "WAKE" | "COOK" | "EAT" | "SHOWER" | "SLEEP" | "EXIT") => void;
  nearbyAction?: "WAKE" | "COOK" | "EAT" | "SHOWER" | "SLEEP" | "EXIT" | null;
}

export function HomeRoutineOverlay({
  dayNumber,
  rumahState,
  isEvening,
  onAction,
  nearbyAction,
}: HomeRoutineOverlayProps) {
  return (
    <div className="fixed top-16 left-4 z-40 max-w-sm w-full font-mono select-none pointer-events-none">
      <div className="bg-quatro-navy/90 backdrop-blur-md border border-quatro-amber/30 rounded-2xl p-4 shadow-2xl pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-quatro-cream/15 pb-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-quatro-amber animate-pulse" />
            <span className="text-xs uppercase tracking-wider text-quatro-amber font-bold">
              {isEvening ? "MALAM — RUTINITAS PULANG" : `HARI ${dayNumber} — PAGI DI RUMAH`}
            </span>
          </div>
          <span className="text-[10px] text-quatro-cream/50 uppercase">RUMAH</span>
        </div>

        {/* Morning Checklist */}
        {!isEvening ? (
          <div className="space-y-2 text-xs">
            {/* 1. Bangun */}
            <div
              className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
                rumahState.wokenUp
                  ? "text-emerald-400 bg-emerald-950/20"
                  : "text-quatro-cream/80 bg-quatro-slate/40"
              }`}
            >
              {rumahState.wokenUp ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-quatro-amber shrink-0 animate-pulse" />
              )}
              <div className="flex items-center space-x-2 flex-1">
                <Bed className="w-3.5 h-3.5 text-quatro-amber" />
                <span className={rumahState.wokenUp ? "line-through opacity-70" : "font-medium"}>
                  Bangun dari tempat tidur
                </span>
              </div>
            </div>

            {/* 2. Masak */}
            <div
              className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
                rumahState.hasCooked
                  ? "text-emerald-400 bg-emerald-950/20"
                  : rumahState.wokenUp
                  ? "text-quatro-cream/80 bg-quatro-slate/40"
                  : "text-quatro-cream/40"
              }`}
            >
              {rumahState.hasCooked ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-quatro-amber shrink-0" />
              )}
              <div className="flex items-center space-x-2 flex-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className={rumahState.hasCooked ? "line-through opacity-70" : "font-medium"}>
                  Masak sarapan di kompor
                </span>
              </div>
            </div>

            {/* 3. Makan */}
            <div
              className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
                rumahState.hasEaten
                  ? "text-emerald-400 bg-emerald-950/20"
                  : rumahState.hasCooked
                  ? "text-quatro-cream/80 bg-quatro-slate/40"
                  : "text-quatro-cream/40"
              }`}
            >
              {rumahState.hasEaten ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-quatro-amber shrink-0" />
              )}
              <div className="flex items-center space-x-2 flex-1">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                <span className={rumahState.hasEaten ? "line-through opacity-70" : "font-medium"}>
                  Makan di meja makan
                </span>
              </div>
            </div>

            {/* 4. Mandi */}
            <div
              className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
                rumahState.hasShowered
                  ? "text-emerald-400 bg-emerald-950/20"
                  : rumahState.hasEaten
                  ? "text-quatro-cream/80 bg-quatro-slate/40"
                  : "text-quatro-cream/40"
              }`}
            >
              {rumahState.hasShowered ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-quatro-amber shrink-0" />
              )}
              <div className="flex items-center space-x-2 flex-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span className={rumahState.hasShowered ? "line-through opacity-70" : "font-medium"}>
                  Mandi di kamar mandi
                </span>
              </div>
            </div>

            {/* 5. Keluar Pintu */}
            <div
              className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
                rumahState.canExitHouse
                  ? "text-purple-300 bg-purple-950/30 border border-purple-500/40"
                  : "text-quatro-cream/40"
              }`}
            >
              <DoorOpen className={`w-4 h-4 ${rumahState.canExitHouse ? "text-purple-400 animate-bounce" : ""}`} />
              <span className={rumahState.canExitHouse ? "font-bold text-purple-200" : ""}>
                {rumahState.canExitHouse
                  ? "Pintu depan terbuka! Siap berangkat ke mobil."
                  : "Selesaikan rutinitas untuk membuka pintu"}
              </span>
            </div>
          </div>
        ) : (
          /* Evening Checklist */
          <div className="space-y-2 text-xs">
            {/* 1. Mandi Malam */}
            <div
              className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
                rumahState.hasShoweredEvening
                  ? "text-emerald-400 bg-emerald-950/20"
                  : "text-quatro-cream/80 bg-quatro-slate/40"
              }`}
            >
              {rumahState.hasShoweredEvening ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-quatro-amber shrink-0 animate-pulse" />
              )}
              <div className="flex items-center space-x-2 flex-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mandi bersihkan lelah di kamar mandi</span>
              </div>
            </div>

            {/* 2. Makan Malam */}
            <div
              className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
                rumahState.hasEatenEvening
                  ? "text-emerald-400 bg-emerald-950/20"
                  : "text-quatro-cream/80 bg-quatro-slate/40"
              }`}
            >
              {rumahState.hasEatenEvening ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-quatro-amber shrink-0" />
              )}
              <div className="flex items-center space-x-2 flex-1">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                <span>Makan malam di ruang makan</span>
              </div>
            </div>

            {/* 3. Tidur */}
            <div
              className={`flex items-center space-x-2.5 p-1.5 rounded-lg transition-colors ${
                rumahState.canSleepEvening
                  ? "text-purple-300 bg-purple-950/30 border border-purple-500/40"
                  : "text-quatro-cream/40"
              }`}
            >
              <Bed className={`w-4 h-4 ${rumahState.canSleepEvening ? "text-purple-400 animate-pulse" : ""}`} />
              <span className={rumahState.canSleepEvening ? "font-bold text-purple-200" : ""}>
                {rumahState.canSleepEvening
                  ? "Tidur di kasur untuk lanjut hari berikutnya [E]"
                  : "Selesaikan mandi dan makan malam dahulu"}
              </span>
            </div>
          </div>
        )}

        {/* Nearby Action Prompt Button */}
        {nearbyAction && onAction && (
          <button
            onClick={() => onAction(nearbyAction)}
            className="mt-3 w-full py-2 bg-quatro-amber hover:bg-quatro-warmOrange text-quatro-navy font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow cursor-pointer animate-pulse"
          >
            Tekan [E] atau Klik: Interaksi {nearbyAction}
          </button>
        )}
      </div>
    </div>
  );
}
