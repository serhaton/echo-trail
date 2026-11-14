import type { Language, StoryId } from '@/i18n/types';

import type { AudioEngine, SoundAsset } from './types';
import { WebAudioEngine } from './WebAudioEngine';

export type {
  AudioEngine,
  Bus,
  OneShotOptions,
  SoundAsset,
  SpatialSource,
  SpatialSourceOptions,
} from './types';
export { computeSpatial } from './spatialMath';
export type { SpatialOutput, SpatialParams, Vec2 } from './spatialMath';
export {
  chaserParams,
  collectibleParams,
  spatialPresets,
  withBehindCue,
} from './spatialPresets';
export { TimeSoundPlayer, timeSoundKeys } from './timeSound';
export type { BehindCueMode, Difficulty } from './spatialPresets';

/**
 * The single app-wide audio engine.
 *
 * Kept on `globalThis` so Fast Refresh (which re-runs edited modules during
 * development) reuses the existing engine instead of creating a second
 * audio context — otherwise the old one keeps playing and screens holding
 * a "sounds loaded" state talk to an empty new engine.
 *
 * When the engine's code itself was edited, the surviving instance is
 * re-pointed at the new class so it gains the new methods while keeping
 * its loaded sounds and audio graph.
 */
const globalForAudio = globalThis as typeof globalThis & { __echoTrailAudio?: AudioEngine };
if (globalForAudio.__echoTrailAudio) {
  Object.setPrototypeOf(globalForAudio.__echoTrailAudio, WebAudioEngine.prototype);
}
export const audioEngine: AudioEngine = (globalForAudio.__echoTrailAudio ??= new WebAudioEngine());

/**
 * Registry of bundled sounds. Keys are stable names used by level data;
 * swapping a placeholder for a final recording only changes the require().
 */
export const sounds = {
  placeholderChime: require('@assets/sounds/common/placeholder-target-chime.wav') as SoundAsset,
  /** Single strike, used with mode: 'pulse'. */
  placeholderPulse: require('@assets/sounds/common/placeholder-target-pulse.wav') as SoundAsset,
  placeholderStream: require('@assets/sounds/common/placeholder-target-stream.wav') as SoundAsset,
  bump: require('@assets/sounds/common/bump.wav') as SoundAsset,
  /** Main-menu pad that breathes with the glowing dot. */
  menuPad: require('@assets/sounds/common/menu-pad.wav') as SoundAsset,
  // Mode time sounds (see timeSound.ts).
  timeBell: require('@assets/sounds/zen/time-bell.wav') as SoundAsset,
  timeClockTick: require('@assets/sounds/mystery/time-clock-tick.wav') as SoundAsset,
  // Collectibles and hints.
  placeholderCollectible: require('@assets/sounds/common/placeholder-collectible.wav') as SoundAsset,
  collect: require('@assets/sounds/common/collect.wav') as SoundAsset,
  hint: require('@assets/sounds/common/hint.wav') as SoundAsset,
  // Level targets (single strikes; pulse mode repeats them).
  targetWaterDrop: require('@assets/sounds/zen/target-water-drop.wav') as SoundAsset,
  targetBird: require('@assets/sounds/zen/target-bird.wav') as SoundAsset,
  targetWindChime: require('@assets/sounds/zen/target-wind-chime.wav') as SoundAsset,
  targetOwl: require('@assets/sounds/zen/target-owl.wav') as SoundAsset,
  targetMusicBox: require('@assets/sounds/mystery/target-music-box.wav') as SoundAsset,
  targetPiano: require('@assets/sounds/mystery/target-piano.wav') as SoundAsset,
  targetClockChime: require('@assets/sounds/mystery/target-clock-chime.wav') as SoundAsset,
  // Tension and Cheerful.
  timeHeartbeat: require('@assets/sounds/tension/time-heartbeat.wav') as SoundAsset,
  chaserLoop: require('@assets/sounds/tension/chaser-loop.wav') as SoundAsset,
  targetBeacon: require('@assets/sounds/tension/target-beacon.wav') as SoundAsset,
  ambDread: require('@assets/sounds/tension/amb-dread.wav') as SoundAsset,
  timeMarimba: require('@assets/sounds/cheerful/time-marimba.wav') as SoundAsset,
  targetXylophone: require('@assets/sounds/cheerful/target-xylophone.wav') as SoundAsset,
  targetBikeBell: require('@assets/sounds/cheerful/target-bike-bell.wav') as SoundAsset,
  ambFair: require('@assets/sounds/cheerful/amb-fair.wav') as SoundAsset,
  // Ambience beds (ambient bus).
  ambForestDawn: require('@assets/sounds/zen/amb-forest-dawn.wav') as SoundAsset,
  ambRiverNoon: require('@assets/sounds/zen/amb-river-noon.wav') as SoundAsset,
  ambBeachEvening: require('@assets/sounds/zen/amb-beach-evening.wav') as SoundAsset,
  ambHillNight: require('@assets/sounds/zen/amb-hill-night.wav') as SoundAsset,
  ambHouse: require('@assets/sounds/mystery/amb-house.wav') as SoundAsset,
  ambRain: require('@assets/sounds/mystery/amb-rain.wav') as SoundAsset,
  ambCellar: require('@assets/sounds/mystery/amb-cellar.wav') as SoundAsset,
} as const;

export type SoundKey = keyof typeof sounds;

/** Load several registered sounds in parallel. */
export function preloadSounds(keys: readonly SoundKey[]): Promise<void[]> {
  return Promise.all(keys.map((key) => audioEngine.load(key, sounds[key])));
}

/**
 * Story narrations (Mystery collectibles), one file PER LANGUAGE.
 * Real recordings go in assets/sounds/mystery/narration/{tr,en}/ with the
 * same file name in both folders; until then both point at a placeholder.
 */
const placeholderStory = require('@assets/sounds/common/placeholder-story-melody.wav') as SoundAsset;
export const narrations: Record<StoryId, Record<Language, SoundAsset>> = {
  s01: { tr: placeholderStory, en: placeholderStory },
  s02: { tr: placeholderStory, en: placeholderStory },
  s03: { tr: placeholderStory, en: placeholderStory },
  s04: { tr: placeholderStory, en: placeholderStory },
  s05: { tr: placeholderStory, en: placeholderStory },
  s06: { tr: placeholderStory, en: placeholderStory },
  s07: { tr: placeholderStory, en: placeholderStory },
  s08: { tr: placeholderStory, en: placeholderStory },
  s09: { tr: placeholderStory, en: placeholderStory },
  s10: { tr: placeholderStory, en: placeholderStory },
  s11: { tr: placeholderStory, en: placeholderStory },
  s12: { tr: placeholderStory, en: placeholderStory },
  s13: { tr: placeholderStory, en: placeholderStory },
  s14: { tr: placeholderStory, en: placeholderStory },
  s15: { tr: placeholderStory, en: placeholderStory },
  s16: { tr: placeholderStory, en: placeholderStory },
  s17: { tr: placeholderStory, en: placeholderStory },
  s18: { tr: placeholderStory, en: placeholderStory },
  s19: { tr: placeholderStory, en: placeholderStory },
  s20: { tr: placeholderStory, en: placeholderStory },
  s21: { tr: placeholderStory, en: placeholderStory },
  s22: { tr: placeholderStory, en: placeholderStory },
  s23: { tr: placeholderStory, en: placeholderStory },
  s24: { tr: placeholderStory, en: placeholderStory },
  s25: { tr: placeholderStory, en: placeholderStory },
  s26: { tr: placeholderStory, en: placeholderStory },
  s27: { tr: placeholderStory, en: placeholderStory },
  s28: { tr: placeholderStory, en: placeholderStory },
  s29: { tr: placeholderStory, en: placeholderStory },
  s30: { tr: placeholderStory, en: placeholderStory },
};

/** Engine key under which a narration is loaded for a language. */
export function narrationKey(storyId: StoryId, language: Language): string {
  return `narration:${storyId}:${language}`;
}

export function preloadNarration(storyId: StoryId, language: Language): Promise<void> {
  return audioEngine.load(narrationKey(storyId, language), narrations[storyId][language]);
}
