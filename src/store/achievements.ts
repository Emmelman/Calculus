import { factKey, tableFacts } from "../domain/facts";
import { MAX_BOX } from "../domain/mastery";
import { GameState } from "./types";

export interface Achievement {
  id: string;
  title: string;
  emoji: string;
  desc: string;
  /** True once the player meets the unlock condition. */
  check: (s: GameState) => boolean;
}

/** Whether every fact of a table has reached the top Leitner box. */
function tableMastered(s: GameState, table: number): boolean {
  return tableFacts(table, s.settings.maxFactor).every(
    (f) => (s.stats[factKey(f.a, f.b)]?.box ?? 1) >= MAX_BOX,
  );
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-correct",
    title: "Первый шаг",
    emoji: "🌟",
    desc: "Первый правильный ответ",
    check: (s) => s.totalCorrect >= 1,
  },
  {
    id: "streak-5",
    title: "В ударе!",
    emoji: "🔥",
    desc: "5 правильных подряд",
    check: (s) => s.bestStreak >= 5,
  },
  {
    id: "streak-10",
    title: "Огонь!",
    emoji: "🚀",
    desc: "10 правильных подряд",
    check: (s) => s.bestStreak >= 10,
  },
  {
    id: "speed",
    title: "Молния",
    emoji: "⚡",
    desc: "Ответ быстрее 2 секунд",
    check: (s) => s.fastestMs !== null && s.fastestMs < 2000,
  },
  {
    id: "coins-100",
    title: "Копилка",
    emoji: "💰",
    desc: "Накопить 100 монет",
    check: (s) => s.coins >= 100,
  },
  {
    id: "coins-500",
    title: "Богатство",
    emoji: "🏆",
    desc: "Накопить 500 монет",
    check: (s) => s.coins >= 500,
  },
  {
    id: "fifty",
    title: "Полста",
    emoji: "🎯",
    desc: "50 правильных ответов",
    check: (s) => s.totalCorrect >= 50,
  },
  {
    id: "master-2",
    title: "Король двойки",
    emoji: "2️⃣",
    desc: "Выучить таблицу на 2",
    check: (s) => tableMastered(s, 2),
  },
  {
    id: "master-5",
    title: "Пятёрочка",
    emoji: "5️⃣",
    desc: "Выучить таблицу на 5",
    check: (s) => tableMastered(s, 5),
  },
  {
    id: "master-9",
    title: "Девятка-загадка",
    emoji: "9️⃣",
    desc: "Выучить таблицу на 9",
    check: (s) => tableMastered(s, 9),
  },
];

/**
 * Return ids of achievements newly satisfied by `state` that are not yet in
 * `already`. Pure — the caller merges the result into the unlocked list.
 */
export function newlyUnlocked(state: GameState, already: readonly string[]): string[] {
  const have = new Set(already);
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.check(state)).map((a) => a.id);
}

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
