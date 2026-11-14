import { useEffect } from 'react';

/**
 * Keeps the screen on while a level is open: with tilt control (or while
 * simply listening) nothing touches the screen, so iOS would dim and lock.
 *
 * expo-keep-awake is a native module added after the first development
 * build. It is loaded defensively so an older build without it keeps
 * working (the screen just follows the normal auto-lock).
 */
type KeepAwakeModule = typeof import('expo-keep-awake');

let mod: KeepAwakeModule | null | undefined;
function load(): KeepAwakeModule | null {
  if (mod === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      mod = require('expo-keep-awake') as KeepAwakeModule;
    } catch {
      mod = null;
    }
  }
  return mod;
}

const TAG = 'echo-trail-level';

export function useKeepScreenAwake() {
  useEffect(() => {
    const m = load();
    m?.activateKeepAwakeAsync(TAG).catch(() => {});
    return () => {
      m?.deactivateKeepAwake(TAG).catch(() => {});
    };
  }, []);
}
