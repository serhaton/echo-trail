import type { LevelDefinition } from '../types';

/**
 * The kitchen. Counters along the walls, a big table, the old hearth; the kettle hums somewhere.
 */
export const mystery04: LevelDefinition = {
  id: 'mystery-04',
  mode: 'mystery',
  index: 4,
  start: { x: 60, y: 860 },
  target: { position: { x: 380, y: 120 }, sound: 'targetMusicBox' },
  obstacles: [
    { kind: 'rect', x: 0, y: 0, w: 450, h: 40, material: 'furniture' },
    { kind: 'rect', x: 410, y: 40, w: 40, h: 300, material: 'furniture' },
    { kind: 'rect', x: 120, y: 420, w: 220, h: 90, material: 'furniture' },
    { kind: 'rect', x: 0, y: 620, w: 250, h: 24, material: 'wall' },
    { kind: 'rect', x: 300, y: 240, w: 110, h: 70, material: 'furniture' },
    { kind: 'circle', x: 120, y: 280, r: 22, material: 'furniture', fromDifficulty: 'normal' },
    { kind: 'rect', x: 330, y: 620, w: 120, h: 24, material: 'wall', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'mystery-04-story',
      position: { x: 40, y: 350 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's04' },
    },
    {
      id: 'mystery-04-time',
      position: { x: 420, y: 780 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
  ],
  ambience: 'ambHouse',
  baseTimeSeconds: 90,
  revealImage: require('@assets/images/mystery/mystery-04.webp'),
};
