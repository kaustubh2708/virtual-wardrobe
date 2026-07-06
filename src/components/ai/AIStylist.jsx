import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Plus } from 'lucide-react';
import { callGeminiJSON } from '../../lib/gemini';
import { buildStylistSystemPrompt, buildOutfitSuggestionPrompt, OUTFIT_SCHEMA } from '../../lib/prompts';
import { useWardrobe } from '../../context/WardrobeContext';
import { useUser } from '../../context/UserContext';
import { OCCASIONS } from '../../constants/categories';
import { HAS_GEMINI_KEY } from '../../lib/demoMode';

// Match a suggested item name (free text from the model) to a real wardrobe item.
function matchItem(name, items) {
  const n = name.toLowerCase().trim();
  return (
    items.find((i) => i.name.toLowerCase() === n) ||
    items.find((i) => i.name.toLowerCase().includes(n) || n.includes(i.name.toLowerCase()))
  );
}

export default function AIStylist({ weather }) {
  const { items, addOutfit } = useWardrobe();
  const { profile } = useUser();
  const [occasion, setOccasion] = useState('Casual');
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedIdx, setSavedIdx] = useState({}); // suggestion index → true once saved

  if (!HAS_GEMINI_KEY) {
    return (
      <div className="bg-accent-light rounded-2xl p-5 text-center">
        <span className="text-2xl block mb-2">✨</span>
        <p className="text-sm font-bold text-accent mb-1">AI Stylist — Demo Mode</p>
        <p className="text-xs text-muted">
          Add a free Gemini key (VITE_GEMINI_API_KEY) from{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline">
            aistudio.google.com
          </a>{' '}
          to your .env for live, personalised outfit suggestions.
        </p>
      </div>
    );
  }

  async function getSuggestions() {
    if (!items.length) { setError('Add items to your wardrobe first.'); return; }
    setLoading(true);
    setError('');
    setSuggestions(null);
    setSavedIdx({});
    try {
      const parsed = await callGeminiJSON({
        system: buildStylistSystemPrompt(profile),
        prompt: buildOutfitSuggestionPrompt(items, occasion, weather),
        schema: OUTFIT_SCHEMA,
        temperature: 0.8,
      });
      setSuggestions(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      setError(err.message || 'AI stylist unavailable. Check your API key.');
    } finally {
      setLoading(false);
    }
  }

  async function saveAsOutfit(suggestion, idx) {
    const itemRoles = [];
    const seen = new Set();
    for (const rawName of suggestion.items || []) {
      const match = matchItem(rawName, items);
      if (match && !seen.has(match.id)) {
        seen.add(match.id);
        itemRoles.push({ itemId: match.id, role: match.category });
      }
    }
    if (!itemRoles.length) { setError('Could not match these items to your wardrobe.'); return; }
    try {
      await addOutfit({ name: suggestion.name, occasion, notes: suggestion.reasoning }, itemRoles);
      setSavedIdx((s) => ({ ...s, [idx]: true }));
    } catch (err) {
      setError(err.message || 'Failed to save outfit.');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Occasion selector */}
      <div>
        <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-2">Occasion</p>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {[...OCCASIONS, 'Any'].map((occ) => (
            <button
              key={occ}
              onClick={() => setOccasion(occ)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold border transition-colors ${
                occasion === occ
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-muted bg-surface'
              }`}
            >
              {occ}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={getSuggestions}
        disabled={loading}
        className="w-full bg-primary text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Sparkles size={16} />
        )}
        {loading ? 'Styling your look...' : 'Suggest Outfits'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* Loading shimmer */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-surface rounded-2xl p-4 shadow-sm">
              <div className="shimmer rounded h-3 w-1/3 mb-3" />
              <div className="shimmer rounded h-2.5 w-full mb-2" />
              <div className="shimmer rounded h-2.5 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      <AnimatePresence>
        {suggestions && suggestions.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-bold text-primary">{s.name || `Look ${i + 1}`}</h3>
              {s.vibe && (
                <span className="text-[9px] font-bold uppercase tracking-wide bg-accent-light text-accent px-2 py-1 rounded-full whitespace-nowrap">
                  {s.vibe}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5 mb-3">
              {(s.items || []).map((item, j) => (
                <div key={j} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                  <p className="text-xs text-primary">{item}</p>
                </div>
              ))}
            </div>
            {s.reasoning && (
              <p className="text-[11px] text-muted italic border-t border-border pt-2 mb-3">
                {s.reasoning}
              </p>
            )}
            <button
              onClick={() => saveAsOutfit(s, i)}
              disabled={savedIdx[i]}
              className={`w-full rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                savedIdx[i]
                  ? 'bg-success/10 text-success'
                  : 'bg-accent-light text-accent active:scale-95'
              }`}
            >
              {savedIdx[i] ? <><Check size={13} /> Saved to Outfits</> : <><Plus size={13} /> Save as Outfit</>}
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
