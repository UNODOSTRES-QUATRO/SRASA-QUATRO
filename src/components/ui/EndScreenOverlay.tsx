"use client";

import { soundManager } from "@/game/audio/SoundManager";
import { RotateCcw, Sparkles, Trophy, Heart } from "lucide-react";

interface EndScreenOverlayProps {
  stats: {
    daysCompleted: number;
    bugsCaught: number;
    easterEggsFound: number;
  };
  onPlayAgain: () => void;
}

export function EndScreenOverlay({ stats, onPlayAgain }: EndScreenOverlayProps) {
  const handleRestart = () => {
    soundManager.playClick();
    onPlayAgain();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090b10] text-[#f8fafc] flex flex-col items-center justify-between p-6 overflow-y-auto font-mono select-none">
      {/* Background Cosmic Glow */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Header */}
      <div className="text-center pt-8 z-10 space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Epilogue • Syntax Restored</span>
        </div>
      </div>

      {/* Central Majestic Semicolon Symbol */}
      <div className="my-8 flex flex-col items-center justify-center z-10">
        <div className="relative">
          <div className="text-8xl md:text-9xl font-bold text-amber-400 drop-shadow-[0_0_40px_rgba(251,191,36,0.6)] animate-pulse">
            ;
          </div>
          <div className="absolute -inset-4 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest text-amber-100 mt-4 text-center">
          The Semicolon
        </h1>
        <p className="text-xs text-amber-200/60 tracking-wider uppercase mt-1">
          Keseimbangan Semesta Telah Pulih
        </p>

        <p className="max-w-lg text-center text-xs md:text-sm text-gray-300 font-sans leading-relaxed mt-4 px-4">
          Kamu telah melintasi rutinitas rumah, jalanan aspal tak berujung, tekanan kantor era 2000-an,
          menembus portal dimensi void, dan memecahkan teka-teki ruang rahasia di Kastil Kuno.
          Realitas kini kembali terkompilasi dengan sempurna.
        </p>
      </div>

      {/* Player Stats Recap Card */}
      <div className="max-w-md w-full bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 shadow-xl z-10 mb-6">
        <div className="flex items-center justify-center space-x-2 text-xs font-bold text-amber-300 mb-3 uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Statistik Perjalanan</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2 bg-slate-800/60 rounded-xl">
            <div className="text-gray-400 text-[10px] uppercase">Hari Bertahan</div>
            <div className="text-sm font-bold text-amber-400 mt-0.5">{stats.daysCompleted} Hari</div>
          </div>
          <div className="p-2 bg-slate-800/60 rounded-xl">
            <div className="text-gray-400 text-[10px] uppercase">Bug Tertangkap</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">5 / 5</div>
          </div>
          <div className="p-2 bg-slate-800/60 rounded-xl">
            <div className="text-gray-400 text-[10px] uppercase">Easter Eggs</div>
            <div className="text-sm font-bold text-purple-400 mt-0.5">{stats.easterEggsFound} / 3</div>
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="max-w-xl w-full text-center z-10 space-y-3 mb-8 text-[11px] text-gray-400">
        <div className="border-t border-gray-800 pt-4">
          <div className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-2">
            CREDITS
          </div>
          <p className="text-gray-400">
            Karya Petualangan Interaktif 6 Lokasi — <span className="text-amber-300 font-bold">SRASA-QUATRO</span>
          </p>
          <p className="text-gray-500 mt-1">
            Teknologi: React Three Fiber, Three.js, Next.js, Web Audio Procedural Synthesis
          </p>
          <div className="flex items-center justify-center space-x-1.5 text-gray-500 mt-2">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>untuk para programmer yang tidak pernah lupa titik koma.</span>
          </div>
        </div>
      </div>

      {/* Play Again Button */}
      <div className="pb-6 z-10 w-full max-w-sm">
        <button
          onClick={handleRestart}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-bold rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-2xl hover:scale-[1.02]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>MAIN LAGI DARI HARI 1</span>
        </button>
      </div>
    </div>
  );
}
