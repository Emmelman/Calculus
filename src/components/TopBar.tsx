import { useGameStore } from "../store/useGameStore";
import { levelForCoins, levelProgress, walletCoins } from "../store/types";

interface Props {
  onBack?: () => void;
}

/** Persistent header: back, spendable coins, level progress, level badge. */
export function TopBar({ onBack }: Props) {
  const coins = useGameStore((s) => s.coins);
  const spent = useGameStore((s) => s.spent);
  const wallet = walletCoins({ coins, spent });
  const level = levelForCoins(coins);
  const progress = levelProgress(coins);

  return (
    <div className="topbar">
      {onBack ? (
        <button className="icon-btn" onClick={onBack} aria-label="Назад">
          ←
        </button>
      ) : null}
      <div className="pill">🪙 {wallet}</div>
      <div className="levelbar">
        <div className="track">
          <div className="fill" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <div className="pill">🏅 {level}</div>
    </div>
  );
}
