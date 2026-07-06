// Lightweight localStorage persistence for Phase 2 planning features
// (calendar plans, moodboard, saved trips). These are personal, low-volume,
// and offline-friendly, so localStorage is fine for both demo and cloud mode.
// Future upgrade path: mirror to Supabase tables (planned_outfits, moodboard,
// trips) keyed by user_id — the read/write API below stays the same.
import { loadLocal, saveLocal, genId } from './localStore';

// ---- Calendar plans: { [YYYY-MM-DD]: outfitId } ----
export function getPlans() {
  return loadLocal('plannedOutfits', {});
}
export function setPlan(dateStr, outfitId) {
  const plans = getPlans();
  if (outfitId) plans[dateStr] = outfitId;
  else delete plans[dateStr];
  saveLocal('plannedOutfits', plans);
  return plans;
}

// ---- MoodBoard: [{ id, src, note, palette, keywords, created_at }] ----
export function getMoodBoard() {
  return loadLocal('moodboard', []);
}
export function addMoodImage({ src, note = '' }) {
  const board = getMoodBoard();
  const entry = { id: genId('mood'), src, note, palette: [], keywords: [], created_at: new Date().toISOString() };
  const next = [entry, ...board];
  saveLocal('moodboard', next);
  return entry;
}
export function updateMoodImage(id, updates) {
  const next = getMoodBoard().map(m => (m.id === id ? { ...m, ...updates } : m));
  saveLocal('moodboard', next);
  return next;
}
export function removeMoodImage(id) {
  const next = getMoodBoard().filter(m => m.id !== id);
  saveLocal('moodboard', next);
  return next;
}

// ---- Trips: [{ id, destination, days, type, itemIds, checked, created_at }] ----
export function getTrips() {
  return loadLocal('trips', []);
}
export function saveTrip(trip) {
  const trips = getTrips();
  const existing = trips.findIndex(t => t.id === trip.id);
  let next;
  if (existing >= 0) {
    next = trips.map(t => (t.id === trip.id ? trip : t));
  } else {
    next = [{ ...trip, id: trip.id || genId('trip'), created_at: new Date().toISOString() }, ...trips];
  }
  saveLocal('trips', next);
  return next[existing >= 0 ? existing : 0];
}
export function removeTrip(id) {
  const next = getTrips().filter(t => t.id !== id);
  saveLocal('trips', next);
  return next;
}
