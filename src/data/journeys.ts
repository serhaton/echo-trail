import type { ModeId } from '@/modes';
import type { ProgressData } from '@/services/progress';

import { allLevels, type LevelDefinition } from './levels';

/**
 * Journeys: the ordered levels of each mode, plus unlock rules.
 *
 * A journey always has JOURNEY_LENGTH slots. Slots without a level yet are
 * shown as "coming soon" (useful while content is being produced, and for
 * future updates that extend a journey).
 */
export const JOURNEY_LENGTH = 30;

/** Levels of a mode, in journey order. */
export function journeyLevels(mode: ModeId): LevelDefinition[] {
  return allLevels()
    .filter((l) => l.mode === mode)
    .sort((a, b) => a.index - b.index);
}

export function starsOf(progress: ProgressData, levelId: string): number {
  return progress.levels[levelId]?.stars ?? 0;
}

export function totalStars(progress: ProgressData, mode: ModeId): number {
  return journeyLevels(mode).reduce((sum, l) => sum + starsOf(progress, l.id), 0);
}

/** How many levels of a journey have been completed. */
export function completedCount(progress: ProgressData, mode: ModeId): number {
  return journeyLevels(mode).filter((l) => starsOf(progress, l.id) > 0).length;
}

export type LockReason = { kind: 'previous' } | { kind: 'stars'; required: number };

/**
 * Why a level is locked, or null if it can be played.
 *   - the first level is always open;
 *   - every other level needs the previous one completed;
 *   - and, if it says so, a total number of stars in this journey.
 */
export function lockReason(progress: ProgressData, level: LevelDefinition): LockReason | null {
  if (level.mode === 'test') return null;
  const levels = journeyLevels(level.mode);
  const i = levels.findIndex((l) => l.id === level.id);
  const previous = i > 0 ? levels[i - 1] : undefined;
  if (previous && starsOf(progress, previous.id) === 0) return { kind: 'previous' };
  const required = level.requiredStars ?? 0;
  if (required > 0 && totalStars(progress, level.mode) < required) {
    return { kind: 'stars', required };
  }
  return null;
}

/** The level after this one in its journey, if any. */
export function nextLevel(level: LevelDefinition): LevelDefinition | undefined {
  if (level.mode === 'test') return undefined;
  const levels = journeyLevels(level.mode);
  return levels[levels.findIndex((l) => l.id === level.id) + 1];
}
