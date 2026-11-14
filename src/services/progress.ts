import type { StarCount } from '@/game/countdown';

import { readJSON, StorageKeys, writeJSON } from './storage';

/**
 * Saved player progress. Versioned so future updates can migrate old saves.
 *
 * Stars are the BEST result for a level, regardless of difficulty, so
 * replaying on Easy never lowers a 3-star Hard result.
 */
export interface LevelProgress {
  /** Best star count achieved (0 = never completed). */
  stars: 0 | StarCount;
  /** Ids of hidden sounds ever found in this level (album details, story). */
  collected: string[];
}

export interface ProgressData {
  version: 1;
  levels: Record<string, LevelProgress>;
  /** Total level completions; drives the interstitial cadence (stage 12). */
  completions: number;
}

export const emptyProgress: ProgressData = { version: 1, levels: {}, completions: 0 };

export async function loadProgress(): Promise<ProgressData> {
  const saved = await readJSON<ProgressData>(StorageKeys.progress);
  if (!saved || saved.version !== 1) return emptyProgress;
  return { ...emptyProgress, ...saved };
}

export function saveProgress(data: ProgressData): Promise<void> {
  return writeJSON(StorageKeys.progress, data);
}

/** Pure: progress after finishing a level. */
export function withCompletion(
  data: ProgressData,
  levelId: string,
  stars: StarCount,
  collectedIds: readonly string[],
): ProgressData {
  const prev = data.levels[levelId] ?? { stars: 0, collected: [] };
  return {
    ...data,
    completions: data.completions + 1,
    levels: {
      ...data.levels,
      [levelId]: {
        stars: Math.max(prev.stars, stars) as LevelProgress['stars'],
        collected: [...new Set([...prev.collected, ...collectedIds])],
      },
    },
  };
}
