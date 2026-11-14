import type { LevelDefinition } from '../types';

/**
 * The cellar. Barrels and a stone pillar; something drips at the top of the stairs.
 */
export const mystery03: LevelDefinition = {
  id: 'mystery-03',
  mode: 'mystery',
  index: 3,
  start: { x: 225, y: 860 },
  target: { position: { x: 225, y: 90 }, sound: 'targetWaterDrop' },
  obstacles: [
    { kind: 'rect', x: 0, y: 560, w: 180, h: 22, material: 'wall' },
    { kind: 'rect', x: 270, y: 560, w: 180, h: 22, material: 'wall' },
    { kind: 'circle', x: 225, y: 420, r: 34, material: 'rock' },
    { kind: 'circle', x: 110, y: 720, r: 24, material: 'furniture' },
    { kind: 'circle', x: 340, y: 740, r: 24, material: 'furniture' },
    { kind: 'circle', x: 120, y: 280, r: 22, material: 'furniture' },
    { kind: 'circle', x: 330, y: 260, r: 22, material: 'furniture' },
    { kind: 'rect', x: 160, y: 180, w: 130, h: 20, material: 'wall', fromDifficulty: 'normal' },
    { kind: 'circle', x: 225, y: 650, r: 20, material: 'furniture', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'mystery-03-story',
      position: { x: 410, y: 420 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's03' },
    },
  ],
  ambience: 'ambCellar',
  baseTimeSeconds: 90,
  requiredStars: 4,
  revealImage: require('@assets/images/mystery/mystery-03.webp'),
};
