/** Small colour helpers (hex strings, no dependencies). */

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function toHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Linear mix of two hex colours, t in 0..1. */
export function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

/**
 * Colour at position `t` along a looping palette, e.g. a trail that
 * cycles peach → honey → sage → sky → lavender → peach …
 * `t` is measured in palette steps (1 = one colour further).
 */
export function cyclePalette(palette: readonly string[], t: number): string {
  const n = palette.length;
  if (n === 0) return '#ffffff';
  const wrapped = ((t % n) + n) % n;
  const i = Math.floor(wrapped);
  const frac = wrapped - i;
  return mixHex(palette[i]!, palette[(i + 1) % n]!, frac);
}

/** Append an alpha channel (0..1) to a #rrggbb colour. */
export function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${a}`;
}
