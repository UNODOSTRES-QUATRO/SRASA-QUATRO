import { describe, it, expect } from "vitest";
import {
  createInitialSessionState,
  advanceDay,
} from "../src/game/core/gameStore";

describe("Game Session and Day Progression Store", () => {
  it("should initialize at Day 1 in COMMUTE_TO_WORK phase", () => {
    const session = createInitialSessionState();
    expect(session.dayNumber).toBe(1);
    expect(session.phase).toBe("COMMUTE_TO_WORK");
    expect(session.workDone).toBe(false);
    expect(session.catAlert).toBe(false);
  });

  it("should advance from Day 1 to Day 2 with environmental anomaly alert", () => {
    const session = createInitialSessionState();
    const day2 = advanceDay(session);

    expect(day2.dayNumber).toBe(2);
    expect(day2.catAlert).toBe(true);
    expect(day2.activePrompt).toContain("Day 2");
  });

  it("should advance from Day 2 to Day 3 with PORTAL_APPROACH phase", () => {
    const day2 = advanceDay(createInitialSessionState());
    const day3 = advanceDay(day2);

    expect(day3.dayNumber).toBe(3);
    expect(day3.phase).toBe("PORTAL_APPROACH");
    expect(day3.catAlert).toBe(true);
    expect(day3.activePrompt).toContain("Day 3");
  });
});
