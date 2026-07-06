import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import { useWardrobe } from '../context/WardrobeContext';
import ItemCard from '../components/wardrobe/ItemCard';
import AddItemModal from '../components/wardrobe/AddItemModal';
import ImportModal from '../components/wardrobe/ImportModal';
import FilterBar from '../components/wardrobe/FilterBar';
import FAB from '../components/ui/FAB';
import { ShimmerCard } from '../components/ui/Shimmer';
import { detectDuplicate } from '../lib/wardrobeUtils';

export default function Wardrobe() {
  const { items, loading, addItem, updateItem, deleteItem, markWorn, markClean, bulkAddItems } = useWardrobe();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);
  const [occasion, setOccasion] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const filtered = useMemo(() => {
    let result = items;
    if (search) result = result.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.brand?.toLowerCase().includes(search.toLowerCase()) ||
      i.color_primary?.toLowerCase().includes(search.toLowerCase())
    );
    if (category) result = result.filter(i => i.category === category);
    if (occasion) result = result.filter(i => i.occasion?.includes(occasion));
    return result;
  }, [items, search, category, occasion]);

  function handleEdit(item) {
    setEditItem(item);
    setAddOpen(true);
  }

  function handleCloseAdd() {
    setAddOpen(false);
    setEditItem(null);
  }

  async function handleSave(data) {
    if (!editItem) {
      const dupe = detectDuplicate(data, items);
      if (dupe && !duplicateWarning) {
        setDuplicateWarning(dupe);
        throw new Error(`You already own something similar: "${dupe.name}". Save anyway by submitting again.`);
      }
      await addItem(data);
    } else {
      await updateItem(editItem.id, data);
    }
    setDuplicateWarning(null);
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this item from your wardrobe?')) return;
    await deleteItem(id);
  }

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      {/* Header */}
      <div className="bg-primary text-white px-5 pt-12 pb-4 lg:pt-8 lg:rounded-t-2xl">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold">Wardrobe</h1>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5 text-xs font-medium"
          >
            <Download size={14} /> Import
          </button>
        </div>
        <p className="text-white/60 text-xs">{items.length} items</p>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 bg-bg">
        <FilterBar
          search={search} onSearch={setSearch}
          category={category} onCategory={setCategory}
          occasion={occasion} onOccasion={setOccasion}
        />
      </div>

      {/* Grid */}
      <div className="flex-1 px-4 pb-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ShimmerCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasItems={items.length > 0} onAdd={() => setAddOpen(true)} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            <AnimatePresence>
              {filtered.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={handleEdit}
                  onDelete={handleDelete}
                  onMarkWorn={markWorn}
                  onMarkClean={markClean}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <FAB onClick={() => { setEditItem(null); setAddOpen(true); }} />

      <AddItemModal
        open={addOpen}
        onClose={handleCloseAdd}
        onSave={handleSave}
        editItem={editItem}
      />
      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={bulkAddItems}
      />
    </div>
  );
}

function EmptyState({ hasItems, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <span className="text-6xl mb-4">{hasItems ? '🔍' : '👗'}</span>
      <h3 className="text-base font-bold text-primary mb-2">
        {hasItems ? 'No matching items' : 'Your wardrobe is empty'}
      </h3>
      <p className="text-sm text-muted mb-6">
        {hasItems
          ? 'Try adjusting your filters or search term.'
          : 'Add your first piece or import your existing wardrobe from a JSON file.'}
      </p>
      {!hasItems && (
        <button
          onClick={onAdd}
          className="bg-primary text-white rounded-xl px-5 py-3 text-sm font-bold"
        >
          Add First Item
        </button>
      )}
    </div>
  );
}
