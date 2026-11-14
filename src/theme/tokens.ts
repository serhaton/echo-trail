/**
 * Layout, typography and motion tokens.
 * Use these instead of magic numbers so the whole app keeps one rhythm.
 */

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  /** Large, airy title (main menu logo). */
  display: { fontSize: 40, fontWeight: '200', letterSpacing: 6 },
  title: { fontSize: 26, fontWeight: '300', letterSpacing: 1.5 },
  subtitle: { fontSize: 17, fontWeight: '400', letterSpacing: 0.5 },
  body: { fontSize: 15, fontWeight: '400', letterSpacing: 0.2 },
  caption: { fontSize: 12, fontWeight: '500', letterSpacing: 1.2 },
} as const;

/**
 * Motion durations (ms). Everything in Echo Trail should feel soft and slow;
 * avoid snappy UI animations.
 */
export const motion = {
  fast: 180,
  normal: 320,
  slow: 600,
  /** Full cycle of the "breathing" glow on idle elements. */
  breathe: 3200,
  /** Image reveal at level end. */
  reveal: 2400,
} as const;

/** Max width for menu content so iPad layouts stay comfortable. */
export const layout = {
  contentMaxWidth: 480,
} as const;
