import { useState } from "react";
import { Keypad } from "../components/Keypad";
import { TopBar } from "../components/TopBar";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

const THEMES = ["космос", "динозавры", "конфеты", "котики", "пираты"];

export function Settings() {
  const settings = useGameStore((s) => s.settings);
  const setSettings = useGameStore((s) => s.setSettings);
  const go = useNav((s) => s.go);

  const [pinDraft, setPinDraft] = useState<string | null>(null);

  const savePin = () => {
    if (pinDraft && pinDraft.length === 4) {
      setSettings({ parentPin: pinDraft });
      setPinDraft(null);
    }
  };

  return (
    <div className="screen-pad">
      <TopBar onBack={() => go("home")} />
      <h1 className="title">Настройки</h1>

      <div className="card">
        <div className="row">
          <span className="label">🔊 Звук</span>
          <button
            className={`switch ${settings.soundOn ? "on" : ""}`}
            onClick={() => setSettings({ soundOn: !settings.soundOn })}
            aria-label="Звук"
          >
            <span className="knob" />
          </button>
        </div>

        <div className="row">
          <span className="label">🔢 Множители до</span>
          <div className="seg">
            {[10, 12].map((m) => (
              <button key={m} className={settings.maxFactor === m ? "on" : ""} onClick={() => setSettings({ maxFactor: m })}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="row">
          <span className="label">🤖 ИИ-помощник</span>
          <button
            className={`switch ${settings.aiEnabled ? "on" : ""}`}
            onClick={() => setSettings({ aiEnabled: !settings.aiEnabled })}
            aria-label="ИИ-помощник"
          >
            <span className="knob" />
          </button>
        </div>

        <div className="row" style={{ flexWrap: "wrap" }}>
          <span className="label">🎨 Тема задачек</span>
          <div className="seg" style={{ flexWrap: "wrap" }}>
            {THEMES.map((t) => (
              <button key={t} className={settings.aiTheme === t ? "on" : ""} onClick={() => setSettings({ aiTheme: t })}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-label" style={{ color: "var(--ink)" }}>Родительский PIN</h2>
        {pinDraft === null ? (
          <div className="row">
            <span className="label">{settings.parentPin ? "PIN установлен" : "PIN не задан"}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={() => setPinDraft("")}>
                {settings.parentPin ? "Изменить" : "Задать"}
              </button>
              {settings.parentPin ? (
                <button className="btn ghost" onClick={() => setSettings({ parentPin: null })}>
                  Убрать
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="center-col">
            <p className="subtitle" style={{ color: "var(--ink-soft)" }}>Введите 4 цифры</p>
            <div className="pin-dots">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={`d ${i < pinDraft.length ? "on" : ""}`} style={{ background: i < pinDraft.length ? "var(--c-purple)" : undefined }} />
              ))}
            </div>
            <Keypad
              onDigit={(d) => setPinDraft((p) => ((p ?? "").length < 4 ? (p ?? "") + d : p))}
              onDelete={() => setPinDraft((p) => (p ?? "").slice(0, -1))}
              onEnter={savePin}
            />
            <button className="btn ghost" onClick={() => setPinDraft(null)}>Отмена</button>
          </div>
        )}
      </div>

      <p className="subtitle" style={{ textAlign: "center" }}>Умножариум · v0.1.0</p>
    </div>
  );
}
