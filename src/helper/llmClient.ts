/**
 * Client for the optional AI helper. Talks to our own proxy at /api/helper/*
 * (which holds the OpenRouter key — see server/). Every call has a short
 * timeout and a built-in offline fallback, so the app never breaks when the
 * helper is disabled, unreachable, or the network is down (fail-open).
 */
import { product } from "../domain/facts";

export interface StoryProblem {
  text: string;
  a: number;
  b: number;
  answer: number;
  /** True when produced by the local fallback rather than the LLM. */
  offline: boolean;
}

const TIMEOUT_MS = 8000;

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`helper ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

const THEME_SCENES: Record<string, { unit: string; place: string }> = {
  космос: { unit: "инопланетян", place: "на каждой из {a} планет" },
  динозавры: { unit: "яиц", place: "в каждом из {a} гнёзд динозавра" },
  конфеты: { unit: "конфет", place: "в каждой из {a} коробок" },
  котики: { unit: "котят", place: "у каждой из {a} кошек" },
  пираты: { unit: "монет", place: "в каждом из {a} сундуков" },
};

function fallbackStory(a: number, b: number, theme: string): StoryProblem {
  const scene = THEME_SCENES[theme] ?? THEME_SCENES["конфеты"];
  const place = scene.place.replace("{a}", String(a));
  return {
    text: `${capitalize(place)} по ${b} ${scene.unit}. Сколько всего ${scene.unit}?`,
    a,
    b,
    answer: product(a, b),
    offline: true,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Ask for a themed word problem about a×b. Falls back to a local template. */
export async function getStoryProblem(
  a: number,
  b: number,
  theme: string,
): Promise<StoryProblem> {
  try {
    const data = await postJson<Partial<StoryProblem>>("/api/helper/story", {
      a,
      b,
      theme,
    });
    if (typeof data.text === "string" && data.text.length > 0) {
      return { text: data.text, a, b, answer: product(a, b), offline: false };
    }
  } catch {
    // fall through to offline template
  }
  return fallbackStory(a, b, theme);
}

const MNEMONICS: Record<string, string> = {
  "9": "Хитрость с девяткой: 9×n — это (10×n) минус n. Например 9×6 = 60 − 6 = 54.",
  "5": "Пятёрка всегда заканчивается на 0 или 5 и равна половине от ×10.",
};

function fallbackExplain(a: number, b: number, hint?: string): string {
  const ans = product(a, b);
  const base = `${a} × ${b} — это ${a} раз по ${b}. Сложим: ${Array.from({ length: Math.min(a, 5) }, () => b).join(" + ")}${a > 5 ? " + …" : ""} = ${ans}.`;
  const tip = hint && hint.length > 0 ? hint : MNEMONICS[String(a)] ?? MNEMONICS[String(b)];
  return tip ? `${base} ${tip}` : base;
}

/**
 * Kid-friendly explanation of a fact. Pass `hint` (a validated memory trick
 * from domain/tricks) to ground the LLM and prevent invented "rules". Falls
 * back to a local template (using the same hint) when the helper is offline.
 */
export async function explainFact(a: number, b: number, hint?: string): Promise<string> {
  try {
    const data = await postJson<{ text?: string }>("/api/helper/explain", { a, b, hint });
    if (typeof data.text === "string" && data.text.length > 0) return data.text;
  } catch {
    // fall through
  }
  return fallbackExplain(a, b, hint);
}
