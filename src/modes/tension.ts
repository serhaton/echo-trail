import type { ModeDefinition } from './types';

/**
 * Tension: a night escape. Something follows you from where you started;
 * reach the target before it reaches you. Not family friendly.
 */
export const tensionMode: ModeDefinition = {
  id: 'tension',
  status: 'available',
  familyFriendly: false,
  palette: 'tension',
  timeSound: 'heartbeat',
  timeoutBehavior: 'fail',
  reverb: 0.12,
  chaser: true,
  i18nKey: 'modes.tension',
};
