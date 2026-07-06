import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import { getPlans, setPlan } from '../lib/planStore';
import Modal from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const iso = (d) => d.toISOString().split('T')[0];

function outfitItems(outfit) {
  return (outfit?.outfit_items || []).map(oi => oi.wardrobe_items).filter(Boolean);
}

function OutfitThumb({ outfit, size = 'sm' }) {
  const imgs = outfitItems(outfit).filter(i => i.image_url).slice(0, 4);
  const box = size === 'sm' ? 'w-full h-full' : 'w-14 h-14';
  if (!imgs.length) return <div className={`${box} bg-accent-light flex items-center justify-center text-lg rounded`}>👔</div>;
  return (
    <div className={`${box} grid grid-cols-2 grid-rows-2 gap-px bg-accent-light rounded overflow-hidden`}>
      {imgs.map((it, i) => <img key={i} src={it.image_url} alt="" className="w-full h-full object-cover" />)}
    </div>
  );
}

export default function Calendar() {
  const { outfits } = useWardrobe();
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [plans, setPlans] = useState(() => getPlans());
  const [pickDate, setPickDate] = useState(null);

  const outfitById = useMemo(() => Object.fromEntries(outfits.map(o => [o.id, o])), [outfits]);
  const todayStr = iso(new Date());

  const cells = useMemo(() => {
    const year = cursor.getFullYear(), month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out = [];
    for (let i = 0; i < first.getDay(); i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(new Date(year, month, d));
    return out;
  }, [cursor]);

  function assign(outfitId) {
    const key = iso(pickDate);
    setPlans({ ...setPlan(key, outfitId) });
    setPickDate(null);
  }
  function clearDay() {
    const key = iso(pickDate);
    setPlans({ ...setPlan(key, null) });
    setPickDate(null);
  }

  const monthLabel = cursor.toLocaleString('default', { month: 'long', year: 'numeric' });
  const pickKey = pickDate ? iso(pickDate) : null;
  const plannedForPick = pickKey ? outfitById[plans[pickKey]] : null;

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      <div className="bg-primary text-white px-5 pt-12 pb-4 lg:pt-8 lg:rounded-t-2xl">
        <h1 className="text-xl font-bold">Outfit Calendar</h1>
        <p className="text-white/60 text-xs mt-1">Plan what you'll wear ahead of time</p>
      </div>

      <div className="px-4 py-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="p-2 rounded-lg hover:bg-accent-light"><ChevronLeft size={18} /></button>
          <h2 className="text-sm font-bold text-primary">{monthLabel}</h2>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="p-2 rounded-lg hover:bg-accent-light"><ChevronRight size={18} /></button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DOW.map((d, i) => <div key={i} className="text-center text-[10px] font-bold text-muted py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const key = iso(date);
            const outfit = outfitById[plans[key]];
            const isToday = key === todayStr;
            return (
              <button
                key={i}
                onClick={() => setPickDate(date)}
                className={`aspect-square rounded-lg p-0.5 flex flex-col items-stretch relative border ${isToday ? 'border-accent' : 'border-border'} bg-surface active:scale-95 transition-transform`}
              >
                <span className={`text-[9px] font-bold px-0.5 ${isToday ? 'text-accent' : 'text-muted'}`}>{date.getDate()}</span>
                {outfit && <div className="flex-1 min-h-0"><OutfitThumb outfit={outfit} /></div>}
              </button>
            );
          })}
        </div>

        {outfits.length === 0 && (
          <div className="text-center text-sm text-muted mt-6">
            <p className="mb-2">You have no saved outfits yet.</p>
            <Link to="/outfits"><Button variant="secondary">Create an outfit</Button></Link>
          </div>
        )}
      </div>

      {/* Day picker */}
      <Modal open={!!pickDate} onClose={() => setPickDate(null)} title={pickDate ? pickDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long' }) : ''}>
        {plannedForPick && (
          <div className="mb-4 p-3 rounded-xl bg-accent-light flex items-center gap-3">
            <div className="w-14 h-14 flex-shrink-0"><OutfitThumb outfit={plannedForPick} /></div>
            <div className="flex-1">
              <p className="text-xs text-muted">Planned</p>
              <p className="text-sm font-bold text-primary">{plannedForPick.name}</p>
            </div>
            <button onClick={clearDay} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
          </div>
        )}
        <p className="text-[11px] uppercase tracking-wide text-muted font-bold mb-2">{plannedForPick ? 'Change to' : 'Pick an outfit'}</p>
        <div className="grid grid-cols-2 gap-2">
          {outfits.map(o => (
            <button key={o.id} onClick={() => assign(o.id)} className="flex flex-col gap-1.5 p-2 rounded-xl bg-surface border border-border active:scale-95 transition-transform">
              <div className="w-full aspect-square"><OutfitThumb outfit={o} /></div>
              <span className="text-[11px] font-semibold text-primary line-clamp-1 text-left">{o.name}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
