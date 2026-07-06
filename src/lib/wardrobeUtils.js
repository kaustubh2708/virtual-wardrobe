export function costPerWear(item) {
  if (!item.original_price_inr || !item.times_worn || item.times_worn === 0) return null;
  return Math.round(item.original_price_inr / item.times_worn);
}

export function formatINR(amount) {
  if (amount == null) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function detectDuplicate(newItem, existingItems) {
  return existingItems.find(
    (item) =>
      item.category === newItem.category &&
      item.color_primary === newItem.color_primary &&
      item.fit_type === newItem.fit_type &&
      item.id !== newItem.id
  );
}

export function getOccasionCoverage(items) {
  const occasions = ['Casual', 'Office', 'Night Out'];
  return occasions.map((occ) => ({
    occasion: occ,
    count: items.filter((i) => i.occasion && i.occasion.includes(occ)).length,
  }));
}

export function totalWardrobeValue(items) {
  return items.reduce((sum, i) => sum + (i.original_price_inr || 0), 0);
}

export function totalWears(items) {
  return items.reduce((sum, i) => sum + (i.times_worn || 0), 0);
}

export function daysSince(dateStr) {
  if (!dateStr) return null;
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86400000);
}

// "Dead stock": items never worn, or not worn in `days`+ days. This is the
// nudge loop — surface what's languishing so the user rotates it or sells it.
export function getDeadStock(items, days = 60) {
  return items
    .map((i) => ({ ...i, idleDays: daysSince(i.last_worn_at) }))
    .filter((i) => !i.times_worn || i.idleDays == null || i.idleDays >= days)
    .sort((a, b) => {
      // Never-worn first, then longest idle.
      const aw = a.times_worn || 0;
      const bw = b.times_worn || 0;
      if (aw !== bw) return aw - bw;
      return (b.idleDays || 0) - (a.idleDays || 0);
    });
}

// Map Gemini JSON field names to our schema
export function mapGeminiItem(raw) {
  return {
    name: raw.name || raw.item_name || 'Unnamed Item',
    brand: raw.brand || null,
    category: normaliseCategory(raw.category),
    subcategory: raw.subcategory || raw.type || null,
    color_primary: raw.color_primary || raw.colour || raw.color || null,
    color_secondary: raw.color_secondary || null,
    size: raw.size || null,
    fit_type: raw.fit_type || raw.fit || null,
    fabric: raw.fabric || raw.material || null,
    occasion: Array.isArray(raw.occasion) ? raw.occasion : raw.occasion ? [raw.occasion] : [],
    season: Array.isArray(raw.season) ? raw.season : raw.season ? [raw.season] : [],
    condition: raw.condition || 'Good',
    original_price_inr: raw.original_price_inr || raw.price || raw.price_inr || null,
    care_instructions: Array.isArray(raw.care_instructions) ? raw.care_instructions : [],
    image_url: raw.image_url || null,
    needs_photo: raw.needs_photo || !raw.image_url,
    times_worn: raw.times_worn || 0,
    status: raw.status || 'Clean',
    notes: raw.notes || null,
  };
}

function normaliseCategory(cat) {
  if (!cat) return 'Top';
  const c = cat.toLowerCase();
  if (c.includes('top') || c.includes('shirt') || c.includes('tee') || c.includes('polo') || c.includes('hoodie') || c.includes('sweat')) return 'Top';
  if (c.includes('bottom') || c.includes('pant') || c.includes('jean') || c.includes('trouser') || c.includes('short') || c.includes('chino')) return 'Bottom';
  if (c.includes('foot') || c.includes('shoe') || c.includes('sneak') || c.includes('loafer') || c.includes('boot') || c.includes('sandal')) return 'Footwear';
  if (c.includes('outer') || c.includes('jacket') || c.includes('blazer') || c.includes('coat') || c.includes('bomber')) return 'Outerwear';
  if (c.includes('access') || c.includes('belt') || c.includes('watch') || c.includes('bag') || c.includes('cap')) return 'Accessory';
  return cat;
}
