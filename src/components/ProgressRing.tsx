interface Props {
  value: number; // 0..1
  size?: number;
  stroke?: number;
  color?: string;
}

/** Circular progress indicator used on table chips. */
export function ProgressRing({ value, size = 70, stroke = 6, color = "#1dd1a1" }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <svg className="ring" viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - clamped)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
