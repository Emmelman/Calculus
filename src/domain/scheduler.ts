import { Fact, factDifficulty, factKey } from "./facts";
import { FactStat, initStat, MAX_BOX } from "./mastery";
import { Rng } from "./rng";

/**
 * Adaptive scheduler: chooses which fact to practise next. It biases toward
 * facts that are (a) in low Leitner boxes, (b) intrinsically hard, and (c)
 * not seen very recently — while still occasionally resurfacing mastered
 * facts for review. Pure and rng-injectable for deterministic tests.
 */

export interface SchedItem {
  fact: Fact;
  stat: FactStat;
}

/** Build scheduler items from a fact list and a map of known stats. */
export function buildItems(
  facts: readonly Fact[],
  stats: Record<string, FactStat>,
): SchedItem[] {
  return facts.map((fact) => ({
    fact,
    stat: stats[factKey(fact.a, fact.b)] ?? initStat(),
  }));
}

/**
 * Selection weight for a fact. Higher = more likely to be picked next.
 * @param step current logical session step (for recency)
 */
export function factWeight(item: SchedItem, step: number): number {
  const { fact, stat } = item;
  // Low boxes weigh more: box 1 -> 5, box 5 -> 1.
  const boxFactor = MAX_BOX + 1 - stat.box;
  // Intrinsic difficulty nudges hard facts up even before history exists.
  const diffFactor = 0.6 + factDifficulty(fact.a, fact.b);
  // Never-seen facts get a one-time boost so the whole table gets introduced.
  const unseenBoost = stat.seen === 0 ? 1.5 : 1;
  // Avoid showing the same fact twice in a row.
  const sinceSeen = stat.lastSeen < 0 ? Infinity : step - stat.lastSeen;
  const recentPenalty = sinceSeen <= 1 ? 0.1 : 1;
  return boxFactor * diffFactor * unseenBoost * recentPenalty;
}

/** Weighted-random pick of one fact. Returns null only for an empty list. */
export function pickFact(items: readonly SchedItem[], step: number, rng: Rng): Fact | null {
  if (items.length === 0) return null;
  const weights = items.map((it) => factWeight(it, step));
  const total = weights.reduce((s, w) => s + w, 0);
  if (total <= 0) return items[Math.floor(rng() * items.length)].fact;
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i].fact;
  }
  return items[items.length - 1].fact;
}

/**
 * Pick `count` distinct facts (by key) for a batch, e.g. a memory-match board.
 * Falls back to fewer than requested if the pool of distinct facts is smaller.
 */
export function pickBatch(
  items: readonly SchedItem[],
  count: number,
  step: number,
  rng: Rng,
): Fact[] {
  const chosen: Fact[] = [];
  const usedKeys = new Set<string>();
  let pool = items.slice();
  while (chosen.length < count && pool.length > 0) {
    const fact = pickFact(pool, step, rng);
    if (!fact) break;
    const key = factKey(fact.a, fact.b);
    if (!usedKeys.has(key)) {
      usedKeys.add(key);
      chosen.push(fact);
    }
    pool = pool.filter((it) => factKey(it.fact.a, it.fact.b) !== key);
  }
  return chosen;
}

/** Fraction of items currently mastered (top box) — for overall progress. */
export function masteredFraction(items: readonly SchedItem[]): number {
  if (items.length === 0) return 0;
  const mastered = items.filter((it) => it.stat.box >= MAX_BOX).length;
  return mastered / items.length;
}
