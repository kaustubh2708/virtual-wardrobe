import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useMotionValue, useSpring } from 'framer-motion';
import HangingItem from './HangingItem';

// One horizontal boutique rack: a wooden rail (or shelf) with garments hung
// (or shelved) along it. Rail garments overlap like a packed closet and swing
// on their hangers as you scroll — an underdamped spring makes them lag,
// sway and settle like real hanging clothes.
export default function ClosetRail({ label, emoji, items, variant = 'rail', onItemClick }) {
  const stacked = variant === 'rail';

  // Scroll velocity → swing angle. The raw value snaps with each scroll event;
  // the spring (low damping) turns that into a pendulum wobble that dies out.
  const swingRaw = useMotionValue(0);
  const swing = useSpring(swingRaw, { stiffness: 170, damping: 9, mass: 0.8 });
  const lastLeft = useRef(null);
  const settle = useRef(null);

  function handleScroll(e) {
    if (!stacked) return;
    const left = e.currentTarget.scrollLeft;
    if (lastLeft.current !== null) {
      const dx = left - lastLeft.current;
      // Content moves opposite the drag; hanging clothes trail behind it.
      swingRaw.set(Math.max(-16, Math.min(16, -dx * 0.55)));
    }
    lastLeft.current = left;
    clearTimeout(settle.current);
    settle.current = setTimeout(() => { swingRaw.set(0); lastLeft.current = null; }, 90);
  }

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

        <div
          className={`flex overflow-x-auto pt-1.5 px-4 scrollbar-hide ${stacked ? 'pb-4' : 'gap-1.5 pb-2 snap-x'}`}
          style={stacked ? { perspective: '700px' } : undefined}
          onScroll={handleScroll}
        >
          {items.map((item, i) => (
            <div key={item.id} className={stacked && i > 0 ? '-ml-9' : ''} style={stacked ? { zIndex: items.length - i } : undefined}>
              <HangingItem item={item} index={i} variant={variant} stacked={stacked} swing={swing} onClick={onItemClick} />
            </div>
          ))}

          {/* Add-more hanger at the end of the rack */}
          <Link
            to="/wardrobe"
            className={`flex-shrink-0 w-24 flex flex-col items-center justify-center ${stacked ? '-ml-6' : 'snap-start'}`}
            style={stacked ? { zIndex: 0 } : undefined}
          >
            <div className={`w-full aspect-[3/4] rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted active:scale-95 transition-transform ${variant === 'rail' ? 'mt-[26px]' : 'mt-2'}`}>
              <Plus size={22} />
            </div>
            {!stacked && <span className="text-[10px] text-muted mt-1.5">Add</span>}
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
