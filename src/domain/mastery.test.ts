import { describe, expect, it } from "vitest";
import {
  initStat,
  isMastered,
  MAX_BOX,
  masteryFraction,
  recordAnswer,
} from "./mastery";

describe("recordAnswer", () => {
  it("promotes one box on correct, capped at MAX_BOX", () => {
    let s = initStat();
    expect(s.box).toBe(1);
    s = recordAnswer(s, true, 1000, 0);
    expect(s.box).toBe(2);
    expect(s.correct).toBe(1);
    expect(s.streak).toBe(1);
    for (let i = 0; i < 10; i++) s = recordAnswer(s, true, 800, i);
    expect(s.box).toBe(MAX_BOX);
  });

  it("demotes one box on wrong and resets streak, floor at 1", () => {
    let s = initStat();
    s = recordAnswer(s, true, 900, 0);
    s = recordAnswer(s, true, 900, 1);
    expect(s.box).toBe(3);
    expect(s.streak).toBe(2);
    s = recordAnswer(s, false, 0, 2);
    expect(s.box).toBe(2);
    expect(s.streak).toBe(0);
    expect(s.wrong).toBe(1);
    // never drops below 1
    s = recordAnswer(s, false, 0, 3);
    s = recordAnswer(s, false, 0, 4);
    expect(s.box).toBe(1);
  });

  it("tracks best and average time only on correct answers", () => {
    let s = initStat();
    s = recordAnswer(s, true, 2000, 0);
    expect(s.bestMs).toBe(2000);
    s = recordAnswer(s, true, 1000, 1);
    expect(s.bestMs).toBe(1000);
    s = recordAnswer(s, false, 0, 2);
    expect(s.bestMs).toBe(1000); // unchanged by wrong answer
    expect(s.seen).toBe(3);
  });

  it("stores the step for recency", () => {
    let s = initStat();
    s = recordAnswer(s, true, 500, 7);
    expect(s.lastSeen).toBe(7);
  });
});

describe("isMastered / masteryFraction", () => {
  it("requires top box plus a live streak", () => {
    let s = initStat();
    for (let i = 0; i < 10; i++) s = recordAnswer(s, true, 700, i);
    expect(s.box).toBe(MAX_BOX);
    expect(isMastered(s)).toBe(true);
  });

  it("reports 0 for fresh and 1 for top box", () => {
    expect(masteryFraction(initStat())).toBe(0);
    let s = initStat();
    for (let i = 0; i < 10; i++) s = recordAnswer(s, true, 700, i);
    expect(masteryFraction(s)).toBe(1);
  });
});
