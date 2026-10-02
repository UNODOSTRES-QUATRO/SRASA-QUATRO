"use client";

interface PauseOverlayProps {
  isOpen: boolean;
  onResume: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
}

export function PauseOverlay({
  isOpen,
  onResume,
  isAudioMuted,
  onToggleAudio,
}: PauseOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-quatro-navy/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-quatro-paper text-quatro-navy max-w-md w-full rounded-lg shadow-2xl border-4 border-quatro-cream p-8 font-sans">
        <div className="border-b-2 border-quatro-navy/20 pb-4 mb-6 text-center">
          <span className="text-xs uppercase tracking-widest text-quatro-navy/60 font-mono">
            The Semicolon ;
          </span>
          <h2 className="text-2xl font-serif font-bold text-quatro-navy mt-1">
            Take a Breath
          </h2>
          <p className="text-xs text-quatro-navy/70 mt-1 italic">
            "A pause before something continues."
          </p>
        </div>

        <div className="space-y-4 my-6">
          <button
            onClick={onResume}
            className="w-full py-2.5 bg-quatro-navy text-quatro-cream rounded font-mono text-sm tracking-wider hover:bg-quatro-slate transition-colors"
          >
            CONTINUE JOURNEY
          </button>

          <button
            onClick={onToggleAudio}
            className="w-full py-2.5 border border-quatro-navy/30 text-quatro-navy rounded font-mono text-sm tracking-wider hover:bg-quatro-softGray transition-colors"
          >
            AUDIO: {isAudioMuted ? "MUTED" : "ENABLED"}
          </button>
        </div>

        <div className="border-t border-quatro-navy/20 pt-4 text-center text-xs text-quatro-navy/60 font-mono">
          Press [ESC] to resume
        </div>
      </div>
    </div>
  );
}
