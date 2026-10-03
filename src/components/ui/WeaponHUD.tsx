"use client";

import { WEAPON_DEFS, WEAPON_ORDER, WeaponId } from "@/game/weapons/weaponTypes";

interface WeaponHUDProps {
  activeWeaponId: WeaponId;
  chargeLevel: number;
  isAttacking: boolean;
  onNextWeapon: () => void;
  onPrevWeapon: () => void;
  onSelectWeapon?: (index: number) => void;
  onStartAttack?: () => void;
  onReleaseAttack?: () => void;
}

/**
 * Weapon selection HUD — shows all weapons, highlights active, charge bar.
 * Positioned at bottom-right corner.
 */
export function WeaponHUD({
  activeWeaponId,
  chargeLevel,
  isAttacking,
  onNextWeapon,
  onPrevWeapon,
  onSelectWeapon,
  onStartAttack,
  onReleaseAttack,
}: WeaponHUDProps) {
  const def = WEAPON_DEFS[activeWeaponId];

  return (
    <div className="pointer-events-none fixed bottom-5 right-28 z-30 flex flex-col items-end gap-2.5">
      {/* Quick Attack Button (interactive for touch & mouse) */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          onStartAttack?.();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          onReleaseAttack?.();
        }}
        onPointerLeave={() => {
          if (isAttacking) onReleaseAttack?.();
        }}
        className="pointer-events-auto flex items-center gap-2 border border-quatro-amber/60 bg-quatro-navy/90 px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider text-quatro-cream shadow-xl backdrop-blur-md transition-all hover:bg-quatro-navy hover:scale-105 active:scale-95"
        style={{
          boxShadow: isAttacking ? `0 0 14px ${def.color}` : "none",
          borderColor: isAttacking ? def.color : undefined,
        }}
      >
        <span className="rounded bg-quatro-amber/20 px-1.5 py-0.5 text-[10px] font-bold text-quatro-amber">
          F
        </span>
        <span style={{ color: def.color }}>
          {def.type === "CHARGE" ? (isAttacking ? "Melepas Serangan..." : "Tahan / Lepas") : "Serang"}
        </span>
      </button>
      {/* Weapon slots */}
      <div className="flex gap-1.5 items-end">
        {WEAPON_ORDER.map((wId, i) => {
          const w = WEAPON_DEFS[wId];
          const isActive = wId === activeWeaponId;
          return (
            <button
              key={wId}
              type="button"
              onClick={() => onSelectWeapon?.(i)}
              className={`pointer-events-auto flex flex-col items-center gap-0.5 transition-all duration-150 cursor-pointer ${
                isActive ? "scale-110" : "scale-90 opacity-60 hover:opacity-100 hover:scale-95"
              }`}
              title={`${w.name} [${i + 1}]`}
            >
              <div
                className="w-9 h-9 flex items-center justify-center text-xl border rounded-sm"
                style={{
                  borderColor: isActive ? w.color : "rgba(255,255,255,0.15)",
                  background: isActive
                    ? `linear-gradient(135deg, ${w.color}20, ${w.accentColor}10)`
                    : "rgba(0,0,0,0.4)",
                  boxShadow: isActive ? `0 0 12px ${w.color}60` : "none",
                }}
              >
                {w.emoji}
              </div>
              <span className="font-mono text-[8px] text-white/50 uppercase tracking-wider">
                {i + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active weapon name */}
      <div className="flex items-center gap-2">
        <span
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: WEAPON_DEFS[activeWeaponId].color }}
        >
          {WEAPON_DEFS[activeWeaponId].name}
        </span>
        <span className="font-mono text-[8px] text-white/30 uppercase">
          [{WEAPON_DEFS[activeWeaponId].type}]
        </span>
      </div>

      {/* Charge bar (for CHARGE type weapons) */}
      {WEAPON_DEFS[activeWeaponId].type === "CHARGE" && (
        <div className="w-36 flex flex-col gap-0.5">
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${chargeLevel * 100}%`,
                background: `linear-gradient(90deg, ${WEAPON_DEFS[activeWeaponId].color}, ${WEAPON_DEFS[activeWeaponId].accentColor})`,
                boxShadow: chargeLevel > 0.8 ? `0 0 8px ${WEAPON_DEFS[activeWeaponId].color}` : "none",
              }}
            />
          </div>
          {chargeLevel >= 0.98 && (
            <div
              className="font-mono text-[8px] text-right uppercase tracking-wider animate-pulse"
              style={{ color: WEAPON_DEFS[activeWeaponId].accentColor }}
            >
              Full charge!
            </div>
          )}
        </div>
      )}

      {/* Controls hint */}
      <div className="font-mono text-[8px] text-white/40 uppercase tracking-wider flex gap-2">
        <span>1-5 / Q Switch</span>
        <span className="text-white/20">·</span>
        <span>F Attack / Draw</span>
      </div>
    </div>
  );
}

// workaround for naming collision
const WEAPON_DEF = WEAPON_DEFS;
