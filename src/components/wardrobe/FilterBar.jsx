import { Search, X } from 'lucide-react';
import { CATEGORIES, OCCASIONS } from '../../constants/categories';

export default function FilterBar({ search, onSearch, category, onCategory, occasion, onOccasion }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search wardrobe..."
          value={search}
          onChange={e => onSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 border border-border rounded-xl text-sm bg-bg focus:outline-none focus:border-accent"
        />
        {search && (
          <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <Chip active={!category} onClick={() => onCategory(null)}>All</Chip>
        {CATEGORIES.map(c => (
          <Chip key={c} active={category === c} onClick={() => onCategory(category === c ? null : c)}>{c}</Chip>
        ))}
      </div>

      {/* Occasion chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <Chip active={!occasion} onClick={() => onOccasion(null)} small>All occasions</Chip>
        {OCCASIONS.map(o => (
          <Chip key={o} active={occasion === o} onClick={() => onOccasion(occasion === o ? null : o)} small>{o}</Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({ children, active, onClick, small }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-full border font-medium transition-colors whitespace-nowrap ${
        small ? 'text-[11px] px-3 py-1' : 'text-xs px-3 py-1.5'
      } ${
        active
          ? 'bg-primary text-white border-primary'
          : 'border-border text-muted bg-surface'
      }`}
    >
      {children}
    </button>
  );
}
