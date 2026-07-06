import { useState } from 'react';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { CATEGORY_EMOJI, OCCASIONS } from '../../constants/categories';
import { useWardrobe } from '../../context/WardrobeContext';

const ROLES = ['Top', 'Bottom', 'Footwear', 'Outerwear', 'Accessory'];

export default function OutfitBuilder({ open, onClose }) {
  const { items, addOutfit } = useWardrobe();
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState({}); // role → item
  const [pickingRole, setPickingRole] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function selectItem(role, item) {
    setSelected(s => ({ ...s, [role]: item }));
    setPickingRole(null);
  }

  function removeItem(role) {
    setSelected(s => { const n = { ...s }; delete n[role]; return n; });
  }

  async function handleSave() {
    if (!name.trim()) { setError('Give this outfit a name'); return; }
    const itemRoles = Object.entries(selected).map(([role, item]) => ({ itemId: item.id, role }));
    if (!itemRoles.length) { setError('Add at least one item'); return; }
    setSaving(true);
    setError('');
    try {
      await addOutfit({ name: name.trim(), occasion, notes }, itemRoles);
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to save outfit');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setName(''); setOccasion(''); setNotes('');
    setSelected({}); setPickingRole(null); setError('');
    onClose();
  }

  // Item picker sub-view
  if (pickingRole) {
    const roleItems = items.filter(i =>
      i.category === pickingRole || (pickingRole === 'Accessory' && i.category === 'Accessory')
    );
    return (
      <Modal open={open} onClose={() => setPickingRole(null)} title={`Pick ${pickingRole}`}>
        <div className="flex flex-col gap-2">
          <button onClick={() => setPickingRole(null)} className="text-xs text-muted mb-1">← Back to outfit</button>
          {roleItems.length === 0 ? (
            <div className="text-center py-10">
              <span className="text-4xl block mb-2">{CATEGORY_EMOJI[pickingRole]}</span>
              <p className="text-sm text-muted">No {pickingRole} items in your wardrobe yet.</p>
            </div>
          ) : (
            roleItems.map(item => (
              <button
                key={item.id}
                onClick={() => selectItem(pickingRole, item)}
                className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border hover:border-accent transition-colors text-left"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-12 h-12 object-cover rounded-xl" />
                ) : (
                  <span className="text-3xl w-12 h-12 flex items-center justify-center bg-accent-light rounded-xl">
                    {CATEGORY_EMOJI[item.category]}
                  </span>
                )}
                <div>
                  <p className="text-sm font-bold text-primary">{item.name}</p>
                  <p className="text-xs text-muted">{item.color_primary} · {item.brand}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Build Outfit">
      <div className="flex flex-col gap-4">
        <Input
          label="Outfit Name *"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Weekend Linen Look"
        />

        <Select label="Occasion" value={occasion} onChange={e => setOccasion(e.target.value)}>
          <option value="">—</option>
          {OCCASIONS.map(o => <option key={o}>{o}</option>)}
        </Select>

        {/* Item slots */}
        <div>
          <label className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold block mb-2">Items</label>
          <div className="flex flex-col gap-2">
            {ROLES.map(role => (
              <div key={role} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{CATEGORY_EMOJI[role]}</span>
                {selected[role] ? (
                  <div className="flex-1 flex items-center justify-between bg-accent-light rounded-xl px-3 py-2">
                    <div>
                      <p className="text-xs font-bold text-primary">{selected[role].name}</p>
                      <p className="text-[11px] text-muted">{selected[role].color_primary}</p>
                    </div>
                    <button onClick={() => removeItem(role)} className="text-muted text-xs">✕</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setPickingRole(role)}
                    className="flex-1 border border-dashed border-border rounded-xl px-3 py-2 text-xs text-muted text-left hover:border-accent transition-colors"
                  >
                    + Add {role}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Input
          label="Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any styling notes..."
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} loading={saving} className="flex-1">Save Outfit</Button>
        </div>
      </div>
    </Modal>
  );
}
