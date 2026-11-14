import { atLeast, type Difficulty } from '@/game/difficulty';

import { cheerful01 } from './cheerful/cheerful-01';
import { cheerful02 } from './cheerful/cheerful-02';
import { cheerful03 } from './cheerful/cheerful-03';
import { cheerful04 } from './cheerful/cheerful-04';
import { cheerful05 } from './cheerful/cheerful-05';
import { cheerful06 } from './cheerful/cheerful-06';
import { cheerful07 } from './cheerful/cheerful-07';
import { cheerful08 } from './cheerful/cheerful-08';
import { cheerful09 } from './cheerful/cheerful-09';
import { cheerful10 } from './cheerful/cheerful-10';
import { cheerful11 } from './cheerful/cheerful-11';
import { cheerful12 } from './cheerful/cheerful-12';
import { cheerful13 } from './cheerful/cheerful-13';
import { cheerful14 } from './cheerful/cheerful-14';
import { cheerful15 } from './cheerful/cheerful-15';
import { cheerful16 } from './cheerful/cheerful-16';
import { cheerful17 } from './cheerful/cheerful-17';
import { cheerful18 } from './cheerful/cheerful-18';
import { cheerful19 } from './cheerful/cheerful-19';
import { cheerful20 } from './cheerful/cheerful-20';
import { cheerful21 } from './cheerful/cheerful-21';
import { cheerful22 } from './cheerful/cheerful-22';
import { cheerful23 } from './cheerful/cheerful-23';
import { cheerful24 } from './cheerful/cheerful-24';
import { cheerful25 } from './cheerful/cheerful-25';
import { cheerful26 } from './cheerful/cheerful-26';
import { cheerful27 } from './cheerful/cheerful-27';
import { cheerful28 } from './cheerful/cheerful-28';
import { cheerful29 } from './cheerful/cheerful-29';
import { cheerful30 } from './cheerful/cheerful-30';
import { mystery01 } from './mystery/mystery-01';
import { mystery02 } from './mystery/mystery-02';
import { mystery03 } from './mystery/mystery-03';
import { mystery04 } from './mystery/mystery-04';
import { mystery05 } from './mystery/mystery-05';
import { mystery06 } from './mystery/mystery-06';
import { mystery07 } from './mystery/mystery-07';
import { mystery08 } from './mystery/mystery-08';
import { mystery09 } from './mystery/mystery-09';
import { mystery10 } from './mystery/mystery-10';
import { mystery11 } from './mystery/mystery-11';
import { mystery12 } from './mystery/mystery-12';
import { mystery13 } from './mystery/mystery-13';
import { mystery14 } from './mystery/mystery-14';
import { mystery15 } from './mystery/mystery-15';
import { mystery16 } from './mystery/mystery-16';
import { mystery17 } from './mystery/mystery-17';
import { mystery18 } from './mystery/mystery-18';
import { mystery19 } from './mystery/mystery-19';
import { mystery20 } from './mystery/mystery-20';
import { mystery21 } from './mystery/mystery-21';
import { mystery22 } from './mystery/mystery-22';
import { mystery23 } from './mystery/mystery-23';
import { mystery24 } from './mystery/mystery-24';
import { mystery25 } from './mystery/mystery-25';
import { mystery26 } from './mystery/mystery-26';
import { mystery27 } from './mystery/mystery-27';
import { mystery28 } from './mystery/mystery-28';
import { mystery29 } from './mystery/mystery-29';
import { mystery30 } from './mystery/mystery-30';
import { tension01 } from './tension/tension-01';
import { tension02 } from './tension/tension-02';
import { tension03 } from './tension/tension-03';
import { tension04 } from './tension/tension-04';
import { tension05 } from './tension/tension-05';
import { tension06 } from './tension/tension-06';
import { tension07 } from './tension/tension-07';
import { tension08 } from './tension/tension-08';
import { tension09 } from './tension/tension-09';
import { tension10 } from './tension/tension-10';
import { tension11 } from './tension/tension-11';
import { tension12 } from './tension/tension-12';
import { tension13 } from './tension/tension-13';
import { tension14 } from './tension/tension-14';
import { tension15 } from './tension/tension-15';
import { tension16 } from './tension/tension-16';
import { tension17 } from './tension/tension-17';
import { tension18 } from './tension/tension-18';
import { tension19 } from './tension/tension-19';
import { tension20 } from './tension/tension-20';
import { tension21 } from './tension/tension-21';
import { tension22 } from './tension/tension-22';
import { tension23 } from './tension/tension-23';
import { tension24 } from './tension/tension-24';
import { tension25 } from './tension/tension-25';
import { tension26 } from './tension/tension-26';
import { tension27 } from './tension/tension-27';
import { tension28 } from './tension/tension-28';
import { tension29 } from './tension/tension-29';
import { tension30 } from './tension/tension-30';
import { test01 } from './test/test-01';
import type { LevelDefinition, Obstacle } from './types';
import { zen01 } from './zen/zen-01';
import { zen02 } from './zen/zen-02';
import { zen03 } from './zen/zen-03';
import { zen04 } from './zen/zen-04';
import { zen05 } from './zen/zen-05';
import { zen06 } from './zen/zen-06';
import { zen07 } from './zen/zen-07';
import { zen08 } from './zen/zen-08';
import { zen09 } from './zen/zen-09';
import { zen10 } from './zen/zen-10';
import { zen11 } from './zen/zen-11';
import { zen12 } from './zen/zen-12';
import { zen13 } from './zen/zen-13';
import { zen14 } from './zen/zen-14';
import { zen15 } from './zen/zen-15';
import { zen16 } from './zen/zen-16';
import { zen17 } from './zen/zen-17';
import { zen18 } from './zen/zen-18';
import { zen19 } from './zen/zen-19';
import { zen20 } from './zen/zen-20';
import { zen21 } from './zen/zen-21';
import { zen22 } from './zen/zen-22';
import { zen23 } from './zen/zen-23';
import { zen24 } from './zen/zen-24';
import { zen25 } from './zen/zen-25';
import { zen26 } from './zen/zen-26';
import { zen27 } from './zen/zen-27';
import { zen28 } from './zen/zen-28';
import { zen29 } from './zen/zen-29';
import { zen30 } from './zen/zen-30';

export type {
  CollectibleDefinition,
  LevelDefinition,
  Obstacle,
  ObstacleMaterial,
  TargetDefinition,
} from './types';

/** Every level in the game. Journey order comes from each level's `index`. */
// prettier-ignore
const ALL_LEVELS: readonly LevelDefinition[] = [
  zen01, zen02, zen03, zen04, zen05, zen06, zen07, zen08, zen09, zen10, zen11, zen12, zen13, zen14, zen15, zen16, zen17, zen18, zen19, zen20, zen21, zen22, zen23, zen24, zen25, zen26, zen27, zen28, zen29, zen30,
  mystery01, mystery02, mystery03, mystery04, mystery05, mystery06, mystery07, mystery08, mystery09, mystery10, mystery11, mystery12, mystery13, mystery14, mystery15, mystery16, mystery17, mystery18, mystery19, mystery20, mystery21, mystery22, mystery23, mystery24, mystery25, mystery26, mystery27, mystery28, mystery29, mystery30,
  tension01, tension02, tension03, tension04, tension05, tension06, tension07, tension08, tension09, tension10, tension11, tension12, tension13, tension14, tension15, tension16, tension17, tension18, tension19, tension20, tension21, tension22, tension23, tension24, tension25, tension26, tension27, tension28, tension29, tension30,
  cheerful01, cheerful02, cheerful03, cheerful04, cheerful05, cheerful06, cheerful07, cheerful08, cheerful09, cheerful10, cheerful11, cheerful12, cheerful13, cheerful14, cheerful15, cheerful16, cheerful17, cheerful18, cheerful19, cheerful20, cheerful21, cheerful22, cheerful23, cheerful24, cheerful25, cheerful26, cheerful27, cheerful28, cheerful29, cheerful30,
  test01,
];

const byId = new Map(ALL_LEVELS.map((level) => [level.id, level]));

export function allLevels(): readonly LevelDefinition[] {
  return ALL_LEVELS;
}

export function getLevel(id: string): LevelDefinition | undefined {
  return byId.get(id);
}

/** The obstacles that exist at a given difficulty. */
export function obstaclesFor(level: LevelDefinition, difficulty: Difficulty): Obstacle[] {
  return level.obstacles.filter((o) => !o.fromDifficulty || atLeast(difficulty, o.fromDifficulty));
}
