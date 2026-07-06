import { useState, useEffect } from 'react';
import { Sparkles, Scissors } from 'lucide-react';
import Modal from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { CATEGORIES, SUBCATEGORIES, OCCASIONS, FIT_TYPES, SEASONS, CONDITIONS, COLOURS } from '../../constants/categories';
import { uploadImage } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';
import { DEMO_MODE, HAS_GEMINI_KEY } from '../../lib/demoMode';
import { fileToDataUrl } from '../../lib/localStore';
import { callGeminiJSON, fileToGeminiImage } from '../../lib/gemini';
import { TAG_SYSTEM_PROMPT, TAG_USER_PROMPT, ITEM_TAG_SCHEMA } from '../../lib/prompts';
import { removeBg } from '../../lib/bgRemove';

const EMPTY = {
  name: '', brand: '', category: 'Top', subcategory: '', color_primary: '', color_secondary: '',
  size: '', fit_type: 'Regular', fabric: '', occasion: [], season: [],
  condition: 'Good', original_price_inr: '', care_instructions: [], image_url: '',
  needs_photo: false, status: 'Clean', notes: '',
};

// Merge AI-tagged fields into the form without stomping anything the user typed.
function applyTags(prev, t) {
  const next = { ...prev };
  if (t.name && !prev.name) next.name = t.name;
  if (t.brand && !prev.brand) next.brand = t.brand;
  if (t.category && CATEGORIES.includes(t.category)) next.category = t.category;
  if (t.subcategory && (SUBCATEGORIES[next.category] || []).includes(t.subcategory)) next.subcategory = t.subcategory;
  if (t.color_primary && COLOURS.includes(t.color_primary)) next.color_primary = t.color_primary;
  if (t.color_secondary && COLOURS.includes(t.color_secondary)) next.color_secondary = t.color_secondary;
  if (t.fabric && !prev.fabric) next.fabric = t.fabric;
  if (t.fit_type && FIT_TYPES.includes(t.fit_type)) next.fit_type = t.fit_type;
  if (t.condition && CONDITIONS.includes(t.condition)) next.condition = t.condition;
  if (Array.isArray(t.occasion) && t.occasion.length && !prev.occasion.length)
    next.occasion = t.occasion.filter((o) => OCCASIONS.includes(o));
  if (Array.isArray(t.season) && t.season.length && !prev.season.length)
    next.season = t.season.filter((s) => SEASONS.includes(s));
  if (t.notes && !prev.notes) next.notes = t.notes;
  return next;
}

export default function AddItemModal({ open, onClose, onSave, editItem }) {
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [tagging, setTagging] = useState(false);
  const [bgRemoving, setBgRemoving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [lastFile, setLastFile] = useState(null); // keep raw file for re-tagging
  const { session } = useUser();

  useEffect(() => {
    if (editItem) setForm({ ...EMPTY, ...editItem });
    else setForm(EMPTY);
    setError(''); setNotice(''); setLastFile(null);
  }, [editItem, open]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleArray(field, value) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));
  }

  // Persist an image (data URL in demo mode, Supabase Storage otherwise).
  async function storeImage(fileOrBlob, filename) {
    if (DEMO_MODE) return fileToDataUrl(fileOrBlob);
    const file = fileOrBlob instanceof File
      ? fileOrBlob
      : new File([fileOrBlob], filename, { type: fileOrBlob.type || 'image/png' });
    const path = `${session.user.id}/items/${Date.now()}-${filename}`;
    return uploadImage(file, path);
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(''); setNotice('');
    try {
      const url = await storeImage(file, file.name);
      set('image_url', url);
      set('needs_photo', false);
      setLastFile(file);
      if (HAS_GEMINI_KEY) autoTag(file); // fire-and-forget; fills the form
    } catch {
      setError('Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function autoTag(file) {
    if (!file || !HAS_GEMINI_KEY) return;
    setTagging(true);
    setNotice('');
    try {
      const image = await fileToGeminiImage(file);
      const tags = await callGeminiJSON({
        system: TAG_SYSTEM_PROMPT,
        prompt: TAG_USER_PROMPT,
        image,
        schema: ITEM_TAG_SCHEMA,
        temperature: 0.2,
      });
      setForm((f) => applyTags(f, tags));
      setNotice('✨ Details auto-filled from your photo — tweak anything below.');
    } catch {
      setNotice('Could not auto-read the photo — fill the details in yourself.');
    } finally {
      setTagging(false);
    }
  }

  async function handleRemoveBg() {
    if (!form.image_url) return;
    setBgRemoving(true);
    setError('');
    try {
      const blob = await removeBg(form.image_url);
      const url = await storeImage(blob, `cutout-${Date.now()}.png`);
      set('image_url', url);
      setNotice('Background removed.');
    } catch {
      setError('Background removal failed — the image may be too complex or blocked by CORS.');
    } finally {
      setBgRemoving(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.category) { setError('Name and category are required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        original_price_inr: form.original_price_inr ? Number(form.original_price_inr) : null,
        subcategory: form.subcategory || null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  }

  const busy = tagging || bgRemoving;

  return (
    <Modal open={open} onClose={onClose} title={editItem ? 'Edit Item' : 'Add Item'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Image */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold">Photo</label>
          <div className="relative">
            {form.image_url ? (
              <div className="relative">
                <img src={form.image_url} alt="item" className="w-full h-40 object-contain bg-accent-light rounded-xl" />
                <button type="button" onClick={() => { set('image_url', ''); setLastFile(null); }} className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs text-red-500 shadow">Remove</button>
                {busy && (
                  <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer bg-accent-light/50 hover:bg-accent-light transition-colors">
                {uploading ? (
                  <span className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="text-2xl mb-1">📷</span>
                    <span className="text-xs text-muted">Tap to add a photo</span>
                    {HAS_GEMINI_KEY && <span className="text-[10px] text-accent mt-0.5">✨ AI fills the details for you</span>}
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
              </label>
            )}
          </div>

          {/* Photo actions */}
          {form.image_url && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRemoveBg}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold border border-border rounded-lg py-2 text-primary disabled:opacity-50"
              >
                <Scissors size={12} /> {bgRemoving ? 'Removing…' : 'Clean up background'}
              </button>
              {HAS_GEMINI_KEY && lastFile && (
                <button
                  type="button"
                  onClick={() => autoTag(lastFile)}
                  disabled={busy}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold border border-border rounded-lg py-2 text-accent disabled:opacity-50"
                >
                  <Sparkles size={12} /> {tagging ? 'Reading…' : 'Re-tag with AI'}
                </button>
              )}
            </div>
          )}

          {notice && <p className="text-[11px] text-accent">{notice}</p>}
        </div>

        <Input label="Name *" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. White Linen Shirt" required />
        <Input label="Brand" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="e.g. H&M" />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Category *" value={form.category} onChange={(e) => { set('category', e.target.value); set('subcategory', ''); }}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select label="Subcategory" value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)}>
            <option value="">—</option>
            {(SUBCATEGORIES[form.category] || []).map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Primary Colour" value={form.color_primary} onChange={(e) => set('color_primary', e.target.value)}>
            <option value="">—</option>
            {COLOURS.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Select label="Secondary Colour" value={form.color_secondary} onChange={(e) => set('color_secondary', e.target.value)}>
            <option value="">—</option>
            {COLOURS.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Fit" value={form.fit_type} onChange={(e) => set('fit_type', e.target.value)}>
            <option value="">—</option>
            {FIT_TYPES.map((f) => <option key={f}>{f}</option>)}
          </Select>
          <Input label="Size" value={form.size} onChange={(e) => set('size', e.target.value)} placeholder="M / 40 / 32" />
        </div>

        <Input label="Fabric" value={form.fabric} onChange={(e) => set('fabric', e.target.value)} placeholder="e.g. 100% Linen" />

        {/* Occasions */}
        <div>
          <label className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold block mb-2">Occasions</label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => (
              <button
                key={occ} type="button"
                onClick={() => toggleArray('occasion', occ)}
                className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors font-medium ${
                  form.occasion.includes(occ)
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        {/* Seasons */}
        <div>
          <label className="text-[10px] uppercase tracking-[1.5px] text-muted font-bold block mb-2">Season</label>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => (
              <button
                key={s} type="button"
                onClick={() => toggleArray('season', s)}
                className={`text-[11px] px-3 py-1.5 rounded-full border transition-colors font-medium ${
                  form.season.includes(s)
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Condition" value={form.condition} onChange={(e) => set('condition', e.target.value)}>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </Select>
          <Input label="Price (₹)" type="number" value={form.original_price_inr} onChange={(e) => set('original_price_inr', e.target.value)} placeholder="999" />
        </div>

        <Textarea label="Notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Any notes about this item..." />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" className="flex-1" loading={saving}>
            {editItem ? 'Save Changes' : 'Add to Wardrobe'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
