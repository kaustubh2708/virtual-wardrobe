import { motion, useTransform } from 'framer-motion';
import { CATEGORY_EMOJI, COLOUR_MAP } from '../../constants/categories';

// A single garment "hanging" from a hanger (rail variant) or resting on a shelf
// (shelf variant). Rail garments pivot from the hook (transform-origin at the
// hanger) and swing with the rail's scroll spring — each with a slightly
// different factor so a packed rack sways organically, not in lockstep.
export default function HangingItem({ item, index = 0, variant = 'rail', stacked = false, swing, onClick }) {
  const emoji = CATEGORY_EMOJI[item.category] || '👔';
  const tilt = ((index % 3) - 1) * 1.5; // -1.5°, 0°, +1.5°
  const swatch = item.color_primary ? COLOUR_MAP[item.color_primary] : null;
  // Anything not Clean is out of rotation — show it faded with a laundry chip
  // so the rack honestly reflects what's ready to wear.
  const away = item.status && item.status !== 'Clean';

  // Per-item swing personality: 0.75×–1.25× of the rail's swing value.
  const factor = 0.75 + ((index * 7) % 5) * 0.125;
  const mySwing = useTransform(swing, (v) => v * factor + tilt);
  // Fake depth: fan the cards a touch on Y and deepen it while swinging.
  const fan = ((index % 2) ? -7 : -3.5);
  const myRotateY = useTransform(swing, (v) => fan + v * 0.4);

  const Garment = (
    <div
      className={`relative w-full aspect-[3/4] rounded-lg bg-accent-light overflow-hidden shadow-md ring-1 ring-border/60 group-active:scale-95 transition-transform ${away ? 'opacity-45 grayscale-[35%]' : ''}`}
    >
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">{emoji}</div>
      )}
      {away && (
        <span className="absolute bottom-1 left-1 bg-primary/75 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
          🧺 {item.status === 'Worn' ? 'Worn' : item.status}
        </span>
      )}
    </div>
  );

  return (
    <button
      onClick={() => onClick?.(item)}
      className="relative flex flex-col items-center flex-shrink-0 w-24 group focus:outline-none"
      style={stacked ? { zIndex: 100 - index } : undefined}
      title={item.name}
    >
      {variant === 'rail' ? (
        <motion.div
          className="flex flex-col items-center w-full"
          style={{
            rotate: mySwing,
            rotateY: myRotateY,
            transformOrigin: '50% 10px', // pivot at the hanger hook on the rail
            transformPerspective: 700,
          }}
        >
          {/* Hanger — hook crosses the rail above */}
          <svg width="60" height="38" viewBox="0 0 64 40" className="relative z-10 -mb-2">
            <path d="M32 13 C32 3 25 3 25 9" fill="none" stroke="#8a6030" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 13 L9 33 L55 33 Z" fill="none" stroke="#8a6030" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <div className="w-full">{Garment}</div>
        </motion.div>
      ) : (
        <div className="w-full pt-2" style={{ transform: `rotate(${tilt / 2}deg)` }}>{Garment}</div>
      )}

      {/* A packed rack has no room for labels — the peek modal carries the name. */}
      {!stacked && (
        <div className="mt-1.5 flex items-center gap-1 w-full justify-center px-0.5">
          {swatch && <span className="w-2 h-2 rounded-full flex-shrink-0 border border-border" style={{ backgroundColor: swatch }} />}
          <span className="text-[10px] text-primary/70 line-clamp-1">{item.name}</span>
        </div>
      )}
    </button>
  );
}
