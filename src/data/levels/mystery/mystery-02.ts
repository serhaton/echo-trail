import type { LevelDefinition } from '../types';

/**
 * The library. Rows of bookshelves with gaps at alternating ends: a quiet maze.
 */
export const mystery02: LevelDefinition = {
  id: 'mystery-02',
  mode: 'mystery',
  index: 2,
  start: { x: 60, y: 850 },
  target: { position: { x: 380, y: 90 }, sound: 'targetMusicBox' },
  obstacles: [
    { kind: 'rect', x: 0, y: 690, w: 340, h: 26, material: 'furniture' },
    { kind: 'rect', x: 110, y: 520, w: 340, h: 26, material: 'furniture' },
    { kind: 'rect', x: 0, y: 350, w: 340, h: 26, material: 'furniture' },
    { kind: 'rect', x: 110, y: 190, w: 340, h: 26, material: 'furniture', fromDifficulty: 'normal' },
    { kind: 'circle', x: 225, y: 610, r: 18, material: 'furniture', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'mystery-02-story',
      position: { x: 40, y: 440 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's02' },
    },
    {
      id: 'mystery-02-time',
      position: { x: 420, y: 620 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
  ],
  ambience: 'ambRain',
  baseTimeSeconds: 80,
  revealImage: require('@assets/images/mystery/mystery-02.webp'),
};
