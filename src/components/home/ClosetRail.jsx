import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import HangingItem from './HangingItem';

// One horizontal boutique rack: a wooden rail (or shelf) with garments hung
// (or shelved) along it. Horizontally scrollable like browsing a real rack.
export default function ClosetRail({ label, emoji, items, variant = 'rail', onItemClick }) {
  if (!items?.length) return null;

  return (
    <section className="mb-5">
      <div className="flex items-baseline justify-between px-4 mb-1">
        <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
          <span>{emoji}</span> {label}
        </h3>
        <span className="text-[11px] text-muted">{items.length}</span>
      </div>

      <div className="relative">
        {/* The rail / shelf bar */}
        {variant === 'rail' ? (
          <div className="absolute left-3 right-3 top-[13px] h-[6px] rounded-full z-0"
            style={{ background: 'linear-gradient(180deg,#a5764a 0%,#8a6030 55%,#6d4a24 100%)', boxShadow: '0 2px 4px rgba(109,74,36,0.35)' }} />
        ) : null}

        <div className="flex gap-1.5 overflow-x-auto pt-1.5 pb-2 px-4 snap-x scrollbar-hide">
          {items.map((item, i) => (
            <HangingItem key={item.id} item={item} index={i} variant={variant} onClick={onItemClick} />
          ))}

          {/* Add-more hanger at the end of the rack */}
          <Link to="/wardrobe" className="flex-shrink-0 w-24 flex flex-col items-center justify-center snap-start">
            <div className={`w-full aspect-[3/4] rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted active:scale-95 transition-transform ${variant === 'rail' ? 'mt-[26px]' : 'mt-2'}`}>
              <Plus size={22} />
            </div>
            <span className="text-[10px] text-muted mt-1.5">Add</span>
          </Link>
        </div>

        {/* Shelf plank under shelved rows */}
        {variant === 'shelf' && (
          <div className="mx-3 h-[7px] -mt-1 rounded-sm"
            style={{ background: 'linear-gradient(180deg,#b3835a 0%,#8a6030 60%,#5f3f1f 100%)', boxShadow: '0 3px 6px rgba(95,63,31,0.3)' }} />
        )}
      </div>
    </section>
  );
}
