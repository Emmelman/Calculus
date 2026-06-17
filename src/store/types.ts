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

/**
 * A real-life reward the child works toward (e.g. "ride a quad bike with dad").
 * A milestone: unlocked when lifetime coins reach `cost`. It does NOT spend
 * coins — it is a goal the parent grants in real life. Parent-editable.
 */
export interface RewardGoal {
  id: string;
  emoji: string;
  title: string;
  /** Lifetime coins needed to unlock this reward. */
  cost: number;
}

/** Family-specific defaults; the parent can edit these on the Parent screen. */
export const DEFAULT_REWARD_GOALS: RewardGoal[] = [
  { id: "quad", emoji: "🛵", title: "Прокатиться на квадроцикле с папой", cost: 2000 },
  { id: "dino-small", emoji: "🦖", title: "Маленький динозавр", cost: 3500 },
  { id: "dino-big", emoji: "🦕", title: "Большой динозавр", cost: 5000 },
];

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
  /** Real-life reward milestones, editable by the parent. */
  rewardGoals: RewardGoal[];
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
  /** Reward-goal ids the parent has marked as handed over in real life. */
  claimedRewards: string[];
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
