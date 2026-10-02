"use client";

import { useState } from "react";
import { soundManager } from "@/game/audio/SoundManager";

interface GuardianDialogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPocketUnlocked: () => void;
}

const GUARDIAN_DIALOGUES = [
  {
    speaker: "The Guardian",
    text: "Ah, traveler... you and your little machine crossed through the rift. I have watched many things leak from the world above—data, discarded loops, and forgotten memories.",
  },
  {
    speaker: "The Guardian",
    text: "You seek the castle within, but the heavy portcullis is locked by ancient logic. Brute force will only crush your wheels against stone.",
  },
  {
    speaker: "The Guardian",
    text: "Remember the semicolon: it is not a full stop, nor an endless race. It is a deliberate pause to transform. Your vehicle carries this wisdom.",
  },
  {
    speaker: "The Guardian",
    text: "Press [Q] to shrink into Pocket Car Mode. Enter the low drainage conduit at the right wall. The hidden pressure plate will answer to your smaller presence.",
  },
];

export function GuardianDialogueModal({
  isOpen,
  onClose,
  onPocketUnlocked,
}: GuardianDialogueModalProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const currentLine = GUARDIAN_DIALOGUES[step];
  const isLast = step === GUARDIAN_DIALOGUES.length - 1;

  const handleNext = () => {
    soundManager.playClick();
    if (isLast) {
      onPocketUnlocked();
      onClose();
      setStep(0);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
        <div className="flex justify-end pt-2">
          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-[#3d4454] hover:bg-[#2b303d] text-[#fbf8f1] rounded-xl text-xs font-mono tracking-wider transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <span>{isLast ? "Understood ; [Q to Shrink]" : "Continue..."}</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
