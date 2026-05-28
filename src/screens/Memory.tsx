import { useMemo, useRef, useState } from "react";
import { TopBar } from "../components/TopBar";
import { buildFacts, Fact, product, tableFacts } from "../domain/facts";
import { shuffle, systemRng } from "../domain/rng";
import { buildItems, pickBatch } from "../domain/scheduler";
import { reward } from "../lib/reward";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const PAIRS = 6;

interface Card {
  id: string;
  pairId: number;
  kind: "expr" | "ans";
  label: string;
  fact: Fact;
}

export function Memory() {
  const settings = useGameStore((s) => s.settings);
  const answer = useGameStore((s) => s.answer);
  const go = useNav((s) => s.go);

  const cards = useMemo<Card[]>(() => {
    const tables = settings.enabledTables.length ? settings.enabledTables : TABLES;
    const all = tables.flatMap((t) => tableFacts(t, settings.maxFactor));
    const pool = all.length ? all : buildFacts();
    const st = useGameStore.getState();
    const chosen = pickBatch(buildItems(pool, st.stats), PAIRS, st.step, systemRng);
    const made = chosen.flatMap((f, pid) => [
      { id: `e${pid}`, pairId: pid, kind: "expr" as const, label: `${f.a}×${f.b}`, fact: f },
      { id: `a${pid}`, pairId: pid, kind: "ans" as const, label: String(product(f.a, f.b)), fact: f },
    ]);
    return shuffle(systemRng, made);
    // Board is built once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const lock = useRef(false);
  const session = useRef({ coins: 0, bestStreak: 0 });

  const totalPairs = cards.length / 2;

  const tap = (idx: number) => {
    const card = cards[idx];
    if (lock.current || matched.has(card.pairId) || flipped.includes(idx)) return;

    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length < 2) return;

    const [i, j] = next;
    if (cards[i].pairId === cards[j].pairId) {
      const res = answer(card.fact, true, 1500);
      reward(res);
      session.current.coins += res.coinsEarned;
      session.current.bestStreak = Math.max(session.current.bestStreak, res.streak);
      const merged = new Set(matched).add(card.pairId);
      setMatched(merged);
      setFlipped([]);
      if (merged.size === totalPairs) {
        setTimeout(
          () =>
            go("result", {
              result: {
                mode: "memory",
                correct: totalPairs,
                total: totalPairs,
                coins: session.current.coins,
                bestStreak: session.current.bestStreak,
              },
            }),
          600,
        );
      }
    } else {
      lock.current = true;
      setTimeout(() => {
        setFlipped([]);
        lock.current = false;
      }, 750);
    }
  };

  return (
    <div className="screen-pad">
      <TopBar onBack={() => go("home")} />
      <div className="play-head">
        <div className="pill">🃏 Найди пару</div>
        <div className="pill">
          ✅ {matched.size}/{totalPairs}
        </div>
      </div>

      <div className="question">
        <div className="memory-grid">
          {cards.map((c, idx) => {
            const isDone = matched.has(c.pairId);
            const isUp = isDone || flipped.includes(idx);
            return (
              <button
                key={c.id}
                className={`mcard ${isUp ? "up" : ""} ${isDone ? "done" : ""} ${
                  flipped.includes(idx) ? "sel" : ""
                }`}
                onClick={() => tap(idx)}
              >
                {isUp ? c.label : "?"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
