"use client";

import { useState } from "react";
import { useLocalization } from "@/game/localization/useLocalization";
import { Globe } from "lucide-react";

export function LanguageSelector() {
  const { language, setLanguage } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-3 left-4 z-40 select-none font-mono">
      {isOpen && (
        <div className="mb-2 flex flex-col gap-1 rounded-lg border border-quatro-amber/40 bg-quatro-navy/95 p-1.5 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => {
              setLanguage("id");
              setIsOpen(false);
            }}
            className={`flex items-center gap-2 rounded px-2.5 py-1 text-xs transition-colors ${
              language === "id"
                ? "bg-quatro-amber text-slate-950 font-bold"
                : "text-quatro-cream/80 hover:bg-white/10 hover:text-quatro-cream"
            }`}
          >
            <span className="font-bold">ID</span>
            <span className="text-[10px] font-sans">Bahasa Indonesia</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLanguage("en");
              setIsOpen(false);
            }}
            className={`flex items-center gap-2 rounded px-2.5 py-1 text-xs transition-colors ${
              language === "en"
                ? "bg-quatro-amber text-slate-950 font-bold"
                : "text-quatro-cream/80 hover:bg-white/10 hover:text-quatro-cream"
            }`}
          >
            <span className="font-bold">EN</span>
            <span className="text-[10px] font-sans">English</span>
          </button>
        </div>
      )}

      <button
        type="button"
        id="language-switcher-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 border border-quatro-cream/20 bg-quatro-navy/85 px-2.5 py-1.5 text-xs text-quatro-cream shadow-xl backdrop-blur-md transition-all hover:border-quatro-amber hover:bg-quatro-navy active:scale-95"
        title="Change Language / Ganti Bahasa"
      >
        <Globe className="h-3.5 w-3.5 text-quatro-amber" />
        <span className="font-bold uppercase tracking-wider text-quatro-amber">
          [{language.toUpperCase()}]
        </span>
      </button>
    </div>
  );
}
