"use client";

import { useState, useEffect } from "react";
import { soundManager } from "@/game/audio/SoundManager";
import { Terminal, Bug, GitBranch, Check, X, Sparkles } from "lucide-react";

interface OfficeWorkstationModalProps {
  isOpen: boolean;
  dayNumber: number;
  onComplete: () => void;
  onClose: () => void;
}

interface BugEntity {
  id: number;
  x: number;
  y: number;
  caught: boolean;
}

export function OfficeWorkstationModal({
  isOpen,
  dayNumber,
  onComplete,
  onClose,
}: OfficeWorkstationModalProps) {
  const [activeTab, setActiveTab] = useState<"CODE" | "BUGS" | "PUSH">("CODE");

  // Task 1: Code Typing
  const [codeTypedProgress, setCodeTypedProgress] = useState(0);
  const targetCodeLines = [
    "// Quatro Reality Engine v2.000",
    "function renderCoordinateGrid(sector) {",
    "  const reality = inspectMemoryHeap();",
    "  if (reality.detectAnomaly()) {",
    "    reality.stabilizeQuantumThreads();",
    "  }",
    "  return sector.bindSemicolonAnchor();",
    "};",
  ];
  const targetCodeText = targetCodeLines.join("\n");

  // Task 2: Catch Bugs
  const [bugs, setBugs] = useState<BugEntity[]>([
    { id: 1, x: 20, y: 30, caught: false },
    { id: 2, x: 65, y: 25, caught: false },
    { id: 3, x: 40, y: 60, caught: false },
    { id: 4, x: 75, y: 70, caught: false },
    { id: 5, x: 15, y: 75, caught: false },
  ]);

  // Task 3: Push Repository
  const [isPushing, setIsPushing] = useState(false);
  const [pushProgress, setPushProgress] = useState(0);
  const [isPushed, setIsPushed] = useState(false);

  // Anomaly effects for Day 2 & 3
  const isAnomalyDay = dayNumber >= 2;
  const isDay3 = dayNumber === 3;

  const bugsCaughtCount = bugs.filter((b) => b.caught).length;
  const isCodeDone = codeTypedProgress >= targetCodeText.length;
  const isBugsDone = bugsCaughtCount >= 5;
  const allTasksFinished = isCodeDone && isBugsDone && isPushed;

  // Move uncaught bugs slightly every 1.2s
  useEffect(() => {
    if (!isOpen || activeTab !== "BUGS") return;
    const interval = setInterval(() => {
      setBugs((prev) =>
        prev.map((bug) => {
          if (bug.caught) return bug;
          const newX = Math.max(10, Math.min(85, bug.x + (Math.random() * 24 - 12)));
          const newY = Math.max(15, Math.min(80, bug.y + (Math.random() * 24 - 12)));
          return { ...bug, x: newX, y: newY };
        })
      );
    }, 1200);
    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  // Handle typing any key on keyboard
  useEffect(() => {
    if (!isOpen || activeTab !== "CODE" || isCodeDone) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Tab") return;
      soundManager.playKeyboardType();
      setCodeTypedProgress((prev) => Math.min(targetCodeText.length, prev + 2));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeTab, isCodeDone, targetCodeText]);

  if (!isOpen) return null;

  const handleSimulateType = () => {
    soundManager.playKeyboardType();
    setCodeTypedProgress((prev) => Math.min(targetCodeText.length, prev + 8));
  };

  const handleCatchBug = (id: number) => {
    soundManager.playBugCatch();
    setBugs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, caught: true } : b))
    );
  };

  const handleStartPush = () => {
    soundManager.playClick();
    setIsPushing(true);
    let p = 0;
    const interval = setInterval(() => {
      p += 25;
      setPushProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setIsPushing(false);
        setIsPushed(true);
        soundManager.playPurr();
      }
    }, 300);
  };

  const handleCompleteOfficeWork = () => {
    soundManager.playPurr();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div
        className={`w-full max-w-2xl bg-[#1e2430] border-4 rounded-xl shadow-2xl overflow-hidden flex flex-col text-[#e2e8f0] ${
          isDay3
            ? "border-purple-500 shadow-purple-900/40"
            : isAnomalyDay
            ? "border-amber-400/70"
            : "border-[#718096]"
        }`}
      >
        {/* CRT Titlebar */}
        <div className="bg-[#2d3748] px-4 py-2 flex items-center justify-between border-b-2 border-[#4a5568]">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-bold tracking-wider text-amber-300 ml-2">
              QUATRO WORKSTATION CRT-2000 • DAY {dayNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer px-1"
          >
            [X]
          </button>
        </div>

        {/* Anomaly Notice on Day 2 & 3 */}
        {isAnomalyDay && (
          <div className="bg-purple-950/60 border-b border-purple-500/40 px-4 py-1.5 text-[11px] text-purple-300 flex items-center justify-between animate-pulse">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>
                {isDay3
                  ? "ANOMALI KRITIS: Semicolon Void terdeteksi di pintu keluar kantor!"
                  : "PERINGATAN: Frekuensi glitch & anomali cahaya terdeteksi di sistem."}
              </span>
            </span>
            <span className="font-bold text-amber-400">;</span>
          </div>
        )}

        {/* Task Tabs Header */}
        <div className="flex bg-[#161a23] border-b border-[#2d3748] text-xs">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab("CODE");
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 transition-colors border-r border-[#2d3748] cursor-pointer ${
              activeTab === "CODE"
                ? "bg-[#242b38] text-amber-400 font-bold border-b-2 border-b-amber-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>1. Ketik Kode ({Math.round((codeTypedProgress / targetCodeText.length) * 100)}%)</span>
            {isCodeDone && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab("BUGS");
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 transition-colors border-r border-[#2d3748] cursor-pointer ${
              activeTab === "BUGS"
                ? "bg-[#242b38] text-amber-400 font-bold border-b-2 border-b-amber-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Bug className="w-4 h-4" />
            <span>2. Tangkap Bug ({bugsCaughtCount}/5)</span>
            {isBugsDone && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab("PUSH");
            }}
            className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 transition-colors cursor-pointer ${
              activeTab === "PUSH"
                ? "bg-[#242b38] text-amber-400 font-bold border-b-2 border-b-amber-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>3. Push Repo</span>
            {isPushed && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 flex-1 min-h-[300px] flex flex-col justify-between">
          {/* TAB 1: KETIK KODE PROGRAM */}
          {activeTab === "CODE" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Instruksi: Ketik di keyboard atau klik tombol di bawah untuk melengkapi kode program.</span>
                <span className="text-amber-400 font-bold">
                  {Math.round((codeTypedProgress / targetCodeText.length) * 100)}%
                </span>
              </div>

              {/* Terminal Code Display */}
              <div
                onClick={handleSimulateType}
                className="bg-[#0f131a] border border-[#2d3748] rounded-lg p-4 font-mono text-xs leading-relaxed min-h-[180px] cursor-pointer select-none text-emerald-400 overflow-hidden relative shadow-inner"
              >
                <div className="text-gray-300 whitespace-pre">
                  {targetCodeText.slice(0, codeTypedProgress)}
                  <span className="animate-ping text-amber-400 font-bold">|</span>
                  <span className="opacity-25 text-gray-500">
                    {targetCodeText.slice(codeTypedProgress)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleSimulateType}
                  disabled={isCodeDone}
                  className="flex-1 py-2.5 bg-quatro-amber hover:bg-quatro-warmOrange disabled:opacity-40 text-quatro-navy font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {isCodeDone ? "KODE SELESAI DITIK ✓" : "KETIK BARIS KODE (KLIK/KETIK KEYBOARD) →"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CATCH BUGS */}
          {activeTab === "BUGS" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Klik kutu error (bug) yang bergerak di layar untuk menangkapnya:</span>
                <span className="text-emerald-400 font-bold">{bugsCaughtCount} / 5 Tertangkap</span>
              </div>

              {/* Bug Arena */}
              <div className="relative w-full h-[200px] bg-[#0c1017] border-2 border-dashed border-[#2d3748] rounded-xl overflow-hidden shadow-inner">
                {bugs.map((bug) => (
                  <button
                    key={bug.id}
                    disabled={bug.caught}
                    onClick={() => handleCatchBug(bug.id)}
                    style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 cursor-pointer ${
                      bug.caught
                        ? "opacity-20 scale-75 pointer-events-none"
                        : "hover:scale-125 animate-bounce"
                    }`}
                  >
                    <div className="p-2 bg-red-950/80 border border-red-500/60 rounded-full shadow-lg">
                      <Bug className="w-5 h-5 text-red-400" />
                    </div>
                  </button>
                ))}

                {isBugsDone && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                    <div className="text-center space-y-1">
                      <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                      <span className="text-xs font-bold text-emerald-300">
                        SEMUA BUG BERHASIL DIBERSIHKAN!
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-gray-400 text-center">
                {isBugsDone
                  ? "Lanjut ke tab Push Repo untuk mengirim hasil pekerjaan."
                  : "Tangkap semua 5 bug yang mengganggu program."}
              </div>
            </div>
          )}

          {/* TAB 3: PUSH REPOSITORY */}
          {activeTab === "PUSH" && (
            <div className="space-y-4">
              <div className="text-xs text-gray-400">
                Git Production Pipeline: Commit perubahan dan push ke server perusahaan.
              </div>

              <div className="bg-[#0f131a] border border-[#2d3748] rounded-lg p-3 space-y-2 text-xs font-mono">
                <div className="text-gray-400">$ git status</div>
                <div className="text-emerald-400">
                  On branch master: {isCodeDone ? "Code verified ✓" : "Waiting for code..."} |{" "}
                  {isBugsDone ? "0 bugs found ✓" : "Bugs remaining..."}
                </div>
                {isPushing && (
                  <div className="text-amber-300 animate-pulse">
                    $ git push origin master... [{pushProgress}%]
                  </div>
                )}
                {isPushed && (
                  <div className="text-emerald-300 font-bold">
                    ✓ To https://github.com/company/telemetry.git [master -&gt; master]
                  </div>
                )}
              </div>

              {!isPushed ? (
                <button
                  onClick={handleStartPush}
                  disabled={!isCodeDone || !isBugsDone || isPushing}
                  className="w-full py-3 bg-quatro-amber hover:bg-quatro-warmOrange disabled:opacity-40 text-quatro-navy font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer shadow"
                >
                  {isPushing
                    ? "SEDANG MENGIRIM REPOSITORY..."
                    : !isCodeDone || !isBugsDone
                    ? "SELESAIKAN KETIK KODE & BUG DAHULU"
                    : "PUSH REPOSITORY KE SERVER →"}
                </button>
              ) : (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg text-xs text-emerald-300 text-center font-bold">
                  REPOSITORY BERHASIL DI-PUSH! SEMUA TASK HARI INI SELESAI.
                </div>
              )}
            </div>
          )}

          {/* Bottom Completion Banner */}
          {allTasksFinished && (
            <div className="mt-4 pt-3 border-t border-[#2d3748] space-y-2">
              <button
                onClick={handleCompleteOfficeWork}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg animate-pulse"
              >
                {isDay3
                  ? "TUGAS SELESAI! MENUJU PORTAL DIMENSI DI PINTU KANTOR →"
                  : "TUGAS SELESAI! KELUAR DARI KANTOR & PULANG →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
