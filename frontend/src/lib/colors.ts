const COLOR_NAME_TO_HEX: Record<string, string> = {
  black: '#171717',
  white: '#F5F5F5',
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#22C55E',
  yellow: '#EAB308',
  orange: '#F97316',
  purple: '#A855F7',
  pink: '#EC4899',
  brown: '#92400E',
  beige: '#D4C4A8',
  tan: '#D2B48C',
  khaki: '#C3B091',
  navy: '#1E3A5F',
  grey: '#9CA3AF',
  gray: '#9CA3AF',
  silver: '#C0C0C0',
  gold: '#D4A843',
  maroon: '#7F1D1D',
  teal: '#14B8A6',
  cyan: '#06B6D4',
  lime: '#84CC16',
  olive: '#65A30D',
  cream: '#FFFDD0',
  ivory: '#FFFFF0',
};

function hashToColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 62%, 42%)`;
}

export function getVariantColorHex(color?: string, colorHex?: string): string {
  const hex = (colorHex || '').trim();
  if (hex) {
    return hex.startsWith('#') ? hex : `#${hex}`;
  }

  const name = (color || '').trim().toLowerCase();
  if (!name) return '#9CA3AF';

  const compact = name.replace(/\s+/g, '').replace(/-/g, '');
  if (COLOR_NAME_TO_HEX[compact]) return COLOR_NAME_TO_HEX[compact];

  for (const [key, value] of Object.entries(COLOR_NAME_TO_HEX)) {
    if (compact.includes(key) || key.includes(compact)) return value;
  }

  for (const word of name.split(/\s+/)) {
    if (COLOR_NAME_TO_HEX[word]) return COLOR_NAME_TO_HEX[word];
  }

  return hashToColor(name);
}

export function isLightColor(hex: string): boolean {
  if (hex.startsWith('hsl')) return false;
  const value = hex.replace('#', '');
  if (value.length < 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.75;
}
