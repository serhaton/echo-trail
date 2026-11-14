import type { LevelDefinition } from '../types';

/**
 * The dunes at dusk. Three long dunes, each open at alternating ends.
 */
export const zen08: LevelDefinition = {
  id: 'zen-08',
  mode: 'zen',
  index: 8,
  start: { x: 60, y: 850 },
  target: { position: { x: 400, y: 90 }, sound: 'targetWindChime' },
  obstacles: [
    { kind: 'rect', x: 0, y: 690, w: 360, h: 28, material: 'rock' },
    { kind: 'rect', x: 90, y: 500, w: 360, h: 28, material: 'rock' },
    { kind: 'rect', x: 0, y: 310, w: 360, h: 28, material: 'rock' },
    { kind: 'rect', x: 90, y: 150, w: 360, h: 24, material: 'rock', fromDifficulty: 'normal' },
    { kind: 'circle', x: 225, y: 600, r: 20, material: 'rock' },
    { kind: 'circle', x: 225, y: 410, r: 20, material: 'rock', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'zen-08-time',
      position: { x: 420, y: 600 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
    {
      id: 'zen-08-album',
      position: { x: 30, y: 420 },
      sound: 'placeholderCollectible',
      reward: { kind: 'albumDetail' },
    },
  ],
  ambience: 'ambBeachEvening',
  baseTimeSeconds: 125,
  revealImage: require('@assets/images/zen/zen-08.webp'),
};
