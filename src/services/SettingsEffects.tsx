import { useEffect } from 'react';

import { audioEngine } from '@/audio';

import { setHapticsEnabled } from './haptics';
import { useSettings } from './SettingsProvider';

/**
 * Pushes saved settings into the services that act on them (audio buses,
 * haptics). Rendered once inside the providers; draws nothing.
 */
export function SettingsEffects() {
  const { sfxVolume, ambientVolume, hapticsEnabled } = useSettings().settings;
  useEffect(() => audioEngine.setBusVolume('sfx', sfxVolume), [sfxVolume]);
  useEffect(() => audioEngine.setBusVolume('ambient', ambientVolume), [ambientVolume]);
  useEffect(() => setHapticsEnabled(hapticsEnabled), [hapticsEnabled]);
  return null;
}
