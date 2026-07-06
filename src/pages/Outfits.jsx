import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWardrobe } from '../context/WardrobeContext';
import OutfitCard from '../components/outfits/OutfitCard';
import OutfitBuilder from '../components/outfits/OutfitBuilder';
import OutfitDetail from '../components/outfits/OutfitDetail';
import FAB from '../components/ui/FAB';
import { ShimmerCard } from '../components/ui/Shimmer';

export default function Outfits() {
  const { outfits, loading, deleteOutfit, updateOutfit } = useWardrobe();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  async function handleDelete(id) {
    if (!window.confirm('Delete this outfit?')) return;
    await deleteOutfit(id);
  }

  async function handleMarkWorn(outfit) {
    await updateOutfit(outfit.id, {
      times_worn: (outfit.times_worn || 0) + 1,
      last_worn_at: new Date().toISOString().split('T')[0],
    });
  }

  // Keep the open detail view in sync with the latest outfit data.
  const activeOutfit = detail ? outfits.find((o) => o.id === detail.id) || detail : null;

  return (
    <div className="flex flex-col min-h-screen lg:min-h-0 bg-bg lg:rounded-2xl lg:overflow-hidden lg:border lg:border-border lg:shadow-sm">
      <div className="bg-primary text-white px-5 pt-12 pb-4 lg:pt-8 lg:rounded-t-2xl">
        <h1 className="text-xl font-bold mb-1">Outfits</h1>
        <p className="text-white/60 text-xs">{outfits.length} saved looks</p>
      </div>

      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {Array.from({ length: 4 }).map((_, i) => <ShimmerCard key={i} />)}
          </div>
        ) : outfits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <span className="text-6xl mb-4">✨</span>
            <h3 className="text-base font-bold text-primary mb-2">No outfits yet</h3>
            <p className="text-sm text-muted mb-6">Build your first outfit by combining items from your wardrobe.</p>
            <button
              onClick={() => setBuilderOpen(true)}
              className="bg-primary text-white rounded-xl px-5 py-3 text-sm font-bold"
            >
              Build First Outfit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            <AnimatePresence>
              {outfits.map(outfit => (
                <OutfitCard
                  key={outfit.id}
                  outfit={outfit}
                  onClick={setDetail}
                  onDelete={handleDelete}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <FAB onClick={() => setBuilderOpen(true)} />
      <OutfitBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} />
      <OutfitDetail
        outfit={activeOutfit}
        open={!!detail}
        onClose={() => setDetail(null)}
        onDelete={handleDelete}
        onMarkWorn={handleMarkWorn}
      />
    </div>
  );
}
