import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Fact, factDifficulty, factKey } from "../domain/facts";
import { initStat, recordAnswer } from "../domain/mastery";
import { newlyUnlocked } from "./achievements";
import { DEFAULT_MASCOT, mascotById } from "./mascots";
import {
  AnswerResult,
  GameState,
  levelForCoins,
  Settings,
  walletCoins,
} from "./types";

const DEFAULT_SETTINGS: Settings = {
  maxFactor: 10,
  enabledTables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
  soundOn: true,
  parentPin: null,
  aiEnabled: false,
  aiTheme: "космос",
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function coinsForAnswer(fact: Fact, streak: number): number {
  const base = 8;
  const diffBonus = Math.round(factDifficulty(fact.a, fact.b) * 12);
  const streakBonus = Math.min(streak, 10) * 2;
  return base + diffBonus + streakBonus;
}

interface GameActions {
  answer: (fact: Fact, correct: boolean, ms: number) => AnswerResult;
  setSettings: (patch: Partial<Settings>) => void;
  toggleTable: (table: number) => void;
  /** Buy a mascot skin if affordable and not owned. Returns true on success. */
  buyMascot: (id: string) => boolean;
  /** Equip an owned mascot skin. */
  selectMascot: (id: string) => void;
  resetProgress: () => void;
}

export type GameStore = GameState & GameActions;

const initialState: GameState = {
  stats: {},
  coins: 0,
  spent: 0,
  stars: 0,
  totalCorrect: 0,
  totalWrong: 0,
  streak: 0,
  bestStreak: 0,
  fastestMs: null,
  daily: {},
  unlocked: [],
  ownedMascots: [DEFAULT_MASCOT],
  selectedMascot: DEFAULT_MASCOT,
  step: 0,
  settings: DEFAULT_SETTINGS,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      answer(fact, correct, ms) {
        const s = get();
        const key = factKey(fact.a, fact.b);
        const step = s.step + 1;
        const stat = recordAnswer(s.stats[key] ?? initStat(), correct, ms, step);
        const streak = correct ? s.streak + 1 : 0;
        const coinsEarned = correct ? coinsForAnswer(fact, streak) : 0;
        const coins = s.coins + coinsEarned;
        const date = today();
        const prevDaily = s.daily[date] ?? { correct: 0, wrong: 0, coins: 0 };

        const draft: GameState = {
          ...s,
          step,
          stats: { ...s.stats, [key]: stat },
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          coins,
          stars: s.stars + (correct ? 1 : 0),
          totalCorrect: s.totalCorrect + (correct ? 1 : 0),
          totalWrong: s.totalWrong + (correct ? 0 : 1),
          fastestMs:
            correct && (s.fastestMs === null || ms < s.fastestMs)
              ? ms
              : s.fastestMs,
          daily: {
            ...s.daily,
            [date]: {
              correct: prevDaily.correct + (correct ? 1 : 0),
              wrong: prevDaily.wrong + (correct ? 0 : 1),
              coins: prevDaily.coins + coinsEarned,
            },
          },
        };

        const unlocked = newlyUnlocked(draft, s.unlocked);
        draft.unlocked = unlocked.length ? [...s.unlocked, ...unlocked] : s.unlocked;

        const leveledUp = levelForCoins(coins) > levelForCoins(s.coins);
        set(draft);

        return {
          correct,
          coinsEarned,
          streak,
          leveledUp,
          level: levelForCoins(coins),
          unlocked,
        };
      },

      setSettings(patch) {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
      },

      toggleTable(table) {
        set((s) => {
          const has = s.settings.enabledTables.includes(table);
          const enabledTables = has
            ? s.settings.enabledTables.filter((t) => t !== table)
            : [...s.settings.enabledTables, table].sort((a, b) => a - b);
          // Never allow an empty selection.
          if (enabledTables.length === 0) return s;
          return { settings: { ...s.settings, enabledTables } };
        });
      },

      buyMascot(id) {
        const s = get();
        if (s.ownedMascots.includes(id)) return false;
        const skin = mascotById(id);
        if (walletCoins(s) < skin.cost) return false;
        set({
          spent: s.spent + skin.cost,
          ownedMascots: [...s.ownedMascots, id],
          selectedMascot: id,
        });
        return true;
      },

      selectMascot(id) {
        if (get().ownedMascots.includes(id)) set({ selectedMascot: id });
      },

      resetProgress() {
        const keepSettings = get().settings;
        set({ ...initialState, settings: keepSettings });
      },
    }),
    {
      name: "umnozharium-v1",
      // Persist data, but never the transient session step counter alone is
      // fine to keep; nothing here is sensitive.
      partialize: (s) => ({
        stats: s.stats,
        coins: s.coins,
        spent: s.spent,
        stars: s.stars,
        totalCorrect: s.totalCorrect,
        totalWrong: s.totalWrong,
        bestStreak: s.bestStreak,
        fastestMs: s.fastestMs,
        daily: s.daily,
        unlocked: s.unlocked,
        ownedMascots: s.ownedMascots,
        selectedMascot: s.selectedMascot,
        step: s.step,
        settings: s.settings,
      }),
    },
  ),
);
