import { useEffect, useState } from "react";
import { FactExpr } from "../components/FactExpr";
import { AdditionModel, ArrayModel, CommuteModel, SkipCount, TrickCard } from "../components/LearnVisuals";
import { Mascot } from "../components/Mascot";
import { TopBar } from "../components/TopBar";
import { product } from "../domain/facts";
import { isFactKnown, LEARN_ORDER, newFactorsFor } from "../domain/learnPath";
import { tableTrick } from "../domain/tricks";
import { askHelper, explainFact } from "../helper/llmClient";
import { playTap } from "../lib/sound";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

/** Russian plural: forms = [one, few, many] (1 пример / 2 примера / 5 примеров). */
function plural(n: number, forms: [string, string, string]): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export function Learn() {
  const settings = useGameStore((s) => s.settings);
  const go = useNav((s) => s.go);

  const available = settings.enabledTables.length ? settings.enabledTables : [...LEARN_ORDER];
  // Chips are shown in plain ascending order (×2, ×3, … ×10) — the numeric
  // order a child expects. The pedagogical LEARN_ORDER still drives which facts
  // count as already-known (white panels), it just isn't the display order.
  const tables = [...available].sort((a, b) => a - b);

  const [table, setTable] = useState<number>(tables[0] ?? 2);
  const [pos, setPos] = useState(0);
  const [showHow, setShowHow] = useState(false);
  const [tip, setTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  const max = settings.maxFactor;
  const yellow = newFactorsFor(table, max);
  const currentB = yellow[Math.min(pos, yellow.length - 1)] ?? 1;
  const onLast = pos >= yellow.length - 1;

  useEffect(() => {
    setTip(null);
    setShowHow(false);
    setQuestion("");
  }, [table, pos]);

  const pickTable = (t: number) => () => {
    playTap();
    setTable(t);
    setPos(0);
  };

  const pickFact = (b: number) => () => {
    const i = yellow.indexOf(b);
    if (i === -1) return; // white panel — already known, not drilled
    playTap();
    setPos(i);
  };

  const next = () => {
    playTap();
    if (!onLast) setPos((p) => p + 1);
  };

  const back = () => {
    playTap();
    if (pos > 0) setPos((p) => p - 1);
  };

  const explain = async () => {
    playTap();
    setLoadingTip(true);
    try {
      const trick = tableTrick(table).lines.join(" ");
      setTip(await explainFact(table, currentB, trick));
    } finally {
      setLoadingTip(false);
    }
  };

  const ask = async () => {
    const q = question.trim();
    if (!q || asking) return;
    playTap();
    setAsking(true);
    try {
      setTip(await askHelper(table, currentB, q));
    } finally {
      setAsking(false);
    }
  };

  const newCount = yellow.length;
  const headline =
    newCount === 0
      ? "Ты уже знаешь всю таблицу! 🎉"
      : `Нужно выучить всего ${newCount} ${plural(newCount, [
          "новый пример",
          "новых примера",
          "новых примеров",
        ])}!`;

  return (
    <div className="screen-pad">
      <TopBar onBack={() => go("home")} />

      <div className="seg" style={{ flexWrap: "wrap", alignSelf: "center" }}>
        {tables.map((t) => (
          <button key={t} className={t === table ? "on" : ""} onClick={pickTable(t)}>
            ×{t}
          </button>
        ))}
      </div>

      <div className="question">
        <div className="qcard learn-head">
          <TrickCard table={table} />
          <p className="table-headline">{headline}</p>
        </div>

        <div className="fact-panels" role="list">
          {Array.from({ length: max }).map((_, i) => {
            const b = i + 1;
            const known = isFactKnown(table, b);
            const isCurrent = !known && b === currentB;
            const note = b === 1 ? "это само число" : `= ${b} × ${table}`;
            return (
              <button
                key={b}
                role="listitem"
                className={`fact-panel ${known ? "known" : "new"} ${isCurrent ? "on" : ""}`}
                onClick={pickFact(b)}
                disabled={known}
                aria-label={`${table} умножить на ${b} равно ${product(table, b)}${known ? ", уже знаешь" : ", новый пример"}`}
              >
                <span className="fact-eq">
                  {table} × {b} = <b>{product(table, b)}</b>
                </span>
                {known ? (
                  <span className="fact-note">{note}</span>
                ) : (
                  <span className="fact-tag">учим</span>
                )}
                <span className="fact-mark" aria-hidden="true">
                  {known ? "✓" : "🟡"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="qcard">
          <span className="focus-progress">
            Новое: {Math.min(pos + 1, newCount)} / {newCount}
          </span>
          <FactExpr a={table} b={currentB} answer={product(table, currentB)} />

          <button className="how-toggle" onClick={() => setShowHow((v) => !v)}>
            {showHow ? "скрыть ▴" : "показать, как это работает ▾"}
          </button>

          {showHow ? (
            <div className="how-body">
              <AdditionModel a={table} b={currentB} />
              <ArrayModel a={table} b={currentB} />
              <SkipCount step={table} times={currentB} />
              <CommuteModel a={table} b={currentB} />
              <p className="subtitle" style={{ color: "var(--ink-soft)" }}>
                {table} × {currentB} = {currentB} × {table} — ответ тот же. Выучил один — знаешь два!
              </p>
            </div>
          ) : null}

          <button className="btn blue" onClick={explain} disabled={loadingTip || asking}>
            {loadingTip ? "Думаю…" : "💡 Объясни, как запомнить"}
          </button>

          <div className="ask-row">
            <input
              className="ask-input"
              type="text"
              inputMode="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") ask();
              }}
              placeholder="Спроси совёнка… (можно надиктовать 🎤 на клавиатуре)"
              maxLength={300}
              aria-label="Задай вопрос помощнику"
            />
            <button
              className="btn teal ask-send"
              onClick={ask}
              disabled={asking || loadingTip || question.trim() === ""}
            >
              {asking ? "…" : "Спросить"}
            </button>
          </div>

          {tip ? (
            <div className="helper">
              <span style={{ fontSize: "var(--fs-lg)" }}>🦉</span>
              <span className="txt">{tip}</span>
            </div>
          ) : null}
        </div>

        <div className="topbar" style={{ width: "100%", maxWidth: 560, margin: 0 }}>
          <button className="btn ghost" onClick={back} disabled={pos === 0}>
            ← Назад
          </button>
          {onLast ? (
            <div className="pill" style={{ color: "var(--on-accent)" }}>
              Готово!
            </div>
          ) : (
            <button className="btn yellow" onClick={next}>
              Дальше →
            </button>
          )}
        </div>

        {onLast ? (
          <div className="center-col">
            <Mascot mood="cheer" say="Молодец! Ты прошёл всю таблицу. Теперь попробуй викторину." />
            <button className="btn teal" onClick={() => go("quiz")}>
              ❓ В викторину!
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
