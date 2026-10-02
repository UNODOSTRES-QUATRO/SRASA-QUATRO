export type DayPhase = "COMMUTE_TO_WORK" | "AT_WORK" | "COMMUTE_HOME" | "RESTING" | "PORTAL_APPROACH";

export interface GameSessionState {
  dayNumber: number; // 1, 2, 3
  phase: DayPhase;
  isPaused: boolean;
  isAudioMuted: boolean;
  activePrompt: string | null;
  workDone: boolean;
  officeParkingUnlocked: boolean;
  catAlert: boolean;
  portalEntered: boolean;
}

export function createInitialSessionState(): GameSessionState {
  return {
    dayNumber: 1,
    phase: "COMMUTE_TO_WORK",
    isPaused: false,
    isAudioMuted: false,
    activePrompt: "Day 1 — Commute to the workplace ahead.",
    workDone: false,
    officeParkingUnlocked: false,
    catAlert: false,
    portalEntered: false,
  };
}

export function advanceDay(current: GameSessionState): GameSessionState {
  const nextDay = Math.min(3, current.dayNumber + 1);
  const prompt =
    nextDay === 2
      ? "Day 2 — The Shift. Something feels slightly different along the road."
      : "Day 3 — The Anomalies. The road boundaries seem to distort...";

  return {
    ...current,
    dayNumber: nextDay,
    phase: nextDay === 3 ? "PORTAL_APPROACH" : "COMMUTE_TO_WORK",
    workDone: false,
    activePrompt: prompt,
    catAlert: nextDay >= 2,
  };
}
