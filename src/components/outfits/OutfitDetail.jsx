import { useState, useEffect } from 'react';
import { Download, Check, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { CATEGORY_EMOJI } from '../../constants/categories';
import { buildFlatLay } from '../../lib/collage';

export default function OutfitDetail({ outfit, open, onClose, onDelete, onMarkWorn }) {
  const [flatLay, setFlatLay] = useState(null);
  const [building, setBuilding] = useState(false);
  const [worn, setWorn] = useState(false);

  const items = outfit?.outfit_items || [];

  useEffect(() => {
    setWorn(false);
    setFlatLay(null);
    if (!open || !outfit) return;
    let alive = true;
    setBuilding(true);
    buildFlatLay(items)
      .then((url) => { if (alive) setFlatLay(url); })
      .catch(() => {})
      .finally(() => { if (alive) setBuilding(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, outfit?.id]);

  if (!outfit) return null;

  async function handleWorn() {
    await onMarkWorn?.(outfit);
    setWorn(true);
  }

  return (
    <Modal open={open} onClose={onClose} title={outfit.name}>
      <div className="flex flex-col gap-4">
        {/* Flat-lay */}
        <div className="w-full aspect-square bg-accent-light rounded-2xl overflow-hidden flex items-center justify-center">
          {building ? (
            <span className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          ) : flatLay ? (
            <img src={flatLay} alt={outfit.name} className="w-full h-full object-contain" />
          ) : (
            <div className="grid grid-cols-2 gap-2 p-4">
              {items.slice(0, 4).map((oi, i) => (
                oi.wardrobe_items?.image_url ? (
                  <img key={i} src={oi.wardrobe_items.image_url} alt="" className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <span key={i} className="text-4xl flex items-center justify-center">{CATEGORY_EMOJI[oi.item_role] || '👔'}</span>
                )
              ))}
            </div>
          )}
        </div>

        {flatLay && (
          <a
            href={flatLay}
            download={`${outfit.name.replace(/\s+/g, '-').toLowerCase()}-flatlay.png`}
            className="flex items-center justify-center gap-1.5 text-xs font-bold border border-border rounded-xl py-2.5 text-primary active:scale-95 transition-transform"
          >
            <Download size={14} /> Download flat-lay
          </a>
        )}

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          {outfit.occasion && <Tag>{outfit.occasion}</Tag>}
          <span className="text-[11px] text-muted">
            {items.length} piece{items.length !== 1 ? 's' : ''}
            {outfit.times_worn > 0 && ` · worn ${outfit.times_worn}×`}
          </span>
        </div>

        {/* Item list */}
        <div className="flex flex-col gap-2">
          {items.map((oi, i) => (
            <div key={i} className="flex items-center gap-3">
              {oi.wardrobe_items?.image_url ? (
                <img src={oi.wardrobe_items.image_url} alt="" className="w-11 h-11 object-contain bg-accent-light rounded-lg" />
              ) : (
                <span className="text-2xl w-11 h-11 flex items-center justify-center bg-accent-light rounded-lg">
                  {CATEGORY_EMOJI[oi.item_role] || '👔'}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-primary truncate">{oi.wardrobe_items?.name || oi.item_role}</p>
                <p className="text-[11px] text-muted">{oi.wardrobe_items?.color_primary || oi.item_role}</p>
              </div>
            </div>
          ))}
        </div>

        {outfit.notes && (
          <p className="text-[11px] text-muted italic border-t border-border pt-3">{outfit.notes}</p>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => { onDelete?.(outfit.id); onClose(); }}
            className="flex items-center justify-center gap-1.5 text-xs font-bold border border-border rounded-xl px-4 py-2.5 text-red-500"
          >
            <Trash2 size={14} /> Delete
          </button>
          <Button onClick={handleWorn} disabled={worn} className="flex-1">
            {worn ? <><Check size={14} className="inline mr-1" /> Logged</> : 'Wore this today'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
