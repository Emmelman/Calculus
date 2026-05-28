import { Rng, shuffle } from "./rng";

/** A single multiplication fact, e.g. { a: 7, b: 8 } meaning 7 × 8. */
export interface Fact {
  a: number;
  b: number;
}

/** Stable string key for a fact. Order-independent (7×8 and 8×7 share a key). */
export function factKey(a: number, b: number): string {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return `${lo}x${hi}`;
}

/** The product of a fact. */
export function product(a: number, b: number): number {
  return a * b;
}

const EASY_FACTOR = new Set([2, 5]);

/**
 * Heuristic difficulty of a fact in (0, 1]. Used to order lessons and to seed
 * scheduling weight before any answer history exists. Anchored tables (1, 10,
 * 2, 5) are easy; squares are memorable; big mixed products (7×8) are hardest.
 */
export function factDifficulty(a: number, b: number): number {
  if (a === 1 || b === 1) return 0.02;
  if (a === 10 || b === 10) return 0.12;
  const hi = Math.max(a, b);
  const lo = Math.min(a, b);
  let score = (hi + lo * 1.5) / 30;
  if (EASY_FACTOR.has(a) || EASY_FACTOR.has(b)) score *= 0.45;
  if (a === b) score *= 0.8; // squares are easier to recall
  return Math.min(1, Math.max(0.02, score));
}

export interface FactRange {
  minA?: number;
  maxA?: number;
  minB?: number;
  maxB?: number;
}

/** Build the full grid of facts for the given factor ranges (defaults 1..10). */
export function buildFacts(range: FactRange = {}): Fact[] {
  const { minA = 1, maxA = 10, minB = 1, maxB = 10 } = range;
  const facts: Fact[] = [];
  for (let a = minA; a <= maxA; a++) {
    for (let b = minB; b <= maxB; b++) {
      facts.push({ a, b });
    }
  }
  return facts;
}

/** Build facts for a single multiplication table (e.g. table of 7 → 7×1..7×10). */
export function tableFacts(table: number, maxFactor = 10): Fact[] {
  return buildFacts({ minA: table, maxA: table, minB: 1, maxB: maxFactor });
}

/**
 * Generate `count` multiple-choice options for a fact (including the correct
 * answer), shuffled. Distractors mimic real childhood mistakes: neighbouring
 * rows/columns and off-by-one-step errors. Always returns positive, distinct
 * values; falls back to small offsets if needed to reach `count`.
 */
export function makeChoices(a: number, b: number, count: number, rng: Rng): number[] {
  const correct = a * b;
  const candidates = new Set<number>();
  const add = (n: number) => {
    if (n > 0 && n !== correct) candidates.add(n);
  };
  add(a * (b + 1));
  add(a * (b - 1));
  add((a + 1) * b);
  add((a - 1) * b);
  add(correct + a);
  add(correct - a);
  add(correct + b);
  add(correct - b);
  add(correct + 1);
  add(correct - 1);

  let pool = shuffle(rng, [...candidates]);
  const wrong = pool.slice(0, count - 1);

  // Pad with safe offsets if the pool was too small (tiny products).
  let pad = 1;
  while (wrong.length < count - 1) {
    const v = correct + pad;
    if (v !== correct && !wrong.includes(v)) wrong.push(v);
    pad++;
  }

  return shuffle(rng, [correct, ...wrong]);
}
