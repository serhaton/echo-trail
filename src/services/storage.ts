import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin, typed JSON wrapper around AsyncStorage.
 *
 * All persistent keys are listed in `StorageKeys` so we never scatter
 * string literals around the codebase. Values are JSON-encoded. Read
 * failures (corrupt data, missing key) fall back to `undefined` instead of
 * crashing the game.
 */

const PREFIX = 'echotrail:v1:';

export const StorageKeys = {
  languagePreference: 'settings.language',
  settings: 'settings.general',
  progress: 'progress',
  removeAds: 'purchases.removeAds',
} as const;

export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

export async function readJSON<T>(key: StorageKey): Promise<T | undefined> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw == null ? undefined : (JSON.parse(raw) as T);
  } catch (error) {
    console.warn(`[storage] failed to read "${key}"`, error);
    return undefined;
  }
}

export async function writeJSON<T>(key: StorageKey, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] failed to write "${key}"`, error);
  }
}
