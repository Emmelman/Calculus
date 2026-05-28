export type Mood = "idle" | "cheer" | "sad";

interface Props {
  mood?: Mood;
  say?: string;
}

/** The friendly mascot "Умножарик". Mood drives its little animation. */
export function Mascot({ mood = "idle", say }: Props) {
  const cls = mood === "cheer" ? "mascot cheer" : "mascot bounce";
  return (
    <div className="center-col">
      <img src="/mascot.svg" className={cls} alt="Умножарик" draggable={false} />
      {say ? <p className="subtitle" style={{ maxWidth: 320, textAlign: "center" }}>{say}</p> : null}
    </div>
  );
}
