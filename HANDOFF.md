# Virtual Wardrobe — Handoff Document

> **For the next Claude Code session.** Read this + CLAUDE.md before touching any code.

---

## Project Overview

A personal React PWA that acts as a digital wardrobe manager with AI styling. It is a **personal project** — not for sale, not scaling. The owner deploys to Vercel; API keys live in Vercel env vars. Client-side `VITE_*` exposure is acceptable.

**Live repo:** https://github.com/kaustubh2708/virtual-wardrobe  
**Stack:** React 19 + Vite 8 + Tailwind 3 + React Router 7 + Framer Motion 12  
**AI:** Google Gemini (free AI Studio key) — **never re-introduce Anthropic/Claude API**  
**Storage:** Supabase free tier (cloud) **or** localStorage (demo mode, no keys needed)

---

## What Is Fully Built (Phase 1 — Shipped)

| Feature | Files | Status |
|---|---|---|
| Full wardrobe CRUD (items, outfits, shopping list) | `src/pages/Wardrobe.jsx`, `WardrobeContext.jsx` | ✅ |
| Photo-first AI intake — Gemini vision auto-tags on upload | `AddItemModal.jsx`, `src/lib/gemini.js`, `prompts.js` | ✅ |
| In-browser background removal (ONNX, no API cost) | `src/lib/bgRemove.js` | ✅ |
| AI outfit suggestions grounded in wear history | `src/components/ai/AIStylist.jsx`, `prompts.js` | ✅ |
| "Save as Outfit" from AI suggestion | `AIStylist.jsx` → `addOutfit()` | ✅ |
| Outfit detail modal + flat-lay canvas collage | `src/components/outfits/OutfitDetail.jsx`, `src/lib/collage.js` | ✅ |
| "Wore this today" wear logging | `OutfitDetail.jsx` → `updateOutfit()` | ✅ |
| Insights: cost-per-wear, colour story, occasion coverage | `src/pages/Insights.jsx` | ✅ |
| Insights: "Gathering Dust" panel (never/long-idle items) | `Insights.jsx`, `wardrobeUtils.js` | ✅ |
| Insights: Gemini-powered wardrobe gap analysis | `Insights.jsx` | ✅ |
| Weather widget (OpenWeather API, optional) | `src/components/weather/WeatherWidget.jsx` | ✅ |
| PWA — installable, home-screen, service worker | `vite.config.js`, `index.html` | ✅ |
| Demo mode (localStorage, seeded wardrobe, no keys needed) | `src/lib/demoMode.js`, `localStore.js` | ✅ |
| Supabase auth + cloud sync | `src/lib/supabase.js`, `UserContext.jsx` | ✅ |
| Settings: profile, reference photo, monthly budget | `src/pages/Settings.jsx` | ✅ |
| Shopping list with cost tracking | `src/pages/Shopping.jsx` | ✅ |

---

## What Is Planned (Phase 2 — Stub Pages Exist, Not Implemented)

All four pages below already exist as route stubs in `src/pages/`. The nav links to them. They render a placeholder UI. The work is building them out.

### 1. Calendar / Outfit Planner (`src/pages/Calendar.jsx`)
Plan outfits for specific upcoming dates (events, trips, work week). Drag-to-assign outfits to calendar days. Key ideas:
- Simple monthly calendar grid — no heavy library needed, build it with CSS Grid
- Each day cell: tap → pick an outfit from a picker modal
- Data model: `planned_outfits` table in Supabase (or localStorage key `planned_outfits: [{date, outfitId}]`)
- Stretch: Gemini suggests outfit for day based on weather forecast + occasion

### 2. MoodBoard (`src/pages/MoodBoard.jsx`)
Pinterest-style inspiration board for style goals. Key ideas:
- User pastes image URLs or uploads photos
- Gemini analyses a moodboard image and extracts a palette / style keywords → feeds into stylist prompt
- Canvas or CSS grid layout; drag to reorder
- Stretch: "Shop the look" → cross-references with user's wardrobe gaps

### 3. Travel Packing (`src/pages/Travel.jsx`)
Smart packing list generator for trips. Key ideas:
- User inputs destination, trip duration, trip type (business / casual / beach / etc.)
- Gemini recommends a capsule wardrobe from the user's actual items (structured output: list of item IDs)
- Checklist UI: tap to mark packed
- Generates a flat-lay collage of the recommended capsule

### 4. Outfit of the Day (OOTD) Auto-Flat-Lay Save
When user logs "Wore this today" on an outfit, automatically generate and persist the flat-lay as the outfit's cover image (instead of regenerating each time the detail opens).
- Call `buildFlatLay()` on first log; store data URL in `outfit.cover_image`
- `OutfitDetail.jsx` checks `outfit.cover_image` before re-running canvas

---

## Key Architectural Constraints to Preserve

1. **No Anthropic API** — `anthropic.js` was deleted intentionally. CLAUDE.md documents this.
2. **Gemini only via raw fetch** — no SDK (`@google/generative-ai` not installed). All calls go through `src/lib/gemini.js` → `callGemini()` / `callGeminiJSON()`.
3. **Gemini `responseSchema` uses UPPERCASE types** — `STRING`, `ARRAY`, `OBJECT`, `NUMBER`, `BOOLEAN`. Lowercase fails silently. All schemas live in `src/lib/prompts.js`.
4. **Background removal is dynamically imported** — `@imgly/background-removal` uses `import()` inside `removeBg()` to keep the 24 MB ONNX runtime out of the initial bundle. Never move it to a top-level import.
5. **ONNX excluded from SW precache** — `vite.config.js` `globIgnores: ['**/ort*', '**/*.wasm']`. Don't remove these.
6. **Demo mode check before every Supabase call** — `if (DEMO_MODE) { /* localStorage path */ } else { /* supabase path */ }`. Pattern is consistent across all context files.

---

## Environment Variables

```
VITE_GEMINI_API_KEY=       # Required for AI features. Free key: aistudio.google.com/apikey
VITE_GEMINI_MODEL=         # Optional. Defaults to gemini-2.5-flash
VITE_SUPABASE_URL=         # Optional. Without it, app runs in demo/localStorage mode
VITE_SUPABASE_ANON_KEY=    # Optional. Paired with URL above
VITE_OPENWEATHER_KEY=      # Optional. Weather widget falls back to manual input without it
VITE_REPLICATE_API_KEY=    # Optional, paid. Photorealistic try-on (not the default)
```

---

## Known Lint Warnings (Pre-existing, Non-blocking)

There are 11 ESLint warnings from `eslint-plugin-react-hooks@7` rules (`react-hooks/exhaustive-deps`, `react-hooks/rules-of-hooks`) spread across the original context files and Shopping/ItemCard components. None affect build or runtime — Vite builds cleanly. Do not fix these unless the user specifically asks; they're in code that predates the Phase 1 rebuild and fixing them risks subtle regressions.

---

## Running Locally

```bash
npm install
cp .env.example .env    # fill in VITE_GEMINI_API_KEY at minimum
npm run dev             # http://localhost:5173
```

Build + PWA check:
```bash
npm run build           # generates dist/ with SW
npx serve dist          # test SW locally
```

---

## Owner Profile (for AI prompt personalisation)

Height: 185 cm · Weight: 73 kg · Build: Lean · Skin tone: Wheatish  
Shirt: 40 · T-shirt: M oversized / L · Pants: 32×32 · City: Delhi  
These values are currently hardcoded in `src/pages/Settings.jsx` `ProfileRow` components.  
Phase 2 could make them editable and store them in `profile` via `updateProfile()`.
