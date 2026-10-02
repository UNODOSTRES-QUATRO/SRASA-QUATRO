import { describe, expect, it } from "vitest";
import { resolvePlayerPosition, resolvePlayerWorldPosition } from "../src/game/core/playerCollision";
import { createInitialSessionState } from "../src/game/core/gameStore";

describe("player collision", () => {
  it("blocks movement through a workplace boundary wall", () => {
    const resolved = resolvePlayerPosition(
      [0, 0, -6.4],
      [0, 0, -7.1],
      "TEMPAT_KERJA",
      false
    );

    expect(resolved[2]).toBe(-6.4);
  });

  it("blocks movement into the home dining table", () => {
    const resolved = resolvePlayerPosition(
      [-2, 0, 1.6],
      [0.5, 0, 1.6],
      "RUMAH",
      false
    );

    expect(resolved[0]).toBe(-2);
  });

  it("spawns beside the bed with room to take the first step", () => {
    const spawn = createInitialSessionState().humanPosition;
    const firstStep = resolvePlayerWorldPosition(
      spawn,
      [spawn[0], 0, spawn[2] + 0.4]
    );

    expect(spawn).toEqual([19.0, 0, -62.8]);
    expect(firstStep).not.toEqual(spawn);
  });

  it("allows the player through the bathroom doorway and within shower range", () => {
    const doorwayPosition = resolvePlayerPosition(
      [1.3, 0, -2.6],
      [2.15, 0, -2.6],
      "RUMAH",
      false
    );

    expect(doorwayPosition[0]).toBe(2.15);
    expect(Math.hypot(doorwayPosition[0] - 3.4, doorwayPosition[2] + 3.4)).toBeLessThan(2);
  });

  it("slides along a cubicle collider when the other axis remains clear", () => {
    const resolved = resolvePlayerPosition(
      [0, 0, 2.5],
      [3, 0, 3],
      "TEMPAT_KERJA",
      false
    );

    expect(resolved).toEqual([0, 0, 3]);
  });

  it("uses the escape-room footprint set when the castle interior is active", () => {
    const resolved = resolvePlayerPosition(
      [0, 0, 0],
      [0, 0, -6.6],
      "KASTIL",
      true
    );

    expect(resolved[2]).toBe(0);
  });

  it("blocks movement through the castle courtyard fountain", () => {
    const resolved = resolvePlayerPosition(
      [-2.5, 0, 1],
      [0, 0, 1],
      "KASTIL",
      false
    );

    expect(resolved[0]).toBe(-2.5);
  });

  it("opens the escape-room doorway when its lock is released", () => {
    const resolved = resolvePlayerPosition(
      [2, 0, -5.7],
      [2, 0, -6.4],
      "KASTIL",
      true,
      0.32,
      true
    );

    expect(resolved[2]).toBe(-6.4);
  });
});