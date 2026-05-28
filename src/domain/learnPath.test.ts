import { describe, expect, it } from "vitest";
import { isFactKnown, LEARN_ORDER, newFactorsFor } from "./learnPath";

describe("isFactKnown", () => {
  it("treats ×1 as always known", () => {
    for (let t = 2; t <= 10; t++) expect(isFactKnown(t, 1)).toBe(true);
  });

  it("keeps the square (b === table) yellow", () => {
    for (const t of LEARN_ORDER) expect(isFactKnown(t, t)).toBe(false);
  });

  it("treats a factor learned earlier in LEARN_ORDER as known", () => {
    // ×8 is last; every factor before it is already learned.
    expect(isFactKnown(8, 2)).toBe(true);
    expect(isFactKnown(8, 7)).toBe(true);
    // ×2 is first; nothing precedes it, so other factors are new.
    expect(isFactKnown(2, 3)).toBe(false);
    expect(isFactKnown(2, 8)).toBe(false);
  });

  it("treats factors without a table of their own as new (maxFactor 12)", () => {
    expect(isFactKnown(8, 11)).toBe(false);
    expect(isFactKnown(8, 12)).toBe(false);
  });
});

describe("newFactorsFor", () => {
  it("matches the expected yellow factors for the hard core", () => {
    expect(newFactorsFor(8)).toEqual([8]);
    expect(newFactorsFor(7)).toEqual([7, 8]);
    expect(newFactorsFor(6)).toEqual([6, 7, 8]);
    // 9 sits before 6/7/8 in LEARN_ORDER, so those stay new in the ×9 table.
    expect(newFactorsFor(9)).toEqual([6, 7, 8, 9]);
    expect(newFactorsFor(4)).toEqual([4, 6, 7, 8, 9]);
  });

  it("returns all non-trivial factors for the first table (×2)", () => {
    expect(newFactorsFor(2)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("never includes ×1 and stays within maxFactor", () => {
    for (let t = 2; t <= 10; t++) {
      const ys = newFactorsFor(t, 10);
      expect(ys).not.toContain(1);
      expect(ys.every((b) => b >= 2 && b <= 10)).toBe(true);
    }
  });

  it("includes out-of-table factors when maxFactor exceeds 10", () => {
    expect(newFactorsFor(8, 12)).toEqual([8, 11, 12]);
  });
});
