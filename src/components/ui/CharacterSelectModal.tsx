"use client";

import { useState } from "react";
import { CharacterId, CharacterPortrait, Expression } from "./CharacterPortraits";
import { useLocalization } from "@/game/localization/useLocalization";
import { soundManager } from "@/game/audio/SoundManager";
import { Check, Sparkles } from "lucide-react";

interface CharacterSelectModalProps {
  isOpen: boolean;
  onSelectCharacter: (characterId: CharacterId) => void;
  selectedId?: CharacterId;
}

interface CharacterMeta {
  id: CharacterId;
  nameKey: any;
  roleKey: any;
  descKey: any;
  quoteKey: any;
  themeColor: string;
}

const CHARACTERS: CharacterMeta[] = [
  {
    id: "ORIGINAL",
    nameKey: "char_1_name",
    roleKey: "char_1_role",
    descKey: "char_1_desc",
    quoteKey: "char_1_quote",
    themeColor: "border-sky-500/60 bg-sky-950/20 text-sky-400",
  },
  {
    id: "GLASSES_GUY",
    nameKey: "char_2_name",
    roleKey: "char_2_role",
    descKey: "char_2_desc",
    quoteKey: "char_2_quote",
    themeColor: "border-cyan-500/60 bg-cyan-950/20 text-cyan-400",
  },
  {
    id: "LONG_HAIR_GIRL",
    nameKey: "char_3_name",
    roleKey: "char_3_role",
    descKey: "char_3_desc",
    quoteKey: "char_3_quote",
    themeColor: "border-amber-500/60 bg-amber-950/20 text-amber-400",
  },
  {
    id: "MUSLIMAH_GIRL",
    nameKey: "char_4_name",
    roleKey: "char_4_role",
    descKey: "char_4_desc",
    quoteKey: "char_4_quote",
    themeColor: "border-emerald-500/60 bg-emerald-950/20 text-emerald-400",
  },
  {
    id: "SHORT_HAIR_GIRL",
    nameKey: "char_5_name",
    roleKey: "char_5_role",
    descKey: "char_5_desc",
    quoteKey: "char_5_quote",
    themeColor: "border-orange-500/60 bg-orange-950/20 text-orange-400",
  },
  {
    id: "HOODIE_GUY",
    nameKey: "char_6_name",
    roleKey: "char_6_role",
    descKey: "char_6_desc",
    quoteKey: "char_6_quote",
    themeColor: "border-indigo-500/60 bg-indigo-950/20 text-indigo-400",
  },
];

export function CharacterSelectModal({
  isOpen,
  onSelectCharacter,
  selectedId = "ORIGINAL",
}: CharacterSelectModalProps) {
  const { t } = useLocalization();
  const [highlightedId, setHighlightedId] = useState<CharacterId>(selectedId);
  const [expression, setExpression] = useState<Expression>("smile");

  if (!isOpen) return null;

  const activeChar = CHARACTERS.find((c) => c.id === highlightedId) ?? CHARACTERS[0];

  const handleHighlight = (id: CharacterId) => {
    soundManager.playClick();
    setHighlightedId(id);
    const expressions: Expression[] = ["smile", "thoughtful", "serious", "neutral"];
    setExpression(expressions[Math.floor(Math.random() * expressions.length)]);
  };

  const handleConfirm = () => {
    soundManager.playPurr();
    onSelectCharacter(highlightedId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 font-mono select-none">
      <div className="relative w-full max-w-4xl rounded-3xl border border-quatro-amber/40 bg-slate-950/95 p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-1 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-quatro-amber">
            <Sparkles className="h-4 w-4" />
            {t("char_select_title")}
          </div>
          <p className="text-xs text-slate-400 font-sans">{t("char_select_subtitle")}</p>
        </div>

        {/* 6 Character Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {CHARACTERS.map((char) => {
            const isSelected = char.id === highlightedId;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => handleHighlight(char.id)}
                className={`flex flex-col items-center rounded-2xl border p-3 transition-all cursor-pointer ${
                  isSelected
                    ? "border-quatro-amber bg-quatro-amber/15 shadow-lg scale-105"
                    : "border-white/10 bg-slate-900/60 hover:border-white/30 hover:bg-slate-900/90"
                }`}
              >
                <CharacterPortrait
                  characterId={char.id}
                  expression={isSelected ? expression : "neutral"}
                  size={76}
                  className={isSelected ? "scale-110 drop-shadow-md" : "opacity-80"}
                />
                <span className="mt-2 text-[11px] font-bold text-slate-200 text-center leading-tight">
                  {t(char.nameKey)}
                </span>
                <span className="text-[9px] text-slate-400 text-center">{t(char.roleKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Active Character Showcase in Visual Novel Style */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 flex flex-col md:flex-row items-center gap-6 shadow-inner">
          <div className="shrink-0 flex flex-col items-center">
            <CharacterPortrait
              characterId={activeChar.id}
              expression={expression}
              size={130}
              className="drop-shadow-2xl border-2 border-quatro-amber/50 rounded-2xl bg-black/40 p-1"
            />
            <span className="mt-2 rounded bg-quatro-amber/20 px-2 py-0.5 text-[10px] font-bold text-quatro-amber uppercase">
              {t(activeChar.roleKey)}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-2.5 text-center md:text-left">
            <h3 className="text-lg font-black tracking-wide text-slate-100">
              {t(activeChar.nameKey)}
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {t(activeChar.descKey)}
            </p>
            {/* Sample Voice Line */}
            <div className="rounded-xl border border-quatro-amber/30 bg-black/50 p-3 mt-1">
              <p className="text-xs italic font-serif text-amber-200">
                “{t(activeChar.quoteKey)}”
              </p>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center justify-center gap-2 rounded-xl bg-quatro-amber px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-xl transition-all hover:bg-amber-400 hover:scale-[1.02] active:scale-95 cursor-pointer w-full md:w-auto"
          >
            <Check className="h-4 w-4" />
            {t("char_select_start")}
          </button>
        </div>
      </div>
    </div>
  );
}
