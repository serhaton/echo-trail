import type { LevelDefinition } from '../types';

/**
 * Development test level for movement, collision and audio.
 *
 * Layout (450 × 900 world units, start at the bottom, target top-left):
 *
 *   ┌───────────────────────┐
 *   │  ◎ target             │
 *   │        ●              │  tree
 *   │   ━━━━━━━━━━━━━━━━━━━━│  wall (gap on the left)
 *   │            ●     ●    │  trees
 *   │━━━━━━━━━━━━━━━━━━     │  wall (gap on the right)
 *   │      ≈≈≈≈             │  water
 *   │                ▢      │  rock
 *   │           ○ start     │
 *   └───────────────────────┘
 */
export const test01: LevelDefinition = {
  id: 'test-01',
  mode: 'test',
  index: 1,
  start: { x: 225, y: 830 },
  target: { position: { x: 80, y: 90 }, sound: 'placeholderPulse', playback: 'pulse' },
  obstacles: [
    // Lower wall with a gap on the right.
    { kind: 'rect', x: 0, y: 560, w: 320, h: 18, material: 'wall' },
    // Upper wall with a gap on the left.
    { kind: 'rect', x: 120, y: 290, w: 330, h: 18, material: 'wall' },
    // Trees between the walls.
    { kind: 'circle', x: 230, y: 430, r: 26, material: 'tree' },
    { kind: 'circle', x: 360, y: 400, r: 22, material: 'tree', fromDifficulty: 'normal' },
    // Tree near the target.
    { kind: 'circle', x: 200, y: 170, r: 24, material: 'tree' },
    // Water and a rock near the start.
    { kind: 'rect', x: 70, y: 640, w: 120, h: 50, material: 'water' },
    { kind: 'rect', x: 300, y: 720, w: 50, h: 40, material: 'rock' },
    // Extra obstacles on Hard only.
    { kind: 'circle', x: 120, y: 470, r: 22, material: 'tree', fromDifficulty: 'hard' },
    { kind: 'circle', x: 300, y: 200, r: 20, material: 'rock', fromDifficulty: 'hard' },
  ],
  collectibles: [
    // Bottom-left corner, past the water: +10 seconds.
    {
      id: 'test-01-time',
      position: { x: 50, y: 800 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
    // Between the walls on the right: a story fragment.
    {
      id: 'test-01-story',
      position: { x: 405, y: 500 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's01' },
    },
  ],
  baseTimeSeconds: 90,
  revealImage: require('@assets/images/placeholder/zen-dawn-forest.webp'),
};
