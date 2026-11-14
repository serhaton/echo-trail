/**
 * Base colour tokens shared by every screen.
 *
 * The game is "dark but beautiful": almost everything sits on a near-black
 * background, and the few lit elements carry the mood. Keep this palette
 * small; mode-specific colour lives in `palettes.ts`.
 */
export const colors = {
  /** Near-black with a hint of blue, so pure-black glows don't look flat. */
  background: '#05060A',
  /** Slightly lifted surface for cards / sheets. */
  surface: '#0E1018',
  surfaceRaised: '#161925',
  /** Hairline borders and dividers. */
  border: 'rgba(255, 255, 255, 0.08)',

  textPrimary: '#EDEFF5',
  textSecondary: '#9AA0B4',
  textMuted: '#5B6075',

  /** Warm candle-like glow used for the player dot and main accents. */
  glow: '#FFF1D6',
  accent: '#F2D8A7',

  danger: '#E5787A',
  success: '#9FD8B5',

  /** Debug overlay colours (developer only). */
  debugObstacle: 'rgba(255, 80, 80, 0.45)',
  debugTarget: 'rgba(80, 220, 255, 0.7)',
  debugCollectible: 'rgba(255, 220, 80, 0.7)',
} as const;

export type ColorToken = keyof typeof colors;
