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
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const tokens: CodeToken[] =
    dayNumber === 1
      ? [
          { id: "token-1", label: "const routine = new Life()", correctIndex: 0 },
          { id: "token-2", label: "routine.executeTask()", correctIndex: 1 },
          { id: "token-3", label: "; // Semicolon (Pause)", correctIndex: 2 },
        ]
      : [
          { id: "token-1", label: "const reality = observeWorld()", correctIndex: 0 },
          { id: "token-2", label: "if (reality.hasGlitch) noticeAnomalies()", correctIndex: 1 },
          { id: "token-3", label: "; // Semicolon (Breathe)", correctIndex: 2 },
        ];

  const handleSelectToken = (id: string) => {
    soundManager.playClick();
    if (selectedTokens.includes(id)) return;

    const next = [...selectedTokens, id];
    setSelectedTokens(next);

    if (next.length === tokens.length) {
      // Check sequence
      const correctOrder = tokens.map((t) => t.id);
      const isCorrect = next.every((val, idx) => val === correctOrder[idx]);

      if (isCorrect) {
        soundManager.playPurr();
        setIsSuccess(true);
      } else {
        // Reset after short delay
        setTimeout(() => {
          setSelectedTokens([]);
        }, 600);
      }
    }
  };

  const handleFinish = () => {
    soundManager.playClick();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-quatro-navy/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-quatro-navy text-quatro-cream border-2 border-quatro-amber/40 rounded-xl max-w-lg w-full p-6 shadow-2xl font-mono">
        <div className="flex justify-between items-center border-b border-quatro-cream/10 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-quatro-warmOrange inline-block" />
            <span className="text-xs uppercase tracking-widest text-quatro-amber font-bold">
              WORKSTATION TERMINAL • DAY {dayNumber}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-quatro-cream/60 hover:text-quatro-cream transition-colors"
          >
            [ESC] EXIT
          </button>
        </div>

        <p className="text-xs text-quatro-cream/70 mb-4 italic">
          "Restore the logic statement in correct order to complete today's tasks."
        </p>

        {/* CURRENT STATEMENT BOX */}
        <div className="bg-quatro-slate/40 border border-quatro-cream/15 rounded p-4 mb-4 min-h-[90px] flex flex-col justify-center space-y-1 text-sm">
          {selectedTokens.length === 0 ? (
            <span className="text-quatro-cream/40 italic text-xs">
              // Click the blocks below in logical order...
            </span>
          ) : (
            selectedTokens.map((id, index) => {
              const token = tokens.find((t) => t.id === id);
              return (
                <div key={id} className="text-quatro-amber">
                  <span className="text-quatro-cream/40 mr-2 text-xs">{index + 1}.</span>
                  <span>{token?.label}</span>
                </div>
              );
            })
          )}
        </div>

        {/* CLICKABLE TOKENS */}
        {!isSuccess ? (
          <div className="space-y-2 mb-6">
            {tokens.map((token) => {
              const isChosen = selectedTokens.includes(token.id);
              return (
                <button
                  key={token.id}
                  disabled={isChosen}
                  onClick={() => handleSelectToken(token.id)}
                  className={`w-full py-2.5 px-4 text-left rounded text-xs transition-all border ${
                    isChosen
                      ? "opacity-35 bg-quatro-slate/20 border-transparent cursor-not-allowed"
                      : "bg-quatro-slate/60 hover:bg-quatro-slate border-quatro-cream/20 hover:border-quatro-amber text-quatro-cream cursor-pointer"
                  }`}
                >
                  {token.label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-quatro-mutedGreen/20 border border-quatro-mutedGreen/40 rounded p-4 mb-6 text-center">
            <div className="text-sm font-bold text-quatro-cream mb-1">
              ✓ Task Complete
            </div>
            <p className="text-xs text-quatro-cream/70">
              Your workday is finished. Quatro and Semicolon are waiting outside.
            </p>
          </div>
        )}

        {isSuccess && (
          <button
            onClick={handleFinish}
            className="w-full py-3 bg-quatro-amber text-quatro-navy font-bold rounded hover:bg-quatro-warmOrange transition-colors text-sm tracking-wider cursor-pointer"
          >
            DRIVE HOME & REST →
          </button>
        )}
      </div>
    </div>
  );
}
