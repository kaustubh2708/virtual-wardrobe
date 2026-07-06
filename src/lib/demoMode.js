// Demo mode activates automatically when Supabase isn't configured yet.
// This lets the app run fully offline against localStorage, seeded with
// real wardrobe data, while .env keys are still being set up.
export const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

export const DEMO_USER_ID = 'demo-user';

export const HAS_GEMINI_KEY = Boolean(import.meta.env.VITE_GEMINI_API_KEY);
export const HAS_WEATHER_KEY = Boolean(import.meta.env.VITE_OPENWEATHER_API_KEY);
export const HAS_REPLICATE_KEY = Boolean(import.meta.env.VITE_REPLICATE_API_KEY);
