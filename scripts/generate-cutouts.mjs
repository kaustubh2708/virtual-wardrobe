// One-off batch job: download each seed item's product photo, remove the
// background locally (@imgly/background-removal-node — same model as the
// in-app button, but server-side fetch dodges the store CDNs' CORS blocks),
// and write transparent PNGs to public/cutouts/. seedWardrobe.js then points
// image_url at these local assets so the closet shows cutouts everywhere
// with zero runtime work.
//
// Usage: node scripts/generate-cutouts.mjs
import { removeBackground } from '@imgly/background-removal-node';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// id → source URL, copied from src/data/seedWardrobe.js (only items that have
// a stock photo; the rest show a category emoji until they're photographed).
const SOURCES = {
  'seed-1': 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/479733/item/goods_09_479733_3x4.jpg',
  // Uniqlo colour codes were probed per product to find the *flat* garment-only
  // shot in the owned colour (many codes serve on-model photos, which would cut
  // out the model instead of the garment):
  'seed-2': 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/460940/item/goods_08_460940_3x4.jpg', // grey — owned colour
  'seed-3': 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/478546/item/goods_32_478546_3x4.jpg', // beige — owned colour
  'seed-4': 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/462197/item/goods_09_462197_3x4.jpg', // black — owned colour
  'seed-5': 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/479134/item/goods_57_479134_3x4.jpg', // olive — owned colour
  'seed-6': 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/475361/item/goods_08_475361_3x4.jpg', // dark grey — closest flat to owned black
  'seed-7': 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/465185/item/goods_70_465185_3x4.jpg', // off-white/cream flat — owned colour
  'seed-23': 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/465185/item/goods_57_465185_3x4.jpg', // olive flat — second AIRism tee the owner has
  'seed-8': 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/477814/item/goods_27_477814_3x4.jpg',
  'seed-10': 'https://assets.adidas.com/images/w_600,f_auto,q_auto/c5eb1caf2f7f42648f7d12bfd38b7540_9366/Ligra_8_Indoor_Shoes_White_IH8118.jpg',
  'seed-11': 'https://images-static.nykaa.com/media/catalog/product/6/1/619b283bq2261-3p-1.jpg',
  'seed-15': 'https://images.bewakoof.com/original/men-s-black-stoned-panda-graphic-printed-oversized-t-shirt-592028-1684136966-1.jpg',
  'seed-16': 'https://assets.ajio.com/medias/sys_master/root/hc6/h2a/9882010845214/-78Wx98H-460076129-white-MODEL.jpg',
  'seed-20': 'https://assets.ajio.com/medias/sys_master/root/20210205/1GCo/601c4960aeb26969815dddcd/-78Wx98H-460836102-black-MODEL.jpg',
  'seed-21': 'https://assets.adidas.com/images/w_600,f_auto,q_auto/ee970571606246058c1ad7850cc55f09_9366/GRAND_COURT_2.0_SHOES_Black_JR0546_HM1.jpg',
};

const OUT_DIR = path.resolve('public/cutouts');
await mkdir(OUT_DIR, { recursive: true });

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

let ok = 0, failed = [];
for (const [id, url] of Object.entries(SOURCES)) {
  const out = path.join(OUT_DIR, `${id}.png`);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' } });
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const blob = await res.blob();
    const cut = await removeBackground(blob, { output: { format: 'image/png' } });
    await writeFile(out, Buffer.from(await cut.arrayBuffer()));
    ok++;
    console.log(`✓ ${id}  (${Math.round(cut.size / 1024)} KB)`);
  } catch (err) {
    failed.push(id);
    console.error(`✗ ${id}: ${err.message}`);
  }
}
console.log(`\nDone: ${ok} cutouts, ${failed.length} failed${failed.length ? ' → ' + failed.join(', ') : ''}`);
