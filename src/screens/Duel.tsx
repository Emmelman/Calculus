import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FactExpr } from "../components/FactExpr";
import { Keypad } from "../components/Keypad";
import { MascotSvg } from "../components/Mascot";
import { TopBar } from "../components/TopBar";
import { buildFacts, Fact, factDifficulty, product, tableFacts } from "../domain/facts";
import { systemRng } from "../domain/rng";
import { buildItems, pickFact } from "../domain/scheduler";
import { reward } from "../lib/reward";
import { mascotById } from "../store/mascots";
import { levelForCoins } from "../store/types";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const WIN = 5;
const DURATION = 90;
const BOT_SKIN = "robot";

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** Seconds the bot needs for a question — faster at higher player levels,
 * slower on harder facts, with a little randomness so it feels alive. */
function botThinkTime(fact: Fact, level: number): number {
  const base = 4.2 - Math.min(level, 12) * 0.18 + factDifficulty(fact.a, fact.b) * 1.6;
  return clamp(base + Math.random(), 1.6, 6.5);
}

export function Duel() {
  const settings = useGameStore((s) => s.settings);
  const coins = useGameStore((s) => s.coins);
  const selectedMascot = useGameStore((s) => s.selectedMascot);
  const answer = useGameStore((s) => s.answer);
  const go = useNav((s) => s.go);

  const level = useMemo(() => levelForCoins(coins), [coins]);
  const facts = useMemo(() => {
    const tables = settings.enabledTables.length ? settings.enabledTables : TABLES;
    const list = tables.flatMap((t) => tableFacts(t, settings.maxFactor));
    return list.length ? list : buildFacts();
  }, [settings.enabledTables, settings.maxFactor]);

  const [fact, setFact] = useState<Fact>(facts[0]);
  const [typed, setTyped] = useState("");
  const [pScore, setPScore] = useState(0);
  const [bScore, setBScore] = useState(0);
  const [botPct, setBotPct] = useState(1);
  const [left, setLeft] = useState(DURATION);
  const [flash, setFlash] = useState<"" | "good" | "bad">("");

  const p = useRef(0);
  const b = useRef(0);
  const botInit = useRef(5);
  const botLeft = useRef(5);
  const leftRef = useRef(DURATION);
  const qStart = useRef(Date.now());
  const sessionCoins = useRef(0);
  const bestStreak = useRef(0);
  const done = useRef(false);

  const nextQuestion = useCallback(() => {
    const st = useGameStore.getState();
    const f = pickFact(buildItems(facts, st.stats), st.step, systemRng) ?? facts[0];
    setFact(f);
    setTyped("");
    const t = botThinkTime(f, level);
    botInit.current = t;
    botLeft.current = t;
    setBotPct(1);
    qStart.current = Date.now();
  }, [facts, level]);

  const endGame = useCallback(() => {
    if (done.current) return;
    done.current = true;
    go("result", {
      result: {
        mode: "duel",
        correct: p.current,
        total: p.current + b.current,
        coins: sessionCoins.current,
        bestStreak: bestStreak.current,
        won: p.current > b.current,
      },
    });
  }, [go]);

  useEffect(() => {
    nextQuestion();
    const id = setInterval(() => {
      if (done.current) return;
      leftRef.current = Math.max(0, Math.round((leftRef.current - 0.1) * 10) / 10);
      setLeft(leftRef.current);
      if (leftRef.current <= 0) {
        endGame();
        return;
      }
      botLeft.current = Math.max(0, botLeft.current - 0.1);
      setBotPct(botInit.current > 0 ? botLeft.current / botInit.current : 0);
      if (botLeft.current <= 0) {
        b.current += 1;
        setBScore(b.current);
        if (b.current >= WIN) endGame();
        else nextQuestion();
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = () => {
    if (typed === "" || done.current) return;
    const correct = Number(typed) === product(fact.a, fact.b);
    const res = answer(fact, correct, Date.now() - qStart.current);
    reward(res);
    bestStreak.current = Math.max(bestStreak.current, res.streak);
    if (correct) {
      p.current += 1;
      setPScore(p.current);
      sessionCoins.current += res.coinsEarned;
      setFlash("good");
      setTimeout(() => setFlash(""), 300);
      if (p.current >= WIN) endGame();
      else nextQuestion();
    } else {
      setFlash("bad");
      setTimeout(() => setFlash(""), 300);
      setTyped("");
    }
  };

  const pips = (value: number, mine: boolean) =>
    Array.from({ length: WIN }).map((_, i) => (
      <span key={i} className={`pip ${i < value ? "on" : ""} ${mine ? "mine" : ""}`} />
    ));

  return (
    <div className="screen-pad">
      <TopBar onBack={endGame} />
      <div className="play-head">
        <div className="pill">⏱ {Math.ceil(left)} c</div>
        <div className="pill">⚔️ Дуэль до {WIN}</div>
      </div>

      <div className="duel-top">
        <div className="duel-fighter">
          <MascotSvg skin={mascotById(selectedMascot)} className="duel-mascot" />
          <div className="duel-name">Ты</div>
          <div className="duel-score">{pips(pScore, true)}</div>
        </div>
        <div className="vs">VS</div>
        <div className="duel-fighter">
          <MascotSvg skin={mascotById(BOT_SKIN)} className="duel-mascot" />
          <div className="duel-name">Робот</div>
          <div className="duel-score">{pips(bScore, false)}</div>
          <div className="botbar">
            <div className="track">
              <div className="fill" style={{ width: `${botPct * 100}%` }} />
            </div>
          </div>
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
