import type { LevelDefinition } from '../types';

/**
 * The conservatory. Rows of plant pots; the music box sits among the lemon trees.
 */
export const mystery06: LevelDefinition = {
  id: 'mystery-06',
  mode: 'mystery',
  index: 6,
  start: { x: 40, y: 860 },
  target: { position: { x: 400, y: 110 }, sound: 'targetMusicBox' },
  obstacles: [
    { kind: 'circle', x: 100, y: 700, r: 22, material: 'furniture' },
    { kind: 'circle', x: 200, y: 700, r: 22, material: 'furniture' },
    { kind: 'circle', x: 300, y: 700, r: 22, material: 'furniture' },
    { kind: 'circle', x: 100, y: 520, r: 22, material: 'furniture' },
    { kind: 'circle', x: 200, y: 520, r: 22, material: 'furniture' },
    { kind: 'circle', x: 300, y: 520, r: 22, material: 'furniture' },
    { kind: 'circle', x: 100, y: 340, r: 22, material: 'furniture' },
    { kind: 'circle', x: 200, y: 340, r: 22, material: 'furniture' },
    { kind: 'circle', x: 300, y: 340, r: 22, material: 'furniture' },
    { kind: 'circle', x: 150, y: 610, r: 22, material: 'furniture' },
    { kind: 'circle', x: 250, y: 610, r: 22, material: 'furniture' },
    { kind: 'circle', x: 350, y: 610, r: 22, material: 'furniture' },
    { kind: 'circle', x: 150, y: 430, r: 22, material: 'furniture' },
    { kind: 'circle', x: 250, y: 430, r: 22, material: 'furniture' },
    { kind: 'circle', x: 350, y: 430, r: 22, material: 'furniture' },
    { kind: 'circle', x: 150, y: 250, r: 22, material: 'furniture' },
    { kind: 'circle', x: 250, y: 250, r: 22, material: 'furniture' },
    { kind: 'circle', x: 350, y: 250, r: 22, material: 'furniture' },
    { kind: 'circle', x: 400, y: 610, r: 20, material: 'furniture', fromDifficulty: 'normal' },
    { kind: 'circle', x: 60, y: 430, r: 20, material: 'furniture', fromDifficulty: 'hard' },
  ],
  collectibles: [
    {
      id: 'mystery-06-story',
      position: { x: 420, y: 780 },
      sound: 'placeholderCollectible',
      reward: { kind: 'story', storyId: 's06' },
    },
    {
      id: 'mystery-06-time',
      position: { x: 40, y: 200 },
      sound: 'placeholderCollectible',
      reward: { kind: 'time', seconds: 10 },
    },
  ],
  ambience: 'ambRain',
  baseTimeSeconds: 105,
  revealImage: require('@assets/images/mystery/mystery-06.webp'),
};
