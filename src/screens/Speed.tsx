import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FactExpr } from "../components/FactExpr";
import { Keypad } from "../components/Keypad";
import { TopBar } from "../components/TopBar";
import { buildFacts, Fact, product, tableFacts } from "../domain/facts";
import { systemRng } from "../domain/rng";
import { buildItems, pickFact } from "../domain/scheduler";
import { reward } from "../lib/reward";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const DURATION = 60;

export function Speed() {
  const settings = useGameStore((s) => s.settings);
  const answer = useGameStore((s) => s.answer);
  const go = useNav((s) => s.go);

  const facts = useMemo(() => {
    const tables = settings.enabledTables.length ? settings.enabledTables : TABLES;
    const list = tables.flatMap((t) => tableFacts(t, settings.maxFactor));
    return list.length ? list : buildFacts();
  }, [settings.enabledTables, settings.maxFactor]);

  const [fact, setFact] = useState<Fact>(facts[0]);
  const [typed, setTyped] = useState("");
  const [combo, setCombo] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [flash, setFlash] = useState<"" | "good" | "bad">("");
  const startRef = useRef(Date.now());
  const session = useRef({ correct: 0, attempts: 0, coins: 0, bestStreak: 0 });
  const done = useRef(false);

  const nextQuestion = useCallback(() => {
    const st = useGameStore.getState();
    const next = pickFact(buildItems(facts, st.stats), st.step, systemRng) ?? facts[0];
    setFact(next);
    setTyped("");
    startRef.current = Date.now();
  }, [facts]);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    go("result", {
      result: {
        mode: "speed",
        correct: session.current.correct,
        total: session.current.attempts,
        coins: session.current.coins,
        bestStreak: session.current.bestStreak,
      },
    });
  }, [go]);

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 0.1) {
          clearInterval(id);
          finish();
          return 0;
        }
        return Math.round((l - 0.1) * 10) / 10;
      });
    }, 100);
    return () => clearInterval(id);
  }, [finish]);

  const submit = () => {
    if (typed === "" || done.current) return;
    const correct = Number(typed) === product(fact.a, fact.b);
    const res = answer(fact, correct, Date.now() - startRef.current);
    reward(res);
    session.current.attempts += 1;
    session.current.bestStreak = Math.max(session.current.bestStreak, res.streak);
    if (correct) {
      session.current.correct += 1;
      session.current.coins += res.coinsEarned;
      setCombo((c) => c + 1);
    } else {
      setCombo(0);
    }
    setFlash(correct ? "good" : "bad");
    setTimeout(() => setFlash(""), 300);
    nextQuestion();
  };

  return (
    <div className="screen-pad">
      <TopBar onBack={finish} />
      <div className="play-head">
        <div className="pill">⏱ {Math.ceil(left)} c</div>
        <div className="pill">✅ {session.current.correct}</div>
        {combo >= 2 ? <div className="combo">🔥 ×{combo}</div> : null}
      </div>

      <div className="timerbar">
        <div className="track">
          <div className="fill" style={{ width: `${(left / DURATION) * 100}%` }} />
        </div>
      </div>

      <div className="question">
        <div className={`qcard ${flash}`}>
          <FactExpr a={fact.a} b={fact.b} answer={typed === "" ? "?" : typed} />
        </div>
        <Keypad
          onDigit={(d) => setTyped((t) => (t.length < 4 ? t + d : t))}
          onDelete={() => setTyped((t) => t.slice(0, -1))}
          onEnter={submit}
        />
      </div>
    </div>
  );
}
