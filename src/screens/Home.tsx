import { Mascot } from "../components/Mascot";
import { ProgressRing } from "../components/ProgressRing";
import { TopBar } from "../components/TopBar";
import { playTap } from "../lib/sound";
import { tableMastery } from "../store/selectors";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export function Home() {
  const settings = useGameStore((s) => s.settings);
  const stats = useGameStore((s) => s.stats);
  const toggleTable = useGameStore((s) => s.toggleTable);
  const go = useNav((s) => s.go);

  const start = (screen: Parameters<typeof go>[0]) => () => {
    playTap();
    go(screen);
  };

  return (
    <div className="screen-pad">
      <TopBar />

      <div className="home-hero">
        <Mascot mood="idle" />
        <div>
          <h1 className="title">Умножариум</h1>
          <p className="subtitle">Привет! Выбери таблицы и поехали 🚀</p>
        </div>
      </div>

      <section>
        <h2 className="section-label">📚 Таблицы умножения</h2>
        <div className="tables-grid">
          {TABLES.map((t) => {
            const on = settings.enabledTables.includes(t);
            const frac = tableMastery(stats, t, settings.maxFactor);
            return (
              <button
                key={t}
                className={`table-chip ${on ? "on" : ""}`}
                onClick={() => {
                  playTap();
                  toggleTable(t);
                }}
                aria-pressed={on}
              >
                <span className="ring">
                  <ProgressRing value={frac} color={on ? "#ffffff" : "#1dd1a1"} />
                </span>
                <span className="lab">×{t}</span>
                <span className="pct">{Math.round(frac * 100)}%</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="section-label">🎮 Поиграем!</h2>
        <div className="mode-grid">
          <button className="mode-btn learn" onClick={start("learn")}>
            <span className="emoji">🧠</span>
            <span className="name">Учить</span>
            <span className="hint">Понять, как считать</span>
          </button>
          <button className="mode-btn quiz" onClick={start("quiz")}>
            <span className="emoji">❓</span>
            <span className="name">Викторина</span>
            <span className="hint">Выбери ответ</span>
          </button>
          <button className="mode-btn speed" onClick={start("speed")}>
            <span className="emoji">⚡</span>
            <span className="name">Гонка</span>
            <span className="hint">Успей за минуту</span>
          </button>
          <button className="mode-btn memory" onClick={start("memory")}>
            <span className="emoji">🃏</span>
            <span className="name">Найди пару</span>
            <span className="hint">Пример и ответ</span>
          </button>
        </div>
      </section>

      <div className="topbar" style={{ marginTop: "auto", marginBottom: 0 }}>
        <button className="btn ghost" onClick={start("parent")}>
          👨‍👩‍👧 Родителям
        </button>
        <div className="spacer" />
        <button className="icon-btn" onClick={start("settings")} aria-label="Настройки">
          ⚙️
        </button>
      </div>
    </div>
  );
}
