import { describe, expect, it } from "vitest";
import { tableTrick } from "./tricks";

describe("tableTrick", () => {
  it("returns a non-empty trick for every table 2..10", () => {
    for (let t = 2; t <= 10; t++) {
      const trick = tableTrick(t);
      expect(trick.title.length).toBeGreaterThan(0);
      expect(trick.lines.length).toBeGreaterThan(0);
      expect(trick.lines.every((l) => l.trim().length > 0)).toBe(true);
    }
  });

  it("falls back gracefully for tables without a dedicated trick", () => {
    const fallback = tableTrick(99);
    expect(fallback.title.length).toBeGreaterThan(0);
    expect(fallback.lines.length).toBeGreaterThan(0);
  });
});
