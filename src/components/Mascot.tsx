import { CSSProperties, ReactElement, useId } from "react";
import { mascotById, MascotSkin } from "../store/mascots";
import { useGameStore } from "../store/useGameStore";

export type Mood = "idle" | "cheer" | "sad";

const INK = "#2b2350";

/** Big cute eyes; expression follows the mood. */
function Eyes({ mood, cx, cy, gap = 24, r = 15 }: { mood: Mood; cx: number; cy: number; gap?: number; r?: number }) {
  const lx = cx - gap;
  const rx = cx + gap;
  if (mood === "cheer") {
    const w = r * 0.75;
    return (
      <g stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round">
        <path d={`M${lx - w} ${cy + 2} Q${lx} ${cy - w} ${lx + w} ${cy + 2}`} />
        <path d={`M${rx - w} ${cy + 2} Q${rx} ${cy - w} ${rx + w} ${cy + 2}`} />
      </g>
    );
  }
  const pr = r * 0.52;
  const py = mood === "sad" ? cy + 3 : cy;
  return (
    <g>
      <circle cx={lx} cy={cy} r={r} fill="#fff" />
      <circle cx={rx} cy={cy} r={r} fill="#fff" />
      <circle cx={lx} cy={py} r={pr} fill={INK} />
      <circle cx={rx} cy={py} r={pr} fill={INK} />
      <circle cx={lx + 2.5} cy={py - 2.5} r={pr * 0.34} fill="#fff" />
      <circle cx={rx + 2.5} cy={py - 2.5} r={pr * 0.34} fill="#fff" />
      {mood === "sad" ? (
        <g stroke={INK} strokeWidth={4} strokeLinecap="round">
          <path d={`M${lx - r} ${cy - r - 2} L${lx + r * 0.6} ${cy - r * 0.4}`} />
          <path d={`M${rx + r} ${cy - r - 2} L${rx - r * 0.6} ${cy - r * 0.4}`} />
        </g>
      ) : null}
    </g>
  );
}

function Mouth({ mood, cx, cy, w = 16 }: { mood: Mood; cx: number; cy: number; w?: number }) {
  if (mood === "cheer") {
    return (
      <g>
        <path d={`M${cx - w} ${cy} Q${cx} ${cy + w * 1.7} ${cx + w} ${cy} Z`} fill="#b83b5e" />
        <path d={`M${cx - w * 0.55} ${cy + w} Q${cx} ${cy + w * 1.5} ${cx + w * 0.55} ${cy + w} Z`} fill="#ff8fb3" />
      </g>
    );
  }
  if (mood === "sad") {
    return (
      <path
        d={`M${cx - w} ${cy + 5} Q${cx} ${cy - 8} ${cx + w} ${cy + 5}`}
        fill="none"
        stroke={INK}
        strokeWidth={4}
        strokeLinecap="round"
      />
    );
  }
  return (
    <path
      d={`M${cx - w} ${cy} Q${cx} ${cy + 13} ${cx + w} ${cy}`}
      fill="none"
      stroke={INK}
      strokeWidth={4}
      strokeLinecap="round"
    />
  );
}

function Cheeks({ skin, cx = 100, gap = 34, cy = 132 }: { skin: MascotSkin; cx?: number; gap?: number; cy?: number }) {
  return (
    <>
      <circle cx={cx - gap} cy={cy} r={11} fill={skin.cheek} opacity={0.8} />
      <circle cx={cx + gap} cy={cy} r={11} fill={skin.cheek} opacity={0.8} />
    </>
  );
}

/** The little ×-badge every character wears (keeps the "multiplication" theme). */
function Badge({ skin, x = 150, y = 168 }: { skin: MascotSkin; x?: number; y?: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={15} fill={skin.badge} />
      <path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="#fff" strokeWidth={4.5} strokeLinecap="round" />
    </g>
  );
}

interface CharProps {
  skin: MascotSkin;
  mood: Mood;
  body: string;
}

const umnik = ({ skin, mood, body }: CharProps) => (
  <g>
    <circle cx={62} cy={64} r={17} fill={skin.ear} />
    <circle cx={138} cy={64} r={17} fill={skin.ear} />
    <ellipse cx={100} cy={120} rx={68} ry={72} fill={body} />
    <ellipse cx={100} cy={136} rx={43} ry={48} fill={skin.belly} />
    <Cheeks skin={skin} />
    <g stroke={skin.accent ?? skin.bodyBottom} strokeWidth={4} fill="none">
      <circle cx={76} cy={106} r={20} />
      <circle cx={124} cy={106} r={20} />
      <path d="M96 106 L104 106" />
    </g>
    <Eyes mood={mood} cx={100} cy={106} gap={24} r={15} />
    <Mouth mood={mood} cx={100} cy={140} />
    <Badge skin={skin} />
  </g>
);

const fox = ({ skin, mood, body }: CharProps) => (
  <g>
    {/* bushy tail */}
    <path d="M150 156 Q198 150 184 102 Q178 138 146 142 Z" fill={body} />
    <path d="M184 102 Q178 132 158 138 Q176 124 182 106 Z" fill={skin.accent ?? "#fff3e0"} />
    {/* pointy ears */}
    <path d="M50 80 L60 26 L94 62 Z" fill={skin.ear} />
    <path d="M150 80 L140 26 L106 62 Z" fill={skin.ear} />
    <path d="M62 70 L67 42 L84 60 Z" fill={INK} opacity={0.16} />
    <path d="M138 70 L133 42 L116 60 Z" fill={INK} opacity={0.16} />
    {/* head */}
    <ellipse cx={100} cy={118} rx={64} ry={66} fill={body} />
    {/* white muzzle */}
    <path d="M100 112 Q150 118 130 158 Q100 180 70 158 Q50 118 100 112 Z" fill={skin.belly} />
    <Cheeks skin={skin} gap={36} cy={140} />
    <Eyes mood={mood} cx={100} cy={104} gap={22} r={13} />
    <ellipse cx={100} cy={130} rx={8} ry={6} fill={INK} />
    <Mouth mood={mood} cx={100} cy={148} w={14} />
    <Badge skin={skin} x={150} y={166} />
  </g>
);

const cat = ({ skin, mood, body }: CharProps) => (
  <g>
    {/* triangular ears with pink inner */}
    <path d="M52 72 L58 30 L96 58 Z" fill={skin.ear} />
    <path d="M148 72 L142 30 L104 58 Z" fill={skin.ear} />
    <path d="M64 64 L68 42 L86 57 Z" fill={skin.accent ?? "#ffd1ec"} />
    <path d="M136 64 L132 42 L114 57 Z" fill={skin.accent ?? "#ffd1ec"} />
    {/* head/body */}
    <ellipse cx={100} cy={120} rx={66} ry={68} fill={body} />
    <ellipse cx={100} cy={138} rx={42} ry={46} fill={skin.belly} />
    <Cheeks skin={skin} cy={134} />
    <Eyes mood={mood} cx={100} cy={106} gap={24} r={14} />
    {/* whiskers */}
    <g stroke={INK} strokeWidth={2.5} strokeLinecap="round" opacity={0.7}>
      <path d="M74 132 L40 126" />
      <path d="M74 138 L40 140" />
      <path d="M126 132 L160 126" />
      <path d="M126 138 L160 140" />
    </g>
    <path d="M94 128 L106 128 L100 136 Z" fill={skin.cheek} />
    <Mouth mood={mood} cx={100} cy={144} w={13} />
    <Badge skin={skin} />
  </g>
);

const dragon = ({ skin, mood, body }: CharProps) => (
  <g>
    {/* back spikes */}
    <path d="M64 78 L74 54 L84 78 L94 50 L106 78 L116 50 L126 78 L136 54 L146 78 Z" fill={skin.accent ?? "#0a8f54"} />
    {/* wing */}
    <path d="M44 116 Q8 104 16 152 Q34 138 52 150 Z" fill={skin.accent ?? "#0a8f54"} />
    {/* horns */}
    <path d="M70 60 L62 32 L82 52 Z" fill="#fff6e0" />
    <path d="M130 60 L138 32 L118 52 Z" fill="#fff6e0" />
    {/* head/body */}
    <ellipse cx={100} cy={122} rx={66} ry={70} fill={body} />
    <ellipse cx={100} cy={138} rx={42} ry={48} fill={skin.belly} />
    {/* belly ridges */}
    <g stroke={skin.accent ?? "#0a8f54"} strokeWidth={3} opacity={0.4} fill="none">
      <path d="M82 150 L118 150" />
      <path d="M84 164 L116 164" />
    </g>
    <Cheeks skin={skin} cy={130} />
    <Eyes mood={mood} cx={100} cy={104} gap={24} r={14} />
    {/* snout nostrils */}
    <circle cx={92} cy={130} r={3} fill={INK} />
    <circle cx={108} cy={130} r={3} fill={INK} />
    <Mouth mood={mood} cx={100} cy={144} />
    <Badge skin={skin} />
  </g>
);

const robot = ({ skin, mood, body }: CharProps) => (
  <g>
    {/* antenna */}
    <line x1={100} y1={38} x2={100} y2={60} stroke={INK} strokeWidth={4} />
    <circle cx={100} cy={34} r={8} fill={skin.badge} />
    {/* bolt ears */}
    <rect x={22} y={106} width={16} height={32} rx={6} fill={skin.ear} />
    <rect x={162} y={106} width={16} height={32} rx={6} fill={skin.ear} />
    {/* head/body */}
    <rect x={40} y={58} width={120} height={146} rx={30} fill={body} />
    {/* screen */}
    <rect x={56} y={80} width={88} height={70} rx={16} fill={skin.belly} />
    <Eyes mood={mood} cx={100} cy={106} gap={22} r={13} />
    <Mouth mood={mood} cx={100} cy={138} w={14} />
    {/* chest panel + buttons */}
    <rect x={74} y={166} width={52} height={24} rx={8} fill={skin.belly} />
    <circle cx={86} cy={178} r={4} fill={skin.accent ?? skin.badge} />
    <circle cx={100} cy={178} r={4} fill={skin.cheek} />
    <circle cx={114} cy={178} r={4} fill={skin.badge} />
  </g>
);

const unicorn = ({ skin, mood, body }: CharProps) => (
  <g>
    {/* mane */}
    <path d="M132 60 Q172 72 158 112 Q150 92 132 92 Z" fill={skin.accent ?? "#ff8fce"} />
    <path d="M138 104 Q176 120 156 156 Q150 132 134 130 Z" fill={skin.accent ?? "#ff8fce"} />
    {/* ear */}
    <path d="M60 76 L64 44 L86 66 Z" fill={skin.ear} />
    {/* horn */}
    <path d="M100 28 L92 66 L108 66 Z" fill="#ffe08a" stroke="#e0a700" strokeWidth={2} />
    <g stroke="#e0a700" strokeWidth={2} strokeLinecap="round">
      <path d="M95 52 L105 50" />
      <path d="M96 60 L104 58" />
    </g>
    {/* head/body */}
    <ellipse cx={100} cy={122} rx={64} ry={68} fill={body} />
    <ellipse cx={100} cy={138} rx={42} ry={46} fill={skin.belly} />
    <Cheeks skin={skin} cy={134} />
    <Eyes mood={mood} cx={96} cy={106} gap={22} r={14} />
    {/* lashes */}
    {mood !== "cheer" ? (
      <g stroke={INK} strokeWidth={2.5} strokeLinecap="round">
        <path d="M82 92 L76 86" />
        <path d="M120 92 L126 86" />
      </g>
    ) : null}
    <Mouth mood={mood} cx={98} cy={144} w={13} />
    <Badge skin={skin} />
  </g>
);

const king = ({ skin, mood, body }: CharProps) => (
  <g>
    {/* crown */}
    <path
      d="M62 58 L70 30 L86 50 L100 24 L114 50 L130 30 L138 58 Z"
      fill="#ffd54a"
      stroke="#e0a700"
      strokeWidth={2}
    />
    <circle cx={100} cy={38} r={4} fill="#ff6b6b" />
    <circle cx={74} cy={42} r={3} fill="#5ad1ff" />
    <circle cx={126} cy={42} r={3} fill="#5ad1ff" />
    <rect x={62} y={56} width={76} height={8} rx={3} fill="#f0b429" />
    {/* head/body */}
    <ellipse cx={100} cy={122} rx={66} ry={70} fill={body} />
    {/* cape collar */}
    <path d="M52 154 Q100 176 148 154 L160 198 Q100 214 40 198 Z" fill={skin.accent ?? "#e0556b"} />
    <ellipse cx={100} cy={138} rx={42} ry={46} fill={skin.belly} />
    <Cheeks skin={skin} cy={130} />
    <Eyes mood={mood} cx={100} cy={106} gap={24} r={15} />
    <Mouth mood={mood} cx={100} cy={142} />
    <Badge skin={skin} />
  </g>
);

const CHARACTERS: Record<string, (p: CharProps) => ReactElement> = {
  umnik,
  fox,
  cat,
  dragon,
  robot,
  unicorn,
  king,
};

interface SvgProps {
  skin: MascotSkin;
  mood?: Mood;
  className?: string;
  style?: CSSProperties;
}

/** Hand-drawn mascot. The character shape is chosen by skin.id; colours come
 * from the skin; the facial expression follows `mood`. */
export function MascotSvg({ skin, mood = "idle", className, style }: SvgProps) {
  const uid = useId().replace(/[:]/g, "");
  const bodyGrad = `body-${uid}`;
  const draw = CHARACTERS[skin.id] ?? umnik;
  return (
    <svg viewBox="0 0 200 214" className={className} style={style} role="img" aria-label={skin.name}>
      <defs>
        <linearGradient id={bodyGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skin.bodyTop} />
          <stop offset="1" stopColor={skin.bodyBottom} />
        </linearGradient>
      </defs>
      {draw({ skin, mood, body: `url(#${bodyGrad})` })}
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
  const cls = mood === "cheer" ? "mascot cheer" : mood === "sad" ? "mascot sad" : "mascot bounce";
  return (
    <div className="center-col">
      <MascotSvg skin={skin} mood={mood} className={cls} />
      {say ? <p className="subtitle" style={{ maxWidth: 320, textAlign: "center" }}>{say}</p> : null}
    </div>
  );
}
