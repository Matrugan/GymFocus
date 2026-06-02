import { describe, expect, it } from "vitest";

import {
  getLevel,
  getLevelProgress,
  getRankInfo,
  getXPForNextLevel,
} from "./levelSystem";

describe("levelSystem", () => {
  it("keeps levels increasing after the base thresholds", () => {
    expect(getLevel(1399)).toBe(4);
    expect(getLevel(1400)).toBe(5);
    expect(getLevel(1999)).toBe(5);
    expect(getLevel(2000)).toBe(6);
    expect(getLevel(2150)).toBe(6);
    expect(getLevel(2500)).toBe(7);
  });

  it("returns the next XP target for extended levels", () => {
    expect(getXPForNextLevel(4)).toBe(1400);
    expect(getXPForNextLevel(5)).toBe(2000);
    expect(getXPForNextLevel(6)).toBe(2500);
    expect(getXPForNextLevel(7)).toBe(3000);
  });

  it("puts 2150 XP in Silver rank with partial progress to level 7", () => {
    const level = getLevel(2150);

    expect(level).toBe(6);
    expect(getRankInfo(level).name).toBe("Silver");
    expect(getLevelProgress(2150)).toBe(30);
  });
});
