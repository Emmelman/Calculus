/**
 * White/yellow panel logic (Uzorova–Nefyodova method). Within a table, facts
 * already learned in an earlier table are "white" (skip them — by the
 * commutative law knowing b×T means knowing T×b); only the "yellow" facts are
 * new and worth drilling. Classification is purely structural: it depends on
 * the table's position in LEARN_ORDER, not on the child's answer history.
 */

/** Soviet "easy → hard" learning path: anchors 2/10/5, then 3/4, the ×9 trick,
 * and the hard core 6/7/8 last (half-free thanks to the commutative law). */
export const LEARN_ORDER = [2, 10, 5, 3, 4, 9, 6, 7, 8] as const;

/**
 * Is the fact `table × b` already known (a "white" panel)? True when `b` is
 * trivial (×1) or when the table for `b` is learned earlier than `table` in
 * LEARN_ORDER — then `b × table` was already taught. The square (b === table)
 * stays "yellow": it has no earlier counterpart.
 */
export function isFactKnown(table: number, b: number): boolean {
  if (b === 1) return true;
  const ti = LEARN_ORDER.indexOf(table as (typeof LEARN_ORDER)[number]);
  const bi = LEARN_ORDER.indexOf(b as (typeof LEARN_ORDER)[number]);
  if (bi === -1) return false; // factor with no table of its own (e.g. 11, 12)
  if (ti === -1) return false;
  return bi < ti;
}

/** The "yellow" (new) factors of a table to actually learn, ascending. */
export function newFactorsFor(table: number, maxFactor = 10): number[] {
  const out: number[] = [];
  for (let b = 1; b <= maxFactor; b++) {
    if (!isFactKnown(table, b)) out.push(b);
  }
  return out;
}
