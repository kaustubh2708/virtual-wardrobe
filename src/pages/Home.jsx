import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, ShoppingBag, CheckCircle, Scissors } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { removeBgSmart, blobToDataUrl } from '../lib/bgRemove';
import WeatherWidget, { useWeatherData } from '../components/weather/WeatherWidget';
import AIStylist from '../components/ai/AIStylist';
import ClosetRail from '../components/home/ClosetRail';
import Modal from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Tag, StatusTag } from '../components/ui/Tag';
import { CATEGORY_EMOJI } from '../constants/categories';

// The closet is organised into boutique racks. Tops/outerwear hang on rails,
// footwear/accessories rest on shelves — like an open Zara-style wardrobe.
const RAILS = [
  { key: 'Top', label: 'Tops', emoji: '👕', variant: 'rail' },
  { key: 'Outerwear', label: 'Outerwear', emoji: '🧥', variant: 'rail' },
  { key: 'Bottom', label: 'Bottoms', emoji: '👖', variant: 'rail' },
  { key: 'Footwear', label: 'Footwear', emoji: '👟', variant: 'shelf' },
  { key: 'Accessory', label: 'Accessories', emoji: '⌚', variant: 'shelf' },
];

export default function Home() {
  const { items, shoppingList, markWorn, updateItem } = useWardrobe();
  const weather = useWeatherData();
  const [query, setQuery] = useState('');
  const [styleOpen, setStyleOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [cutting, setCutting] = useState(false);
  const [cutError, setCutError] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const cleanItems = items.filter(i => i.status === 'Clean').length;
  const toBuy = shoppingList.filter(i => i.status === 'ToBuy').length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      [i.name, i.brand, i.color_primary, i.category, ...(i.occasion || [])]
        .filter(Boolean).some(v => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const map = {};
    for (const r of RAILS) map[r.key] = [];
    for (const it of filtered) (map[it.category] || (map[it.category] = [])).push(it);
    return map;
  }, [filtered]);

  async function handleWorn(item) {
    await markWorn(item.id);
    setSelected(null);
  }

  // Turn the item's stock/product photo into a transparent garment cutout,
  // entirely in-browser. Remote CDN images need CORS headers; when a host
  // blocks that, we surface a hint to re-shoot instead of failing silently.
  async function handleCutout(item) {
    setCutting(true);
    setCutError('');
    try {
      const blob = await removeBgSmart(item.image_url);
      const dataUrl = await blobToDataUrl(blob);
      await updateItem(item.id, { image_url: dataUrl, needs_photo: false });
      setSelected({ ...item, image_url: dataUrl });
    } catch {
      setCutError("This store blocks image access, so it can't be cut out automatically. Take/upload your own photo in Wardrobe and use “Clean up background” there.");
    } finally {
      setCutting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      {/* Boutique header */}
      <div className="bg-primary text-white px-5 pt-12 pb-5 lg:pt-8 lg:rounded-t-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-[2px] mb-0.5">{greeting}</p>
            <h1 className="text-2xl font-bold tracking-tight">My Closet</h1>
            <p className="text-white/60 text-xs mt-1">{items.length} pieces · {cleanItems} ready to wear</p>
          </div>
          <button
            onClick={() => setStyleOpen(true)}
            className="flex flex-col items-center gap-1 bg-white/10 rounded-2xl px-3 py-2 active:scale-95 transition-transform"
          >
            <Sparkles size={18} className="text-accent-light" />
            <span className="text-[10px] font-semibold">Style me</span>
          </button>
        </div>

        <WeatherWidget />

        {/* Search the rack */}
        <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
          <Search size={15} className="text-white/50" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your closet…"
            className="bg-transparent flex-1 text-sm placeholder-white/40 focus:outline-none text-white"
          />
        </div>
      </div>

      {/* The open closet */}
      <div className="py-4 flex-1">
        {items.length === 0 ? (
          <EmptyCloset />
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted py-16 px-6">No pieces match "{query}".</p>
        ) : (
          RAILS.map(r => (
            <ClosetRail
              key={r.key}
              label={r.label}
              emoji={r.emoji}
              variant={r.variant}
              items={grouped[r.key] || []}
              onItemClick={setSelected}
            />
          ))
        )}

        {/* Shortcuts */}
        <div className="grid grid-cols-2 gap-3 px-4 mt-2">
          <Link to="/outfits" className="bg-surface rounded-2xl p-3 shadow-sm flex items-center gap-2 active:scale-95 transition-transform">
            <Sparkles size={16} className="text-accent" />
            <span className="text-xs font-semibold text-primary">My Outfits</span>
          </Link>
          <Link to="/shop" className="bg-surface rounded-2xl p-3 shadow-sm flex items-center gap-2 active:scale-95 transition-transform">
            <ShoppingBag size={16} className="text-accent" />
            <span className="text-xs font-semibold text-primary">To buy ({toBuy})</span>
          </Link>
        </div>
      </div>

      {/* Style-me sheet */}
      <Modal open={styleOpen} onClose={() => setStyleOpen(false)} title="✨ Style me">
        <AIStylist weather={weather} />
      </Modal>

      {/* Quick item peek */}
      <Modal open={!!selected} onClose={() => { setSelected(null); setCutError(''); }} title={selected?.name || 'Item'}>
        {selected && (
          <div className="flex flex-col gap-3">
            <div className="w-full aspect-square rounded-2xl bg-accent-light flex items-center justify-center overflow-hidden">
              {selected.image_url
                ? <img src={selected.image_url} alt={selected.name} className="w-full h-full object-contain" />
                : <span className="text-6xl">{CATEGORY_EMOJI[selected.category] || '👔'}</span>}
            </div>
            {selected.brand && <p className="text-xs text-muted -mb-1">{selected.brand}</p>}
            <div className="flex flex-wrap gap-1.5">
              <StatusTag status={selected.status} />
              {selected.color_primary && <Tag>{selected.color_primary}</Tag>}
              {selected.fit_type && <Tag>{selected.fit_type}</Tag>}
              {selected.occasion?.slice(0, 2).map(o => <Tag key={o}>{o}</Tag>)}
            </div>
            {selected.image_url && !selected.image_url.startsWith('data:') && !selected.image_url.startsWith('/cutouts/') && (
              <Button variant="secondary" onClick={() => handleCutout(selected)} loading={cutting} className="w-full">
                <Scissors size={14} className="inline mr-1 -mt-0.5" /> Cut out garment (remove background)
              </Button>
            )}
            {cutError && <p className="text-xs text-red-500">{cutError}</p>}
            <div className="flex gap-2 mt-1">
              {selected.status === 'Clean' && (
                <Button onClick={() => handleWorn(selected)} className="flex-1">
                  <CheckCircle size={15} className="inline mr-1 -mt-0.5" /> Wore it today
                </Button>
              )}
              <Link to="/wardrobe" className="flex-1">
                <Button variant="secondary" className="w-full">Open in wardrobe</Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function EmptyCloset() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-16">
      <span className="text-6xl mb-3">🚪</span>
      <h3 className="text-base font-bold text-primary mb-1">Your closet is empty</h3>
      <p className="text-sm text-muted mb-4">Add your first piece and watch the rack fill up.</p>
      <Link to="/wardrobe"><Button>Add an item</Button></Link>
    </div>
  );
}
