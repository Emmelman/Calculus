import { useEffect } from "react";
import { ToastHost } from "./components/Toast";
import { setSoundEnabled } from "./lib/sound";
import { Duel } from "./screens/Duel";
import { Home } from "./screens/Home";
import { Learn } from "./screens/Learn";
import { Memory } from "./screens/Memory";
import { Parent } from "./screens/Parent";
import { Quiz } from "./screens/Quiz";
import { Result } from "./screens/Result";
import { Settings } from "./screens/Settings";
import { Shop } from "./screens/Shop";
import { Speed } from "./screens/Speed";
import { useGameStore } from "./store/useGameStore";
import { useNav } from "./store/useNav";
import { ScreenId } from "./store/types";

const SCREENS: Record<ScreenId, () => JSX.Element> = {
  home: Home,
  learn: Learn,
  play: Home,
  quiz: Quiz,
  speed: Speed,
  memory: Memory,
  duel: Duel,
  result: Result,
  shop: Shop,
  parent: Parent,
  settings: Settings,
};

export default function App() {
  const screen = useNav((s) => s.screen);
  const soundOn = useGameStore((s) => s.settings.soundOn);

  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  const Screen = SCREENS[screen] ?? Home;

  return (
    <div className="app">
      <div className="shell">
        <Screen />
      </div>
      <ToastHost />
    </div>
  );
}
