import { factKey, tableFacts } from "../domain/facts";
import { FactStat, initStat, masteryFraction } from "../domain/mastery";

/** Average mastery (0..1) across all facts of a table — used for ring fills. */
export function tableMastery(
  stats: Record<string, FactStat>,
  table: number,
  maxFactor: number,
): number {
  const facts = tableFacts(table, maxFactor);
  if (facts.length === 0) return 0;
  const sum = facts.reduce(
    (acc, f) => acc + masteryFraction(stats[factKey(f.a, f.b)] ?? initStat()),
    0,
  );
  return sum / facts.length;
}

export interface HardFact {
  a: number;
  b: number;
  wrong: number;
  box: number;
}

/** Facts the child struggles with most (low box, many wrongs) for the parent view. */
export function hardestFacts(
  stats: Record<string, FactStat>,
  tables: number[],
  maxFactor: number,
  limit = 6,
): HardFact[] {
  const seen = new Set<string>();
  const list: HardFact[] = [];
  for (const t of tables) {
    for (const f of tableFacts(t, maxFactor)) {
      const key = factKey(f.a, f.b);
      if (seen.has(key)) continue;
      seen.add(key);
      const stat = stats[key];
      if (!stat || stat.seen === 0) continue;
      if (stat.wrong > 0 || stat.box < 3) {
        list.push({ a: f.a, b: f.b, wrong: stat.wrong, box: stat.box });
      }
    }
  }
  return list
    .sort((x, y) => x.box - y.box || y.wrong - x.wrong)
    .slice(0, limit);
}
