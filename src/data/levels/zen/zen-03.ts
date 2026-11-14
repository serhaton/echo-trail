import type { LevelDefinition } from '../types';

/**
 * The winding path. Two logs make a zigzag; the target waits in the top-left corner.
 */
export const zen03: LevelDefinition = {
  id: 'zen-03',
  mode: 'zen',
  index: 3,
  start: { x: 380, y: 850 },
  target: { position: { x: 80, y: 90 }, sound: 'targetBird' },
  obstacles: [
    { kind: 'rect', x: 120, y: 640, w: 330, h: 22, material: 'tree' },
    { kind: 'rect', x: 0, y: 400, w: 330, h: 22, material: 'tree' },
    { kind: 'circle', x: 300, y: 520, r: 26, material: 'tree' },
    { kind: 'circle', x: 200, y: 230, r: 28, material: 'tree' },
    { kind: 'circle', x: 90, y: 760, r: 24, material: 'tree', fromDifficulty: 'normal' },
    { kind: 'circle', x: 120, y: 520, r: 22, material: 'tree', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'zen-03-time',
      position: { x: 40, y: 560 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
    {
      id: 'zen-03-album',
      position: { x: 410, y: 260 },
      sound: 'placeholderCollectible',
      reward: { kind: 'albumDetail' },
    },
  ],
  ambience: 'ambForestDawn',
  baseTimeSeconds: 95,
  requiredStars: 4,
  revealImage: require('@assets/images/zen/zen-03.webp'),
};
