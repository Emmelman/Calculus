import confetti from "canvas-confetti";
import { create } from "zustand";

/** Small celebration burst (used on streaks, level-ups, finished sessions). */
export function celebrate(intensity: "small" | "big" = "small"): void {
  const count = intensity === "big" ? 160 : 70;
  confetti({
    particleCount: count,
    spread: intensity === "big" ? 110 : 70,
    startVelocity: 45,
    origin: { y: 0.7 },
    colors: ["#6c5ce7", "#ff6b6b", "#feca57", "#1dd1a1", "#54a0ff", "#ff7eb9"],
    disableForReducedMotion: true,
  });
}

interface ToastState {
  message: string | null;
  /** Bumped on every toast so React re-mounts the animation. */
  seq: number;
  show: (message: string) => void;
  clear: () => void;
}

/** Transient reward toast ("+24 монеты!", "Новый уровень!", …). */
export const useToast = create<ToastState>((set) => ({
  message: null,
  seq: 0,
  show: (message) => set((s) => ({ message, seq: s.seq + 1 })),
  clear: () => set({ message: null }),
}));
