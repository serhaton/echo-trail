import { useEffect, useState } from 'react';

import { useStoreValue } from '@/game/valueStore';
import {
  detectHeadphones,
  sessionHeadphoneAnswer,
  watchHeadphones,
  type HeadphoneState,
} from '@/services/headphones';
import { useSettings } from '@/services/SettingsProvider';

export interface AudioOutputInfo {
  /** What iOS reports right now. */
  detected: HeadphoneState;
  /** Whether we treat the player as wearing headphones. */
  usingHeadphones: boolean;
  /** Visual direction cues (wave rings) are on. */
  visualCues: boolean;
  /** Detection failed and the player hasn't answered yet: ask before playing. */
  needsAnswer: boolean;
}

/**
 * Combines live headphone detection with the player's setting:
 *   auto        → follow detection; if detection fails, use the player's
 *                 answer for this session (or no headphones until asked,
 *                 so the player always gets help rather than none)
 *   headphones  → always headphones (no rings)
 *   speaker     → always speaker (rings on)
 */
export function useAudioOutput(): AudioOutputInfo {
  const { audioOutput } = useSettings().settings;
  const [detected, setDetected] = useState<HeadphoneState>('unknown');
  // False until the first detection finishes, so we never ask prematurely.
  const [checked, setChecked] = useState(false);
  const answer = useStoreValue(sessionHeadphoneAnswer);

  useEffect(() => {
    let alive = true;
    void detectHeadphones().then((s) => {
      if (!alive) return;
      setDetected(s);
      setChecked(true);
    });
    const unwatch = watchHeadphones((s) => alive && setDetected(s));
    return () => {
      alive = false;
      unwatch();
    };
  }, []);

  const usingHeadphones =
    audioOutput === 'headphones' ||
    (audioOutput === 'auto' &&
      (detected === 'connected' || (detected === 'unknown' && answer === 'headphones')));
  const needsAnswer =
    checked && audioOutput === 'auto' && detected === 'unknown' && answer == null;
  return { detected, usingHeadphones, visualCues: !usingHeadphones, needsAnswer };
}
