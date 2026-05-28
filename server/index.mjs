/**
 * Optional AI helper proxy for Умножариум.
 *
 * Holds the OpenRouter API key server-side so it never ships inside the app
 * (the app only talks to this proxy). Exposes two kid-safe endpoints used by
 * src/helper/llmClient.ts. The app works fully without this server — it falls
 * back to local templates — so this is a pure enhancement.
 */
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import express from "express";
import { chatCompletion, OpenRouterError } from "./openrouter.mjs";

// Load server/.env next to this file regardless of the process cwd, so the
// key is found whether started as `npm run server` (cwd = repo root) or from
// elsewhere. This matches the documented location (server/env.example).
config({ path: join(dirname(fileURLToPath(import.meta.url)), ".env") });

const PORT = Number(process.env.PORT ?? 8799);
const API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const BASE_URL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const MODEL = process.env.HELPER_MODEL ?? "openai/gpt-4o-mini";

const app = express();
app.use(express.json({ limit: "8kb" }));

// Permissive CORS: this proxy serves only public, non-sensitive helper text,
// and the packaged app may call it from a different origin (capacitor://).
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  next();
});
app.options("*", (_req, res) => res.sendStatus(204));

function log(event, extra = {}) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...extra }));
}

/** Validate that v is an integer in [1, 12]. */
function validFactor(v) {
  return Number.isInteger(v) && v >= 1 && v <= 12;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, ai: Boolean(API_KEY), model: API_KEY ? MODEL : null });
});

app.post("/api/helper/story", async (req, res) => {
  const { a, b, theme } = req.body ?? {};
  if (!validFactor(a) || !validFactor(b)) {
    return res.status(400).json({ error: "a and b must be integers 1..12" });
  }
  if (!API_KEY) return res.status(503).json({ error: "ai disabled" });

  const safeTheme = String(theme ?? "приключения").slice(0, 40);
  try {
    const content = await chatCompletion({
      apiKey: API_KEY,
      baseUrl: BASE_URL,
      model: MODEL,
      responseFormat: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Ты — добрый помощник в детском приложении для детей 7–9 лет. " +
            "Придумывай короткие весёлые задачи на умножение на русском языке. " +
            "Только добрый, безопасный контент: без насилия, страхов и сложных слов. " +
            'Отвечай СТРОГО в JSON: {"text": "<условие задачи в 1–2 предложениях, БЕЗ ответа>"}.',
        },
        {
          role: "user",
          content: `Тема: ${safeTheme}. Составь задачу, которая решается умножением ${a} × ${b}. Не пиши ответ.`,
        },
      ],
    });
    const parsed = JSON.parse(content);
    const text = typeof parsed.text === "string" ? parsed.text : "";
    log("story.ok", { a, b });
    return res.json({ text, a, b, answer: a * b });
  } catch (err) {
    const msg = err instanceof OpenRouterError ? err.message : String(err);
    log("story.error", { error: msg.slice(0, 160) });
    return res.status(502).json({ error: "helper failed" });
  }
});

app.post("/api/helper/explain", async (req, res) => {
  const { a, b } = req.body ?? {};
  if (!validFactor(a) || !validFactor(b)) {
    return res.status(400).json({ error: "a and b must be integers 1..12" });
  }
  if (!API_KEY) return res.status(503).json({ error: "ai disabled" });

  const answer = a * b;
  const hint = typeof req.body?.hint === "string" ? req.body.hint.slice(0, 300) : "";

  try {
    const content = await chatCompletion({
      apiKey: API_KEY,
      baseUrl: BASE_URL,
      model: MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Ты — добрый учитель для ребёнка 7–9 лет. Тебе дают ВЕРНЫЙ ответ примера и, как правило, " +
            "проверенный способ его запомнить. Перескажи этот способ простыми, тёплыми словами — коротко, " +
            "2–3 предложения, только по-русски, без markdown и без эмодзи. " +
            "СТРОГИЕ ПРАВИЛА (нарушать нельзя): " +
            "1) Не выдумывай новых «правил», «фокусов» или закономерностей. Используй ТОЛЬКО данный способ, " +
            "либо счёт сложением (a раз по b), либо перестановку множителей (a×b = b×a). " +
            "2) Не разбивай число на отдельные цифры и не придумывай связей между цифрами ответа " +
            "(никаких «сумма цифр», «это как X и Y») — кроме случая, когда это прямо есть в данном способе. " +
            "3) Вся арифметика в ответе должна быть верной и согласованной с данным ответом; ничего не считай заново неправильно. " +
            "4) Если способ не дан — объясни через сложение или перестановку, ничего не изобретая.",
        },
        {
          role: "user",
          content:
            `Пример: ${a} × ${b} = ${answer} (это верный ответ, не меняй его). ` +
            (hint ? `Проверенный способ запомнить: «${hint}». ` : "") +
            "Объясни ребёнку коротко и по-доброму, как это запомнить.",
        },
      ],
    });
    log("explain.ok", { a, b, grounded: Boolean(hint) });
    return res.json({ text: content.trim() });
  } catch (err) {
    const msg = err instanceof OpenRouterError ? err.message : String(err);
    log("explain.error", { error: msg.slice(0, 160) });
    return res.status(502).json({ error: "helper failed" });
  }
});

app.listen(PORT, () => {
  log("server.start", { port: PORT, ai: Boolean(API_KEY), model: API_KEY ? MODEL : null });
});
