import { useState } from 'react';
import { useWardrobe } from '../context/WardrobeContext';
import { useUser } from '../context/UserContext';
import {
  costPerWear, formatINR, totalWardrobeValue, totalWears,
  getOccasionCoverage, getDeadStock,
} from '../lib/wardrobeUtils';
import { getPaletteFromItems } from '../lib/colorUtils';
import { callGeminiJSON } from '../lib/gemini';
import { buildGapSystemPrompt, buildGapAnalysisPrompt, GAP_SCHEMA } from '../lib/prompts';
import { HAS_GEMINI_KEY } from '../lib/demoMode';
import { CATEGORY_EMOJI } from '../constants/categories';

export default function Insights() {
  const { items } = useWardrobe();
  const { profile } = useUser();
  const [gaps, setGaps] = useState(null);
  const [gapsLoading, setGapsLoading] = useState(false);
  const [gapsError, setGapsError] = useState('');

  const totalValue = totalWardrobeValue(items);
  const palette = getPaletteFromItems(items);
  const coverage = getOccasionCoverage(items);
  const wears = totalWears(items);
  const deadStock = getDeadStock(items);

  // Cost per wear, best value first.
  const cpwItems = items
    .map((i) => ({ ...i, cpw: costPerWear(i) }))
    .filter((i) => i.cpw != null)
    .sort((a, b) => a.cpw - b.cpw)
    .slice(0, 5);

  async function fetchGaps() {
    setGapsLoading(true);
    setGapsError('');
    try {
      const parsed = await callGeminiJSON({
        system: buildGapSystemPrompt(profile),
        prompt: buildGapAnalysisPrompt(items),
        schema: GAP_SCHEMA,
        temperature: 0.5,
      });
      setGaps(Array.isArray(parsed) ? parsed : []);
    } catch {
      setGapsError('Gap analysis unavailable. Check your Gemini API key.');
    } finally {
      setGapsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      <div className="bg-primary text-white px-5 pt-12 pb-4 lg:pt-8 lg:rounded-t-2xl">
        <h1 className="text-xl font-bold">Insights</h1>
        <p className="text-white/60 text-xs">Wardrobe value: {formatINR(totalValue)} · {wears} total wears</p>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Occasion coverage */}
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-3">Occasion Coverage</p>
          {coverage.map(({ occasion, count }) => {
            const max = Math.max(...coverage.map((c) => c.count), 1);
            return (
              <div key={occasion} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-primary font-medium">{occasion}</span>
                  <span className="text-xs text-muted">{count} items</span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Colour palette */}
        {palette.length > 0 && (
          <div className="bg-surface rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-3">Colour Story</p>
            <div className="flex flex-wrap gap-2">
              {palette.slice(0, 10).map(({ colour, count, hex }) => (
                <div key={colour} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: hex }} />
                  <span className="text-[11px] text-muted">{colour} ({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost per wear */}
        {cpwItems.length > 0 && (
          <div className="bg-surface rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-3">Best Value Items</p>
            {cpwItems.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted w-4">{i + 1}</span>
                  <p className="text-xs font-medium text-primary">{item.name}</p>
                </div>
                <span className="text-xs font-bold text-success">₹{item.cpw}/wear</span>
              </div>
            ))}
          </div>
        )}

        {/* Dead stock / rotation nudge */}
        {deadStock.length > 0 && (
          <div className="bg-surface rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-1">Gathering Dust</p>
            <p className="text-xs text-muted mb-3">
              {deadStock.length} item{deadStock.length !== 1 ? 's' : ''} you rarely wear — style them into an outfit or let them go.
            </p>
            {deadStock.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{CATEGORY_EMOJI[item.category] || '👔'}</span>
                  <p className="text-xs font-medium text-primary truncate">{item.name}</p>
                </div>
                <span className="text-[11px] text-muted whitespace-nowrap ml-2">
                  {!item.times_worn ? 'never worn' : `idle ${item.idleDays}d`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Gap analysis */}
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold mb-1">Capsule Gap Analysis</p>
          <p className="text-xs text-muted mb-3">AI-powered analysis of what's missing from your wardrobe.</p>
          {!HAS_GEMINI_KEY ? (
            <div className="bg-accent-light rounded-xl p-3 text-center">
              <p className="text-xs text-accent font-bold">Demo Mode</p>
              <p className="text-[11px] text-muted mt-0.5">Add a free VITE_GEMINI_API_KEY in .env to enable gap analysis.</p>
            </div>
          ) : !gaps ? (
            <button
              onClick={fetchGaps}
              disabled={gapsLoading}
              className="w-full bg-primary text-white rounded-xl py-3 text-sm font-bold disabled:opacity-70"
            >
              {gapsLoading ? 'Analysing...' : 'Analyse My Wardrobe'}
            </button>
          ) : null}
          {gapsError && <p className="text-xs text-red-500 mt-2">{gapsError}</p>}
          {gaps && gaps.map((gap, i) => (
            <div key={i} className="py-3 border-b border-border last:border-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-primary">{gap.item}</p>
                <span className="text-xs font-bold text-accent whitespace-nowrap">{formatINR(gap.estimated_price_inr)}</span>
              </div>
              <p className="text-xs text-muted mt-0.5">{gap.reason}</p>
              <p className="text-[11px] text-muted mt-0.5">📍 {gap.store}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
