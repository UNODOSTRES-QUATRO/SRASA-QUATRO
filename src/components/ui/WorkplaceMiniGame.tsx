"use client";

import { useState } from "react";
import { soundManager } from "@/game/audio/SoundManager";

interface WorkplaceMiniGameProps {
  isOpen: boolean;
  dayNumber: number;
  onComplete: () => void;
  onClose: () => void;
}

interface CodeToken {
  id: string;
  label: string;
  correctIndex: number;
}

export function WorkplaceMiniGame({
  isOpen,
  dayNumber,
  onComplete,
  onClose,
}: WorkplaceMiniGameProps) {
  const [currentStage, setCurrentStage] = useState<"MEMO" | "LOGIC" | "DEPLOY">("MEMO");
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);

  if (!isOpen) return null;

  const dayMemos = {
    1: {
      from: "Dev Lead <sarah@quatro-systems.internal>",
      subject: "Morning Routine & Build Health",
      body: "Morning! Welcome back to another productive cycle. Today's sprint is standard: verify the telemetry pipeline and make sure we don't skip linting. Take your time—speed means nothing if we break the build. Remember: a clean semicolon keeps the engine grounded.",
    },
    2: {
      from: "Site Reliability <ops-alert@quatro-systems.internal>",
      subject: "URGENT: Spatial telemetry discrepancies in Sector 7",
      body: "We are seeing anomalous memory allocations from coordinate [7.2, 0, 141]. Several field sensors report roads flickering and tree models displacing by 1.5 units. Please inspect the reality sync loop before logging off today. Don't drive north of the bridge after sunset.",
    },
    3: {
      from: "SYSTEM OVERFLOW <root@voxel-core.rift>",
      subject: "✦ VOXEL DIMENSION SYNCHRONIZED",
      body: "Data buffers have merged with memory fragments. The routine is officially broken. The Castle Gate is awaiting the small and the patient.",
    },
  };

  const dayTokens: Record<number, CodeToken[]> = {
    1: [
      { id: "token-1", label: "const routine = new HumanLife();", correctIndex: 0 },
      { id: "token-2", label: "await routine.commuteThroughMorning();", correctIndex: 1 },
      { id: "token-3", label: "if (routine.fatigue > 0.8) routine.pause();", correctIndex: 2 },
      { id: "token-4", label: "; // Semicolon (Mindful Breath)", correctIndex: 3 },
    ],
    2: [
      { id: "token-1", label: "const reality = inspectCoordinateGrid();", correctIndex: 0 },
      { id: "token-2", label: "if (reality.detectGlitch('sector_100')) {", correctIndex: 1 },
      { id: "token-3", label: "  reality.unlockDualScaleVehicle();", correctIndex: 2 },
      { id: "token-4", label: "}; // Semicolon (The Portal Beckons)", correctIndex: 3 },
    ],
    3: [
      { id: "token-1", label: "const rift = enterVoxelSanctuary();", correctIndex: 0 },
      { id: "token-2", label: "rift.transformCarScale('POCKET');", correctIndex: 1 },
      { id: "token-3", label: "castlePortcullis.unsealByAncientRune();", correctIndex: 2 },
      { id: "token-4", label: "; // Semicolon (Eternal Serenity)", correctIndex: 3 },
    ],
  };

  const tokens = dayTokens[dayNumber] || dayTokens[1];
  const memo = dayMemos[dayNumber as 1 | 2 | 3] || dayMemos[1];

  const handleSelectToken = (id: string) => {
    soundManager.playClick();
    if (selectedTokens.includes(id)) return;

    const next = [...selectedTokens, id];
    setSelectedTokens(next);

    if (next.length === tokens.length) {
      const correctOrder = tokens.map((t) => t.id);
      const isCorrect = next.every((val, idx) => val === correctOrder[idx]);

      if (isCorrect) {
        soundManager.playPurr();
        setIsSuccess(true);
      } else {
        setTimeout(() => {
          setSelectedTokens([]);
        }, 650);
      }
    }
  };

  const handleStartDeploy = () => {
    soundManager.playClick();
    setIsDeploying(true);

    let current = 0;
    const interval = setInterval(() => {
      current += 20;
      setDeployProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        soundManager.playPurr();
      }
    }, 250);
  };

  const handleFinish = () => {
    soundManager.playClick();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-quatro-navy text-quatro-cream border-2 border-quatro-amber/40 rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col justify-between">
        {/* Terminal Header */}
        <div className="flex justify-between items-center border-b border-quatro-cream/10 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-quatro-amber animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-quatro-amber font-bold">
              WORKSTATION TERMINAL • DAY {dayNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-quatro-cream/60 hover:text-quatro-cream transition-colors cursor-pointer"
          >
            [ESC] EXIT
          </button>
        </div>

        {/* Stage Progress Pills */}
        <div className="flex space-x-2 mb-4 text-[10px] tracking-wider uppercase">
          <div
            className={`px-3 py-1 rounded-md border ${
              currentStage === "MEMO"
                ? "bg-quatro-amber text-quatro-navy font-bold border-quatro-amber"
                : "bg-quatro-slate/40 text-quatro-cream/60 border-quatro-cream/10"
            }`}
          >
            1. Daily Memo
          </div>
          <div
            className={`px-3 py-1 rounded-md border ${
              currentStage === "LOGIC"
                ? "bg-quatro-amber text-quatro-navy font-bold border-quatro-amber"
                : "bg-quatro-slate/40 text-quatro-cream/60 border-quatro-cream/10"
            }`}
          >
            2. Logic Diagnostics
          </div>
          <div
            className={`px-3 py-1 rounded-md border ${
              currentStage === "DEPLOY"
                ? "bg-quatro-amber text-quatro-navy font-bold border-quatro-amber"
                : "bg-quatro-slate/40 text-quatro-cream/60 border-quatro-cream/10"
            }`}
          >
            3. Pipeline Wrap-up
          </div>
        </div>

        {/* STAGE 1: DAILY MEMO */}
        {currentStage === "MEMO" && (
          <div className="space-y-4 my-2">
            <div className="bg-quatro-slate/40 border border-quatro-cream/15 rounded-xl p-4 text-xs space-y-2">
              <div className="text-quatro-cream/50">
                <span className="text-quatro-cream/80 font-bold">From:</span> {memo.from}
              </div>
              <div className="text-quatro-cream/50">
                <span className="text-quatro-cream/80 font-bold">Subject:</span> {memo.subject}
              </div>
              <div className="border-t border-quatro-cream/10 pt-2 text-quatro-cream/85 leading-relaxed font-sans text-xs">
                "{memo.body}"
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                setCurrentStage("LOGIC");
              }}
              className="w-full py-2.5 bg-quatro-amber text-quatro-navy font-bold rounded-xl text-xs tracking-wider hover:bg-quatro-warmOrange transition-all cursor-pointer shadow"
            >
              PROCEED TO LOGIC DIAGNOSTICS →
            </button>
          </div>
        )}

        {/* STAGE 2: LOGIC ORDERING */}
        {currentStage === "LOGIC" && (
          <div className="space-y-3 my-2">
            <p className="text-[11px] text-quatro-cream/70 italic">
              "Assemble the code statements in proper structural order to clear today's tickets."
            </p>

            <div className="bg-quatro-slate/40 border border-quatro-cream/15 rounded-xl p-3 min-h-[110px] flex flex-col justify-center space-y-1.5 text-xs">
              {selectedTokens.length === 0 ? (
                <span className="text-quatro-cream/40 italic text-[11px]">
                  // Click the syntax fragments below in sequence...
                </span>
              ) : (
                selectedTokens.map((id, index) => {
                  const token = tokens.find((t) => t.id === id);
                  return (
                    <div key={id} className="text-quatro-amber flex items-center space-x-2">
                      <span className="text-quatro-cream/40 text-[10px]">{index + 1}.</span>
                      <span className="font-mono">{token?.label}</span>
                    </div>
                  );
                })
              )}
            </div>

            {!isSuccess ? (
              <div className="space-y-1.5">
                {tokens.map((token) => {
                  const isChosen = selectedTokens.includes(token.id);
                  return (
                    <button
                      key={token.id}
                      disabled={isChosen}
                      onClick={() => handleSelectToken(token.id)}
                      className={`w-full py-2 px-3 text-left rounded-lg text-xs transition-all border ${
                        isChosen
                          ? "opacity-30 bg-quatro-slate/20 border-transparent cursor-not-allowed"
                          : "bg-quatro-slate/60 hover:bg-quatro-slate border-quatro-cream/15 hover:border-quatro-amber text-quatro-cream cursor-pointer"
                      }`}
                    >
                      {token.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                onClick={() => {
                  soundManager.playClick();
                  setCurrentStage("DEPLOY");
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow"
              >
                LOGIC VALIDATED ✓ PROCEED TO DEPLOY →
              </button>
            )}
          </div>
        )}

        {/* STAGE 3: DEPLOY & EVENING WRAP-UP */}
        {currentStage === "DEPLOY" && (
          <div className="space-y-4 my-2 text-xs">
            <div className="bg-quatro-slate/40 border border-quatro-cream/15 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-quatro-cream/70">Production Telemetry Pipeline</span>
                <span className="text-quatro-amber font-bold">{deployProgress}%</span>
              </div>
              <div className="w-full bg-quatro-navy rounded-full h-2 overflow-hidden border border-quatro-cream/10">
                <div
                  className="bg-quatro-amber h-full transition-all duration-300 ease-out"
                  style={{ width: `${deployProgress}%` }}
                />
              </div>

              {deployProgress === 100 && (
                <div className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1.5 pt-1">
                  <span>✓ All commits compiled. Evening shutdown initialized.</span>
                </div>
              )}
            </div>

            {deployProgress < 100 ? (
              <button
                onClick={handleStartDeploy}
                disabled={isDeploying}
                className="w-full py-2.5 bg-quatro-amber text-quatro-navy font-bold rounded-xl text-xs tracking-wider hover:bg-quatro-warmOrange transition-all cursor-pointer"
              >
                {isDeploying ? "COMPILING SYSTEM BUILD..." : "RUN BUILD PIPELINE"}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] text-quatro-cream/70 italic text-center font-sans">
                  The workday has concluded. Outside, the dusk light softens the asphalt. Time to drive home.
                </div>
                <button
                  onClick={handleFinish}
                  className="w-full py-3 bg-quatro-amber hover:bg-quatro-warmOrange text-quatro-navy font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  EXIT OFFICE & DRIVE HOME →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
