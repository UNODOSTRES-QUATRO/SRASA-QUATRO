"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLocalization } from "@/game/localization/useLocalization";

type MenuState = "MAIN" | "PLAY" | "SETTINGS";

export function MainMenu({ onPlay }: { onPlay: (name: string) => void }) {
  const [menuState, setMenuState] = useState<MenuState>("MAIN");
  const { t, language, setLanguage } = useLocalization();

  const [playerName, setPlayerName] = useState("");

  const handlePlaySubmit = async () => {
    if (playerName.trim()) {
      onPlay(playerName.trim());
    }
  };

  const handleContinue = () => {
    onPlay(playerName || "Guest");
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] overflow-hidden z-40">
      {/* Subtle atmospheric background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f0f] to-[#050505] pointer-events-none" />

      <div className="relative w-full h-full">
        {menuState === "MAIN" && (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center w-full h-full"
          >
            <div className="text-center mb-16">
              <h2 className="text-xl font-light tracking-[0.5em] text-white/60 mb-2">
                SRASA:
              </h2>
              <h1 className="text-5xl font-serif font-bold tracking-[0.2em] text-white">
                QUATRO
              </h1>
            </div>

            <div className="flex flex-col gap-6 w-64">
              <MenuButton onClick={() => setMenuState("PLAY")}>
                Play
              </MenuButton>
              <MenuButton onClick={() => setMenuState("SETTINGS")}>
                Settings
              </MenuButton>
            </div>

            <div className="absolute bottom-8 flex flex-col items-center text-xs text-white/30 tracking-widest gap-2">
              <span>Project Quatro</span>
              <span>Semicolon Team</span>
            </div>
          </motion.div>
        )}

        {menuState === "PLAY" && (
          <motion.div
            key="play"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center w-full max-w-md p-8 mx-auto"
          >
            <h2 className="text-3xl font-serif text-white/90 mb-10 tracking-widest">
              Play
            </h2>
            
            <div className="flex flex-col w-full gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/50 tracking-wider">
                  Enter Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && playerName.trim()) {
                      handlePlaySubmit();
                    }
                  }}
                  className="bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-white/40 transition-colors"
                  placeholder="Enter name..."
                />
              </div>
              <MenuButton onClick={handlePlaySubmit} disabled={!playerName.trim()}>
                Start Game
              </MenuButton>
            </div>
            
            <button 
              onClick={() => setMenuState("MAIN")}
              className="mt-12 text-sm text-white/40 hover:text-white/80 transition-colors tracking-widest"
            >
              BACK
            </button>
          </motion.div>
        )}

        {menuState === "SETTINGS" && (
          <div className="absolute inset-0 flex items-center justify-center w-full h-full">
            <SettingsMenu onBack={() => setMenuState("MAIN")} />
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsMenu({ onBack }: { onBack: () => void }) {
  const { t, language, setLanguage } = useLocalization();

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center w-full max-w-md p-8"
    >
      <h2 className="text-3xl font-serif text-white/90 mb-10 tracking-widest">
        Settings
      </h2>

      <div className="flex flex-col w-full gap-8">
        <div className="flex flex-col gap-4">
          <label className="text-xs text-white/50 tracking-wider">
            Language
          </label>
          <div className="flex gap-4">
            <button 
              className={`flex-1 py-2 border transition-colors ${language === 'en' ? 'border-amber-500/50 text-amber-500' : 'border-white/10 text-white/60 hover:border-white/30'}`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button 
              className={`flex-1 py-2 border transition-colors ${language === 'id' ? 'border-amber-500/50 text-amber-500' : 'border-white/10 text-white/60 hover:border-white/30'}`}
              onClick={() => setLanguage('id')}
            >
              Indonesia
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={onBack}
        className="mt-16 text-sm text-white/40 hover:text-white/80 transition-colors tracking-widest"
      >
        BACK
      </button>
    </motion.div>
  );
}

function MenuButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 border border-white/10 bg-white/5 text-white/80 tracking-[0.2em] transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}
