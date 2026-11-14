import type { LevelDefinition } from '../types';

/**
 * Midnight. A spiral of fallen trees winds toward the owl at the centre.
 */
export const zen10: LevelDefinition = {
  id: 'zen-10',
  mode: 'zen',
  index: 10,
  start: { x: 40, y: 860 },
  target: { position: { x: 225, y: 450 }, sound: 'targetOwl' },
  obstacles: [
    { kind: 'rect', x: 0, y: 760, w: 380, h: 22, material: 'tree' },
    { kind: 'rect', x: 380, y: 180, w: 22, h: 602, material: 'tree' },
    { kind: 'rect', x: 70, y: 180, w: 332, h: 22, material: 'tree' },
    { kind: 'rect', x: 70, y: 180, w: 22, h: 480, material: 'tree' },
    { kind: 'rect', x: 70, y: 640, w: 240, h: 22, material: 'tree' },
    { kind: 'rect', x: 290, y: 300, w: 22, h: 362, material: 'tree', fromDifficulty: 'normal' },
    { kind: 'circle', x: 180, y: 380, r: 22, material: 'tree' },
    { kind: 'circle', x: 225, y: 560, r: 18, material: 'rock', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'zen-10-time',
      position: { x: 420, y: 500 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
    {
      id: 'zen-10-album',
      position: { x: 150, y: 300 },
      sound: 'placeholderCollectible',
      reward: { kind: 'albumDetail' },
    },
  ],
  ambience: 'ambHillNight',
  baseTimeSeconds: 150,
  revealImage: require('@assets/images/zen/zen-10.webp'),
};
