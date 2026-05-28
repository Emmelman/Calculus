import { FactStat } from "../domain/mastery";

export type ScreenId =
  | "home"
  | "learn"
  | "play"
  | "quiz"
  | "speed"
  | "memory"
  | "duel"
  | "result"
  | "shop"
  | "parent"
  | "settings";

export interface DailyStat {
  correct: number;
  wrong: number;
  coins: number;
}

export interface Settings {
  /** Largest second factor (10 or 12). */
  maxFactor: number;
  /** Tables (first factor) the child is currently practising. */
  enabledTables: number[];
  soundOn: boolean;
  /** Optional 4-digit parent PIN guarding the progress screen. */
  parentPin: string | null;
  /** Whether the optional AI helper is switched on. */
  aiEnabled: boolean;
  /** Theme for AI story problems (космос, динозавры, …). */
  aiTheme: string;
}

/** Outcome of recording a single answer — drives reward animations. */
export interface AnswerResult {
  correct: boolean;
  coinsEarned: number;
  streak: number;
  leveledUp: boolean;
  level: number;
  unlocked: string[];
}

export interface GameState {
  stats: Record<string, FactStat>;
  /** Lifetime coins earned — never decreases; drives the player level. */
  coins: number;
  /** Coins spent in the shop. Wallet = coins - spent. */
  spent: number;
  /** Lifetime correct answers (the simple "stars" kids count). */
  stars: number;
  totalCorrect: number;
  totalWrong: number;
  streak: number;
  bestStreak: number;
  fastestMs: number | null;
  daily: Record<string, DailyStat>;
  unlocked: string[];
  /** Mascot skin ids the player owns. */
  ownedMascots: string[];
  /** Currently equipped mascot skin id. */
  selectedMascot: string;
  step: number;
  settings: Settings;
}

/** Spendable coin balance (lifetime earned minus spent). */
export function walletCoins(s: Pick<GameState, "coins" | "spent">): number {
  return s.coins - s.spent;
}

export const COINS_PER_LEVEL = 150;

/** Player level derived from total coins (1-based). */
export function levelForCoins(coins: number): number {
  return 1 + Math.floor(coins / COINS_PER_LEVEL);
}

/** Progress (0..1) toward the next level. */
export function levelProgress(coins: number): number {
  return (coins % COINS_PER_LEVEL) / COINS_PER_LEVEL;
}
