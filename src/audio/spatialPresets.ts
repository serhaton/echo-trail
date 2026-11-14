import type { Difficulty } from '../game/difficulty';

import type { SpatialParams } from './spatialMath';

export type { Difficulty };

/**
 * Difficulty presets for the target sound.
 *
 * Distances are in world units. In the stage-2 prototype one world unit is
 * one screen point; real levels will use the same scale (the camera maps the
 * level onto the screen), so these numbers carry over.
 *
 * Harder = the target is quieter and duller when far away, and the stereo
 * image is narrower, so you have to listen more carefully.
 *
 * Tuning history:
 *   v2 (playtest 1) — far sound quieter (minGain 0.07 → 0.035, curve 1.8 → 2.2),
 *   stronger behind cue (cutoff ×0.3, gain ×0.7) plus new pitch cue.
 *   v3 (playtester idea) — pulse mode: strikes speed up as you approach.
 *   v4 (playtest 3) — slower top speed up close (0.22 → 0.4 s; hard 0.35 → 0.5 s).
 */
const base: SpatialParams = {
  refDistance: 30,
  maxDistance: 700,
  minGain: 0.035, // ≈ −29 dB at max distance
  gainCurve: 2.2,
  maxPan: 0.9,
  nearFieldRadius: 45,
  nearCutoffHz: 18000,
  farCutoffHz: 1400,
  behindCutoffFactor: 0.3,
  behindGainFactor: 0.7,
  behindPitchFactor: 0.89, // ≈ −2 semitones directly behind
  pulseMaxInterval: 1.5, // far away: one strike every 1.5 s
  pulseMinInterval: 0.4, // right next to it: 2.5 strikes per second
};

export const spatialPresets: Record<Difficulty, SpatialParams> = {
  easy: { ...base, minGain: 0.07, gainCurve: 1.8, farCutoffHz: 2600, maxPan: 0.95 },
  normal: base,
  // Hard: smaller rate change, so the rhythm gives away less.
  hard: {
    ...base,
    minGain: 0.02,
    farCutoffHz: 800,
    maxPan: 0.75,
    gainCurve: 2.6,
    pulseMaxInterval: 1.3,
    pulseMinInterval: 0.5,
  },
};

/**
 * Hidden collectibles: only audible nearby (silent beyond maxDistance, so
 * they must be discovered), quieter than the target, gentle behind-cue.
 */
export const collectibleParams: SpatialParams = {
  ...base,
  refDistance: 18,
  maxDistance: 220,
  minGain: 0,
  gainCurve: 1.6,
  farCutoffHz: 2500,
};

/**
 * Tension's chaser: faint from far away, unmistakable up close, and with
 * the full behind-cue so you can tell when it is at your back.
 */
export const chaserParams: SpatialParams = {
  ...base,
  refDistance: 25,
  maxDistance: 520,
  minGain: 0.02,
  gainCurve: 2.0,
  farCutoffHz: 500,
};

/** Variants of the behind cue, for A/B testing in the Audio Lab. */
export type BehindCueMode = 'off' | 'muffle' | 'muffleAndPitch';

export function withBehindCue(params: SpatialParams, mode: BehindCueMode): SpatialParams {
  switch (mode) {
    case 'off':
      return { ...params, behindCutoffFactor: 1, behindGainFactor: 1, behindPitchFactor: 1 };
    case 'muffle':
      return { ...params, behindPitchFactor: 1 };
    case 'muffleAndPitch':
      return params;
  }
}
