# Virtual Wardrobe 👔

A mobile-first personal wardrobe app: catalogue your clothes, build outfits, and
get AI styling — all on a **free** stack (Google Gemini free tier, in-browser
background removal, Supabase free tier). Works fully offline in **demo mode** with
no keys at all.

## Features

- **📷 Photo-first intake** — snap a photo and Gemini auto-fills name, category,
  colour, fabric, fit, occasion, and season. No more tedious forms.
- **✂️ Background removal** — one-tap, in-browser cutouts (no API, no cost) for
  catalog-quality item images.
- **✨ AI stylist** — outfit suggestions personalised to your body + skin tone,
  grounded in real usage (favours clean, under-worn pieces). Save any suggestion
  straight to your outfits.
- **🧺 Flat-lay collages** — every outfit renders as a downloadable flat-lay,
  composed on-device. (Photorealistic try-on is available as an optional paid add-on.)
- **📊 Insights** — cost-per-wear, colour story, occasion coverage, and a
  "gathering dust" list of items to rotate or sell. Plus AI capsule gap analysis.
- **📱 Installable PWA** — add to your home screen; camera-driven capture on mobile.

## Quick start

```bash
npm install
cp .env.example .env   # optional — app runs in demo mode with no keys
npm run dev
```

Open the printed local URL. With no `.env`, you get demo mode (localStorage +
seeded wardrobe). Add keys to unlock the real features:

| Key | What it enables | Cost |
| --- | --- | --- |
| `VITE_GEMINI_API_KEY` | Photo auto-tagging, AI stylist, gap analysis | **Free** — [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` | Cloud sync + auth (leaves demo mode) | Free tier |
| `VITE_OPENWEATHER_API_KEY` | Weather-aware suggestions | Free tier |
| `VITE_REPLICATE_API_KEY` | Photorealistic AI try-on (optional) | Paid |

> The Gemini key is the free **AI Studio** key — the consumer Gemini app
> subscription does not grant API access.

## Cloud sync (optional)

To leave demo mode, create a Supabase project and run
[`supabase_migration.sql`](supabase_migration.sql) in its SQL editor, create a
public Storage bucket named `wardrobe`, then set the two `VITE_SUPABASE_*` keys.

## Deploying to Vercel

1. Push to GitHub, import the repo in Vercel (framework preset: **Vite**).
2. Add the `VITE_*` env vars in Vercel project settings.

> ⚠️ Because this is a client-only SPA, `VITE_*` keys ship in the browser bundle.
> That's fine for a personal project on free tiers (worst case: someone burns your
> free quota — no billing). To fully hide keys, move the Gemini calls in
> [`src/lib/gemini.js`](src/lib/gemini.js) behind a Vercel serverless function.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build (PWA assets generated)
- `npm run preview` — preview the build
- `npm run lint` — ESLint

## Tech

React 19 · Vite · Tailwind · React Router · Framer Motion · Supabase ·
Google Gemini · `@imgly/background-removal` · `vite-plugin-pwa`
