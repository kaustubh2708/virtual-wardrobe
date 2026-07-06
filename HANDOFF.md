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

## Phase 2 — Built ✅ (was planned, now shipped)

All three stub pages are now fully functional, plus a redesigned home page.

### 0. ZARA-style "open closet" home page (`src/pages/Home.jsx`)
Boutique-rack UI. Garments hang from SVG hangers on wooden rails
(`src/components/home/ClosetRail.jsx` + `HangingItem.jsx`), grouped by category;
footwear/accessories use a "shelf" variant instead of hangers. Includes closet
search, a "Style me" sheet (AIStylist in a modal), and a quick item-peek modal
with "Wore it today". `RAILS` config in Home.jsx controls the rows/variants.

### 1. Calendar / Outfit Planner (`src/pages/Calendar.jsx`)
Monthly CSS-grid calendar, tap a day → pick/assign/clear an outfit. Today is
highlighted. Plans persist via `src/lib/planStore.js` (`getPlans`/`setPlan`).
Day cells show a 2×2 thumbnail of the assigned outfit's items.

### 2. MoodBoard (`src/pages/MoodBoard.jsx`)
Masonry inspiration grid. Add via image URL or upload (stored as data URL).
Optional **Gemini** "Analyse style" extracts a hex palette + style keywords +
vibe summary (`MOOD_SCHEMA`). Persist via `planStore` (`getMoodBoard` etc.).
Note: URL images may fail CORS on analysis; uploads always work.

### 3. Travel Packing (`src/pages/Travel.jsx`)
Form (destination, days, trip type) → **Gemini** picks a capsule from the user's
clean wardrobe + essentials + a packing tip (`TRIP_SCHEMA`). Fuzzy-matches
suggested names back to real items (`matchItem`). Packing checklist with persisted
checked state, saved-trips chips, and a flat-lay of the capsule (`buildFlatLay`).
Trips persist via `planStore` (`getTrips`/`saveTrip`/`removeTrip`).

**Persistence note:** Phase 2 data (plans, moodboard, trips) uses `planStore.js`
= localStorage always, in both demo and cloud mode. Future upgrade: mirror to
Supabase tables (`planned_outfits`, `moodboard`, `trips`) keyed by `user_id` —
the read/write API in planStore.js can stay identical.

## Polish Pass — Built ✅

- **ScrollToTop** on route change (`App.jsx`) — SPA kept old scroll position.
- **Laundry states on the rack** — non-Clean items render faded with a 🧺 chip.
- **Flat-lay covers persist** — first build saves to `outfit.flatlay_image_url`
  via `onSaveFlatLay` (OutfitDetail → Outfits.jsx); cards show it, no rebuilds.
- **Editable profile** in Settings (height/weight/build/skin tone/city) via
  `updateProfile()`; the AI stylist prompts read these values.
- **Physics rack** — rail garments overlap like a packed closet and *swing on
  their hangers* while scrolling: scroll velocity → underdamped spring
  (`ClosetRail.jsx`), per-item swing factor + rotateY fan for fake 3D depth
  (`HangingItem.jsx`). Labels hidden on stacked rails (peek modal has them).
- **min-w-0 fix in AppLayout** — without it, mobile horizontal rails stretched
  the page instead of scrolling. Do not remove.

## Garment Cutouts (seed data) ✅

Seed items now ship with **pre-cut transparent garment PNGs** in
`public/cutouts/seed-N.png`, generated by `scripts/generate-cutouts.mjs`
(`@imgly/background-removal-node`, devDependency; server-side fetch dodges
store CDN CORS blocks). Key learnings baked into the script:
- Uniqlo `goods_XX_<id>` colour codes were probed per product to find **flat
  garment-only shots in the owned colour** (many codes are on-model photos —
  cutting those keeps the model, which looked wrong).
- AJIO blocks non-browser fetches (returns placeholder bytes) → the two Puma
  AJIO items (seed-16, seed-20) keep remote thumbnails / emoji.
- `SEED_VERSION` bumped to 3 — existing localStorage re-syncs image/notes.
- Runtime "Cut out garment" button (Home peek modal) remains for user-added
  photos; hidden for `data:`/`/cutouts/` images. `removeBgSmart()` in
  `bgRemove.js` falls back through two CORS proxies for remote images.

## What Is Planned (Phase 3 — Not Yet Built)

### User re-shoots wardrobe photos
The owner plans to photograph items and replace stock cutouts over time
(AddItemModal photo → "Clean up background" flow already supports this).

### Weather-aware calendar suggestions
In Calendar, use the weather forecast + occasion to have Gemini pre-suggest an
outfit for upcoming days.

### Supabase-backed Phase 2 tables
Move planStore data server-side (see persistence note above) for cross-device sync.

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
