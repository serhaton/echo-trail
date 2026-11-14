import type { ControlScheme } from '@/game/movement';

import { readJSON, StorageKeys, writeJSON } from './storage';

/** How sound reaches the player. 'auto' follows headphone detection. */
export type AudioOutputPreference = 'auto' | 'headphones' | 'speaker';

/**
 * Player settings (persisted). Language lives in the i18n layer; everything
 * else is here.
 */
export interface Settings {
  /** How dragging moves the player (see src/game/movement.ts). */
  controlScheme: ControlScheme;
  /** Without headphones, visual direction cues (wave rings) are shown. */
  audioOutput: AudioOutputPreference;
  /** Effects volume, 0..1 (target, collectibles, bumps, time sound). */
  sfxVolume: number;
  /** Ambience volume, 0..1. */
  ambientVolume: number;
  hapticsEnabled: boolean;
  /** Show the control demo ("ready" card) before each level. */
  showControlIntro: boolean;
  /** The first-launch "how to play" intro has been seen. */
  introSeen: boolean;
}

export const defaultSettings: Settings = {
  controlScheme: 'followFinger',
  audioOutput: 'auto',
  sfxVolume: 1,
  ambientVolume: 1,
  hapticsEnabled: true,
  showControlIntro: true,
  introSeen: false,
};

/**
 * Load saved settings, filling in defaults for anything missing — so adding
 * a new setting in an update never breaks an older save.
 */
export async function loadSettings(): Promise<Settings> {
  const saved = await readJSON<Partial<Settings>>(StorageKeys.settings);
  return { ...defaultSettings, ...saved };
}

export function saveSettings(settings: Settings): Promise<void> {
  return writeJSON(StorageKeys.settings, settings);
}
