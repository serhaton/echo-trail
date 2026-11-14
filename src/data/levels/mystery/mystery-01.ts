import type { LevelDefinition } from '../types';

/**
 * The entrance hall. An inner wall with a doorway on the left, a long table and two armchairs.
 */
export const mystery01: LevelDefinition = {
  id: 'mystery-01',
  mode: 'mystery',
  index: 1,
  start: { x: 330, y: 850 },
  target: { position: { x: 90, y: 120 }, sound: 'targetMusicBox' },
  obstacles: [
    { kind: 'rect', x: 110, y: 420, w: 340, h: 20, material: 'wall' },
    { kind: 'rect', x: 150, y: 600, w: 160, h: 50, material: 'furniture' },
    { kind: 'circle', x: 80, y: 700, r: 26, material: 'furniture' },
    { kind: 'circle', x: 300, y: 240, r: 26, material: 'furniture' },
    { kind: 'rect', x: 0, y: 260, w: 140, h: 24, material: 'wall', fromDifficulty: 'normal' },
    { kind: 'rect', x: 380, y: 520, w: 70, h: 40, material: 'furniture', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'mystery-01-story',
      position: { x: 410, y: 300 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's01' },
    },
  ],
  ambience: 'ambHouse',
  baseTimeSeconds: 70,
  revealImage: require('@assets/images/mystery/mystery-01.webp'),
};
