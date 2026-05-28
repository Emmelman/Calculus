import { useEffect, useState } from "react";
import { Mascot, Mood } from "../components/Mascot";
import { TopBar } from "../components/TopBar";
import { buildFacts, tableFacts } from "../domain/facts";
import { randInt, systemRng } from "../domain/rng";
import { getStoryProblem, StoryProblem } from "../helper/llmClient";
import { celebrate } from "../lib/fx";
import { playWin } from "../lib/sound";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];

const MODE_LABEL: Record<string, string> = {
  quiz: "Викторина",
  speed: "Гонка",
  memory: "Найди пару",
};

export function Result() {
  const result = useNav((s) => s.params.result);
  const go = useNav((s) => s.go);
  const settings = useGameStore((s) => s.settings);

  const [story, setStory] = useState<StoryProblem | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [loadingStory, setLoadingStory] = useState(false);

  const ratio = result && result.total > 0 ? result.correct / result.total : 0;
  const great = ratio >= 0.8;

  useEffect(() => {
    if (great) {
      playWin();
      celebrate("big");
    }
  }, [great]);

  if (!result) {
    return (
      <div className="screen-pad">
        <TopBar onBack={() => go("home")} />
        <button className="btn block" onClick={() => go("home")}>
          На главную
        </button>
      </div>
    );
  }

  const mood: Mood = great ? "cheer" : ratio >= 0.4 ? "idle" : "sad";
  const phrase = great ? "Супер! Ты молодец! 🎉" : ratio >= 0.4 ? "Хорошо! Идём дальше 💪" : "Не сдавайся, попробуем ещё!";

  const fetchStory = async () => {
    setLoadingStory(true);
    setRevealed(false);
    const tables = settings.enabledTables.length ? settings.enabledTables : TABLES;
    const pool = tables.flatMap((t) => tableFacts(t, settings.maxFactor));
    const f = (pool.length ? pool : buildFacts())[randInt(systemRng, 0, Math.max(0, pool.length - 1))];
    try {
      setStory(await getStoryProblem(f.a, f.b, settings.aiTheme));
    } finally {
      setLoadingStory(false);
    }
  };

  return (
    <div className="screen-pad">
      <TopBar onBack={() => go("home")} />
      <div className="question">
        <Mascot mood={mood} say={phrase} />
        <div className="card" style={{ width: "100%", maxWidth: 560 }}>
          <h2 className="section-label" style={{ color: "var(--ink)" }}>
            {MODE_LABEL[result.mode]} — итог
          </h2>
          <div className="result-stats">
            <div className="stat">
              <div className="v">{result.correct}/{result.total}</div>
              <div className="k">правильно</div>
            </div>
            <div className="stat">
              <div className="v">+{result.coins}</div>
              <div className="k">монет 🪙</div>
            </div>
            <div className="stat">
              <div className="v">{result.bestStreak}</div>
              <div className="k">серия 🔥</div>
            </div>
          </div>
        </div>

        <button className="btn yellow" onClick={fetchStory} disabled={loadingStory}>
          {loadingStory ? "Придумываю…" : "🎁 Задачка-история"}
        </button>
        {story ? (
          <div className="helper" style={{ maxWidth: 560 }}>
            <span style={{ fontSize: "var(--fs-lg)" }}>🦉</span>
            <span className="txt">
              {story.text}
              <br />
              {revealed ? (
                <strong>Ответ: {story.answer}</strong>
              ) : (
                <button className="btn teal" style={{ marginTop: 8 }} onClick={() => setRevealed(true)}>
                  Показать ответ
                </button>
              )}
            </span>
          </div>
        ) : null}

        <div className="topbar" style={{ width: "100%", maxWidth: 560, margin: 0 }}>
          <button className="btn block coral" onClick={() => go(result.mode)}>
            ↻ Ещё раз
          </button>
          <button className="btn block" onClick={() => go("home")}>
            🏠 Домой
          </button>
        </div>
      </div>
    </div>
  );
}
