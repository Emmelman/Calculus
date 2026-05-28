/**
 * Tiny seedable PRNG (mulberry32). Deterministic given a seed, which keeps
 * gameplay reproducible in tests while staying fast and dependency-free.
 */
export type Rng = () => number;

/** Create a seeded random function returning floats in [0, 1). */
export function makeRng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Non-deterministic rng for production gameplay. */
export const systemRng: Rng = () => Math.random();

/** Pick a random integer in [min, max] inclusive. */
export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Return a shuffled copy of the array (Fisher–Yates) using the given rng. */
export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
