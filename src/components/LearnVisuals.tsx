import { product } from "../domain/facts";
import { tableTrick } from "../domain/tricks";

interface FactProps {
  a: number;
  b: number;
}

/** Stage 1 — repeated addition collapsing into a multiplication. */
export function AdditionModel({ a, b }: FactProps) {
  const terms = Array.from({ length: b });
  return (
    <div className="add-model">
      <div className="add-row">
        {terms.map((_, i) => (
          <span className="add-piece" key={i}>
            <span className="add-term" style={{ animationDelay: `${i * 0.06}s` }}>
              {a}
            </span>
            {i < b - 1 ? <span className="add-op">+</span> : null}
          </span>
        ))}
        <span className="add-op">=</span>
        <span className="add-sum">{product(a, b)}</span>
      </div>
      <div className="add-collapse">
        это&nbsp;<b>{a} × {b}</b>
      </div>
    </div>
  );
}

/** Stage 2 — equal groups as an a×b array of dots (rows × columns = area). */
export function ArrayModel({ a, b }: FactProps) {
  const total = a * b;
  return (
    <div className="array-model">
      <div className="dots-grid framed" style={{ gridTemplateColumns: `repeat(${b}, auto)` }} aria-label={`${a} рядов по ${b}`}>
        {Array.from({ length: total }).map((_, i) => (
          <span className="dot" key={i} style={{ animationDelay: `${i * 0.012}s` }} />
        ))}
      </div>
    </div>
  );
}

/** Stage 3 — skip-counting ladder: step, 2·step, …, times·step. */
export function SkipCount({ step, times }: { step: number; times: number }) {
  return (
    <div className="numberline">
      {Array.from({ length: times }).map((_, i) => (
        <span className="step hit pop" key={i} style={{ animationDelay: `${i * 0.18}s` }}>
          {(i + 1) * step}
        </span>
      ))}
    </div>
  );
}

/** A compact a×b dot grid used inside the commutative comparison. */
function MiniGrid({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="dots-grid mini" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }} aria-hidden="true">
      {Array.from({ length: rows * cols }).map((_, i) => (
        <span className="dot" key={i} />
      ))}
    </div>
  );
}

/** Stage 4 — commutative law: a×b and b×a give the same product. */
export function CommuteModel({ a, b }: FactProps) {
  return (
    <div className="commute-model">
      <div className="commute-side">
        <MiniGrid rows={a} cols={b} />
        <span className="commute-lab">{a} × {b}</span>
      </div>
      <span className="commute-eq">=</span>
      <div className="commute-side">
        <MiniGrid rows={b} cols={a} />
        <span className="commute-lab">{b} × {a}</span>
      </div>
    </div>
  );
}

/** Stage 5 — table-specific memory trick. */
export function TrickCard({ table }: { table: number }) {
  const trick = tableTrick(table);
  return (
    <div className="trick-card">
      <div className="trick-title">🪄 {trick.title}</div>
      {trick.lines.map((line, i) => (
        <p className="trick-line" key={i}>
          {line}
        </p>
      ))}
    </div>
  );
}
