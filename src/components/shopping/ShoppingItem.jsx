import { Trash2 } from 'lucide-react';
import { StatusTag } from '../ui/Tag';
import { formatINR } from '../../lib/wardrobeUtils';

const STATUS_CYCLE = { ToBuy: 'Bought', Wishlist: 'ToBuy', Bought: 'Wishlist' };

export default function ShoppingItem({ item, onToggle, onDelete }) {
  const isBought = item.status === 'Bought';

  return (
    <div className={`bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-3 transition-opacity ${isBought ? 'opacity-60' : ''}`}>
      {/* Toggle circle */}
      <button
        onClick={() => onToggle(item.id, STATUS_CYCLE[item.status])}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          isBought
            ? 'bg-success border-success text-white'
            : item.status === 'Wishlist'
            ? 'border-purple-400'
            : 'border-border'
        }`}
      >
        {isBought && <span className="text-[10px]">✓</span>}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold text-primary leading-tight ${isBought ? 'line-through' : ''}`}>
          {item.name}
        </p>
        {item.store && <p className="text-xs text-muted mt-0.5">{item.store}</p>}
        <div className="flex items-center gap-2 mt-1.5">
          <StatusTag status={item.status} />
          {(item.estimated_price_inr || item.actual_price_inr) && (
            <span className="text-xs font-bold text-primary">
              {formatINR(item.actual_price_inr || item.estimated_price_inr)}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button onClick={() => onDelete(item.id)} className="text-muted hover:text-red-400 p-1">
        <Trash2 size={15} />
      </button>
    </div>
  );
}
