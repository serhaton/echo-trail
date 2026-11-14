/**
 * Pure spatial-audio math. No React, no audio library — just numbers in,
 * numbers out, so it can be unit-tested and tuned in isolation.
 *
 * Coordinate system (shared with the game world):
 *   - Top-down map, y grows DOWNWARD (same as screen coordinates).
 *   - The listener always faces "up" the screen (north). So a sound drawn to
 *     the right of the player is heard in the right ear, a sound drawn above
 *     is "in front", below is "behind".
 */

import type { Vec2 } from '../game/geometry';

export type { Vec2 };

/** Tunable parameters of the spatial model (see spatialPresets.ts). */
export interface SpatialParams {
  /** Within this distance the source plays at full volume and full clarity. */
  refDistance: number;
  /** At / beyond this distance the source reaches `minGain` and `farCutoffHz`. */
  maxDistance: number;
  /** Volume floor so the target is always faintly audible (0..1). */
  minGain: number;
  /** Shape of the volume fall-off: 1 = linear, 2 = gentle near / fast far. */
  gainCurve: number;
  /** Maximum stereo pan (0..1). Below 1 avoids an unnatural "one ear only". */
  maxPan: number;
  /** Inside this radius the pan collapses toward centre ("it's around you"). */
  nearFieldRadius: number;
  /** Low-pass cutoff when close: effectively unfiltered. */
  nearCutoffHz: number;
  /** Low-pass cutoff at max distance: the sound becomes dull / muffled. */
  farCutoffHz: number;
  /**
   * Extra muffling for sounds behind the listener (0..1 multiplier on the
   * cutoff at directly-behind). Stereo panning alone cannot tell front from
   * back; a darker sound behind you is a learnable cue, like the head shadow
   * in real life. 1 disables the effect.
   */
  behindCutoffFactor: number;
  /** Slight volume drop behind the listener (multiplier at directly-behind). */
  behindGainFactor: number;
  /**
   * Playback-rate multiplier at directly-behind (1 = off, 0.89 ≈ −2
   * semitones). Muffling alone is ambiguous because distance also muffles;
   * pitch is an independent dimension, so "lower = behind me" is a cue the
   * ear can separate from "quieter / duller = far away".
   */
  behindPitchFactor: number;
  /**
   * Pulse-mode sources (a single strike repeated, like a parking sensor):
   * seconds between strikes when far away / when right next to the source.
   * Getting faster as you approach is both a distance cue and a front/back
   * cue: walk "up" — if the pulses speed up, the target is in front.
   */
  pulseMaxInterval: number;
  pulseMinInterval: number;
}

/** Output of the model: what the audio graph should be set to. */
export interface SpatialOutput {
  /** -1 (left) … +1 (right). */
  pan: number;
  /** 0..1 linear gain from distance (before any bus/master volume). */
  gain: number;
  /** Low-pass filter cutoff in Hz. */
  cutoffHz: number;
  /** Playback-rate multiplier (pitch cue for sounds behind). */
  playbackRate: number;
  /** Seconds between strikes for pulse-mode sources. */
  pulseInterval: number;
  /** Distance in world units (handy for debug readouts and game logic). */
  distance: number;
  /** -1 (behind) … +1 (in front). */
  frontness: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Smooth 0→1 transition, avoids audible "edges" when crossing thresholds. */
const smoothstep = (edge0: number, edge1: number, v: number) => {
  const t = clamp01((v - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export function computeSpatial(listener: Vec2, source: Vec2, p: SpatialParams): SpatialOutput {
  const dx = source.x - listener.x;
  const dy = source.y - listener.y;
  const distance = Math.hypot(dx, dy);

  // Direction relative to the listener's forward (up). Guard against d = 0.
  const lateral = distance > 1e-6 ? dx / distance : 0; // sin(angle): + = right
  const frontness = distance > 1e-6 ? -dy / distance : 1; // cos(angle): + = in front

  // --- Pan ------------------------------------------------------------------
  // Fade the pan toward the centre as we get very close, so walking "through"
  // the source doesn't flip it hard from ear to ear.
  const nearField = smoothstep(0, p.nearFieldRadius, distance);
  const pan = lateral * p.maxPan * nearField;

  // --- Distance → normalized 0 (near) … 1 (far) -----------------------------
  const norm = clamp01((distance - p.refDistance) / Math.max(1e-6, p.maxDistance - p.refDistance));

  // --- Gain -----------------------------------------------------------------
  const closeness = Math.pow(1 - norm, p.gainCurve);
  const behind = clamp01(-frontness); // 0 in front/side, 1 directly behind
  const gain = lerp(p.minGain, 1, closeness) * lerp(1, p.behindGainFactor, behind);

  // --- Clarity (low-pass) ---------------------------------------------------
  // Interpolate in log-frequency space, which is how we hear pitch.
  const logCut = lerp(Math.log(p.nearCutoffHz), Math.log(p.farCutoffHz), Math.sqrt(norm));
  const cutoffHz = Math.exp(logCut) * lerp(1, p.behindCutoffFactor, behind);

  // --- Pitch (behind cue) ---------------------------------------------------
  // smoothstep so sounds at the side stay at normal pitch and the drop
  // only becomes clear once the source is really behind.
  const playbackRate = lerp(1, p.behindPitchFactor, smoothstep(0, 1, behind));

  // --- Pulse rate ------------------------------------------------------------
  // Interpolated in log space: each step closer speeds the rhythm up by the
  // same *ratio*, so the change is equally noticeable far away and up close.
  const pulseInterval = Math.exp(
    lerp(Math.log(p.pulseMaxInterval), Math.log(p.pulseMinInterval), 1 - norm),
  );

  return { pan, gain, cutoffHz, playbackRate, pulseInterval, distance, frontness };
}
