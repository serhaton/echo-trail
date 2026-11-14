import type { LevelDefinition } from '../types';

/**
 * The riverbank at noon. A river crosses the meadow; the only way over is a narrow ford on the right.
 */
export const zen04: LevelDefinition = {
  id: 'zen-04',
  mode: 'zen',
  index: 4,
  start: { x: 120, y: 850 },
  target: { position: { x: 100, y: 120 }, sound: 'targetWaterDrop' },
  obstacles: [
    { kind: 'rect', x: 0, y: 430, w: 300, h: 50, material: 'water' },
    { kind: 'rect', x: 350, y: 430, w: 100, h: 50, material: 'water' },
    { kind: 'circle', x: 200, y: 650, r: 26, material: 'rock' },
    { kind: 'circle', x: 380, y: 700, r: 22, material: 'tree' },
    { kind: 'circle', x: 240, y: 250, r: 28, material: 'tree' },
    { kind: 'rect', x: 40, y: 280, w: 70, h: 30, material: 'rock', fromDifficulty: 'normal' },
    { kind: 'circle', x: 330, y: 330, r: 20, material: 'rock', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'zen-04-time',
      position: { x: 420, y: 820 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
    {
      id: 'zen-04-album',
      position: { x: 40, y: 330 },
      sound: 'placeholderCollectible',
      reward: { kind: 'albumDetail' },
    },
  ],
  ambience: 'ambRiverNoon',
  baseTimeSeconds: 95,
  revealImage: require('@assets/images/zen/zen-04.webp'),
};
