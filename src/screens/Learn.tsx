import { useEffect, useState } from "react";
import { FactExpr } from "../components/FactExpr";
import { DotsModel, NumberLine } from "../components/LearnVisuals";
import { Mascot } from "../components/Mascot";
import { TopBar } from "../components/TopBar";
import { product } from "../domain/facts";
import { explainFact } from "../helper/llmClient";
import { playTap } from "../lib/sound";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export function Learn() {
  const settings = useGameStore((s) => s.settings);
  const go = useNav((s) => s.go);

  const tables = settings.enabledTables.length ? settings.enabledTables : TABLES;
  const [table, setTable] = useState(tables[0]);
  const [b, setB] = useState(1);
  const [tip, setTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);

  useEffect(() => {
    setTip(null);
  }, [table, b]);

  const max = settings.maxFactor;
  const step = (delta: number) => () => {
    playTap();
    setB((cur) => Math.min(max, Math.max(1, cur + delta)));
  };

  const askHelper = async () => {
    playTap();
    setLoadingTip(true);
    try {
      setTip(await explainFact(table, b));
    } finally {
      setLoadingTip(false);
    }
  };

  return (
    <div className="screen-pad">
      <TopBar onBack={() => go("home")} />

      <div className="seg" style={{ flexWrap: "wrap", alignSelf: "center" }}>
        {tables.map((t) => (
          <button
            key={t}
            className={t === table ? "on" : ""}
            onClick={() => {
              playTap();
              setTable(t);
              setB(1);
            }}
          >
            ×{t}
          </button>
        ))}
      </div>

      <div className="question">
        <div className="qcard">
          <FactExpr a={table} b={b} answer={product(table, b)} />
          <p className="subtitle" style={{ color: "var(--ink-soft)" }}>
            Это {table} раз по {b}
          </p>
          <DotsModel a={table} b={b} />
          <NumberLine a={table} b={b} />
        </div>

        <div className="topbar" style={{ width: "100%", maxWidth: 560, margin: 0 }}>
          <button className="btn ghost" onClick={step(-1)} disabled={b <= 1}>
            ← Назад
          </button>
          <div className="pill" style={{ color: "var(--on-accent)" }}>
            {b} / {max}
          </div>
          <button className="btn yellow" onClick={step(1)} disabled={b >= max}>
            Дальше →
          </button>
        </div>

        <button className="btn blue" onClick={askHelper} disabled={loadingTip}>
          {loadingTip ? "Думаю…" : "💡 Объясни, как запомнить"}
        </button>

        {tip ? (
          <div className="helper">
            <span style={{ fontSize: "var(--fs-lg)" }}>🦉</span>
            <span className="txt">{tip}</span>
          </div>
        ) : null}

        {b >= max ? (
          <div className="center-col">
            <Mascot mood="cheer" say="Молодец! Теперь попробуй викторину." />
            <button className="btn teal" onClick={() => go("quiz")}>
              ❓ В викторину!
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
