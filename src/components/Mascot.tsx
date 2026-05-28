import { CSSProperties, useId } from "react";
import { mascotById, MascotSkin } from "../store/mascots";
import { useGameStore } from "../store/useGameStore";

export type Mood = "idle" | "cheer" | "sad";

interface SvgProps {
  skin: MascotSkin;
  className?: string;
  style?: CSSProperties;
}

/** Parametrised mascot drawing — colours come from the chosen skin. */
export function MascotSvg({ skin, className, style }: SvgProps) {
  const uid = useId().replace(/[:]/g, "");
  const bodyGrad = `body-${uid}`;
  return (
    <svg viewBox="0 0 200 210" className={className} style={style} role="img" aria-label={skin.name}>
      <defs>
        <linearGradient id={bodyGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skin.bodyTop} />
          <stop offset="1" stopColor={skin.bodyBottom} />
        </linearGradient>
      </defs>
      {skin.accessory ? (
        <text x="100" y="34" fontSize="40" textAnchor="middle">{skin.accessory}</text>
      ) : null}
      <path d="M55 50 L70 88 L40 82 Z" fill={skin.ear} />
      <path d="M145 50 L130 88 L160 82 Z" fill={skin.ear} />
      <ellipse cx="100" cy="122" rx="68" ry="72" fill={`url(#${bodyGrad})`} />
      <ellipse cx="100" cy="134" rx="44" ry="50" fill={skin.belly} />
      <circle cx="58" cy="130" r="12" fill={skin.cheek} opacity="0.85" />
      <circle cx="142" cy="130" r="12" fill={skin.cheek} opacity="0.85" />
      <circle cx="78" cy="106" r="20" fill="#fff" />
      <circle cx="122" cy="106" r="20" fill="#fff" />
      <circle cx="82" cy="109" r="9" fill="#2b2350" />
      <circle cx="118" cy="109" r="9" fill="#2b2350" />
      <circle cx="85" cy="105" r="3" fill="#fff" />
      <circle cx="121" cy="105" r="3" fill="#fff" />
      <path d="M93 122 L107 122 L100 132 Z" fill="#feca57" />
      <path d="M84 142 Q100 158 116 142" fill="none" stroke="#2b2350" strokeWidth="4" strokeLinecap="round" />
      <g transform="translate(132,160)">
        <circle r="18" fill={skin.badge} />
        <path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

interface Props {
  mood?: Mood;
  say?: string;
  /** Override the equipped skin (used for shop previews / the duel bot). */
  skinId?: string;
}

/** The friendly mascot. Uses the player's equipped skin unless overridden. */
export function Mascot({ mood = "idle", say, skinId }: Props) {
  const selected = useGameStore((s) => s.selectedMascot);
  const skin = mascotById(skinId ?? selected);
  const cls = mood === "cheer" ? "mascot cheer" : "mascot bounce";
  return (
    <div className="center-col">
      <MascotSvg skin={skin} className={cls} />
      {say ? <p className="subtitle" style={{ maxWidth: 320, textAlign: "center" }}>{say}</p> : null}
    </div>
  );
}
