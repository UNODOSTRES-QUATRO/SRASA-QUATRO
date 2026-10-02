"use client";

import { WEAPON_DEFS, WEAPON_ORDER, WeaponId } from "@/game/weapons/weaponTypes";

interface WeaponHUDProps {
  activeWeaponId: WeaponId;
  chargeLevel: number;
  isAttacking: boolean;
  onNextWeapon: () => void;
  onPrevWeapon: () => void;
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
}: WeaponHUDProps) {
  const def = WEAPON_DEFS[activeWeaponId];

  return (
    <div className="pointer-events-none fixed bottom-5 right-40 z-30 flex flex-col items-end gap-2">
      {/* Weapon slots */}
      <div className="flex gap-1.5 items-end">
        {WEAPON_ORDER.map((wId, i) => {
          const w = WEAPON_DEFS[wId];
          const isActive = wId === activeWeaponId;
          return (
            <div
              key={wId}
              className={`flex flex-col items-center gap-0.5 transition-all duration-150 ${
                isActive ? "scale-110" : "scale-90 opacity-50"
              }`}
            >
              <div
                className="w-9 h-9 flex items-center justify-center text-xl border"
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
              <span className="font-mono text-[8px] text-white/40 uppercase tracking-wider">
                {i + 1}
              </span>
            </div>
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
      <div className="font-mono text-[8px] text-white/25 uppercase tracking-wider flex gap-2">
        <span>1-5 Switch</span>
        <span className="text-white/15">·</span>
        <span>F Attack</span>
        <span className="text-white/15">·</span>
        <span>Q/E Cycle</span>
      </div>
    </div>
  );
}

// workaround for naming collision
const WEAPON_DEF = WEAPON_DEFS;
