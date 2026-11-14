/**
 * Difficulty rules in one place.
 *
 * Difficulty affects:
 *   - target sound clarity  → src/audio/spatialPresets.ts
 *   - countdown length      → timeMultiplier
 *   - obstacle count        → obstacles tagged `fromDifficulty` (level data)
 *   - hint frequency        → hintCooldown / hintDuration
 *   - chaser speed (Tension) → chaserSpeed
 */
export type Difficulty = 'easy' | 'normal' | 'hard';

export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'normal', 'hard'];

const rank: Record<Difficulty, number> = { easy: 0, normal: 1, hard: 2 };

export interface DifficultyRules {
  /** Multiplies the level's base (Normal) time. */
  timeMultiplier: number;
  /** Seconds before another hint can be used. */
  hintCooldown: number;
  /** Seconds the hint light stays visible. */
  hintDuration: number;
  /** Tension: the chaser's speed in world units/s (the player walks at 110). */
  chaserSpeed: number;
}

export const difficultyRules: Record<Difficulty, DifficultyRules> = {
  easy: { timeMultiplier: 1.4, hintCooldown: 8, hintDuration: 4.5, chaserSpeed: 38 },
  normal: { timeMultiplier: 1.0, hintCooldown: 15, hintDuration: 3.5, chaserSpeed: 48 },
  hard: { timeMultiplier: 0.75, hintCooldown: 25, hintDuration: 2.5, chaserSpeed: 58 },
};

/** True if `current` is at least as hard as `required`. */
export function atLeast(current: Difficulty, required: Difficulty): boolean {
  return rank[current] >= rank[required];
}

export function isDifficulty(value: unknown): value is Difficulty {
  return value === 'easy' || value === 'normal' || value === 'hard';
}
