import type { ModeDefinition } from './types';

/** Mystery: follow a lost person's trail through an abandoned mansion. */
export const mysteryMode: ModeDefinition = {
  id: 'mystery',
  status: 'available',
  familyFriendly: true,
  palette: 'mystery',
  timeSound: 'acceleratingClock',
  timeoutBehavior: 'fail',
  reverb: 0.18,
  i18nKey: 'modes.mystery',
};
