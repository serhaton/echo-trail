import { cheerfulMode } from './cheerful';
import { mysteryMode } from './mystery';
import { tensionMode } from './tension';
import type { ModeDefinition, ModeId } from './types';
import { zenMode } from './zen';

export type { ModeDefinition, ModeId, TimeoutBehavior, TimeSoundKind } from './types';

/** All modes in menu order. */
export const MODES: readonly ModeDefinition[] = [zenMode, mysteryMode, tensionMode, cheerfulMode];

const byId = Object.fromEntries(MODES.map((m) => [m.id, m])) as Record<ModeId, ModeDefinition>;

export function getMode(id: ModeId): ModeDefinition {
  return byId[id];
}

/** Type guard for route params such as `journey/[mode]`. */
export function isModeId(value: unknown): value is ModeId {
  return typeof value === 'string' && value in byId;
}
