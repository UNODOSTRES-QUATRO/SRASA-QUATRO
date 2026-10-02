"use client";

import { useState, useEffect } from "react";
import { soundManager } from "@/game/audio/SoundManager";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface SemicolonSanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeditate?: () => void;
}

export function SemicolonSanctuaryModal({
  isOpen,
  onClose,
  onMeditate,
}: SemicolonSanctuaryModalProps) {
  const [activeTab, setActiveTab] = useState<"SANCTUARY" | "REFLECTION" | "TERMINAL">("SANCTUARY");
  const [breathePhase, setBreathePhase] = useState<"INHALE" | "HOLD" | "EXHALE">("INHALE");
  const [breatheTimer, setBreatheTimer] = useState(4);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Play gentle purr and chime upon entering
  useEffect(() => {
    if (isOpen) {
      soundManager.playPurr();
    }
  }, [isOpen]);

  // Gentle breathing cycle loop for mindfulness
  useEffect(() => {
    if (!isOpen || activeTab !== "SANCTUARY") return;

    const interval = setInterval(() => {
      setBreatheTimer((prev) => {
        if (prev <= 1) {
          setBreathePhase((phase) => {
            if (phase === "INHALE") return "HOLD";
            if (phase === "HOLD") return "EXHALE";
            return "INHALE";
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, activeTab]);

  // Sync completion milestone to Supabase
  const handleRecordMilestone = async () => {
    setIsSyncing(true);
    soundManager.playClick();

    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          await supabase.from("story_progress").upsert({
            user_id: authData.user.id,
            flag_key: "CHAPTER_3_SANCTUARY",
            flag_value: true,
          });
        }
      }
      setSyncSuccess(true);
      soundManager.playPurr();
    } catch {
      // Graceful offline fallback
      setSyncSuccess(true);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in font-mono">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#111625] to-[#0a0d17] text-quatro-cream rounded-2xl border-2 border-quatro-amber/40 shadow-2xl p-7 flex flex-col justify-between overflow-hidden">
        {/* Subtle Ambient Background Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-quatro-amber/15 rounded-full blur-3xl" />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-quatro-cream/10 pb-4 mb-5 relative z-10">
          <div className="flex items-center space-x-3">
            <span className="text-quatro-amber text-xl animate-pulse">✦</span>
            <div>
              <h2 className="text-sm font-bold tracking-widest text-quatro-cream uppercase">
                The Semicolon Sanctuary
              </h2>
              <div className="text-[11px] text-quatro-cream/50 tracking-wider">
                INNER KEEP • VOXEL DIMENSION CORE
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-quatro-navy/80 px-2.5 py-1 rounded-lg border border-quatro-cream/15 text-[10px] text-emerald-400 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>SANCTUARY UNLOCKED</span>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="text-xs text-quatro-cream/50 hover:text-quatro-cream px-2 py-1 transition-colors cursor-pointer"
            >
              [ESC]
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-quatro-cream/10 pb-2 relative z-10 text-xs">
          {[
            { id: "SANCTUARY", label: "🐾 THE MONUMENT" },
            { id: "REFLECTION", label: "📖 PHILOSOPHY & LORE" },
            { id: "TERMINAL", label: "⚡ REALM ARCHIVES" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-quatro-amber text-quatro-navy font-bold shadow-md"
                  : "text-quatro-cream/60 hover:text-quatro-cream hover:bg-quatro-navy/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: THE MONUMENT & MINDFUL BREATH */}
        {activeTab === "SANCTUARY" && (
          <div className="relative z-10 flex flex-col items-center text-center my-2 space-y-5">
            {/* Glowing Golden Semicolon Monument Visual */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-quatro-amber/20 blur-xl animate-pulse" />
              <div className="w-24 h-24 rounded-full border-2 border-quatro-amber/60 flex items-center justify-center bg-quatro-navy/60 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
                <span className="text-5xl font-serif text-quatro-amber select-none font-bold">
                  ;
                </span>
              </div>
            </div>

            {/* Cat Companion Presence */}
            <div className="bg-quatro-navy/60 border border-quatro-cream/15 rounded-xl px-4 py-2 text-xs text-quatro-cream/80 flex items-center space-x-2">
              <span>🐾</span>
              <span>
                <strong>Semicolon the Cat</strong> is curled on the velvet pedestal, purring in deep peace.
              </span>
            </div>

            {/* Mindful Breathing Exercise */}
            <div className="bg-quatro-slate/30 border border-quatro-amber/25 rounded-xl p-4 w-full max-w-md">
              <div className="text-[10px] text-quatro-amber uppercase tracking-widest mb-1">
                Mindful Breathing — The Pause
              </div>
              <div className="text-lg font-bold text-quatro-cream tracking-wider mb-2">
                {breathePhase} ({breatheTimer}s)
              </div>
              <div className="w-full bg-quatro-navy/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-quatro-amber h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((5 - breatheTimer) / 4) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-quatro-cream/60 mt-2 italic font-serif">
                “In code, a semicolon marks the end of a thought before the next begins. In life, take the pause.”
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PHILOSOPHY & STORY EPILOGUE */}
        {activeTab === "REFLECTION" && (
          <div className="relative z-10 space-y-4 my-2 text-xs leading-relaxed max-h-[280px] overflow-y-auto pr-2">
            <div className="bg-quatro-navy/40 border border-quatro-cream/15 rounded-xl p-4">
              <h3 className="font-bold text-quatro-amber uppercase tracking-wider mb-2">
                The Philosophy of the Semicolon
              </h3>
              <p className="text-quatro-cream/80 mb-2 font-serif text-sm italic">
                “A author uses a semicolon when she could have chosen to end her sentence, but chose to pause and continue.”
              </p>
              <p className="text-quatro-cream/70">
                You began this journey trapped in a suffocating daily loop: wake up, commute, compile, repeat. But as the road glitched and the boundaries dissolved, you discovered that stillness is not failure. Transforming your car into pocket size was not about escaping responsibility—it was about changing your perspective.
              </p>
            </div>

            <div className="bg-quatro-navy/40 border border-quatro-cream/15 rounded-xl p-4">
              <h3 className="font-bold text-quatro-cream/90 uppercase tracking-wider mb-1">
                The Guardian's Epilogue
              </h3>
              <p className="text-quatro-cream/70">
                The Voxel Dimension was never broken. It is a sanctuary formed by every pause, every breath, and every creative heartbeat you forgot to take during the rush. You may return to the normal world whenever you wish—the road is open, and Quatro is ready.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: REALM ARCHIVES & SUPABASE SYNC */}
        {activeTab === "TERMINAL" && (
          <div className="relative z-10 space-y-4 my-2 text-xs">
            <div className="bg-quatro-navy/50 border border-quatro-cream/15 rounded-xl p-4 font-mono">
              <div className="text-[11px] text-emerald-400 mb-2 font-bold">
                ● SANCTUARY PROTOCOL ACTIVE
              </div>
              <div className="space-y-1 text-quatro-cream/70">
                <div>[STATUS] CHAPTER 3 COMPLETE: Castle Courtyard Reached</div>
                <div>[DISCOVERY] Dual-Scale Pocket Vehicle Attunement: 100%</div>
                <div>[COMPANION] Semicolon Stress Level: 0.00 (Cozy)</div>
                <div>[COSMOS] Dimensional Leak Status: Stabilized via Pause</div>
              </div>
            </div>

            <div className="p-4 bg-quatro-amber/10 border border-quatro-amber/30 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-bold text-quatro-amber text-xs">
                  Save Sanctuary Memory
                </div>
                <div className="text-[11px] text-quatro-cream/60">
                  Preserve your pilgrimage milestone to Supabase cloud.
                </div>
              </div>
              <button
                onClick={handleRecordMilestone}
                disabled={isSyncing || syncSuccess}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  syncSuccess
                    ? "bg-emerald-500 text-white"
                    : "bg-quatro-amber text-quatro-navy hover:bg-quatro-warmOrange"
                }`}
              >
                {syncSuccess ? "✓ SAVED TO CLOUD" : isSyncing ? "SYNCING..." : "SAVE MILESTONE"}
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-quatro-cream/10 pt-4 mt-5 relative z-10">
          <button
            onClick={() => {
              soundManager.playPurr();
              if (onMeditate) onMeditate();
            }}
            className="text-xs text-quatro-amber hover:text-quatro-warmOrange transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <span>🐾 Pet Semicolon</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="px-5 py-2.5 bg-quatro-amber hover:bg-quatro-warmOrange text-quatro-navy font-bold rounded-xl text-xs tracking-wider transition-all cursor-pointer shadow-lg hover:shadow-xl"
            >
              CONTINUE JOURNEY →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
