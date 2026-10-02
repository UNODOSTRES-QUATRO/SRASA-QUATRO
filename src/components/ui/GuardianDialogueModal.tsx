"use client";

import { useState } from "react";
import { soundManager } from "@/game/audio/SoundManager";

interface GuardianDialogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPocketUnlocked: () => void;
  onOpenGate?: () => void;
}

const GUARDIAN_DIALOGUES = [
  {
    speaker: "The Guardian",
    text: "Ah, traveler... you and your little machine crossed through the rift. I have watched many things leak from the world above—data, discarded loops, and forgotten memories.",
  },
  {
    speaker: "The Guardian",
    text: "You seek the Semicolon Sanctuary within the Castle Courtyard. In the realm of men, you were rushing towards endless deadlines. Here, stillness is the key.",
  },
  {
    speaker: "The Guardian",
    text: "The semicolon (;) is the sacred mark of our sanctuary: a pause in a sentence when the author could have chosen to end it, but chose to breathe and keep going.",
  },
  {
    speaker: "The Guardian",
    text: "Press [Q] to shrink into Pocket Car Mode whenever you wish to enter narrow conduits. I shall also unseal the Castle Portcullis so you may drive your Quatro freely into the courtyard.",
  },
];

export function GuardianDialogueModal({
  isOpen,
  onClose,
  onPocketUnlocked,
  onOpenGate,
}: GuardianDialogueModalProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const currentLine = GUARDIAN_DIALOGUES[step];
  const isLast = step === GUARDIAN_DIALOGUES.length - 1;

  const handleNext = () => {
    soundManager.playClick();
    if (isLast) {
      onPocketUnlocked();
      if (onOpenGate) onOpenGate();
      soundManager.playPurr();
      onClose();
      setStep(0);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none">
      <div className="relative w-full max-w-lg bg-[#fbf8f1] text-[#2b2725] rounded-2xl p-7 shadow-2xl border-4 border-[#3d4454] font-serif transition-all duration-300">
        {/* Parchment aesthetic top bar */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#e2d9c8] text-xs font-mono tracking-widest text-[#786c5e]">
          <span className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97736]" />
            <span className="font-bold text-[#3d4454] uppercase">{currentLine.speaker}</span>
          </span>
          <span>
            {step + 1} / {GUARDIAN_DIALOGUES.length}
          </span>
        </div>

        {/* Dialogue text */}
        <div className="my-6 min-h-[96px] text-base leading-relaxed text-[#38332f]">
          <p className="italic font-normal">“{currentLine.text}”</p>
        </div>

        {/* Action Button */}
        <div className="flex justify-between items-center pt-2 border-t border-[#e2d9c8]">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="text-xs font-mono text-[#786c5e] hover:text-[#2b2725] transition-colors cursor-pointer"
          >
            [ESC] Listen Later
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-[#3d4454] hover:bg-[#2b303d] text-[#fbf8f1] rounded-xl text-xs font-mono tracking-wider transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <span>{isLast ? "Unseal Castle & Shrink [Q] →" : "Next Reflection →"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
