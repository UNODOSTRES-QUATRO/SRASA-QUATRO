export type LocationType =
  | "RUMAH"
  | "JALAN"
  | "TEMPAT_KERJA"
  | "BENGKEL"
  | "DIMENSI_LAIN"
  | "KASTIL"
  | "END_SCREEN";

export type DayPhase =
  | "MORNING_ROUTINE"
  | "COMMUTE_TO_WORK"
  | "AT_WORK"
  | "COMMUTE_HOME"
  | "EVENING_ROUTINE"
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
    phase: "MORNING_ROUTINE",
    isPaused: false,
    isAudioMuted: false,
    activePrompt: "Day 1 — Bangun dari tempat tidur [WASD/E] lalu siapkan sarapan.",

    humanPosition: [-1.0, 0, -3.2], // Clear of the bed collider, beside its east edge
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

export function getCurrentObjective(session: GameSessionState): string {
  switch (session.phase) {
    case "MORNING_ROUTINE":
      if (session.currentLocation !== "RUMAH") return "Return home for the morning routine";
      if (!session.rumah.wokenUp) return "Wake up";
      if (!session.rumah.hasCooked) return "Cook breakfast";
      if (!session.rumah.hasEaten) return "Eat breakfast";
      if (!session.rumah.hasShowered) return "Take a shower";
      return "Leave for work";
    case "COMMUTE_TO_WORK":
      return "Drive to work";
    case "AT_WORK":
      return session.workplace.allTasksDone ? "Leave the office" : "Complete today's work";
    case "COMMUTE_HOME":
      return "Drive home";
    case "EVENING_ROUTINE":
      if (!session.rumah.hasShoweredEvening) return "Take an evening shower";
      if (!session.rumah.hasEatenEvening) return "Have dinner";
      return "Sleep";
    case "PORTAL_APPROACH":
      return "Enter the portal";
    case "CASTLE_EXPLORATION":
      if (session.currentLocation === "DIMENSI_LAIN") return "Reach the castle";
      if (session.currentLocation !== "KASTIL") return "Continue through the castle realm";
      if (!session.kastil.insideEscapeRoom) return "Explore the keep";
      if (!session.kastil.escapeRoom.cabinetSearched) return "Search the cabinet";
      if (!session.kastil.escapeRoom.stoveChecked) return "Inspect the hearth";
      if (!session.kastil.escapeRoom.secretWallRevealed) return "Find the loose stone";
      if (!session.kastil.escapeRoom.hasMasterKey) return "Open the safe";
      return "Unlock the exit";
    case "SANCTUARY_REACHED":
      return "Continue the journey";
    case "RESTING":
    default:
      return "Take a moment";
  }
}

export function advanceDay(current: GameSessionState): GameSessionState {
  if (
    current.phase !== "EVENING_ROUTINE" ||
    !current.rumah.hasShoweredEvening ||
    !current.rumah.hasEatenEvening ||
    !current.rumah.canSleepEvening ||
    current.dayNumber >= 3
  ) {
    return current;
  }

  const nextDay = Math.min(3, current.dayNumber + 1);
  const prompt =
    nextDay === 2
      ? "Day 2 — Bangun pagi. Rasa aneh di udara. Mandi, sarapan, dan berangkat kerja."
      : "Day 3 — Hari ketiga. Kode realitas semakin bergetar. Siapkan diri lalu berangkat ke kantor.";

  return {
    ...current,
    currentLocation: "RUMAH",
    dayNumber: nextDay,
    phase: "MORNING_ROUTINE",
    activePrompt: prompt,
    humanPosition: [-1.0, 0, -3.2],
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
    portalEntered: false,
    castleGateOpen: current.castleGateOpen,
    puzzleSolved: current.puzzleSolved,
    sanctuaryEntered: current.sanctuaryEntered,
    currentRoadsideEvent: null,
    stats: {
      ...current.stats,
      daysCompleted: nextDay,
    },
  };
}

export function beginCommuteToWork(current: GameSessionState): GameSessionState {
  if (
    current.currentLocation !== "RUMAH" ||
    current.phase !== "MORNING_ROUTINE" ||
    !current.rumah.canExitHouse
  ) {
    return current;
  }

  return {
    ...current,
    currentLocation: "JALAN",
    phase: "COMMUTE_TO_WORK",
    humanPosition: [0, 0, 0],
    activePrompt: "Tujuan: kantor",
  };
}

export function wakeUp(current: GameSessionState): GameSessionState {
  if (
    current.currentLocation !== "RUMAH" ||
    current.phase !== "MORNING_ROUTINE" ||
    current.rumah.wokenUp
  ) {
    return current;
  }

  return {
    ...current,
    rumah: { ...current.rumah, wokenUp: true },
    activePrompt: "Sudah bangun. Siapkan sarapan.",
  };
}

export function cookBreakfast(current: GameSessionState): GameSessionState {
  if (
    current.currentLocation !== "RUMAH" ||
    current.phase !== "MORNING_ROUTINE" ||
    !current.rumah.wokenUp ||
    current.rumah.hasCooked
  ) {
    return current;
  }

  return {
    ...current,
    rumah: { ...current.rumah, hasCooked: true },
    activePrompt: "Sarapan siap. Makan di meja.",
  };
}

export function eatBreakfast(current: GameSessionState): GameSessionState {
  if (
    current.currentLocation !== "RUMAH" ||
    current.phase !== "MORNING_ROUTINE" ||
    !current.rumah.hasCooked ||
    current.rumah.hasEaten
  ) {
    return current;
  }

  return {
    ...current,
    rumah: { ...current.rumah, hasEaten: true },
    activePrompt: "Sarapan selesai. Mandi sebelum berangkat.",
  };
}

export function takeMorningShower(current: GameSessionState): GameSessionState {
  if (
    current.currentLocation !== "RUMAH" ||
    current.phase !== "MORNING_ROUTINE" ||
    !current.rumah.hasEaten ||
    current.rumah.hasShowered
  ) {
    return current;
  }

  return {
    ...current,
    rumah: { ...current.rumah, hasShowered: true, canExitHouse: true },
    activePrompt: "Rutinitas selesai. Tujuan berikutnya: kantor.",
  };
}

export function takeEveningShower(current: GameSessionState): GameSessionState {
  if (
    current.currentLocation !== "RUMAH" ||
    current.phase !== "EVENING_ROUTINE" ||
    current.rumah.hasShoweredEvening
  ) {
    return current;
  }

  return {
    ...current,
    rumah: {
      ...current.rumah,
      hasShoweredEvening: true,
      canSleepEvening: current.rumah.hasEatenEvening,
    },
    activePrompt: "Mandi selesai. Siapkan makan malam.",
  };
}

export function eatDinner(current: GameSessionState): GameSessionState {
  if (
    current.currentLocation !== "RUMAH" ||
    current.phase !== "EVENING_ROUTINE" ||
    !current.rumah.hasShoweredEvening ||
    current.rumah.hasEatenEvening
  ) {
    return current;
  }

  return {
    ...current,
    rumah: {
      ...current.rumah,
      hasEatenEvening: true,
      canSleepEvening: current.rumah.hasShoweredEvening,
    },
    activePrompt: "Hari selesai. Tidur untuk melanjutkan.",
  };
}

export function arriveAtWork(current: GameSessionState): GameSessionState {
  if (current.currentLocation !== "JALAN" || current.phase !== "COMMUTE_TO_WORK") {
    return current;
  }

  return {
    ...current,
    currentLocation: "TEMPAT_KERJA",
    phase: "AT_WORK",
    humanPosition: [0, 0, 5.5],
    activePrompt: "Tugas hari ini menunggu di workstation.",
  };
}

export function completeWorkday(current: GameSessionState): GameSessionState {
  if (
    (current.currentLocation !== "TEMPAT_KERJA" && current.currentLocation !== "JALAN") ||
    (current.phase !== "AT_WORK" && current.phase !== "COMMUTE_TO_WORK")
  ) {
    return current;
  }

  return {
    ...current,
    workDone: true,
    phase: current.dayNumber === 3 ? "PORTAL_APPROACH" : "AT_WORK",
    workplace: {
      ...current.workplace,
      allTasksDone: true,
      codeTyped: true,
      bugsCaught: current.workplace.bugsTarget,
      repoPushed: true,
      portalSpawned: current.dayNumber === 3,
    },
    activePrompt:
      current.dayNumber === 3
        ? "✦ Portal Semicolon terbuka di pintu kantor."
        : "✦ Tugas selesai. Keluar kantor dan kembali ke mobil untuk pulang.",
  };
}

export function beginCommuteHome(current: GameSessionState): GameSessionState {
  if (
    (current.currentLocation !== "TEMPAT_KERJA" && current.currentLocation !== "JALAN") ||
    current.dayNumber === 3 ||
    current.phase !== "AT_WORK" ||
    !current.workplace.allTasksDone
  ) {
    return current;
  }

  return {
    ...current,
    currentLocation: "JALAN",
    phase: "COMMUTE_HOME",
    humanPosition: [0, 0, 0],
    activePrompt: "✦ Tujuan: kembali ke rumah.",
  };
}

export function arriveHomeForEvening(current: GameSessionState): GameSessionState {
  if (
    (current.currentLocation !== "JALAN" && current.currentLocation !== "RUMAH") ||
    current.phase !== "COMMUTE_HOME"
  ) {
    return current;
  }

  return {
    ...current,
    currentLocation: "RUMAH",
    phase: "EVENING_ROUTINE",
    homeReached: true,
    humanPosition: [0, 0, 3.4],
    activePrompt: "✦ Sampai di rumah. Mandi malam dan siapkan makan malam.",
  };
}

export function enterAlternateDimension(current: GameSessionState): GameSessionState {
  if (
    (current.currentLocation !== "TEMPAT_KERJA" && current.currentLocation !== "JALAN") ||
    current.dayNumber !== 3 ||
    current.phase !== "PORTAL_APPROACH" ||
    !current.workplace.allTasksDone
  ) {
    return current;
  }

  return {
    ...current,
    currentLocation: "DIMENSI_LAIN",
    humanPosition: [0, 0, 125],
    phase: "CASTLE_EXPLORATION",
    portalEntered: true,
    activePrompt: "✦ Masuki Alam Astral & Kompleks Kastil Semicolon.",
  };
}

export function enterCastle(current: GameSessionState): GameSessionState {
  if (current.currentLocation !== "DIMENSI_LAIN" || !current.portalEntered) {
    return current;
  }

  return {
    ...current,
    currentLocation: "KASTIL",
    phase: "CASTLE_EXPLORATION",
    humanPosition: [0, 0, 8],
    kastil: { ...current.kastil, insideEscapeRoom: false },
    activePrompt: "",
  };
}
