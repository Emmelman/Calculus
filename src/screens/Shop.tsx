import { MascotSvg } from "../components/Mascot";
import { TopBar } from "../components/TopBar";
import { celebrate, useToast } from "../lib/fx";
import { playTap, playWin } from "../lib/sound";
import { MASCOTS } from "../store/mascots";
import { walletCoins } from "../store/types";
import { useGameStore } from "../store/useGameStore";
import { useNav } from "../store/useNav";

export function Shop() {
  const coins = useGameStore((s) => s.coins);
  const spent = useGameStore((s) => s.spent);
  const owned = useGameStore((s) => s.ownedMascots);
  const selected = useGameStore((s) => s.selectedMascot);
  const buyMascot = useGameStore((s) => s.buyMascot);
  const selectMascot = useGameStore((s) => s.selectMascot);
  const go = useNav((s) => s.go);
  const toast = useToast((s) => s.show);

  const wallet = walletCoins({ coins, spent });

  const buy = (id: string) => {
    if (buyMascot(id)) {
      playWin();
      celebrate("big");
      toast("🎉 Новый друг твой!");
    } else {
      toast("Не хватает монет 🪙");
    }
  };

  return (
    <div className="screen-pad">
      <TopBar onBack={() => go("home")} />
      <div className="home-hero" style={{ justifyContent: "space-between", width: "100%" }}>
        <h1 className="title">🛍 Магазин друзей</h1>
        <div className="pill" style={{ fontSize: "var(--fs-md)" }}>🪙 {wallet}</div>
      </div>
      <p className="subtitle">Зарабатывай монеты в играх и открывай новых маскотов!</p>

      <div className="shop-grid">
        {MASCOTS.map((m) => {
          const isOwned = owned.includes(m.id);
          const isSelected = selected === m.id;
          const affordable = wallet >= m.cost;
          return (
            <div key={m.id} className={`shop-card ${isSelected ? "selected" : ""}`}>
              <MascotSvg skin={m} style={{ width: "70%", maxWidth: 110 }} />
              <div className="name">{m.name}</div>
              {isOwned ? (
                isSelected ? (
                  <div className="tag on">✅ Выбран</div>
                ) : (
                  <button
                    className="btn teal"
                    onClick={() => {
                      playTap();
                      selectMascot(m.id);
                    }}
                  >
                    Выбрать
                  </button>
                )
              ) : (
                <button
                  className={`btn ${affordable ? "yellow" : "ghost"}`}
                  onClick={() => buy(m.id)}
                  disabled={!affordable}
                >
                  {m.cost} 🪙
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
