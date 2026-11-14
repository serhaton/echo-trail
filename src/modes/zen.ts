import type { ModeDefinition } from './types';

/** Zen: a day-long nature walk. Gentle, no fail state. */
export const zenMode: ModeDefinition = {
  id: 'zen',
  status: 'available',
  familyFriendly: true,
  palette: 'zen',
  timeSound: 'fadingBell',
  timeoutBehavior: 'continue',
  reverb: 0,
  i18nKey: 'modes.zen',
};
