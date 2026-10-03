"use client";

import React from "react";

export type CharacterId =
  | "ORIGINAL"
  | "GLASSES_GUY"
  | "LONG_HAIR_GIRL"
  | "MUSLIMAH_GIRL"
  | "SHORT_HAIR_GIRL"
  | "HOODIE_GUY";

export type Expression = "neutral" | "smile" | "serious" | "thoughtful" | "surprised";

interface CharacterPortraitProps {
  characterId: CharacterId | "SAGE" | "JEFFREY" | "VESPERA" | "BARNABY" | "MECHANIC";
  expression?: Expression;
  className?: string;
  size?: number;
}

export function CharacterPortrait({
  characterId,
  expression = "neutral",
  className = "",
  size = 200,
}: CharacterPortraitProps) {
  const getEyeExpression = () => {
    switch (expression) {
      case "smile":
        return (
          <>
            <path d="M 38 46 Q 44 42 50 46" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 62 46 Q 68 42 74 46" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case "serious":
        return (
          <>
            <line x1="37" y1="42" x2="51" y2="45" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <line x1="61" y1="45" x2="75" y2="42" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="44" cy="48" rx="4" ry="4.5" fill="#1e293b" />
            <ellipse cx="68" cy="48" rx="4" ry="4.5" fill="#1e293b" />
            <circle cx="45.5" cy="46.5" r="1.5" fill="#ffffff" />
            <circle cx="69.5" cy="46.5" r="1.5" fill="#ffffff" />
          </>
        );
      case "thoughtful":
        return (
          <>
            <ellipse cx="45" cy="46" rx="4.5" ry="4" fill="#1e293b" />
            <ellipse cx="69" cy="46" rx="4.5" ry="4" fill="#1e293b" />
            <circle cx="46.5" cy="44.5" r="1.5" fill="#ffffff" />
            <circle cx="70.5" cy="44.5" r="1.5" fill="#ffffff" />
            <path d="M 36 41 Q 44 40 51 42" stroke="#334155" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M 61 42 Q 68 40 76 41" stroke="#334155" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </>
        );
      default:
        return (
          <>
            <ellipse cx="44" cy="47" rx="4.5" ry="5.5" fill="#1e293b" />
            <ellipse cx="68" cy="47" rx="4.5" ry="5.5" fill="#1e293b" />
            <circle cx="45.5" cy="45" r="1.8" fill="#ffffff" />
            <circle cx="69.5" cy="45" r="1.8" fill="#ffffff" />
            <path d="M 37 41 Q 44 39 51 41" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 61 41 Q 68 39 75 41" stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
    }
  };

  const getMouthExpression = () => {
    switch (expression) {
      case "smile":
        return <path d="M 50 63 Q 56 68 62 63" stroke="#b91c1c" strokeWidth="2" fill="#fca5a5" strokeLinecap="round" />;
      case "serious":
        return <line x1="51" y1="64" x2="61" y2="64" stroke="#475569" strokeWidth="2" strokeLinecap="round" />;
      case "thoughtful":
        return <path d="M 52 64 Q 56 63 60 65" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />;
      default:
        return <path d="M 51 63 Q 56 66 61 63" stroke="#475569" strokeWidth="2" fill="none" strokeLinecap="round" />;
    }
  };

  const renderCharacterContent = () => {
    switch (characterId) {
      case "ORIGINAL":
        return (
          <g>
            {/* Background halo */}
            <circle cx="56" cy="56" r="50" fill="#1e293b" />
            {/* Clothes: Office shirt & collar */}
            <path d="M 28 98 Q 56 78 84 98 L 88 112 L 24 112 Z" fill="#334155" />
            <path d="M 44 86 L 56 102 L 68 86 L 62 82 L 56 88 L 50 82 Z" fill="#f1f5f9" />
            <path d="M 53 88 L 56 108 L 59 88 Z" fill="#0284c7" />
            {/* Neck & Face */}
            <rect x="49" y="68" width="14" height="18" fill="#fed7aa" />
            <path d="M 36 44 Q 36 74 56 75 Q 76 74 76 44 Q 76 26 56 26 Q 36 26 36 44 Z" fill="#ffedd5" />
            {/* Eyes & Mouth */}
            {getEyeExpression()}
            {getMouthExpression()}
            {/* Short dark neat hair */}
            <path d="M 33 42 Q 33 22 56 20 Q 79 22 79 42 Q 74 27 56 26 Q 38 27 33 42 Z" fill="#1e1b4b" />
            <path d="M 34 38 Q 42 27 50 34 Q 54 28 64 34 Q 72 29 78 38 Q 68 28 56 30 Q 44 28 34 38 Z" fill="#0f172a" />
          </g>
        );

      case "GLASSES_GUY":
        return (
          <g>
            <circle cx="56" cy="56" r="50" fill="#0f172a" />
            {/* Blue-gray tech jacket */}
            <path d="M 26 98 Q 56 76 86 98 L 90 112 L 22 112 Z" fill="#1e3a5f" />
            <path d="M 42 85 L 56 102 L 70 85 Z" fill="#38bdf8" opacity="0.8" />
            {/* Neck & Face */}
            <rect x="49" y="68" width="14" height="18" fill="#fde68a" />
            <path d="M 36 44 Q 36 74 56 75 Q 76 74 76 44 Q 76 26 56 26 Q 36 26 36 44 Z" fill="#fef3c7" />
            {/* Modern styled haircut */}
            <path d="M 32 38 Q 33 18 56 18 Q 80 18 78 40 Q 68 22 56 23 Q 44 22 32 38 Z" fill="#334155" />
            <path d="M 34 36 L 46 25 L 58 32 L 68 24 L 78 36 Q 66 24 56 26 Q 44 24 34 36 Z" fill="#1e293b" />
            {/* Glasses */}
            <rect x="36" y="42" width="16" height="11" rx="2" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <rect x="60" y="42" width="16" height="11" rx="2" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <line x1="52" y1="47" x2="60" y2="47" stroke="#38bdf8" strokeWidth="2" />
            {getEyeExpression()}
            {getMouthExpression()}
          </g>
        );

      case "LONG_HAIR_GIRL":
        return (
          <g>
            <circle cx="56" cy="56" r="50" fill="#2d1b4e" />
            {/* Long flowing back hair */}
            <path d="M 26 45 Q 20 85 24 112 L 88 112 Q 92 85 86 45 Z" fill="#78350f" />
            {/* Soft artistic clothing */}
            <path d="M 28 98 Q 56 78 84 98 L 88 112 L 24 112 Z" fill="#d97706" />
            <path d="M 44 88 Q 56 94 68 88 L 68 112 L 44 112 Z" fill="#fef3c7" />
            {/* Neck & Face */}
            <rect x="50" y="68" width="12" height="18" fill="#fed7aa" />
            <path d="M 38 44 Q 38 72 56 73 Q 74 72 74 44 Q 74 27 56 27 Q 38 27 38 44 Z" fill="#ffedd5" />
            {/* Front bangs & soft hair framing */}
            <path d="M 34 38 Q 42 22 56 22 Q 70 22 78 38 Q 72 32 64 34 Q 56 28 48 34 Q 40 32 34 38 Z" fill="#92400e" />
            <path d="M 34 38 Q 33 60 36 75 Q 38 55 40 46 Z" fill="#78350f" />
            <path d="M 78 38 Q 79 60 76 75 Q 74 55 72 46 Z" fill="#78350f" />
            {/* Feather/Artistic clip */}
            <circle cx="74" cy="36" r="3" fill="#f43f5e" />
            {getEyeExpression()}
            {getMouthExpression()}
          </g>
        );

      case "MUSLIMAH_GIRL":
        return (
          <g>
            <circle cx="56" cy="56" r="50" fill="#064e3b" />
            {/* Modest clothing */}
            <path d="M 26 98 Q 56 80 86 98 L 90 112 L 22 112 Z" fill="#047857" />
            {/* Hijab drapery */}
            <path d="M 30 52 Q 26 85 46 95 L 66 95 Q 86 85 82 52 Q 82 20 56 20 Q 30 20 30 52 Z" fill="#059669" />
            {/* Inner hijab cap */}
            <path d="M 37 40 Q 56 32 75 40 Z" fill="#d1fae5" />
            {/* Face oval */}
            <path d="M 38 44 Q 38 70 56 71 Q 74 70 74 44 Q 74 34 56 34 Q 38 34 38 44 Z" fill="#fde68a" />
            {getEyeExpression()}
            {getMouthExpression()}
          </g>
        );

      case "SHORT_HAIR_GIRL":
        return (
          <g>
            <circle cx="56" cy="56" r="50" fill="#451a03" />
            {/* Professional outfit with terracotta accents */}
            <path d="M 28 98 Q 56 78 84 98 L 88 112 L 24 112 Z" fill="#7c2d12" />
            <path d="M 44 86 L 56 100 L 68 86 Z" fill="#ea580c" />
            {/* Neck & Face */}
            <rect x="50" y="68" width="12" height="18" fill="#fde68a" />
            <path d="M 38 44 Q 38 72 56 73 Q 74 72 74 44 Q 74 27 56 27 Q 38 27 38 44 Z" fill="#fef3c7" />
            {/* Stylish short hair */}
            <path d="M 32 40 Q 32 20 56 20 Q 80 20 80 40 Q 76 26 56 26 Q 36 26 32 40 Z" fill="#451a03" />
            <path d="M 34 40 L 44 32 L 54 36 L 68 30 L 76 40 Q 64 28 54 30 Q 42 28 34 40 Z" fill="#78350f" />
            {/* Minimalist ear stud */}
            <circle cx="37" cy="52" r="2" fill="#fbbf24" />
            {getEyeExpression()}
            {getMouthExpression()}
          </g>
        );

      case "HOODIE_GUY":
        return (
          <g>
            <circle cx="56" cy="56" r="50" fill="#18181b" />
            {/* Dark cozy hoodie */}
            <path d="M 24 98 Q 56 76 88 98 L 92 112 L 20 112 Z" fill="#27272a" />
            {/* Hood collar */}
            <path d="M 34 82 Q 56 94 78 82 Q 82 92 56 96 Q 30 92 34 82 Z" fill="#3f3f46" />
            {/* Headphones around neck */}
            <path d="M 32 72 Q 56 86 80 72" stroke="#06b6d4" strokeWidth="4" fill="none" strokeLinecap="round" />
            <rect x="30" y="66" width="6" height="12" rx="3" fill="#0891b2" />
            <rect x="76" y="66" width="6" height="12" rx="3" fill="#0891b2" />
            {/* Neck & Face */}
            <rect x="49" y="66" width="14" height="18" fill="#fed7aa" />
            <path d="M 36 44 Q 36 74 56 75 Q 76 74 76 44 Q 76 26 56 26 Q 36 26 36 44 Z" fill="#ffedd5" />
            {/* Messy anime hair */}
            <path d="M 30 38 Q 34 16 56 16 Q 78 16 82 38 Q 72 22 56 24 Q 40 22 30 38 Z" fill="#18181b" />
            <path d="M 32 38 L 40 28 L 48 36 L 56 26 L 66 36 L 74 28 L 80 38 Q 68 26 56 28 Q 44 26 32 38 Z" fill="#27272a" />
            {getEyeExpression()}
            {getMouthExpression()}
          </g>
        );

      case "SAGE":
        return (
          <g>
            <circle cx="56" cy="56" r="50" fill="#0f172a" />
            <path d="M 24 98 Q 56 76 88 98 L 92 112 L 20 112 Z" fill="#312e81" />
            <rect x="49" y="66" width="14" height="18" fill="#e2e8f0" />
            <path d="M 36 44 Q 36 74 56 75 Q 76 74 76 44 Q 76 26 56 26 Q 36 26 36 44 Z" fill="#f8fafc" />
            {/* White long beard */}
            <path d="M 42 60 Q 56 95 70 60 Q 56 75 42 60 Z" fill="#e2e8f0" />
            {/* Long white hair */}
            <path d="M 32 38 Q 34 18 56 18 Q 78 18 80 38 Q 72 24 56 26 Q 40 24 32 38 Z" fill="#cbd5e1" />
            {/* Golden glowing brow gem */}
            <circle cx="56" cy="34" r="3.5" fill="#fbbf24" />
            {/* Wise calm eyes */}
            <path d="M 39 46 Q 45 42 51 46" stroke="#4338ca" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 61 46 Q 67 42 73 46" stroke="#4338ca" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );

      case "JEFFREY":
        return (
          <g>
            <circle cx="56" cy="56" r="50" fill="#1e293b" />
            <path d="M 24 98 Q 56 76 88 98 L 92 112 L 20 112 Z" fill="#475569" />
            {/* Blue-gray steel armor plate & amber trim */}
            <path d="M 40 85 L 56 102 L 72 85 Z" fill="#fbbf24" opacity="0.8" />
            <rect x="49" y="66" width="14" height="18" fill="#fed7aa" />
            <path d="M 36 44 Q 36 74 56 75 Q 76 74 76 44 Q 76 26 56 26 Q 36 26 36 44 Z" fill="#ffedd5" />
            {/* Knight helm / gray beard */}
            <path d="M 32 36 Q 56 16 80 36 Q 74 24 56 26 Q 38 24 32 36 Z" fill="#334155" />
            <path d="M 44 62 Q 56 76 68 62 Z" fill="#94a3b8" />
            {getEyeExpression()}
            {getMouthExpression()}
          </g>
        );

      case "VESPERA":
        return (
          <g>
            <circle cx="56" cy="56" r="50" fill="#3b0764" />
            <path d="M 24 98 Q 56 76 88 98 L 92 112 L 20 112 Z" fill="#581c87" />
            <rect x="50" y="68" width="12" height="18" fill="#fde68a" />
            <path d="M 38 44 Q 38 72 56 73 Q 74 72 74 44 Q 74 27 56 27 Q 38 27 38 44 Z" fill="#fef3c7" />
            {/* Regal purple magician hood & hair */}
            <path d="M 30 45 Q 26 85 46 95 L 66 95 Q 86 85 82 45 Q 82 18 56 18 Q 30 18 30 45 Z" fill="#6b21a8" />
            <circle cx="56" cy="28" r="3" fill="#c084fc" />
            {getEyeExpression()}
            {getMouthExpression()}
          </g>
        );

      case "BARNABY":
        return (
          <g>
            <circle cx="56" cy="56" r="50" fill="#064e3b" />
            <path d="M 24 98 Q 56 76 88 98 L 92 112 L 20 112 Z" fill="#065f46" />
            <rect x="49" y="66" width="14" height="18" fill="#fed7aa" />
            <path d="M 36 44 Q 36 74 56 75 Q 76 74 76 44 Q 76 26 56 26 Q 36 26 36 44 Z" fill="#ffedd5" />
            {/* Chronicler cap & curly hair */}
            <path d="M 32 38 Q 56 16 80 38 Z" fill="#047857" />
            <circle cx="56" cy="18" r="4" fill="#fbbf24" />
            {getEyeExpression()}
            {getMouthExpression()}
          </g>
        );

      case "MECHANIC":
        return (
          <g>
            <circle cx="56" cy="56" r="50" fill="#7f1d1d" />
            <path d="M 24 98 Q 56 76 88 98 L 92 112 L 20 112 Z" fill="#1e40af" />
            <rect x="49" y="66" width="14" height="18" fill="#fed7aa" />
            <path d="M 36 44 Q 36 74 56 75 Q 76 74 76 44 Q 76 26 56 26 Q 36 26 36 44 Z" fill="#fed7aa" />
            {/* Red Mechanic Cap with visor */}
            <path d="M 32 38 Q 56 22 80 38 L 84 42 L 28 42 Z" fill="#dc2626" />
            <path d="M 26 42 L 86 42 L 82 45 L 30 45 Z" fill="#991b1b" />
            {getEyeExpression()}
            {getMouthExpression()}
          </g>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center overflow-hidden rounded-2xl shadow-xl transition-transform ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 112 112"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderCharacterContent()}
      </svg>
    </div>
  );
}
