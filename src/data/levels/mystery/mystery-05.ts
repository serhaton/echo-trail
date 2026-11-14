import type { LevelDefinition } from '../types';

/**
 * The music room. A grand piano in the middle, chairs in rows; the piano itself is the target.
 */
export const mystery05: LevelDefinition = {
  id: 'mystery-05',
  mode: 'mystery',
  index: 5,
  start: { x: 225, y: 860 },
  target: { position: { x: 225, y: 130 }, sound: 'targetPiano' },
  obstacles: [
    { kind: 'rect', x: 120, y: 330, w: 210, h: 110, material: 'furniture' },
    { kind: 'circle', x: 90, y: 600, r: 20, material: 'furniture' },
    { kind: 'circle', x: 170, y: 600, r: 20, material: 'furniture' },
    { kind: 'circle', x: 280, y: 600, r: 20, material: 'furniture' },
    { kind: 'circle', x: 360, y: 600, r: 20, material: 'furniture' },
    { kind: 'circle', x: 90, y: 700, r: 20, material: 'furniture' },
    { kind: 'circle', x: 360, y: 700, r: 20, material: 'furniture' },
    { kind: 'rect', x: 0, y: 240, w: 120, h: 22, material: 'wall' },
    { kind: 'rect', x: 330, y: 240, w: 120, h: 22, material: 'wall' },
    { kind: 'circle', x: 225, y: 520, r: 20, material: 'furniture', fromDifficulty: 'normal' },
    { kind: 'circle', x: 225, y: 250, r: 18, material: 'furniture', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'mystery-05-story',
      position: { x: 40, y: 120 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's05' },
    },
    {
      id: 'mystery-05-time',
      position: { x: 420, y: 420 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
  ],
  ambience: 'ambRain',
  baseTimeSeconds: 100,
  requiredStars: 8,
  revealImage: require('@assets/images/mystery/mystery-05.webp'),
};
