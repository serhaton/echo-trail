import type { LevelDefinition } from '../types';

/**
 * Dew and birdsong. A fallen log blocks the middle; walk around its open end on the right.
 */
export const zen02: LevelDefinition = {
  id: 'zen-02',
  mode: 'zen',
  index: 2,
  start: { x: 120, y: 840 },
  target: { position: { x: 380, y: 110 }, sound: 'targetBird' },
  obstacles: [
    { kind: 'rect', x: 0, y: 500, w: 300, h: 22, material: 'tree' },
    { kind: 'circle', x: 260, y: 700, r: 28, material: 'tree' },
    { kind: 'circle', x: 120, y: 330, r: 30, material: 'tree' },
    { kind: 'circle', x: 300, y: 260, r: 24, material: 'tree' },
    { kind: 'rect', x: 380, y: 360, w: 50, h: 36, material: 'rock', fromDifficulty: 'normal' },
    { kind: 'circle', x: 390, y: 600, r: 22, material: 'tree', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'zen-02-album',
      position: { x: 410, y: 760 },
      sound: 'placeholderCollectible',
      reward: { kind: 'albumDetail' },
    },
  ],
  ambience: 'ambForestDawn',
  baseTimeSeconds: 85,
  revealImage: require('@assets/images/zen/zen-02.webp'),
};
