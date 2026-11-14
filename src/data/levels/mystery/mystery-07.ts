import type { LevelDefinition } from '../types';

/**
 * The study. Tall shelves stand like corridors; the tower chime echoes through them.
 */
export const mystery07: LevelDefinition = {
  id: 'mystery-07',
  mode: 'mystery',
  index: 7,
  start: { x: 40, y: 860 },
  target: { position: { x: 410, y: 100 }, sound: 'targetClockChime' },
  obstacles: [
    { kind: 'rect', x: 90, y: 160, w: 24, h: 700, material: 'furniture' },
    { kind: 'rect', x: 200, y: 40, w: 24, h: 700, material: 'furniture' },
    { kind: 'rect', x: 310, y: 160, w: 24, h: 700, material: 'furniture' },
    { kind: 'rect', x: 370, y: 40, w: 80, h: 30, material: 'furniture' },
    { kind: 'rect', x: 230, y: 400, w: 60, h: 40, material: 'furniture', fromDifficulty: 'normal' },
    { kind: 'rect', x: 114, y: 300, w: 60, h: 24, material: 'furniture', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'mystery-07-story',
      position: { x: 150, y: 100 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's07' },
    },
    {
      id: 'mystery-07-time',
      position: { x: 260, y: 820 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
  ],
  ambience: 'ambHouse',
  baseTimeSeconds: 115,
  requiredStars: 13,
  revealImage: require('@assets/images/mystery/mystery-07.webp'),
};
