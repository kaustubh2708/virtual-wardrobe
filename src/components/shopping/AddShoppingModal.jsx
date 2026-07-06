import { useState } from 'react';
import Modal from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';

const EMPTY = { name: '', store: '', estimated_price_inr: '', status: 'ToBuy', notes: '' };

export default function AddShoppingModal({ open, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Item name is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        estimated_price_inr: form.estimated_price_inr ? Number(form.estimated_price_inr) : null,
      });
      setForm(EMPTY);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add to Shopping List">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Item Name *" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. White Linen Shirt" required />
        <Input label="Store" value={form.store} onChange={e => set('store', e.target.value)} placeholder="e.g. H&M / Sarojini" />
        <Input label="Estimated Price (₹)" type="number" value={form.estimated_price_inr} onChange={e => set('estimated_price_inr', e.target.value)} placeholder="999" />
        <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="ToBuy">To Buy</option>
          <option value="Wishlist">Wishlist</option>
          <option value="Bought">Already Bought</option>
        </Select>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1" loading={saving}>Add Item</Button>
        </div>
      </form>
    </Modal>
  );
}
