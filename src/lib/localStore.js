// Minimal localStorage-backed persistence used by demo mode, so the app
// is fully usable before Supabase is connected. Swapping in real Supabase
// later requires no changes here — WardrobeContext/UserContext branch on
// DEMO_MODE and call these instead of supabase-js.
const PREFIX = 'vw_demo_';

export function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) return JSON.parse(raw);
  } catch {
    // fall through to seeding
  }
  saveLocal(key, fallback);
  return fallback;
}

export function saveLocal(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — fail silently, demo mode is best-effort
  }
}

export function genId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
