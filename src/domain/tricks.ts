/**
 * Per-table memory "tricks" (мнемоники), distilled from classic Soviet primary
 * arithmetic (Пчёлко/Поляк, Моро): доubling chains, the ×5/×10 link, the ×9
 * finger trick, and distributive break-downs for the hard core (3, 6, 7).
 * Pure data — рендерится в TrickCard на экране «Учить».
 */
export interface TableTrick {
  title: string;
  lines: string[];
}

const TRICKS: Record<number, TableTrick> = {
  2: {
    title: "Удвоение",
    lines: ["×2 — это число плюс само себя.", "6 × 2 = 6 + 6 = 12."],
  },
  3: {
    title: "Опора на соседа",
    lines: ["Трудный пример — обопрись на ×5.", "3 × 6 = 3 × 5 + 3 = 15 + 3 = 18."],
  },
  4: {
    title: "Удвой дважды",
    lines: ["×4 = ×2, и ещё раз ×2.", "4 × 7 = (2 × 7) + (2 × 7) = 14 + 14 = 28."],
  },
  5: {
    title: "Половина от ×10",
    lines: [
      "×5 — это половина от ×10.",
      "Чётное число → оканчивается на 0, нечётное → на 5.",
      "5 × 6 = 60 ÷ 2 = 30.",
    ],
  },
  6: {
    title: "6 = 5 + 1",
    lines: ["Считай через ×5 и прибавь ещё разок.", "6 × 7 = 5 × 7 + 7 = 35 + 7 = 42."],
  },
  7: {
    title: "7 = 5 + 2",
    lines: ["Раздели на ×5 и ×2 — потом сложи.", "7 × 8 = 5 × 8 + 2 × 8 = 40 + 16 = 56."],
  },
  8: {
    title: "Удвой трижды",
    lines: ["×8 = ×2, ×2 и ещё ×2.", "8 × 3 → 3 → 6 → 12 → 24."],
  },
  9: {
    title: "Фокус с девяткой",
    lines: [
      "9 × N = 10 × N − N.  9 × 4 = 40 − 4 = 36.",
      "А ещё сумма цифр ответа всегда 9 (3 + 6 = 9).",
      "Пальцы: загни N-й палец — слева десятки, справа единицы.",
    ],
  },
  10: {
    title: "Просто допиши ноль",
    lines: ["×10 — допиши к числу ноль.", "10 × 7 = 70."],
  },
};

const FALLBACK: TableTrick = {
  title: "Переставь множители",
  lines: ["Если забыл — переставь: a × b = b × a.", "И вспомни ближайший знакомый пример."],
};

/** Memory trick for a multiplication table (first factor). */
export function tableTrick(table: number): TableTrick {
  return TRICKS[table] ?? FALLBACK;
}
