import type { PaletteKey } from '@/theme';

/** Every mode the game knows about, including ones not released yet. */
export type ModeId = 'zen' | 'mystery' | 'tension' | 'cheerful';

/** How the mode reacts when the countdown reaches zero. */
export type TimeoutBehavior =
  /** Level continues; finishing it only awards 1 star (Zen). */
  | 'continue'
  /** Level is lost; offer "retry" or "watch ad for +15s" (Mystery and later). */
  | 'fail';

/** The sound that communicates remaining time in this mode. */
export type TimeSoundKind = 'fadingBell' | 'acceleratingClock' | 'heartbeat' | 'chime';

/**
 * Static description of a mode (journey).
 *
 * A new mode is enabled by adding a definition file next to this one,
 * registering it in `index.ts`, and providing its levels, sounds and images.
 * No game-engine code should need to change.
 */
export interface ModeDefinition {
  id: ModeId;
  /** `comingSoon` modes are listed in the menu but cannot be played. */
  status: 'available' | 'comingSoon';
  /** Shows a "not family friendly" warning in the menu when false. */
  familyFriendly: boolean;
  palette: PaletteKey;
  timeSound: TimeSoundKind;
  timeoutBehavior: TimeoutBehavior;
  /** Room echo amount for this world (0 = open air). See AudioEngine.setReverb. */
  reverb: number;
  /** A chaser hunts the player (levels define where it starts). */
  chaser?: boolean;
  /** World units of walking per trail colour step (default 180). */
  trailColorStep?: number;
  /** Translation keys (see src/i18n/en.ts → modes.<id>). */
  i18nKey: `modes.${ModeId}`;
}
