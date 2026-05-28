interface Props {
  a: number;
  b: number;
  /** Text to show after "=": a typed answer, "?", or the solved product. */
  answer?: string | number;
}

/** Renders "a × b = answer" with playful coloring. */
export function FactExpr({ a, b, answer = "?" }: Props) {
  const slot = answer === "?" || answer === "";
  return (
    <div className="qexpr">
      {a} <span className="x">×</span> {b} <span className="eq">=</span>{" "}
      <span className={slot ? "qslot" : undefined}>{answer === "" ? "?" : answer}</span>
    </div>
  );
}
