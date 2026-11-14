import type { SpatialOutput, SpatialParams, Vec2 } from './spatialMath';

/** A bundled sound file: the number returned by `require('…wav')`. */
export type SoundAsset = number;

/**
 * Mixer buses. Each has its own volume so settings can control
 * "effects" and "ambience" separately (stage 11).
 *   sfx     – target, collectibles, bumps, time sound, UI
 *   ambient – background ambience loops
 */
export type Bus = 'sfx' | 'ambient';

export interface OneShotOptions {
  bus?: Bus;
  volume?: number;
  playbackRate?: number;
  /** Stereo position, -1 (left) … +1 (right). E.g. a bump on the wall's side. */
  pan?: number;
}

/** A positioned sound (target, collectible) that reacts to the listener. */
export interface SpatialSource {
  readonly id: string;
  setPosition(position: Vec2): void;
  /** Swap model parameters live (difficulty, tuning panel). */
  setParams(params: SpatialParams): void;
  /** Per-source volume on top of the distance model (0..1). */
  setVolume(volume: number): void;
  start(): void;
  stop(): void;
  /** Last values sent to the audio graph (for debug readouts). */
  readonly output: SpatialOutput;
}

export interface SpatialSourceOptions {
  id: string;
  /** Key of a sound previously passed to `load()`. */
  sound: string;
  position: Vec2;
  params: SpatialParams;
  /**
   * 'loop'  – the sound file loops continuously (ambience-like targets).
   * 'pulse' – the file is a single strike, repeated faster as the listener
   *           gets closer (see SpatialParams.pulse*Interval).
   */
  mode?: 'loop' | 'pulse';
  /**
   * Pulse mode only: called when a strike is booked, with the delay in
   * seconds until it is actually heard. Lets visuals (wave rings) land
   * exactly on the beat.
   */
  onPulse?: (delaySeconds: number) => void;
  volume?: number;
  bus?: Bus;
}

/**
 * The game's view of the audio system. Game code only talks to this
 * interface, never to the underlying library, so the backend can be
 * swapped (e.g. a native HRTF engine) without touching gameplay.
 */
export interface AudioEngine {
  /** Configure the iOS audio session and create the audio context. Idempotent. */
  init(): Promise<void>;
  /** Decode a sound into memory under `key`. Safe to call repeatedly. */
  load(key: string, asset: SoundAsset): Promise<void>;
  /** Move the listener (player). Recomputes every spatial source. */
  setListener(position: Vec2): void;
  createSpatialSource(options: SpatialSourceOptions): SpatialSource;
  /** Remove a spatial source and free its nodes. */
  destroySource(id: string): void;
  /** Fire-and-forget, non-positional sound (bump, UI, time tick). */
  playOneShot(sound: string, options?: OneShotOptions): void;
  setBusVolume(bus: Bus, volume: number): void;
  /** Start (or cross-fade to) a looping, non-positional ambience bed. */
  startAmbience(sound: string, volume?: number): void;
  stopAmbience(): void;
  /** Glide the current ambience to a new volume over `seconds` (e.g. a slow swell). */
  rampAmbience(volume: number, seconds: number): void;
  /**
   * Room echo on effects (0 = dry … ~0.5 = big hall). Mystery's rooms use a
   * little; Zen's open air uses none. Kept subtle so direction stays clear.
   */
  setReverb(amount: number): void;
  /** Duration in seconds of a loaded sound (0 if not loaded). */
  getDuration(sound: string): number;
  /** Output latency reported by the system, in seconds (debug readout). */
  getLatency(): number;
  /** Silence / resume everything (e.g. while a full-screen ad plays). */
  setPaused(paused: boolean): void;
  /** Stop and remove every source (leaving a level). */
  reset(): void;
}
