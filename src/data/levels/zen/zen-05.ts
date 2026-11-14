import type { LevelDefinition } from '../types';

/**
 * Stepping stones. Two streams with crossings at opposite ends: left, then right.
 */
export const zen05: LevelDefinition = {
  id: 'zen-05',
  mode: 'zen',
  index: 5,
  start: { x: 400, y: 850 },
  target: { position: { x: 225, y: 110 }, sound: 'targetWaterDrop' },
  obstacles: [
    { kind: 'rect', x: 90, y: 600, w: 360, h: 40, material: 'water' },
    { kind: 'rect', x: 0, y: 320, w: 360, h: 40, material: 'water' },
    { kind: 'circle', x: 200, y: 760, r: 24, material: 'rock' },
    { kind: 'circle', x: 260, y: 470, r: 26, material: 'rock' },
    { kind: 'circle', x: 120, y: 200, r: 24, material: 'tree' },
    { kind: 'circle', x: 330, y: 180, r: 24, material: 'tree' },
    { kind: 'circle', x: 60, y: 470, r: 20, material: 'rock', fromDifficulty: 'normal' },
    { kind: 'circle', x: 400, y: 470, r: 20, material: 'rock', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'zen-05-time',
      position: { x: 30, y: 760 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
    {
      id: 'zen-05-album',
      position: { x: 420, y: 240 },
      sound: 'placeholderCollectible',
      reward: { kind: 'albumDetail' },
    },
  ],
  ambience: 'ambRiverNoon',
  baseTimeSeconds: 105,
  requiredStars: 8,
  revealImage: require('@assets/images/zen/zen-05.webp'),
};
