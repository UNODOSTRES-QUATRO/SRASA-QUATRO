import { describe, it, expect } from "vitest";
import {
  createInitialSessionState,
  advanceDay,
  beginCommuteToWork,
  arriveAtWork,
  completeWorkday,
  beginCommuteHome,
  arriveHomeForEvening,
  cookBreakfast,
  eatBreakfast,
  eatDinner,
  takeEveningShower,
  takeMorningShower,
  wakeUp,
  getCurrentObjective,
} from "../src/game/core/gameStore";

describe("Game Session and Day Progression Store", () => {
  it("starts each day in the morning routine", () => {
    const session = createInitialSessionState();
    expect(session.dayNumber).toBe(1);
    expect(session.phase).toBe("MORNING_ROUTINE");
    expect(getCurrentObjective(session)).toBe("Wake up");
    expect(session.workDone).toBe(false);
    expect(session.catAlert).toBe(false);
    expect(session.pocketUnlocked).toBe(false);
    expect(session.castleGateOpen).toBe(false);
    expect(session.puzzleSolved).toBe(false);
  });

  it("does not advance before evening tasks are complete", () => {
    const session = createInitialSessionState();
    expect(advanceDay(session)).toBe(session);
  });

  it("requires morning tasks and evening shower, dinner, then sleep in order", () => {
    let state = createInitialSessionState();
    expect(cookBreakfast(state)).toBe(state);
    state = wakeUp(state);
    state = cookBreakfast(state);
    expect(takeMorningShower(state)).toBe(state);
    state = eatBreakfast(state);
    state = takeMorningShower(state);
    expect(state.rumah.canExitHouse).toBe(true);
    const evening = { ...state, phase: "EVENING_ROUTINE" as const };
    expect(eatDinner(evening)).toBe(evening);
    const showered = takeEveningShower(evening);
    expect(showered.rumah.hasShoweredEvening).toBe(true);
    const dinner = eatDinner(showered);
    expect(dinner.rumah.canSleepEvening).toBe(true);
    expect(eatDinner(dinner)).toBe(dinner);
  });

  it("advances to a clean Day 2 after completing the work-home-evening flow", () => {
    const start = createInitialSessionState();
    const day2 = advanceDay({
      ...start,
      dayNumber: 1,
      phase: "EVENING_ROUTINE",
      currentLocation: "RUMAH",
      rumah: {
        ...start.rumah,
        wokenUp: true,
        hasCooked: true,
        hasEaten: true,
        hasShowered: true,
        canExitHouse: true,
        hasShoweredEvening: true,
        hasEatenEvening: true,
        canSleepEvening: true,
      },
      workplace: { ...start.workplace, allTasksDone: true },
      workDone: true,
    });

    expect(day2.dayNumber).toBe(2);
    expect(day2.phase).toBe("MORNING_ROUTINE");
    expect(day2.catAlert).toBe(true);
    expect(day2.activePrompt).toContain("Day 2");
    expect(day2.rumah.wokenUp).toBe(false);
    expect(day2.rumah.hasCooked).toBe(false);
    expect(day2.rumah.hasEaten).toBe(false);
    expect(day2.rumah.hasShowered).toBe(false);
    expect(day2.rumah.hasShoweredEvening).toBe(false);
    expect(day2.rumah.hasEatenEvening).toBe(false);
    expect(day2.workplace.allTasksDone).toBe(false);
    expect(day2.workplace.bugsCaught).toBe(0);
    expect(day2.workDone).toBe(false);
  });

  it("requires morning completion, work, and a return commute in order", () => {
    const start = createInitialSessionState();
    const unprepared = beginCommuteToWork(start);
    expect(unprepared).toBe(start);

    const ready = {
      ...start,
      rumah: { ...start.rumah, canExitHouse: true },
    };
    const commute = beginCommuteToWork(ready);
    expect(commute.phase).toBe("COMMUTE_TO_WORK");
    expect(getCurrentObjective(commute)).toBe("Drive to work");
    expect(beginCommuteHome(commute)).toBe(commute);

    const atWork = arriveAtWork(commute);
    expect(atWork.phase).toBe("AT_WORK");
    expect(beginCommuteHome(atWork)).toBe(atWork);

    const finished = completeWorkday(atWork);
    expect(finished.workplace.allTasksDone).toBe(true);
    const headingHome = beginCommuteHome(finished);
    expect(headingHome.phase).toBe("COMMUTE_HOME");
    expect(arriveHomeForEvening(headingHome).phase).toBe("EVENING_ROUTINE");
    expect(getCurrentObjective(arriveHomeForEvening(headingHome))).toBe("Take an evening shower");
  });

  it("advances the castle objective only as clue and key state changes", () => {
    const start = createInitialSessionState();
    const castle = {
      ...start,
      currentLocation: "KASTIL" as const,
      dayNumber: 3,
      phase: "CASTLE_EXPLORATION" as const,
      kastil: { ...start.kastil, insideEscapeRoom: true },
    };
    expect(getCurrentObjective(castle)).toBe("Search the cabinet");
    const withClues = {
      ...castle,
      kastil: {
        ...castle.kastil,
        escapeRoom: { ...castle.kastil.escapeRoom, cabinetSearched: true, stoveChecked: true },
      },
    };
    expect(getCurrentObjective(withClues)).toBe("Find the loose stone");
    expect(getCurrentObjective({
      ...withClues,
      kastil: {
        ...withClues.kastil,
        escapeRoom: { ...withClues.kastil.escapeRoom, secretWallRevealed: true, hasMasterKey: true },
      },
    })).toBe("Unlock the exit");
  });

  it("starts Day 3 with fresh routines and defers the portal until work is complete", () => {
    const start = createInitialSessionState();
    const completedEvening = {
      ...start,
      dayNumber: 2,
      phase: "EVENING_ROUTINE" as const,
      rumah: {
        ...start.rumah,
        hasShoweredEvening: true,
        hasEatenEvening: true,
        canSleepEvening: true,
      },
    };
    const day3 = advanceDay(completedEvening);

    expect(day3.dayNumber).toBe(3);
    expect(day3.phase).toBe("MORNING_ROUTINE");
    expect(day3.catAlert).toBe(true);
    expect(day3.activePrompt).toContain("Day 3");
    expect(day3.workplace.portalSpawned).toBe(true);
    expect(day3.workplace.allTasksDone).toBe(false);
    expect(day3.rumah.wokenUp).toBe(false);

    const atWork = {
      ...day3,
      currentLocation: "TEMPAT_KERJA" as const,
      phase: "AT_WORK" as const,
    };
    expect(completeWorkday(atWork).phase).toBe("PORTAL_APPROACH");
  });
});
