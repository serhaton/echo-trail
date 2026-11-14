import type { LevelDefinition } from '../types';

/**
 * Starry hill. A ring of trees guards the owl; the gap is at the bottom-left.
 */
export const zen09: LevelDefinition = {
  id: 'zen-09',
  mode: 'zen',
  index: 9,
  start: { x: 380, y: 850 },
  target: { position: { x: 225, y: 300 }, sound: 'targetOwl' },
  obstacles: [
    { kind: 'circle', x: 130, y: 200, r: 28, material: 'tree' },
    { kind: 'circle', x: 225, y: 170, r: 28, material: 'tree' },
    { kind: 'circle', x: 320, y: 200, r: 28, material: 'tree' },
    { kind: 'circle', x: 360, y: 300, r: 28, material: 'tree' },
    { kind: 'circle', x: 320, y: 400, r: 28, material: 'tree' },
    { kind: 'circle', x: 225, y: 430, r: 28, material: 'tree' },
    { kind: 'circle', x: 90, y: 300, r: 28, material: 'tree', fromDifficulty: 'normal' },
    { kind: 'circle', x: 300, y: 620, r: 30, material: 'tree' },
    { kind: 'circle', x: 140, y: 700, r: 26, material: 'tree' },
    { kind: 'circle', x: 180, y: 560, r: 22, material: 'rock', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'zen-09-time',
      position: { x: 40, y: 820 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
    {
      id: 'zen-09-album',
      position: { x: 420, y: 120 },
      sound: 'placeholderCollectible',
      reward: { kind: 'albumDetail' },
    },
  ],
  ambience: 'ambHillNight',
  baseTimeSeconds: 130,
  requiredStars: 18,
  revealImage: require('@assets/images/zen/zen-09.webp'),
};
