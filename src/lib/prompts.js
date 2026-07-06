import { CATEGORIES, OCCASIONS, FIT_TYPES, SEASONS, CONDITIONS, COLOURS } from '../constants/categories';

// ---------------------------------------------------------------------------
// Gemini response schemas (responseSchema format — types are UPPERCASE).
// Constraining output to these makes parsing reliable: no regex, no guessing.
// ---------------------------------------------------------------------------

export const OUTFIT_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      name: { type: 'STRING' },
      items: { type: 'ARRAY', items: { type: 'STRING' } },
      reasoning: { type: 'STRING' },
      vibe: { type: 'STRING' },
    },
    required: ['name', 'items', 'reasoning', 'vibe'],
  },
};

export const GAP_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      item: { type: 'STRING' },
      category: { type: 'STRING' },
      reason: { type: 'STRING' },
      store: { type: 'STRING' },
      estimated_price_inr: { type: 'NUMBER' },
      occasion: { type: 'STRING' },
    },
    required: ['item', 'category', 'reason', 'store', 'estimated_price_inr', 'occasion'],
  },
};

// Schema for auto-tagging a garment photo. Enums keep the values aligned to the
// app's own dropdowns so the tagged item drops straight into the form.
export const ITEM_TAG_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    brand: { type: 'STRING' },
    category: { type: 'STRING', enum: CATEGORIES },
    subcategory: { type: 'STRING' },
    color_primary: { type: 'STRING', enum: COLOURS },
    color_secondary: { type: 'STRING', enum: COLOURS },
    fabric: { type: 'STRING' },
    fit_type: { type: 'STRING', enum: FIT_TYPES },
    occasion: { type: 'ARRAY', items: { type: 'STRING', enum: OCCASIONS } },
    season: { type: 'ARRAY', items: { type: 'STRING', enum: SEASONS } },
    condition: { type: 'STRING', enum: CONDITIONS },
    notes: { type: 'STRING' },
  },
  required: ['name', 'category'],
};

// ---------------------------------------------------------------------------
// Photo auto-tagging
// ---------------------------------------------------------------------------

export const TAG_SYSTEM_PROMPT = `You are a fashion cataloguing assistant. You are shown a photo of a single clothing item or accessory. Identify it and return structured metadata.

Rules:
- Give it a short, natural product name (e.g. "White Linen Shirt", "Tan Suede Loafers"). No brand unless clearly visible.
- Pick the closest category, colours, fit, fabric, occasions and season from the allowed values.
- If unsure about a field, make your best reasonable guess rather than leaving it blank.
- Only describe what you can actually see in the photo.`;

export const TAG_USER_PROMPT =
  'Catalogue this clothing item. Fill in every field you reasonably can.';

// ---------------------------------------------------------------------------
// Stylist + gap analysis (personalised to the user's profile)
// ---------------------------------------------------------------------------

const DEFAULT_PROFILE = {
  height_cm: 185,
  weight_kg: 73,
  build: 'Lean',
  skin_tone: 'Wheatish',
  city: 'Delhi',
};

export function buildStylistSystemPrompt(profile = {}) {
  const p = { ...DEFAULT_PROFILE, ...profile };
  return `You are a personal stylist AI for one specific user. Personalise every recommendation to their exact profile — never give generic advice.

USER PROFILE:
- Height: ${p.height_cm}cm, Weight: ${p.weight_kg}kg, Build: ${p.build}
- Skin tone: ${p.skin_tone} (warm undertone)
- Best colours: White, Off-White, Beige, Sand, Olive, Sage, Rust, Terracotta, Camel, Navy, Charcoal, Burgundy
- Avoid: pastels, icy tones, neon
- Style: minimal, linen-forward, earth tones, effortless
- Location: ${p.city}, India
- Styling rules:
  * Relaxed / wide-leg fits work on a lean tall frame
  * Half-tuck shirts — never full tuck unless very formal
  * Chunky sneakers > flat soles for this height
  * Earth tones + white always look intentional on this skin tone

When suggesting outfits:
- Only use items from the wardrobe list provided in the user message.
- Favour items marked "clean" and worn few times; avoid pushing items worn very recently.
- Explain in ONE practical sentence why each combination works for this build + skin tone.
- Return exactly 3 outfits.`;
}

export function buildGapSystemPrompt(profile = {}) {
  const p = { ...DEFAULT_PROFILE, ...profile };
  return `You are a wardrobe consultant. Analyse the user's wardrobe for gaps.

The user is ${p.height_cm}cm, ${p.build.toLowerCase()} build, ${p.skin_tone.toLowerCase()} skin tone, in ${p.city}. They need coverage for Casual, Office and Night Out.

For each gap:
1. Name exactly what's missing.
2. Say why it matters for THIS profile.
3. Recommend where to buy it in ${p.city} on a budget (Sarojini / Snitch / AJIO / H&M).
4. Give an estimated price in INR.

Be specific. Do not suggest anything they already own. Return at most 6 gaps.`;
}

// ---------------------------------------------------------------------------
// User-message builders (the wardrobe data the model reasons over)
// ---------------------------------------------------------------------------

// Ground suggestions in real usage: pass wear counts + recency so the stylist
// can favour clean, under-worn pieces and rotate the wardrobe.
export function buildOutfitSuggestionPrompt(wardrobeItems, occasion, weather = null) {
  const itemList = wardrobeItems
    .filter((i) => i.status === 'Clean')
    .map((i) => {
      const worn = i.times_worn ? `worn ${i.times_worn}×` : 'never worn';
      const last = i.last_worn_at ? `, last on ${i.last_worn_at}` : '';
      return `- ${i.name} (${i.category}, ${i.color_primary || 'colour unknown'}, ${i.fit_type || 'fit unknown'}; ${worn}${last})`;
    })
    .join('\n');

  const weatherContext = weather
    ? `\nCURRENT WEATHER: ${weather.temp}°C, ${weather.condition}. Dress for this.\n`
    : '';

  return `Occasion: ${occasion}${weatherContext}
MY WARDROBE (clean items only, with wear history):
${itemList}

Suggest 3 outfits using ONLY these exact items. Prefer under-worn pieces so my wardrobe rotates.`;
}

export function buildGapAnalysisPrompt(wardrobeItems) {
  const itemList = wardrobeItems
    .map((i) => `- ${i.name} (${i.category}, ${i.color_primary || ''})`)
    .join('\n');
  return `MY CURRENT WARDROBE:\n${itemList}\n\nAnalyse it for gaps as instructed.`;
}
