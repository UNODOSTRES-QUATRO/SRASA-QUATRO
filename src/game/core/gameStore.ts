export type LocationType =
  | "RUMAH"
  | "JALAN"
  | "TEMPAT_KERJA"
  | "BENGKEL"
  | "DIMENSI_LAIN"
  | "KASTIL"
  | "END_SCREEN";

export type DayPhase =
  | "COMMUTE_TO_WORK"
  | "AT_WORK"
  | "COMMUTE_HOME"
  | "RESTING"
  | "PORTAL_APPROACH"
  | "CASTLE_EXPLORATION"
  | "SANCTUARY_REACHED";

export interface RumahState {
  wokenUp: boolean;
  hasCooked: boolean;
  hasEaten: boolean;
  hasShowered: boolean;
  canExitHouse: boolean;
  // Evening routine
  hasShoweredEvening: boolean;
  hasEatenEvening: boolean;
  canSleepEvening: boolean;
}

export interface WorkplaceState {
  codeTyped: boolean;
  bugsCaught: number;
  bugsTarget: number;
  repoPushed: boolean;
  allTasksDone: boolean;
  portalSpawned: boolean;
}

export interface DimensiLainState {
  cutsceneCompleted: boolean;
  onVoidRoad: boolean;
}

export interface KastilState {
  insideEscapeRoom: boolean;
  talkedNPCs: {
    jeffrey: boolean;
    vespera: boolean;
    barnaby: boolean;
  };
  easterEggs: {
    fountain: boolean;
    hayBales: boolean;
    crest: boolean;
  };
  easterEggCount: number;
  escapeRoom: {
    cabinetSearched: boolean;
    stoveChecked: boolean;
    secretWallRevealed: boolean;
    puzzleSolved: boolean;
    hasMasterKey: boolean;
    doorUnlocked: boolean;
  };
}

export interface GameStats {
  daysCompleted: number;
  bugsCaught: number;
  easterEggsFound: number;
  codeLinesSubmitted: number;
}

export interface GameSessionState {
  currentLocation: LocationType;
  dayNumber: number; // 1, 2, 3
  phase: DayPhase;
  isPaused: boolean;
  isAudioMuted: boolean;
  activePrompt: string | null;

  // Human player transform
  humanPosition: [number, number, number];
  humanHeading: number;

  // Sub-states for locations
  rumah: RumahState;
  workplace: WorkplaceState;
  dimensiLain: DimensiLainState;
  kastil: KastilState;
  stats: GameStats;

  // Backward-compat flags
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
    currentLocation: "RUMAH", // Game begins at Home on Day 1!
    dayNumber: 1,
    phase: "COMMUTE_TO_WORK",
    isPaused: false,
    isAudioMuted: false,
    activePrompt: "Day 1 — Bangun dari tempat tidur [WASD/E] lalu siapkan sarapan.",

    humanPosition: [-2.2, 0, -2.4], // Near the bed in bedroom
    humanHeading: 0,

    rumah: {
      wokenUp: false,
      hasCooked: false,
      hasEaten: false,
      hasShowered: false,
      canExitHouse: false,
      hasShoweredEvening: false,
      hasEatenEvening: false,
      canSleepEvening: false,
    },

    workplace: {
      codeTyped: false,
      bugsCaught: 0,
      bugsTarget: 5,
      repoPushed: false,
      allTasksDone: false,
      portalSpawned: false,
    },

    dimensiLain: {
      cutsceneCompleted: false,
      onVoidRoad: false,
    },

    kastil: {
      insideEscapeRoom: false,
      talkedNPCs: {
        jeffrey: false,
        vespera: false,
        barnaby: false,
      },
      easterEggs: {
        fountain: false,
        hayBales: false,
        crest: false,
      },
      easterEggCount: 0,
      escapeRoom: {
        cabinetSearched: false,
        stoveChecked: false,
        secretWallRevealed: false,
        puzzleSolved: false,
        hasMasterKey: false,
        doorUnlocked: false,
      },
    },

    stats: {
      daysCompleted: 1,
      bugsCaught: 0,
      easterEggsFound: 0,
      codeLinesSubmitted: 0,
    },

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
      ? "Day 2 — Bangun pagi. Rasa aneh di udara. Mandi, sarapan, dan berangkat kerja."
      : "Day 3 — Hari ketiga. Kode realitas semakin bergetar. Siapkan diri lalu berangkat ke kantor.";

  return {
    ...current,
    currentLocation: "RUMAH",
    dayNumber: nextDay,
    phase: nextDay === 3 ? "PORTAL_APPROACH" : "COMMUTE_TO_WORK",
    activePrompt: prompt,
    humanPosition: [-2.2, 0, -2.4],
    humanHeading: 0,
    rumah: {
      wokenUp: false,
      hasCooked: false,
      hasEaten: false,
      hasShowered: false,
      canExitHouse: false,
      hasShoweredEvening: false,
      hasEatenEvening: false,
      canSleepEvening: false,
    },
    workplace: {
      codeTyped: false,
      bugsCaught: 0,
      bugsTarget: 5,
      repoPushed: false,
      allTasksDone: false,
      portalSpawned: nextDay === 3,
    },
    workDone: false,
    officeParkingUnlocked: false,
    catAlert: nextDay >= 2,
    homeReached: false,
    stats: {
      ...current.stats,
      daysCompleted: nextDay,
    },
  };
}
