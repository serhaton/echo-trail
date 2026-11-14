import type { ProgressData } from '@/services/progress';

/**
 * Screenshot mode: used only to produce App Store screenshots.
 *
 * Enabled by building with EXPO_PUBLIC_SCREENSHOT_MODE=1 (see
 * scripts/take-screenshots.sh). The value is inlined at bundle time, so in
 * every normal build this is the constant `false` and all code behind it
 * is removed.
 *
 * When on:
 *   - ads and purchases are not started (no tracking prompt over the UI);
 *   - the first-launch intro is treated as seen;
 *   - progress is a fixed, in-memory demo save (nothing is written);
 *   - a level opened with ?demo=1 plays itself: the dot walks the route to
 *     the target so the trail, hint, rings and reveal can be captured.
 */
export const SCREENSHOT_MODE = process.env.EXPO_PUBLIC_SCREENSHOT_MODE === '1';

/** A believable mid-game save for journey and album screenshots. */
export function demoProgress(): ProgressData {
  const levels: ProgressData['levels'] = {};
  const fill = (mode: string, stars: number[]) =>
    stars.forEach((s, i) => {
      const id = `${mode}-${String(i + 1).padStart(2, '0')}`;
      levels[id] = { stars: s as 1 | 2 | 3, collected: [`${id}-story`, `${id}-album`] };
    });
  fill('zen', [3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 3, 3, 2]);
  fill('mystery', [3, 2, 3, 3, 2, 3, 3, 2, 3]);
  fill('tension', [3, 2, 2, 3]);
  fill('cheerful', [3, 3, 3, 2, 3, 3]);
  return { version: 1, levels, completions: 0 };
}
