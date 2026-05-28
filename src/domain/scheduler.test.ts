import { describe, expect, it } from "vitest";
import { buildFacts, factKey, tableFacts } from "./facts";
import { initStat, recordAnswer } from "./mastery";
import { makeRng } from "./rng";
import {
  buildItems,
  factWeight,
  masteredFraction,
  pickBatch,
  pickFact,
  SchedItem,
} from "./scheduler";

const item = (a: number, b: number, mutate?: (s: ReturnType<typeof initStat>) => void): SchedItem => {
  const stat = initStat();
  mutate?.(stat);
  return { fact: { a, b }, stat };
};

describe("factWeight", () => {
  it("weighs low boxes higher than high boxes", () => {
    const low = item(6, 7, (s) => (s.box = 1));
    const high = item(6, 7, (s) => (s.box = 5));
    expect(factWeight(low, 10)).toBeGreaterThan(factWeight(high, 10));
  });

  it("boosts never-seen facts", () => {
    const unseen = item(6, 7);
    const seen = item(6, 7, (s) => {
      s.seen = 3;
      s.lastSeen = 0;
    });
    expect(factWeight(unseen, 10)).toBeGreaterThan(factWeight(seen, 10));
  });

  it("penalises a fact seen on the previous step", () => {
    const justSeen = item(6, 7, (s) => {
      s.seen = 1;
      s.lastSeen = 9;
    });
    const longAgo = item(6, 7, (s) => {
      s.seen = 1;
      s.lastSeen = 0;
    });
    expect(factWeight(justSeen, 10)).toBeLessThan(factWeight(longAgo, 10));
  });
});

describe("pickFact", () => {
  it("returns null on empty input", () => {
    expect(pickFact([], 0, makeRng(1))).toBeNull();
  });

  it("returns a fact from the provided set", () => {
    const items = buildItems(tableFacts(7), {});
    const fact = pickFact(items, 0, makeRng(123));
    expect(fact).not.toBeNull();
    expect(fact!.a).toBe(7);
  });

  it("favours hard/struggling facts over easy/mastered ones", () => {
    // 7×8 in box 1 (struggling) vs 1×2 in box 5 (mastered).
    const items: SchedItem[] = [
      item(7, 8, (s) => (s.box = 1)),
      item(1, 2, (s) => (s.box = 5)),
    ];
    const rng = makeRng(7);
    let hard = 0;
    for (let i = 0; i < 400; i++) {
      const f = pickFact(items, 100, rng)!;
      if (f.a === 7) hard++;
    }
    expect(hard).toBeGreaterThan(300); // strongly biased toward the hard fact
  });
});

describe("pickBatch", () => {
  it("returns the requested number of distinct facts", () => {
    const items = buildItems(buildFacts(), {});
    const batch = pickBatch(items, 6, 0, makeRng(99));
    expect(batch).toHaveLength(6);
    const keys = batch.map((f) => factKey(f.a, f.b));
    expect(new Set(keys).size).toBe(6);
  });

  it("caps at the number of available distinct facts", () => {
    const items = buildItems(tableFacts(7), {}); // 10 facts
    const batch = pickBatch(items, 50, 0, makeRng(99));
    expect(batch.length).toBeLessThanOrEqual(10);
  });
});

describe("masteredFraction", () => {
  it("rises as facts reach the top box", () => {
    let stats = {};
    const facts = tableFacts(2);
    expect(masteredFraction(buildItems(facts, stats))).toBe(0);

    // Master every fact in the table.
    const map: Record<string, ReturnType<typeof initStat>> = {};
    for (const f of facts) {
      let s = initStat();
      for (let i = 0; i < 6; i++) s = recordAnswer(s, true, 600, i);
      map[factKey(f.a, f.b)] = s;
    }
    expect(masteredFraction(buildItems(facts, map))).toBe(1);
  });
});
