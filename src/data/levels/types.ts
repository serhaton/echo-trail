import type { SoundKey } from '@/audio';
import type { Difficulty } from '@/game/difficulty';
import type { Shape, Vec2 } from '@/game/geometry';
import type { StoryId } from '@/i18n/types';
import type { ModeId } from '@/modes';

/**
 * Data-driven level definition. A level is pure data: adding one never
 * requires engine changes.
 *
 * All positions/sizes are in world units (see WORLD_WIDTH / WORLD_HEIGHT
 * in src/game/geometry.ts). Use the in-game debug view (dev builds) to see
 * obstacles and the target while designing.
 */

/** What an obstacle is made of; drives its bump sound (later) and debug colour. */
export type ObstacleMaterial = 'wall' | 'tree' | 'rock' | 'water' | 'furniture';

export type Obstacle = Shape & {
  material: ObstacleMaterial;
  /**
   * Only present from this difficulty upward. Lets one layout get busier
   * on Normal / Hard without duplicating the level. Omit = always present.
   */
  fromDifficulty?: Difficulty;
};

export interface TargetDefinition {
  position: Vec2;
  sound: SoundKey;
  /** 'pulse' (single strike, speeds up as you approach) is the default for targets. */
  playback?: 'pulse' | 'loop';
  /** Reaching within this radius completes the level. Default: 26. */
  reachRadius?: number;
}

/** Hidden sounds collected on the way (stage 6). */
export interface CollectibleDefinition {
  id: string;
  position: Vec2;
  sound: SoundKey;
  /** Extra seconds, an album detail, or (Mystery) a story fragment. */
  reward:
    | { kind: 'time'; seconds: number }
    | { kind: 'albumDetail' }
    /** Cheerful: a star to collect; also adds a few seconds. */
    | { kind: 'star'; seconds: number }
    | { kind: 'story'; storyId: StoryId };
}

export interface LevelDefinition {
  /** Globally unique, e.g. "zen-01". Used in routes and save data. */
  id: string;
  mode: ModeId | 'test';
  /** 1-based order inside its journey. */
  index: number;
  start: Vec2;
  target: TargetDefinition;
  obstacles: readonly Obstacle[];
  collectibles?: readonly CollectibleDefinition[];
  /**
   * Tension: where the chaser appears and how long it waits before it
   * starts hunting. Its speed comes from the difficulty.
   */
  chaser?: { start: Vec2; delaySeconds: number };
  /** Background ambience loop (stage 9). */
  ambience?: SoundKey;
  /** Countdown on Normal difficulty; scaled by difficulty (stage 5). */
  baseTimeSeconds: number;
  /**
   * Picture revealed at the end and added to the album
   * (`require('@assets/images/…webp')`, portrait, 1:2).
   */
  revealImage: number;
  /** Stars needed to unlock this level (stage 8). */
  requiredStars?: number;
}
