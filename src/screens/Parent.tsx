import { useState } from "react";
import { Keypad } from "../components/Keypad";
import { TopBar } from "../components/TopBar";
import { factKey } from "../domain/facts";
import { initStat, masteryFraction } from "../domain/mastery";
import { levelForCoins } from "../store/types";
import { hardestFacts } from "../store/selectors";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

function cellColor(frac: number): string {
  if (frac <= 0.001) return "var(--surface-soft)";
  return `hsl(160 70% ${86 - 46 * frac}%)`;
}

export function Parent() {
  const store = useGameStore();
  const go = useNav((s) => s.go);
  const { settings, stats, totalCorrect, totalWrong, bestStreak, coins, daily } = store;

  const [pinInput, setPinInput] = useState("");
  const [unlocked, setUnlocked] = useState(settings.parentPin === null);
  const [pinError, setPinError] = useState(false);

  if (!unlocked) {
    const submit = () => {
      if (pinInput === settings.parentPin) {
        setUnlocked(true);
      } else {
        setPinError(true);
        setPinInput("");
        setTimeout(() => setPinError(false), 600);
      }
    };
    return (
      <div className="screen-pad">
        <TopBar onBack={() => go("home")} />
        <div className="question">
          <h2 className="title">Введите PIN</h2>
          <div className={`pin-dots ${pinError ? "shake" : ""}`}>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`d ${i < pinInput.length ? "on" : ""}`} />
            ))}
          </div>
          <Keypad
            onDigit={(d) => setPinInput((p) => (p.length < 4 ? p + d : p))}
            onDelete={() => setPinInput((p) => p.slice(0, -1))}
            onEnter={submit}
          />
        </div>
      </div>
    );
  }

  const total = totalCorrect + totalWrong;
  const accuracy = total > 0 ? Math.round((totalCorrect / total) * 100) : 0;
  const daysActive = Object.keys(daily).length;
  const hard = hardestFacts(stats, settings.enabledTables.length ? settings.enabledTables : TABLES, settings.maxFactor);
  const factors = Array.from({ length: settings.maxFactor }, (_, i) => i + 1);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, day: d.toLocaleDateString("ru-RU", { weekday: "short" }), stat: daily[key] };
  });

  return (
    <div className="screen-pad">
      <TopBar onBack={() => go("home")} />
      <h1 className="title">Прогресс ребёнка</h1>

      <div className="card">
        <div className="result-stats">
          <div className="stat"><div className="v">{totalCorrect}</div><div className="k">верных ответов</div></div>
          <div className="stat"><div className="v">{accuracy}%</div><div className="k">точность</div></div>
          <div className="stat"><div className="v">{bestStreak}</div><div className="k">лучшая серия</div></div>
          <div className="stat"><div className="v">{levelForCoins(coins)}</div><div className="k">уровень</div></div>
          <div className="stat"><div className="v">{daysActive}</div><div className="k">дней занятий</div></div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-label" style={{ color: "var(--ink)" }}>Карта освоения</h2>
        <div style={{ overflowX: "auto" }}>
          <div className="heatrow" style={{ gridTemplateColumns: `2.4em repeat(${settings.maxFactor}, 1fr)` }}>
            <span className="h" />
            {factors.map((f) => <span key={f} className="h">{f}</span>)}
          </div>
          {TABLES.map((t) => (
            <div
              key={t}
              className="heatrow"
              style={{ gridTemplateColumns: `2.4em repeat(${settings.maxFactor}, 1fr)`, marginTop: 4 }}
            >
              <span className="h">×{t}</span>
              {factors.map((f) => {
                const frac = masteryFraction(stats[factKey(t, f)] ?? initStat());
                return <span key={f} className="heatcell" style={{ background: cellColor(frac) }} title={`${t}×${f}`} />;
              })}
            </div>
          ))}
          <p className="subtitle" style={{ color: "var(--ink-soft)", marginTop: 8 }}>
            Чем зеленее клетка — тем увереннее ребёнок знает пример.
          </p>
        </div>
      </div>

      {hard.length > 0 ? (
        <div className="card">
          <h2 className="section-label" style={{ color: "var(--ink)" }}>Над чем поработать</h2>
          <div className="mode-grid">
            {hard.map((h) => (
              <div key={`${h.a}x${h.b}`} className="stat">
                <div className="v">{h.a}×{h.b}</div>
                <div className="k">ошибок: {h.wrong}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card">
        <h2 className="section-label" style={{ color: "var(--ink)" }}>Последние 7 дней</h2>
        <div className="heatrow" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
          {last7.map((d) => (
            <div key={d.key} style={{ textAlign: "center" }}>
              <div className="heatcell" style={{ background: cellColor(d.stat ? Math.min(1, d.stat.correct / 20) : 0) }} />
              <div className="k" style={{ fontSize: "var(--fs-xs)" }}>{d.day}</div>
              <div className="k" style={{ fontSize: "var(--fs-xs)" }}>{d.stat?.correct ?? 0}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="btn block coral"
        onClick={() => {
          if (confirm("Сбросить весь прогресс ребёнка? Это нельзя отменить.")) {
            store.resetProgress();
            go("home");
          }
        }}
      >
        Сбросить прогресс
      </button>
    </div>
  );
}
