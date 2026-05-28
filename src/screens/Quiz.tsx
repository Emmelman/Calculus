import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FactExpr } from "../components/FactExpr";
import { MascotSvg } from "../components/Mascot";
import { TopBar } from "../components/TopBar";
import { buildFacts, Fact, makeChoices, product, tableFacts } from "../domain/facts";
import { makeRng, systemRng } from "../domain/rng";
import { buildItems, pickFact } from "../domain/scheduler";
import { reward } from "../lib/reward";
import { mascotById } from "../store/mascots";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const TOTAL = 10;

export function Quiz() {
  const settings = useGameStore((s) => s.settings);
  const answer = useGameStore((s) => s.answer);
  const skin = mascotById(useGameStore((s) => s.selectedMascot));
  const go = useNav((s) => s.go);

  const facts = useMemo(() => {
    const tables = settings.enabledTables.length ? settings.enabledTables : TABLES;
    const list = tables.flatMap((t) => tableFacts(t, settings.maxFactor));
    return list.length ? list : buildFacts();
  }, [settings.enabledTables, settings.maxFactor]);

  const [index, setIndex] = useState(0);
  const [fact, setFact] = useState<Fact>(facts[0]);
  const [choices, setChoices] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const startRef = useRef(Date.now());
  const session = useRef({ correct: 0, coins: 0, bestStreak: 0 });

  const nextQuestion = useCallback(() => {
    const st = useGameStore.getState();
    const next = pickFact(buildItems(facts, st.stats), st.step, systemRng) ?? facts[0];
    setFact(next);
    setChoices(makeChoices(next.a, next.b, 4, systemRng));
    setPicked(null);
    startRef.current = Date.now();
  }, [facts]);

  useEffect(() => {
    session.current = { correct: 0, coins: 0, bestStreak: 0 };
    // Seed the very first set of choices deterministically, then continue live.
    setChoices(makeChoices(facts[0].a, facts[0].b, 4, makeRng(Date.now())));
    startRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (value: number) => {
    if (picked !== null) return;
    setPicked(value);
    const correct = value === product(fact.a, fact.b);
    const res = answer(fact, correct, Date.now() - startRef.current);
    reward(res);
    if (correct) {
      session.current.correct += 1;
      session.current.coins += res.coinsEarned;
    }
    session.current.bestStreak = Math.max(session.current.bestStreak, res.streak);

    setTimeout(() => {
      if (index + 1 >= TOTAL) {
        go("result", {
          result: {
            mode: "quiz",
            correct: session.current.correct,
            total: TOTAL,
            coins: session.current.coins,
            bestStreak: session.current.bestStreak,
          },
        });
      } else {
        setIndex((i) => i + 1);
        nextQuestion();
      }
    }, 850);
  };

  const correctValue = product(fact.a, fact.b);
  const mood = picked === null ? "idle" : picked === correctValue ? "cheer" : "sad";

  return (
    <div className="screen-pad">
      <TopBar onBack={() => go("home")} />
      <div className="play-head">
        <MascotSvg skin={skin} mood={mood} className={`play-mascot ${mood}`} />
        <div className="pill">Вопрос {index + 1}/{TOTAL}</div>
        <div className="pill">✅ {session.current.correct}</div>
      </div>

      <div className="question">
        <div className={`qcard ${picked === null ? "" : picked === correctValue ? "good" : "bad"}`}>
          <FactExpr a={fact.a} b={fact.b} answer={picked === null ? "?" : picked} />
        </div>

        <div className="choices">
          {choices.map((c) => {
            let cls = "choice";
            if (picked !== null) {
              if (c === correctValue) cls += " correct";
              else if (c === picked) cls += " wrong";
            }
            return (
              <button key={c} className={cls} onClick={() => choose(c)} disabled={picked !== null}>
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
