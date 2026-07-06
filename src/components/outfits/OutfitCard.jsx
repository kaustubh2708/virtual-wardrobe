import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Tag } from '../ui/Tag';
import { CATEGORY_EMOJI } from '../../constants/categories';

export default function OutfitCard({ outfit, onClick, onDelete }) {
  const items = outfit.outfit_items || [];
  const cover = outfit.flatlay_image_url || outfit.try_on_image_url;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-surface rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Flat-lay preview */}
      <div
        className="w-full aspect-square bg-accent-light flex items-center justify-center cursor-pointer relative"
        onClick={() => onClick?.(outfit)}
      >
        {cover ? (
          <img src={cover} alt={outfit.name} className="w-full h-full object-contain" />
        ) : items.length ? (
          <div className="grid grid-cols-2 gap-1.5 p-3 w-full h-full">
            {items.slice(0, 4).map((oi, i) => (
              <div key={i} className="flex items-center justify-center">
                {oi.wardrobe_items?.image_url ? (
                  <img src={oi.wardrobe_items.image_url} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
                ) : (
                  <span className="text-3xl">{CATEGORY_EMOJI[oi.item_role] || '👔'}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-3xl">✨</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[13px] font-bold text-primary line-clamp-1">{outfit.name}</h3>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(outfit.id); }}
            className="text-muted hover:text-red-400 flex-shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {outfit.occasion && <Tag>{outfit.occasion}</Tag>}

        <p className="text-[11px] text-muted mt-1.5">
          {items.length} piece{items.length !== 1 ? 's' : ''}
          {outfit.times_worn > 0 && ` · Worn ${outfit.times_worn}×`}
        </p>
      </div>
    </motion.div>
  );
}
