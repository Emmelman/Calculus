import { describe, expect, it } from "vitest";
import {
  buildFacts,
  factDifficulty,
  factKey,
  makeChoices,
  product,
  tableFacts,
} from "./facts";
import { makeRng } from "./rng";

describe("factKey", () => {
  it("is order-independent", () => {
    expect(factKey(7, 8)).toBe(factKey(8, 7));
    expect(factKey(3, 9)).toBe("3x9");
  });
});

describe("product", () => {
  it("multiplies", () => {
    expect(product(7, 8)).toBe(56);
  });
});

describe("factDifficulty", () => {
  it("treats ×1 as trivial and stays within (0,1]", () => {
    const d = factDifficulty(1, 9);
    expect(d).toBeLessThan(0.1);
    expect(d).toBeGreaterThan(0);
    expect(factDifficulty(7, 8)).toBeLessThanOrEqual(1);
  });

  it("ranks classic hard facts above anchored ones", () => {
    expect(factDifficulty(7, 8)).toBeGreaterThan(factDifficulty(5, 8));
    expect(factDifficulty(7, 8)).toBeGreaterThan(factDifficulty(2, 8));
    expect(factDifficulty(7, 8)).toBeGreaterThan(factDifficulty(1, 8));
    expect(factDifficulty(6, 7)).toBeGreaterThan(factDifficulty(3, 4));
  });

  it("makes squares no harder than their neighbours", () => {
    expect(factDifficulty(6, 6)).toBeLessThanOrEqual(factDifficulty(6, 7));
  });
});

describe("buildFacts / tableFacts", () => {
  it("builds the default 10×10 grid", () => {
    expect(buildFacts()).toHaveLength(100);
  });

  it("builds a single table", () => {
    const sevens = tableFacts(7);
    expect(sevens).toHaveLength(10);
    expect(sevens.every((f) => f.a === 7)).toBe(true);
  });
});

describe("makeChoices", () => {
  const rng = makeRng(42);

  it("returns the requested count, all distinct and positive", () => {
    const choices = makeChoices(7, 8, 4, rng);
    expect(choices).toHaveLength(4);
    expect(new Set(choices).size).toBe(4);
    expect(choices.every((c) => c > 0)).toBe(true);
  });

  it("always includes the correct answer", () => {
    for (let i = 0; i < 20; i++) {
      const a = 1 + Math.floor(rng() * 10);
      const b = 1 + Math.floor(rng() * 10);
      expect(makeChoices(a, b, 4, rng)).toContain(a * b);
    }
  });

  it("reaches the requested count even for tiny products", () => {
    const choices = makeChoices(1, 1, 4, rng);
    expect(choices).toHaveLength(4);
    expect(new Set(choices).size).toBe(4);
    expect(choices).toContain(1);
  });
});
