import type { LevelDefinition } from '../types';

/**
 * Tide pools. Small pools scattered across the beach; weave between them.
 */
export const zen07: LevelDefinition = {
  id: 'zen-07',
  mode: 'zen',
  index: 7,
  start: { x: 380, y: 850 },
  target: { position: { x: 60, y: 100 }, sound: 'targetWindChime' },
  obstacles: [
    { kind: 'circle', x: 330, y: 680, r: 40, material: 'water' },
    { kind: 'circle', x: 160, y: 720, r: 36, material: 'water' },
    { kind: 'circle', x: 250, y: 540, r: 44, material: 'water' },
    { kind: 'circle', x: 80, y: 520, r: 34, material: 'water' },
    { kind: 'circle', x: 370, y: 420, r: 38, material: 'water' },
    { kind: 'circle', x: 180, y: 370, r: 40, material: 'water' },
    { kind: 'circle', x: 300, y: 240, r: 36, material: 'water' },
    { kind: 'circle', x: 110, y: 230, r: 30, material: 'water' },
    { kind: 'circle', x: 60, y: 370, r: 22, material: 'rock', fromDifficulty: 'normal' },
    { kind: 'circle', x: 230, y: 140, r: 26, material: 'water', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'zen-07-time',
      position: { x: 420, y: 560 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
    {
      id: 'zen-07-album',
      position: { x: 250, y: 820 },
      sound: 'placeholderCollectible',
      reward: { kind: 'albumDetail' },
    },
  ],
  ambience: 'ambBeachEvening',
  baseTimeSeconds: 115,
  requiredStars: 13,
  revealImage: require('@assets/images/zen/zen-07.webp'),
};
