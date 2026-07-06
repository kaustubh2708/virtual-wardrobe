// Canvas-based flat-lay collage. Composes an outfit's item images into a single
// styled image on a warm neutral background — the free, zero-inference answer to
// "let me see the outfit together". Looks best with background-removed cutouts,
// but works with any thumbnails.

const BG = '#f0ede8'; // matches Tailwind accent-light

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // allow canvas export for CORS-enabled URLs
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed: ' + src));
    img.src = src;
  });
}

// Draw `img` scaled to *contain* within the cell (no cropping, keeps proportions).
function drawContained(ctx, img, cx, cy, cw, ch, pad = 0) {
  const availW = cw - pad * 2;
  const availH = ch - pad * 2;
  const scale = Math.min(availW / img.width, availH / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, cx + (cw - w) / 2, cy + (ch - h) / 2, w, h);
}

/**
 * Build a square flat-lay collage from an outfit's items.
 * @param {Array} outfitItems  outfit.outfit_items entries (need .wardrobe_items.image_url)
 * @param {number} size        output edge in px
 * @returns {Promise<string|null>} PNG data URL, or null if no usable images
 */
export async function buildFlatLay(outfitItems = [], size = 1000) {
  const withImages = outfitItems.filter((oi) => oi.wardrobe_items?.image_url);
  if (!withImages.length) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, size, size);

  const imgs = [];
  for (const oi of withImages.slice(0, 6)) {
    try {
      imgs.push(await loadImage(oi.wardrobe_items.image_url));
    } catch {
      // skip images that fail to load (e.g. tainted/broken) rather than abort
    }
  }
  if (!imgs.length) return null;

  // Grid: 1 → full, 2 → side by side, 3–4 → 2×2, 5–6 → 3×2.
  const n = imgs.length;
  const cols = n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 2 : 3;
  const rows = Math.ceil(n / cols);
  const cellW = size / cols;
  const cellH = size / rows;
  const pad = size * 0.04;

  imgs.forEach((img, i) => {
    const cx = (i % cols) * cellW;
    const cy = Math.floor(i / cols) * cellH;
    drawContained(ctx, img, cx, cy, cellW, cellH, pad);
  });

  try {
    return canvas.toDataURL('image/png');
  } catch {
    // Canvas tainted by a cross-origin image without CORS headers — can't export.
    return null;
  }
}
