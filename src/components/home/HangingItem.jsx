import { CATEGORY_EMOJI, COLOUR_MAP } from '../../constants/categories';

// A single garment "hanging" from a hanger (rail variant) or resting on a shelf
// (shelf variant). Slight per-item tilt makes a packed rack feel real.
export default function HangingItem({ item, index = 0, variant = 'rail', onClick }) {
  const emoji = CATEGORY_EMOJI[item.category] || '👔';
  const tilt = ((index % 3) - 1) * 1.5; // -1.5°, 0°, +1.5°
  const swatch = item.color_primary ? COLOUR_MAP[item.color_primary] : null;

  const Garment = (
    <div
      className="w-full aspect-[3/4] rounded-lg bg-accent-light overflow-hidden shadow-sm ring-1 ring-border/60 group-active:scale-95 transition-transform"
    >
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} loading="lazy" className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">{emoji}</div>
      )}
    </div>
  );

  return (
    <button
      onClick={() => onClick?.(item)}
      className="relative flex flex-col items-center flex-shrink-0 w-24 group focus:outline-none snap-start"
      title={item.name}
    >
      {variant === 'rail' ? (
        <>
          {/* Hanger — hook crosses the rail above */}
          <svg width="60" height="38" viewBox="0 0 64 40" className="relative z-10 -mb-2" style={{ transform: `rotate(${tilt}deg)` }}>
            <path d="M32 13 C32 3 25 3 25 9" fill="none" stroke="#8a6030" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M32 13 L9 33 L55 33 Z" fill="none" stroke="#8a6030" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <div className="w-full" style={{ transform: `rotate(${tilt}deg)` }}>{Garment}</div>
        </>
      ) : (
        <div className="w-full pt-2" style={{ transform: `rotate(${tilt / 2}deg)` }}>{Garment}</div>
      )}

      <div className="mt-1.5 flex items-center gap-1 w-full justify-center px-0.5">
        {swatch && <span className="w-2 h-2 rounded-full flex-shrink-0 border border-border" style={{ backgroundColor: swatch }} />}
        <span className="text-[10px] text-primary/70 line-clamp-1">{item.name}</span>
      </div>
    </button>
  );
}
