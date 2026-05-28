/**
 * Thin OpenRouter client (OpenAI-compatible /chat/completions). Mirrors the
 * pattern from /root/Synica/synica/llm/openrouter.py: Bearer auth plus the
 * HTTP-Referer / X-Title headers OpenRouter expects. Uses global fetch (Node 18+).
 */

export class OpenRouterError extends Error {}

/**
 * @param {object} opts
 * @param {string} opts.apiKey
 * @param {string} opts.baseUrl
 * @param {string} opts.model
 * @param {Array<{role:string, content:string}>} opts.messages
 * @param {object} [opts.responseFormat]
 * @param {number} [opts.temperature]
 * @param {number} [opts.maxTokens]
 * @returns {Promise<string>} assistant message content
 */
export async function chatCompletion({
  apiKey,
  baseUrl,
  model,
  messages,
  responseFormat,
  temperature = 0.7,
  maxTokens = 400,
}) {
  if (!apiKey) throw new OpenRouterError("OPENROUTER_API_KEY is not configured");

  const payload = { model, messages, temperature, max_tokens: maxTokens };
  if (responseFormat) payload.response_format = responseFormat;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  let res;
  try {
    res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://umnozharium.local",
        "X-Title": "Umnozharium",
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new OpenRouterError(`OpenRouter ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new OpenRouterError("OpenRouter returned no content");
  }
  return content;
}
