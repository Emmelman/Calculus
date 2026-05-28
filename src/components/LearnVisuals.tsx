interface FactProps {
  a: number;
  b: number;
}

/** a rows × b columns of dots — shows multiplication as equal groups. */
export function DotsModel({ a, b }: FactProps) {
  const total = a * b;
  return (
    <div
      className="dots-grid"
      style={{ gridTemplateColumns: `repeat(${b}, auto)` }}
      aria-label={`${a} рядов по ${b}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span className="dot" key={i} style={{ animationDelay: `${i * 0.012}s` }} />
      ))}
    </div>
  );
}

/** Skip-counting chips: b, 2b, 3b … a·b. */
export function NumberLine({ a, b }: FactProps) {
  return (
    <div className="numberline">
      {Array.from({ length: a }).map((_, i) => (
        <span className="step hit" key={i}>
          {(i + 1) * b}
        </span>
      ))}
    </div>
  );
}
