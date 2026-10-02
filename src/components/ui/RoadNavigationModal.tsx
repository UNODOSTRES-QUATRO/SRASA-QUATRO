"use client";

import { Home, Briefcase, Wrench, ShieldAlert } from "lucide-react";
import { soundManager } from "@/game/audio/SoundManager";

interface RoadNavigationModalProps {
  isVoidHighway?: boolean;
  onSelectDestination: (dest: "RUMAH" | "TEMPAT_KERJA" | "BENGKEL" | "KASTIL") => void;
}

export function RoadNavigationModal({
  isVoidHighway = false,
  onSelectDestination,
}: RoadNavigationModalProps) {
  const handleSelect = (dest: "RUMAH" | "TEMPAT_KERJA" | "BENGKEL" | "KASTIL") => {
    soundManager.playClick();
    onSelectDestination(dest);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-full px-4 font-mono select-none pointer-events-auto">
      <div className="bg-quatro-navy/95 backdrop-blur-lg border-2 border-quatro-amber/40 rounded-3xl p-5 shadow-2xl flex flex-col space-y-4">
        {/* Dashboard Top Status */}
        <div className="flex items-center justify-between border-b border-quatro-cream/15 pb-2.5">
          <div className="flex items-center space-x-2.5">
            <span
              className={`w-3 h-3 rounded-full animate-pulse ${
                isVoidHighway ? "bg-purple-400" : "bg-emerald-400"
              }`}
            />
            <span className="text-xs uppercase tracking-widest text-quatro-cream font-bold">
              {isVoidHighway ? "NAVIGASI DIMENSI VOID • SPEED: 110 KM/H" : "SISTEM NAVIGASI MOBIL QUATRO • SPEED: 80 KM/H"}
            </span>
          </div>
          <span className="text-[11px] text-quatro-amber font-bold">
            {isVoidHighway ? "LOKASI TUNGGAL TERDETEKSI" : "PILIH TUJUAN PERJALANAN"}
          </span>
        </div>

        {/* Destination Cards */}
        {!isVoidHighway ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Ke Rumah */}
            <button
              onClick={() => handleSelect("RUMAH")}
              className="group flex flex-col items-center p-4 bg-quatro-slate/40 hover:bg-quatro-amber/15 border border-quatro-cream/10 hover:border-quatro-amber rounded-2xl transition-all duration-200 text-center cursor-pointer shadow hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-xl bg-quatro-slate flex items-center justify-center mb-2.5 group-hover:bg-quatro-amber transition-colors">
                <Home className="w-6 h-6 text-quatro-amber group-hover:text-quatro-navy" />
              </div>
              <span className="text-xs font-bold text-quatro-cream group-hover:text-quatro-amber uppercase">
                Ke Rumah
              </span>
              <span className="text-[10px] text-quatro-cream/50 mt-1 leading-snug">
                Kembali ke rumah untuk istirahat & rutinitas harian.
              </span>
            </button>

            {/* Ke Tempat Kerja */}
            <button
              onClick={() => handleSelect("TEMPAT_KERJA")}
              className="group flex flex-col items-center p-4 bg-quatro-slate/40 hover:bg-quatro-amber/15 border border-quatro-cream/10 hover:border-quatro-amber rounded-2xl transition-all duration-200 text-center cursor-pointer shadow hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-xl bg-quatro-slate flex items-center justify-center mb-2.5 group-hover:bg-quatro-amber transition-colors">
                <Briefcase className="w-6 h-6 text-quatro-amber group-hover:text-quatro-navy" />
              </div>
              <span className="text-xs font-bold text-quatro-cream group-hover:text-quatro-amber uppercase">
                Ke Tempat Kerja
              </span>
              <span className="text-[10px] text-quatro-cream/50 mt-1 leading-snug">
                Kantor 2000-an, selesaikan tugas pemrograman di PC.
              </span>
            </button>

            {/* Ke Bengkel Mobil */}
            <button
              onClick={() => handleSelect("BENGKEL")}
              className="group flex flex-col items-center p-4 bg-quatro-slate/40 hover:bg-quatro-amber/15 border border-quatro-cream/10 hover:border-quatro-amber rounded-2xl transition-all duration-200 text-center cursor-pointer shadow hover:scale-[1.02]"
            >
              <div className="w-12 h-12 rounded-xl bg-quatro-slate flex items-center justify-center mb-2.5 group-hover:bg-quatro-amber transition-colors">
                <Wrench className="w-6 h-6 text-quatro-amber group-hover:text-quatro-navy" />
              </div>
              <span className="text-xs font-bold text-quatro-cream group-hover:text-quatro-amber uppercase">
                Ke Bengkel Mobil
              </span>
              <span className="text-[10px] text-quatro-cream/50 mt-1 leading-snug">
                Servis Quatro, periksa mesin, dan bincang dengan montir.
              </span>
            </button>
          </div>
        ) : (
          /* Dimensi Lain: HANYA ADA SATU PILIHAN: KE KASTIL! */
          <div className="w-full">
            <button
              onClick={() => handleSelect("KASTIL")}
              className="w-full group flex items-center justify-between p-5 bg-purple-950/40 hover:bg-purple-900/60 border-2 border-purple-500/50 hover:border-purple-400 rounded-2xl transition-all duration-200 cursor-pointer shadow-lg hover:scale-[1.01]"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-900/60 border border-purple-400/40 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                  <ShieldAlert className="w-7 h-7 text-purple-300 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-purple-200 group-hover:text-white uppercase tracking-wider flex items-center space-x-2">
                    <span>KE KASTIL SEMICOLON</span>
                    <span className="text-xs text-quatro-amber font-mono font-normal">// SATU-SATUNYA JALAN</span>
                  </div>
                  <p className="text-xs text-purple-300/70 mt-1 max-w-md">
                    Benteng kuno era pertengahan di ujung cakrawala void. Masuki gerbang dan pecahkan rahasia dunia.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-300 group-hover:text-white bg-purple-800/60 px-4 py-2 rounded-xl border border-purple-400/40 tracking-wider">
                BERANGKAT →
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
