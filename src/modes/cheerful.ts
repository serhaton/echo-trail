import type { ModeDefinition } from './types';

/** Cheerful: a day at the fair. Bright sounds, stars to collect, rainbow trails. */
export const cheerfulMode: ModeDefinition = {
  id: 'cheerful',
  status: 'available',
  familyFriendly: true,
  palette: 'cheerful',
  timeSound: 'chime',
  timeoutBehavior: 'fail',
  reverb: 0,
  // The trail runs through the whole rainbow three times faster than usual.
  trailColorStep: 60,
  i18nKey: 'modes.cheerful',
};
