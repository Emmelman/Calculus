import { create } from "zustand";
import { ScreenId } from "./types";

/** Summary shown on the result screen after a game session. */
export interface SessionResult {
  mode: "quiz" | "speed" | "memory";
  correct: number;
  total: number;
  coins: number;
  bestStreak: number;
}

export interface NavParams {
  /** Table selected for the Learn screen. */
  table?: number;
  result?: SessionResult;
}

interface NavState {
  screen: ScreenId;
  params: NavParams;
  go: (screen: ScreenId, params?: NavParams) => void;
}

/** Lightweight, non-persisted navigation. A full router is overkill for a
 * single-window kids PWA, and we never want screen state to survive reloads. */
export const useNav = create<NavState>((set) => ({
  screen: "home",
  params: {},
  go: (screen, params = {}) => set({ screen, params }),
}));
