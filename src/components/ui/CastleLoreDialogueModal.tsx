"use client";

import { useEffect, useState } from "react";
import { soundManager } from "@/game/audio/SoundManager";
import { BookOpen, Shield, Sparkles, Wrench, X } from "lucide-react";
import { CharacterPortrait } from "./CharacterPortraits";

interface CastleLoreDialogueModalProps {
  npcId: "jeffrey" | "vespera" | "barnaby" | "mechanic" | null;
  easterEggNotification: string | null;
  onClose: () => void;
}

export function CastleLoreDialogueModal({
  npcId,
  easterEggNotification,
  onClose,
}: CastleLoreDialogueModalProps) {
  const [lineIndex, setLineIndex] = useState(0);
  if (!npcId && !easterEggNotification) return null;

  const npcData = {
    jeffrey: {
      name: "SIR JEFFREY (PENJAGA BENTENG)",
      icon: <Shield className="w-6 h-6 text-amber-400" />,
      portraitId: "JEFFREY" as const,
      lines: [
        "Halt! Kau datang menembus kabut kehampaan. Benteng ini berdiri di atas fondasi kompilasi pertama.",
        "Aula utama mengunci siapa pun yang masuk tanpa Kunci Master. Jangan abaikan ukiran pada benda-benda tua di dalam.",
      ],
    },
    vespera: {
      name: "LADY VESPERA (PENYIHIR KERAJAAN)",
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      portraitId: "VESPERA" as const,
      lines: [
        "Energi Semicolon mengalir di setiap batu bata kastil ini. Tiga benda menjaga rahasia aula.",
        "Ikuti urutan lemari, perapian, lalu batu lepas. Air mancur menyimpan jeda, bukan angka sandi.",
      ],
    },
    barnaby: {
      name: "BARNABY (CENDEKIAWAN PENGEMBARA)",
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      portraitId: "BARNABY" as const,
      lines: [
        "Catatanku menyebutkan lemari tua menyimpan awal sandi, sementara perapian menjaga angka berikutnya.",
        "Setelah dua tanda itu ditemukan, cari batu yang longgar di dekat rak buku. Urutan petunjuk adalah kuncinya.",
      ],
    },
    mechanic: {
      name: "PAK MONTIR",
      icon: <Wrench className="w-6 h-6 text-amber-400" />,
      portraitId: "MECHANIC" as const,
      lines: [
        "Halo, Bung. Quatro-mu sudah ku-tune up dan dicuci bersih.",
        "Mesinnya terdengar mantap. Jalanan di luar sudah menunggu. Hati-hati di tikungan.",
      ],
    },
  };

  const currentNpc = npcId ? npcData[npcId] : null;
  const lines = currentNpc?.lines ?? [];
  const closeDialogue = () => {
    setLineIndex(0);
    onClose();
  };
  const advanceDialogue = () => {
    soundManager.playClick();
    if (lineIndex + 1 >= lines.length) closeDialogue();
    else setLineIndex((current) => current + 1);
  };

  useEffect(() => {
    setLineIndex(0);
  }, [npcId]);

  useEffect(() => {
    if (!npcId) return;
    const handleDialogueKey = (event: KeyboardEvent) => {
      if (event.code === "KeyE" || event.code === "Enter" || event.code === "Space") {
        if (event.repeat) return;
        event.preventDefault();
        advanceDialogue();
      }
    };
    window.addEventListener("keydown", handleDialogueKey);
    return () => window.removeEventListener("keydown", handleDialogueKey);
  }, [npcId, lineIndex]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      {/* NPC Dialogue Box */}
      {currentNpc && (
        <div className="max-w-lg w-full bg-[#1e293b] border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700 pb-3">
            <div className="flex items-center space-x-3">
              <CharacterPortrait
                characterId={currentNpc.portraitId}
                size={52}
                className="border border-amber-400/40 rounded-2xl bg-slate-900 shrink-0"
              />
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {currentNpc.name}
                </div>
                <div className="text-[10px] text-gray-400">PENGHUNI KASTIL SEMICOLON</div>
              </div>
            </div>
            <button
              onClick={closeDialogue}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-sm font-sans text-gray-200 leading-relaxed bg-[#0f172a] border border-gray-800 rounded-2xl p-4 min-h-24">
            “{lines[lineIndex]}”
          </div>

          <button
            onClick={advanceDialogue}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
          >
            {lineIndex + 1 >= lines.length ? "AKHIRI [E]" : "LANJUTKAN [E]"}
          </button>
        </div>
      )}

      {/* Easter Egg Popup Notification */}
      {easterEggNotification && (
        <div className="max-w-sm w-full bg-amber-950/90 border-2 border-amber-400 rounded-2xl p-4 shadow-2xl text-center space-y-2 animate-bounce">
          <div className="text-2xl">✨ ; ✨</div>
          <div className="text-xs font-bold text-amber-300 uppercase">
            EASTER EGG SEMICOLON DITEMUKAN!
          </div>
          <div className="text-[11px] text-amber-100 font-sans">
            {easterEggNotification}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-400 text-amber-950 font-bold rounded-lg text-xs cursor-pointer"
          >
            LANJUTKAN
          </button>
        </div>
      )}
    </div>
  );
}
