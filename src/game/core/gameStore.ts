export type DayPhase =
  | "COMMUTE_TO_WORK"
  | "AT_WORK"
  | "COMMUTE_HOME"
  | "RESTING"
  | "PORTAL_APPROACH"
  | "CASTLE_EXPLORATION"
  | "SANCTUARY_REACHED";

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
  pocketUnlocked: boolean;
  guardianSpoken: boolean;
  castleGateOpen: boolean;
  puzzleSolved: boolean;
  sanctuaryEntered: boolean;
  homeReached: boolean;
  currentRoadsideEvent: string | null;
}

export function createInitialSessionState(): GameSessionState {
  return {
    dayNumber: 1,
    phase: "COMMUTE_TO_WORK",
    isPaused: false,
    isAudioMuted: false,
    activePrompt: "Day 1 — Morning Commute: Drive north to the office parking bay.",
    workDone: false,
    officeParkingUnlocked: false,
    catAlert: false,
    portalEntered: false,
    pocketUnlocked: false,
    guardianSpoken: false,
    castleGateOpen: false,
    puzzleSolved: false,
    sanctuaryEntered: false,
    homeReached: false,
    currentRoadsideEvent: null,
  };
}

export function advanceDay(current: GameSessionState): GameSessionState {
  const nextDay = Math.min(3, current.dayNumber + 1);
  const prompt =
    nextDay === 2
      ? "Day 2 — Morning Commute: Strange static on the radio. Drive north to work."
      : "Day 3 — The Rift: Reality glitching ahead. Drive north into the unknown.";

  return {
    ...current,
    dayNumber: nextDay,
    phase: nextDay === 3 ? "PORTAL_APPROACH" : "COMMUTE_TO_WORK",
    workDone: false,
    officeParkingUnlocked: false,
    activePrompt: prompt,
    catAlert: nextDay >= 2,
    homeReached: false,
    currentRoadsideEvent: null,
  };
}
