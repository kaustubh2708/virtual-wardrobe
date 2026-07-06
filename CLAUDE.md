# CLAUDE.md — Virtual Wardrobe

Mobile-first personal wardrobe + AI stylist. React 19 + Vite + Tailwind, deployed
as an installable PWA. Free-stack by design (Gemini free tier, in-browser bg
removal, Supabase free tier). Personal project — not intended to scale/sell.

## Architecture

- **State**: two React contexts — `UserContext` (auth/profile) and
  `WardrobeContext` (items, outfits, shopping list; reducer + optimistic updates).
- **Demo mode**: `src/lib/demoMode.js` → `DEMO_MODE` is true when Supabase keys
  are absent. In demo mode all persistence goes through `src/lib/localStore.js`
  (localStorage) seeded from `src/data/seedWardrobe.js`. Every context method
  branches on `DEMO_MODE`. This is the default dev experience.
- **Feature flags**: `HAS_GEMINI_KEY`, `HAS_WEATHER_KEY`, `HAS_REPLICATE_KEY` in
  `demoMode.js` gate optional integrations; UI degrades gracefully without them.

## AI layer

- All LLM calls go through `src/lib/gemini.js` (Google Gemini, REST, no SDK).
  Use `callGeminiJSON({ system, prompt, image, schema })` — always pass a
  `schema` (from `src/lib/prompts.js`) for reliable structured output; no regex
  parsing. `fileToGeminiImage(file)` prepares an inline image part.
- `src/lib/prompts.js` holds response schemas (UPPERCASE Gemini `Type` values),
  the profile-aware system prompts, and the wardrobe-context builders. The
  stylist prompt is grounded in wear history so it favours under-worn items.
- **Do not reintroduce Anthropic/Claude** — the app deliberately uses only free
  AI. `anthropic.js` was removed.

## Key features & where they live

- Photo auto-tag + background removal: `src/components/wardrobe/AddItemModal.jsx`
  (uses `gemini.js` + `src/lib/bgRemove.js`, which dynamically imports
  `@imgly/background-removal` so its weight stays out of the main bundle).
- Flat-lay collages: `src/lib/collage.js` (`buildFlatLay`) →
  `src/components/outfits/OutfitDetail.jsx`.
- Usage analytics: `src/lib/wardrobeUtils.js` (`getDeadStock`, `totalWears`,
  `costPerWear`) → `src/pages/Insights.jsx`.

## Conventions

- Tailwind theme tokens in `tailwind.config.js` (`bg`, `surface`, `primary`,
  `accent`, `accent-light`, `muted`, `border`, `success`). Use these, not raw hex.
- Item images: `object-contain` on `bg-accent-light` (cutouts look best on the
  neutral card background).
- Keys are client-side `VITE_*` vars — acceptable for this personal/free-tier
  project. See README for the serverless-proxy upgrade path if ever needed.

## Commands

`npm run dev` · `npm run build` · `npm run lint` · `npm run preview`
