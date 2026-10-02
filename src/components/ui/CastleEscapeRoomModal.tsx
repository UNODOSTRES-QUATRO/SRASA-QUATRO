"use client";

import { useEffect, useRef, useState } from "react";
import { soundManager } from "@/game/audio/SoundManager";
import { KastilState } from "@/game/core/gameStore";
import { Key, Lock, Unlock, Flame, Archive, Eye, Check } from "lucide-react";

interface CastleEscapeRoomModalProps {
  isOpen: boolean;
  inspectTarget: "CABINET" | "STOVE" | "SECRET_WALL" | "EXIT_DOOR" | null;
  escapeRoomState: KastilState["escapeRoom"];
  onUpdateEscapeRoom: (updates: Partial<KastilState["escapeRoom"]>) => void;
  onEscapeCastle: () => void;
  onClose: () => void;
}

export function CastleEscapeRoomModal({
  isOpen,
  inspectTarget,
  escapeRoomState,
  onUpdateEscapeRoom,
  onEscapeCastle,
  onClose,
}: CastleEscapeRoomModalProps) {
  // Combination code dials for the hidden wall safe: [7, 4, 2]
  const [dial1, setDial1] = useState(0);
  const [dial2, setDial2] = useState(0);
  const [dial3, setDial3] = useState(0);
  const [codeError, setCodeError] = useState(false);
  const leaveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setCodeError(false);
  }, [inspectTarget]);

  useEffect(() => () => {
    if (leaveTimerRef.current !== null) window.clearTimeout(leaveTimerRef.current);
  }, []);

  if (!isOpen || !inspectTarget) return null;

  const handleSearchCabinet = () => {
    soundManager.playDoorOpen();
    onUpdateEscapeRoom({ cabinetSearched: true });
  };

  const handleCheckStove = () => {
    soundManager.playCook();
    onUpdateEscapeRoom({ stoveChecked: true });
  };

  const handlePressSecretWall = () => {
    soundManager.playPurr();
    onUpdateEscapeRoom({ secretWallRevealed: true });
  };

  const handleUnlockSafe = () => {
    if (dial1 === 7 && dial2 === 4 && dial3 === 2) {
      soundManager.playKeyPickup();
      setCodeError(false);
      onUpdateEscapeRoom({ puzzleSolved: true, hasMasterKey: true });
    } else {
      soundManager.playClick();
      setCodeError(true);
    }
  };

  const handleUnlockDoor = () => {
    soundManager.playDoorOpen();
    onUpdateEscapeRoom({ doorUnlocked: true });
    onClose();
    leaveTimerRef.current = window.setTimeout(onEscapeCastle, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="max-w-lg w-full bg-[#18181b] border-2 border-amber-500/70 rounded-3xl p-6 shadow-2xl flex flex-col space-y-5 text-gray-200">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
              ESCAPE ROOM KASTIL • PEMERIKSAAN
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            [ESC / TUTUP]
          </button>
        </div>

        {/* 1. INSPECT TARGET: CABINET (LEMARI) */}
        {inspectTarget === "CABINET" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-amber-300">
              <Archive className="w-6 h-6" />
              <span className="text-sm font-bold uppercase">Lemari Antik Abad Pertengahan</span>
            </div>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Sebuah lemari kayu mahoni tua bertabur ukiran simbol rahasia. Terdapat beberapa laci yang agak macet karena usia.
            </p>

            {!escapeRoomState.cabinetSearched ? (
              <button
                onClick={handleSearchCabinet}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
              >
                BUKA & GELEDAH ISI LACI →
              </button>
            ) : (
              <div className="p-4 bg-amber-950/40 border border-amber-400/40 rounded-2xl text-xs space-y-2">
                <div className="text-amber-300 font-bold flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Petunjuk Ditemukan: Gulungan Kuno</span>
                </div>
                <p className="text-gray-300 italic font-sans">
                  "Digit PERTAMA dari peti rahasia adalah: 7. Jangan lupakan perapian di seberang sana."
                </p>
              </div>
            )}
          </div>
        )}

        {/* 2. INSPECT TARGET: STOVE (DAPUR & KOMPOR) */}
        {inspectTarget === "STOVE" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-orange-400">
              <Flame className="w-6 h-6" />
              <span className="text-sm font-bold uppercase">Dapur & Kompor Perapian Batu</span>
            </div>
            <p className="text-xs text-gray-300 font-sans leading-relaxed">
              Perapian batu dan tungku masak tempat memasak para juru masak kastil kuno. Bara api masih berpijar hangat.
            </p>

            {!escapeRoomState.stoveChecked ? (
              <button
                onClick={handleCheckStove}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-stone-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
              >
                PERIKSA TUNGKU & ABU PERAPIAN →
              </button>
            ) : (
              <div className="p-4 bg-orange-950/40 border border-orange-400/40 rounded-2xl text-xs space-y-2">
                <div className="text-orange-300 font-bold flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Petunjuk Ditemukan: Kepingan Bara Berukir</span>
                </div>
                <p className="text-gray-300 italic font-sans">
                  "Di bagian bawah tungku kompor tertulis angka KEDUA: 4. Angka ini dijaga oleh panas bara."
                </p>
              </div>
            )}
          </div>
        )}

        {/* 3. INSPECT TARGET: SECRET WALL (TEMBOK RAHASIA) */}
        {inspectTarget === "SECRET_WALL" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-purple-400">
              <Eye className="w-6 h-6" />
              <span className="text-sm font-bold uppercase">Tembok Rahasia & Peti Sandi</span>
            </div>

            {!escapeRoomState.secretWallRevealed ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-300 font-sans leading-relaxed">
                  Salah satu batu bata pada dinding kastil terlihat sedikit menonjol dan longgar di samping rak buku.
                </p>
                <button
                  onClick={handlePressSecretWall}
                  disabled={!escapeRoomState.cabinetSearched || !escapeRoomState.stoveChecked}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
                >
                  {!escapeRoomState.cabinetSearched || !escapeRoomState.stoveChecked
                    ? "TEMUKAN PETUNJUK LEMARI DAN PERAPIAN DAHULU"
                    : "TEKAN BATU BATA RAHASIA →"}
                </button>
              </div>
            ) : !escapeRoomState.hasMasterKey ? (
              <div className="space-y-4">
                <p className="text-xs text-purple-200 font-sans">
                  Dinding bergeser! Di baliknya terdapat brankas besi kuno dengan petunjuk: *"Digit ketiga adalah 2."*
                </p>

                {/* 3 Dials Combination */}
                <div className="flex items-center justify-center space-x-4 py-2">
                  {[
                    { val: dial1, set: setDial1, label: "Digit 1" },
                    { val: dial2, set: setDial2, label: "Digit 2" },
                    { val: dial3, set: setDial3, label: "Digit 3" },
                  ].map((dial, dIdx) => (
                    <div key={`dial-${dIdx}`} className="flex flex-col items-center space-y-1">
                      <span className="text-[10px] text-gray-400">{dial.label}</span>
                      <button
                        onClick={() => dial.set((prev) => (prev + 1) % 10)}
                        className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 border-2 border-amber-400/60 text-lg font-bold text-amber-300 flex items-center justify-center cursor-pointer shadow"
                      >
                        {dial.val}
                      </button>
                      <span className="text-[9px] text-gray-500">// klik ubah</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUnlockSafe}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-stone-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
                >
                  BUKA BRANKAS RAHASIA →
                </button>
                {codeError && (
                  <p role="alert" className="text-center text-xs text-rose-300">
                    Mekanisme tidak bergerak. Periksa kembali urutan tiga petunjuk.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-emerald-950/40 border border-emerald-400/40 rounded-2xl text-xs space-y-2 text-center">
                <Key className="w-8 h-8 text-amber-400 mx-auto animate-bounce" />
                <div className="text-emerald-300 font-bold">
                  MASTER CASTLE KEY TELAH DI TANGAN!
                </div>
                <p className="text-gray-300 font-sans">
                  Kunci emas kuno berbentuk lambang Semicolon. Pergilah ke Pintu Keluar Kastil untuk membuka gembok!
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4. INSPECT TARGET: EXIT DOOR (PINTU KELUAR) */}
        {inspectTarget === "EXIT_DOOR" && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-amber-300">
              {escapeRoomState.hasMasterKey ? (
                <Unlock className="w-6 h-6 text-emerald-400" />
              ) : (
                <Lock className="w-6 h-6 text-red-400" />
              )}
              <span className="text-sm font-bold uppercase">Gerbang Keluar Kastil Semicolon</span>
            </div>

            {!escapeRoomState.hasMasterKey ? (
              <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl text-xs space-y-2">
                <div className="text-red-400 font-bold">GERBANG TERKUNCI RAPAT!</div>
                <p className="text-gray-300 font-sans">
                  Gembok emas besar berbentuk Semicolon menahan pintu gerbang. Kamu memerlukan Master Castle Key yang tersembunyi di brankas dinding rahasia.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-emerald-950/40 border border-emerald-400/40 rounded-2xl text-xs space-y-2 text-emerald-200 font-sans">
                  Kamu memasukkan Master Castle Key ke lubang kunci... Mekanisme gerbang berputar dan terbuka!
                </div>
                <button
                  onClick={handleUnlockDoor}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-stone-950 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all cursor-pointer shadow-xl animate-pulse"
                >
                  KELUAR DARI KASTIL &rarr; MENUJU END SCREEN
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
