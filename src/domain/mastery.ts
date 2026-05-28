/**
 * Per-fact mastery tracking based on a Leitner spaced-repetition system.
 * Each fact lives in a box 1..5. Correct answers promote it one box (slower
 * future review); wrong answers demote it one box (sooner review). All
 * functions are pure: they return a new stat rather than mutating.
 */

export const MAX_BOX = 5;

export interface FactStat {
  /** Leitner box, 1 (struggling) .. 5 (mastered). */
  box: number;
  /** Times this fact has been shown. */
  seen: number;
  correct: number;
  wrong: number;
  /** Consecutive correct answers. */
  streak: number;
  /** Logical step (session counter) when last shown; used for recency. */
  lastSeen: number;
  /** Fastest correct answer in ms, or null if never answered correctly. */
  bestMs: number | null;
  /** Running average of correct answer time in ms, or null. */
  avgMs: number | null;
}

/** Fresh stat for a never-seen fact. */
export function initStat(): FactStat {
  return {
    box: 1,
    seen: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    lastSeen: -1,
    bestMs: null,
    avgMs: null,
  };
}

/**
 * Record an answer and return the updated stat.
 * @param ms response time in milliseconds (ignored on wrong answers)
 * @param step logical session step, stored for recency-based scheduling
 */
export function recordAnswer(
  stat: FactStat,
  correct: boolean,
  ms: number,
  step: number,
): FactStat {
  const next: FactStat = {
    ...stat,
    seen: stat.seen + 1,
    lastSeen: step,
  };
  if (correct) {
    next.box = Math.min(MAX_BOX, stat.box + 1);
    next.correct = stat.correct + 1;
    next.streak = stat.streak + 1;
    next.bestMs = stat.bestMs === null ? ms : Math.min(stat.bestMs, ms);
    next.avgMs =
      stat.avgMs === null ? ms : Math.round(stat.avgMs * 0.7 + ms * 0.3);
  } else {
    next.box = Math.max(1, stat.box - 1);
    next.wrong = stat.wrong + 1;
    next.streak = 0;
  }
  return next;
}

/** A fact counts as mastered once it reaches the top box with a live streak. */
export function isMastered(stat: FactStat): boolean {
  return stat.box >= MAX_BOX && stat.streak >= 2;
}

/** Mastery as a 0..1 fraction for progress bars (based on Leitner box). */
export function masteryFraction(stat: FactStat): number {
  return (stat.box - 1) / (MAX_BOX - 1);
}
