import type { LevelDefinition } from '../types';

/**
 * The clock tower. Gears turn around a spiral climb; Ada waits beside the great clock.
 */
export const mystery10: LevelDefinition = {
  id: 'mystery-10',
  mode: 'mystery',
  index: 10,
  start: { x: 225, y: 870 },
  target: { position: { x: 225, y: 110 }, sound: 'targetClockChime' },
  obstacles: [
    { kind: 'circle', x: 120, y: 740, r: 40, material: 'furniture' },
    { kind: 'circle', x: 330, y: 740, r: 40, material: 'furniture' },
    { kind: 'rect', x: 0, y: 640, w: 300, h: 22, material: 'wall' },
    { kind: 'rect', x: 150, y: 500, w: 300, h: 22, material: 'wall' },
    { kind: 'rect', x: 0, y: 360, w: 300, h: 22, material: 'wall' },
    { kind: 'rect', x: 150, y: 220, w: 300, h: 22, material: 'wall' },
    { kind: 'circle', x: 380, y: 580, r: 30, material: 'furniture' },
    { kind: 'circle', x: 70, y: 430, r: 30, material: 'furniture' },
    { kind: 'circle', x: 380, y: 300, r: 26, material: 'furniture', fromDifficulty: 'normal' },
    { kind: 'circle', x: 80, y: 160, r: 24, material: 'furniture', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'mystery-10-story',
      position: { x: 40, y: 290 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's10' },
    },
    {
      id: 'mystery-10-time',
      position: { x: 420, y: 430 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
  ],
  ambience: 'ambHouse',
  baseTimeSeconds: 150,
  revealImage: require('@assets/images/mystery/mystery-10.webp'),
};
