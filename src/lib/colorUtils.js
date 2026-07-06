import { COLOUR_MAP, SKIN_TONE_COLOURS } from '../constants/categories';

export function getColourHex(colorName) {
  return COLOUR_MAP[colorName] || '#e0e0e0';
}

export function isGoodForSkinTone(colorName) {
  return SKIN_TONE_COLOURS.best.includes(colorName);
}

// Simple colour compatibility — earth tones palette
const COMPATIBLE_GROUPS = [
  ['White', 'Off-White', 'Cream', 'Beige', 'Sand'],
  ['Olive', 'Sage', 'Camel', 'Brown'],
  ['Black', 'Charcoal', 'Navy'],
  ['Rust', 'Terracotta', 'Burgundy'],
];

export function areColoursCompatible(c1, c2) {
  for (const group of COMPATIBLE_GROUPS) {
    if (group.includes(c1) && group.includes(c2)) return true;
  }
  // neutrals go with everything
  const neutrals = ['White', 'Off-White', 'Cream', 'Black', 'Charcoal', 'Navy', 'Grey'];
  if (neutrals.includes(c1) || neutrals.includes(c2)) return true;
  return false;
}

export function getPaletteFromItems(items) {
  const counts = {};
  items.forEach((item) => {
    const c = item.color_primary;
    if (c) counts[c] = (counts[c] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([colour, count]) => ({ colour, count, hex: getColourHex(colour) }));
}
