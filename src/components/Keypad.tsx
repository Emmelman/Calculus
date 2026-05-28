import { playTap } from "../lib/sound";

interface Props {
  onDigit: (d: number) => void;
  onDelete: () => void;
  onEnter: () => void;
  disabled?: boolean;
}

/** Big touch-friendly numeric keypad used in Quiz and Speed modes. */
export function Keypad({ onDigit, onDelete, onEnter, disabled }: Props) {
  const press = (fn: () => void) => () => {
    if (disabled) return;
    playTap();
    fn();
  };

  return (
    <div className="keypad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
        <button key={d} className="key" onClick={press(() => onDigit(d))} disabled={disabled}>
          {d}
        </button>
      ))}
      <button className="key del" onClick={press(onDelete)} disabled={disabled} aria-label="Удалить">
        ⌫
      </button>
      <button className="key" onClick={press(() => onDigit(0))} disabled={disabled}>
        0
      </button>
      <button className="key ok" onClick={press(onEnter)} disabled={disabled} aria-label="Готово">
        ✓
      </button>
    </div>
  );
}
