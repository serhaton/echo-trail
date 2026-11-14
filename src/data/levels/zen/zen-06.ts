import type { LevelDefinition } from '../types';

/**
 * The shore in the evening. The sea runs along the right; driftwood and rocks dot the sand.
 */
export const zen06: LevelDefinition = {
  id: 'zen-06',
  mode: 'zen',
  index: 6,
  start: { x: 100, y: 850 },
  target: { position: { x: 280, y: 130 }, sound: 'targetWindChime' },
  obstacles: [
    { kind: 'rect', x: 360, y: 0, w: 90, h: 900, material: 'water' },
    { kind: 'rect', x: 60, y: 620, w: 180, h: 20, material: 'tree' },
    { kind: 'circle', x: 270, y: 500, r: 28, material: 'rock' },
    { kind: 'rect', x: 80, y: 360, w: 160, h: 20, material: 'tree' },
    { kind: 'circle', x: 140, y: 230, r: 24, material: 'rock' },
    { kind: 'circle', x: 300, y: 300, r: 22, material: 'rock', fromDifficulty: 'normal' },
    { kind: 'rect', x: 180, y: 180, w: 120, h: 18, material: 'tree', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'zen-06-time',
      position: { x: 330, y: 820 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
    {
      id: 'zen-06-album',
      position: { x: 40, y: 450 },
      sound: 'placeholderCollectible',
      reward: { kind: 'albumDetail' },
    },
  ],
  ambience: 'ambBeachEvening',
  baseTimeSeconds: 100,
  revealImage: require('@assets/images/zen/zen-06.webp'),
};
