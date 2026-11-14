import type { LevelDefinition } from '../types';

/**
 * Forest at dawn. A gentle first walk: a few trees, a rock, the target almost straight ahead.
 */
export const zen01: LevelDefinition = {
  id: 'zen-01',
  mode: 'zen',
  index: 1,
  start: { x: 225, y: 840 },
  target: { position: { x: 290, y: 130 }, sound: 'targetBird' },
  obstacles: [
    { kind: 'circle', x: 150, y: 620, r: 28, material: 'tree' },
    { kind: 'circle', x: 300, y: 500, r: 32, material: 'tree' },
    { kind: 'circle', x: 190, y: 320, r: 26, material: 'tree' },
    { kind: 'rect', x: 50, y: 430, w: 60, h: 40, material: 'rock' },
    { kind: 'circle', x: 370, y: 270, r: 24, material: 'tree', fromDifficulty: 'normal' },
    { kind: 'circle', x: 250, y: 210, r: 20, material: 'tree', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'zen-01-time',
      position: { x: 60, y: 200 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
  ],
  ambience: 'ambForestDawn',
  baseTimeSeconds: 75,
  revealImage: require('@assets/images/zen/zen-01.webp'),
};
