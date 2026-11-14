import type { LevelDefinition } from '../types';

/**
 * The bedroom. A partition wall with a single door, the bed, a wardrobe.
 */
export const mystery08: LevelDefinition = {
  id: 'mystery-08',
  mode: 'mystery',
  index: 8,
  start: { x: 400, y: 860 },
  target: { position: { x: 80, y: 110 }, sound: 'targetMusicBox' },
  obstacles: [
    { kind: 'rect', x: 0, y: 460, w: 330, h: 22, material: 'wall' },
    { kind: 'rect', x: 380, y: 460, w: 70, h: 22, material: 'wall' },
    { kind: 'rect', x: 60, y: 560, w: 170, h: 120, material: 'furniture' },
    { kind: 'rect', x: 330, y: 560, w: 90, h: 60, material: 'furniture' },
    { kind: 'rect', x: 200, y: 140, w: 180, h: 90, material: 'furniture' },
    { kind: 'circle', x: 60, y: 300, r: 22, material: 'furniture' },
    { kind: 'rect', x: 140, y: 300, w: 24, h: 160, material: 'wall', fromDifficulty: 'normal' },
    { kind: 'circle', x: 300, y: 760, r: 22, material: 'furniture', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'mystery-08-story',
      position: { x: 410, y: 200 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's08' },
    },
    {
      id: 'mystery-08-time',
      position: { x: 40, y: 820 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
  ],
  ambience: 'ambRain',
  baseTimeSeconds: 120,
  revealImage: require('@assets/images/mystery/mystery-08.webp'),
};
