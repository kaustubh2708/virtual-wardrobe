// Google Gemini API wrapper (free tier via Google AI Studio).
// Get a key at https://aistudio.google.com/apikey and put it in .env as
// VITE_GEMINI_API_KEY. The consumer Gemini app subscription does NOT grant
// API access — the AI Studio key does, and its free tier is plenty here.
//
// Everything the app needs from an LLM goes through this one module:
//   - callGemini()      → raw text
//   - callGeminiJSON()  → parsed JSON, optionally schema-constrained
//   - fileToGeminiImage → turn an uploaded File into an inline image part
//
// NOTE ON KEYS: like the rest of this app, calls run in the browser, so the
// key is visible in the bundle. That's acceptable for a personal project on
// the free tier (worst case: someone burns your free quota, no billing). If
// you ever want to lock it down, move these calls behind a Vercel serverless
// function (/api/*) that holds the key server-side — the callers below won't
// need to change, only this file's fetch target.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';

const endpoint = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export function hasGeminiKey() {
  return Boolean(GEMINI_API_KEY);
}

/**
 * Low-level Gemini call.
 * @param {object}  opts
 * @param {string} [opts.system]      System instruction.
 * @param {string} [opts.prompt]      User text.
 * @param {{mimeType:string,data:string}} [opts.image]  Inline base64 image.
 * @param {object} [opts.schema]      Gemini responseSchema (forces JSON output).
 * @param {number} [opts.temperature] Sampling temperature.
 * @returns {Promise<string>} Model text output.
 */
export async function callGemini({ system, prompt, image, schema, temperature = 0.7 } = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env');
  }

  const parts = [];
  if (image) parts.push({ inlineData: { mimeType: image.mimeType, data: image.data } });
  if (prompt) parts.push({ text: prompt });

  const body = {
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  if (schema) {
    body.generationConfig.responseMimeType = 'application/json';
    body.generationConfig.responseSchema = schema;
  }

  const res = await fetch(`${endpoint(MODEL)}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();

  const candidate = data?.candidates?.[0];
  if (candidate?.finishReason === 'SAFETY') {
    throw new Error('Gemini blocked this request for safety reasons.');
  }
  const text = (candidate?.content?.parts || [])
    .map((p) => p.text)
    .filter(Boolean)
    .join('');

  if (!text) throw new Error('Gemini returned an empty response.');
  return text;
}

/** Same as callGemini but parses the result as JSON. Pass a `schema` for reliability. */
export async function callGeminiJSON(opts) {
  const text = await callGemini(opts);
  return parseJSON(text);
}

// Gemini normally returns clean JSON when a responseSchema is set, but this
// strips markdown fences / prose as a fallback so a stray format never crashes.
function parseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/[[{][\s\S]*[\]}]/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Could not parse Gemini JSON response.');
    }
  }
}

/** Convert an uploaded File/Blob into an inline image part for Gemini. */
export function fileToGeminiImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result); // data:image/png;base64,....
      const comma = result.indexOf(',');
      const meta = result.slice(0, comma);
      const b64 = result.slice(comma + 1);
      const mimeType = /data:(.*?);/.exec(meta)?.[1] || file.type || 'image/jpeg';
      resolve({ mimeType, data: b64 });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
