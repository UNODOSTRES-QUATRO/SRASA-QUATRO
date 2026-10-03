"use client";

import { useState } from "react";
import { soundManager } from "@/game/audio/SoundManager";
import { Sparkles, ArrowRight } from "lucide-react";
import { CharacterPortrait } from "./CharacterPortraits";

interface VoidLoreCutsceneModalProps {
  isOpen: boolean;
  onEnterVoidHighway: () => void;
}

export function VoidLoreCutsceneModal({
  isOpen,
  onEnterVoidHighway,
}: VoidLoreCutsceneModalProps) {
  const [dialogStep, setDialogStep] = useState(0);

  if (!isOpen) return null;

  const dialogues = [
    {
      speaker: "SANG SAGE (OLD MAN)",
      text: "Selamat datang di Dimensi Sintaksis Void, wahai penjelajah... Kamu telah melintasi gerbang portal dari kantormu.",
    },
    {
      speaker: "SANG SAGE (OLD MAN)",
      text: "Dunia kita dulunya utuh. Namun ketika Semicolon Agung lenyap dari baris perintah semesta, realitas terpecah menjadi glitch tak berujung.",
    },
    {
      speaker: "SANG SAGE (OLD MAN)",
      text: "Mobil Quatro-mu memegang frekuensi kestabilan. Naiklah kembali ke mobilmu. Hanya ada SATU jalan raya yang membentang di dimensi ini... Jalan menuju Sang Benteng Kuno: Kastil Semicolon.",
    },
  ];

  const handleNext = () => {
    soundManager.playClick();
    if (dialogStep < dialogues.length - 1) {
      setDialogStep((prev) => prev + 1);
    } else {
      soundManager.playPortalWhoosh();
      onEnterVoidHighway();
    }
  };

  const current = dialogues[dialogStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 font-mono select-none">
      <div className="max-w-xl w-full bg-[#170f2c] border-2 border-purple-500/70 rounded-3xl p-7 shadow-2xl flex flex-col space-y-6 relative overflow-hidden">
        {/* Glow ambient background aura */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-purple-400/20 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-xs uppercase tracking-widest text-purple-300 font-bold">
              DIMENSI LAIN • THE VOID CHRONICLES
            </span>
          </div>
          <span className="text-xs text-amber-400 font-bold">
            {dialogStep + 1} / {dialogues.length}
          </span>
        </div>

        {/* Character Portrait & Dialogue */}
        <div className="flex items-start space-x-4">
          {/* Old Man Sage Avatar */}
          <CharacterPortrait
            characterId="SAGE"
            size={68}
            className="rounded-2xl border-2 border-purple-400 bg-gradient-to-br from-purple-800 to-indigo-950 shadow-lg shrink-0"
          />

          <div className="flex-1 space-y-2">
            <div className="text-xs font-bold tracking-wider text-amber-400 uppercase">
              {current.speaker}
            </div>
            <div className="text-sm leading-relaxed text-purple-100 font-sans min-h-[70px]">
              "{current.text}"
            </div>
          </div>
        </div>

        {/* Next / Proceed Button */}
        <button
          onClick={handleNext}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg hover:shadow-purple-500/25"
        >
          <span>
            {dialogStep < dialogues.length - 1 ? "LANJUT BICARA" : "NAIK KE MOBIL QUATRO →"}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
