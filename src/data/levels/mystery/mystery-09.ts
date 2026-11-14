import type { LevelDefinition } from '../types';

/**
 * The attic. Roof beams and old trunks; Mother's music box plays somewhere in the dust.
 */
export const mystery09: LevelDefinition = {
  id: 'mystery-09',
  mode: 'mystery',
  index: 9,
  start: { x: 225, y: 860 },
  target: { position: { x: 380, y: 90 }, sound: 'targetMusicBox' },
  obstacles: [
    { kind: 'rect', x: 0, y: 700, w: 180, h: 20, material: 'wall' },
    { kind: 'rect', x: 270, y: 700, w: 180, h: 20, material: 'wall' },
    { kind: 'rect', x: 60, y: 540, w: 330, h: 20, material: 'wall' },
    { kind: 'rect', x: 0, y: 380, w: 180, h: 20, material: 'wall' },
    { kind: 'rect', x: 270, y: 380, w: 180, h: 20, material: 'wall' },
    { kind: 'rect', x: 60, y: 220, w: 330, h: 20, material: 'wall' },
    { kind: 'rect', x: 100, y: 620, w: 70, h: 40, material: 'furniture' },
    { kind: 'rect', x: 300, y: 460, w: 70, h: 40, material: 'furniture', fromDifficulty: 'normal' },
    { kind: 'rect', x: 120, y: 300, w: 60, h: 40, material: 'furniture', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'mystery-09-story',
      position: { x: 30, y: 460 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's09' },
    },
    {
      id: 'mystery-09-time',
      position: { x: 420, y: 300 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
  ],
  ambience: 'ambRain',
  baseTimeSeconds: 130,
  requiredStars: 18,
  revealImage: require('@assets/images/mystery/mystery-09.webp'),
};
