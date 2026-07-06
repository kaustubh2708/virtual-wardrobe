import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plane, Sparkles, Check, Trash2, Download, Image as ImageIcon } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { HAS_GEMINI_KEY } from '../lib/demoMode';
import { callGeminiJSON } from '../lib/gemini';
import { buildFlatLay } from '../lib/collage';
import { getTrips, saveTrip, removeTrip } from '../lib/planStore';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { CATEGORY_EMOJI } from '../constants/categories';
import { buildStylistSystemPrompt } from '../lib/prompts';

const TRIP_TYPES = ['Business', 'Casual holiday', 'Beach', 'Wedding / Festive', 'Winter getaway', 'Adventure'];

const TRIP_SCHEMA = {
  type: 'OBJECT',
  properties: {
    capsule: { type: 'ARRAY', items: { type: 'STRING' } },
    essentials: { type: 'ARRAY', items: { type: 'STRING' } },
    tip: { type: 'STRING' },
  },
  required: ['capsule', 'essentials', 'tip'],
};

// Fuzzy-match a suggested name back to a real wardrobe item.
function matchItem(name, items) {
  const n = name.toLowerCase();
  return (
    items.find(i => i.name.toLowerCase() === n) ||
    items.find(i => i.name.toLowerCase().includes(n) || n.includes(i.name.toLowerCase())) ||
    items.find(i => { const words = n.split(/\s+/); return words.filter(w => w.length > 3 && i.name.toLowerCase().includes(w)).length >= 2; })
  );
}

export default function Travel() {
  const { items } = useWardrobe();
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(4);
  const [type, setType] = useState(TRIP_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trip, setTrip] = useState(null);
  const [trips, setTrips] = useState(() => getTrips());
  const [flatlay, setFlatlay] = useState(null);
  const [building, setBuilding] = useState(false);

  function refresh() { setTrips(getTrips()); }

  async function generate() {
    if (!destination.trim()) { setError('Where are you headed?'); return; }
    setLoading(true); setError(''); setFlatlay(null);
    try {
      const clean = items.filter(i => i.status === 'Clean');
      const wardrobeList = clean.map(i => `- ${i.name} (${i.category}, ${i.color_primary || '?'})`).join('\n');
      const result = await callGeminiJSON({
        system: buildStylistSystemPrompt() + '\n\nYou are now packing a capsule wardrobe for a trip. Choose a versatile, mix-and-match set of items ONLY from the wardrobe list. Also list non-clothing essentials to pack.',
        prompt: `Trip: ${type} to ${destination} for ${days} days.\n\nMY WARDROBE (clean):\n${wardrobeList}\n\nPick a capsule (item names exactly as written) that mixes and matches for ${days} days, plus a short essentials list, and one packing tip.`,
        schema: TRIP_SCHEMA,
        temperature: 0.6,
      });
      const matched = (result.capsule || []).map(name => ({ name, item: matchItem(name, items) }));
      const newTrip = saveTrip({
        destination: destination.trim(), days: Number(days), type,
        capsule: matched.map(m => ({ name: m.name, itemId: m.item?.id || null })),
        essentials: result.essentials || [], tip: result.tip || '', checked: {},
      });
      setTrip(newTrip);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggle(label) {
    if (!trip) return;
    const checked = { ...trip.checked, [label]: !trip.checked[label] };
    const updated = { ...trip, checked };
    setTrip(updated);
    saveTrip(updated);
    refresh();
  }

  function openTrip(t) { setTrip(t); setFlatlay(null); setError(''); }
  function del(id) { removeTrip(id); if (trip?.id === id) setTrip(null); refresh(); }

  async function makeFlatlay() {
    if (!trip) return;
    setBuilding(true);
    const oiLike = trip.capsule
      .map(c => items.find(i => i.id === c.itemId))
      .filter(i => i?.image_url)
      .map(i => ({ wardrobe_items: i }));
    const url = await buildFlatLay(oiLike);
    setFlatlay(url);
    setBuilding(false);
  }

  const capsuleItems = trip ? trip.capsule.map(c => ({ ...c, item: items.find(i => i.id === c.itemId) })) : [];

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      <div className="bg-primary text-white px-5 pt-12 pb-4 lg:pt-8 lg:rounded-t-2xl">
        <h1 className="text-xl font-bold">Travel Packs</h1>
        <p className="text-white/60 text-xs mt-1">A capsule wardrobe from what you own</p>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Trip form */}
        <div className="bg-surface rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <Input label="Destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Goa, Manali, Dubai…" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Days" type="number" min={1} max={30} value={days} onChange={e => setDays(e.target.value)} />
            <Select label="Trip type" value={type} onChange={e => setType(e.target.value)}>
              {TRIP_TYPES.map(t => <option key={t}>{t}</option>)}
            </Select>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {HAS_GEMINI_KEY ? (
            <Button onClick={generate} loading={loading} className="w-full">
              <Sparkles size={16} className="inline mr-1 -mt-0.5" /> Generate packing list
            </Button>
          ) : (
            <p className="text-[11px] text-muted text-center">Add a Gemini key to generate AI packing lists. Get one free at aistudio.google.com/apikey.</p>
          )}
        </div>

        {/* Result */}
        {trip && (
          <div className="bg-surface rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-base font-bold text-primary flex items-center gap-1"><Plane size={15} /> {trip.destination}</h2>
                <p className="text-xs text-muted">{trip.days} days · {trip.type}</p>
              </div>
              <button onClick={() => del(trip.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
            </div>
            {trip.tip && <p className="text-xs text-primary bg-accent-light rounded-lg p-2 mb-3">💡 {trip.tip}</p>}

            <p className="text-[11px] uppercase tracking-wide text-muted font-bold mb-2">Your capsule ({capsuleItems.length})</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {capsuleItems.map((c, i) => (
                <button key={i} onClick={() => toggle('cap:' + c.name)} className="relative rounded-xl overflow-hidden bg-accent-light aspect-square flex items-center justify-center">
                  {c.item?.image_url
                    ? <img src={c.item.image_url} alt={c.name} className="w-full h-full object-contain" />
                    : <span className="text-3xl">{CATEGORY_EMOJI[c.item?.category] || '👔'}</span>}
                  {trip.checked['cap:' + c.name] && <div className="absolute inset-0 bg-success/70 flex items-center justify-center"><Check size={22} className="text-white" /></div>}
                  {!c.item && <span className="absolute bottom-0 inset-x-0 bg-primary/70 text-white text-[8px] py-0.5">not owned</span>}
                </button>
              ))}
            </div>

            {trip.essentials?.length > 0 && (
              <>
                <p className="text-[11px] uppercase tracking-wide text-muted font-bold mb-1.5">Essentials</p>
                <div className="flex flex-col gap-1 mb-3">
                  {trip.essentials.map((e, i) => (
                    <button key={i} onClick={() => toggle('ess:' + e)} className="flex items-center gap-2 text-sm text-left py-0.5">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${trip.checked['ess:' + e] ? 'bg-success border-success' : 'border-border'}`}>
                        {trip.checked['ess:' + e] && <Check size={11} className="text-white" />}
                      </span>
                      <span className={trip.checked['ess:' + e] ? 'line-through text-muted' : 'text-primary'}>{e}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={makeFlatlay} loading={building} className="flex-1">
                <ImageIcon size={14} className="inline mr-1 -mt-0.5" /> Flat-lay
              </Button>
            </div>
            {flatlay && (
              <div className="mt-3">
                <img src={flatlay} alt="Capsule flat-lay" className="w-full rounded-xl border border-border" />
                <a href={flatlay} download={`${trip.destination}-capsule.png`} className="mt-2 flex items-center justify-center gap-1 text-xs text-accent font-bold">
                  <Download size={13} /> Download flat-lay
                </a>
              </div>
            )}
          </div>
        )}

        {/* Saved trips */}
        {trips.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted font-bold mb-2 px-1">Saved trips</p>
            <div className="flex flex-wrap gap-2">
              {trips.map(t => (
                <button key={t.id} onClick={() => openTrip(t)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${trip?.id === t.id ? 'bg-primary text-white border-primary' : 'bg-surface text-primary border-border'}`}>
                  {t.destination} · {t.days}d
                </button>
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <p className="text-center text-sm text-muted">Add items to your <Link to="/wardrobe" className="text-accent font-bold">wardrobe</Link> first.</p>
        )}
      </div>
    </div>
  );
}
