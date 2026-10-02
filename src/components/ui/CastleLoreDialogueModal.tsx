"use client";

import { soundManager } from "@/game/audio/SoundManager";
import { MessageSquare, Shield, BookOpen, Sparkles, X } from "lucide-react";

interface CastleLoreDialogueModalProps {
  npcId: "jeffrey" | "vespera" | "barnaby" | null;
  easterEggNotification: string | null;
  onClose: () => void;
}

export function CastleLoreDialogueModal({
  npcId,
  easterEggNotification,
  onClose,
}: CastleLoreDialogueModalProps) {
  if (!npcId && !easterEggNotification) return null;

  const npcData = {
    jeffrey: {
      name: "SIR JEFFREY (PENJAGA BENTENG)",
      icon: <Shield className="w-6 h-6 text-amber-400" />,
      avatar: "🛡️",
      quote:
        "Halt! Kau datang menembus kabut kehampaan. Benteng ini didirikan di atas fondasi kompilasi pertama. Hati-hati jika melangkah ke dalam aula utama... gerbang berat itu kerap mengunci siapa saja yang tidak memiliki Kunci Master!",
    },
    vespera: {
      name: "LADY VESPERA (PENYIHIR KERAJAAN)",
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      avatar: "🔮",
      quote:
        "Energi Semicolon mengalir di setiap batu bata kastil ini. Sang Pemrogram menyembunyikan simbol rahasia di tempat yang tak terduga—air mancur, jerami, dan perapian kuno. Carilah ketiga tanda itu bila kau ingin bebas!",
    },
    barnaby: {
      name: "BARNABY (CENDEKIAWAN PENGEMBARA)",
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      avatar: "📜",
      quote:
        "Catatanku menyebutkan: Di dalam aula besar, lemari tua menyimpan gulungan sandi. Dan pada perapian batu, terdapat angka keramat. Periksa dinding rahasia dengan cermat sebelum memutar kunci keluar!",
    },
  };

  const currentNpc = npcId ? npcData[npcId] : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      {/* NPC Dialogue Box */}
      {currentNpc && (
        <div className="max-w-lg w-full bg-[#1e293b] border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-gray-700 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">{currentNpc.avatar}</span>
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  {currentNpc.name}
                </div>
                <div className="text-[10px] text-gray-400">PENGHUNI KASTIL SEMICOLON</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-sm font-sans text-gray-200 leading-relaxed bg-[#0f172a] border border-gray-800 rounded-2xl p-4">
            "{currentNpc.quote}"
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
          >
            TUTUP PERCAKAPAN [ESC]
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
