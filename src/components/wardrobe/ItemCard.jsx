import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, Trash2 } from 'lucide-react';
import { Tag, StatusTag } from '../ui/Tag';
import { CATEGORY_EMOJI, COLOUR_MAP } from '../../constants/categories';
import { costPerWear, formatINR } from '../../lib/wardrobeUtils';

export default function ItemCard({ item, onClick, onDelete, onMarkWorn, onMarkClean }) {
  const [showActions, setShowActions] = useState(false);
  const cpw = costPerWear(item);
  const colourHex = item.color_primary ? COLOUR_MAP[item.color_primary] : null;
  const emoji = CATEGORY_EMOJI[item.category] || '👔';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-surface rounded-2xl shadow-sm overflow-hidden relative"
    >
      {/* Image or emoji placeholder */}
      <div
        className="w-full aspect-square bg-accent-light flex items-center justify-center relative cursor-pointer"
        onClick={() => onClick(item)}
        onTouchStart={() => {}}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-5xl">{emoji}</span>
        )}

        {/* Needs photo badge */}
        {item.needs_photo && !item.image_url && (
          <div className="absolute bottom-2 right-2 bg-primary/80 rounded-full p-1">
            <Camera size={12} className="text-white" />
          </div>
        )}

        {/* Worn indicator */}
        {item.status === 'Worn' && (
          <div className="absolute top-2 left-2 bg-orange-500 rounded-full px-2 py-0.5 text-[9px] text-white font-bold">
            🧺 Worn
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3" onClick={() => onClick(item)}>
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3 className="text-[13px] font-bold text-primary leading-tight line-clamp-2">{item.name}</h3>
          {colourHex && (
            <div
              className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5 border border-border"
              style={{ backgroundColor: colourHex }}
            />
          )}
        </div>

        {item.brand && (
          <p className="text-[11px] text-muted mb-1.5">{item.brand}</p>
        )}

        <div className="flex flex-wrap gap-1 mb-2">
          {item.occasion?.slice(0, 2).map(occ => (
            <Tag key={occ}>{occ}</Tag>
          ))}
          {item.fit_type && <Tag>{item.fit_type}</Tag>}
        </div>

        <div className="flex items-center justify-between">
          <StatusTag status={item.status} />
          {cpw && (
            <span className="text-[10px] text-muted">₹{cpw}/wear</span>
          )}
        </div>
      </div>

      {/* Long-press action bar */}
      <div className="flex border-t border-border">
        {item.status === 'Clean' ? (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkWorn?.(item.id); }}
            className="flex-1 py-2 text-[11px] text-muted flex items-center justify-center gap-1 hover:bg-accent-light"
          >
            <CheckCircle size={13} /> Mark Worn
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkClean?.(item.id); }}
            className="flex-1 py-2 text-[11px] text-muted flex items-center justify-center gap-1 hover:bg-accent-light"
          >
            ✨ Mark Clean
          </button>
        )}
        <div className="w-px bg-border" />
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(item.id); }}
          className="px-3 py-2 text-red-400 hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
