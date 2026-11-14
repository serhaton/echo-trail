import { AudioManager } from 'react-native-audio-api';

import { ValueStore } from '@/game/valueStore';

/**
 * Headphone detection.
 *
 * iOS reports the current audio route's output ports (AVAudioSessionPort
 * types). Anything worn on the ears counts as headphones; the phone's
 * speaker / receiver, AirPlay, car audio etc. do not.
 *
 * 'unknown' means the route couldn't be read; the UI should then ask the
 * player instead of guessing.
 */
export type HeadphoneState = 'connected' | 'disconnected' | 'unknown';

const HEADPHONE_PORTS = new Set([
  'Headphones', // wired / Lightning / USB-C headphones
  'BluetoothA2DPOutput', // AirPods & most Bluetooth headphones (music quality)
  'BluetoothLE', // LE Audio hearing aids / earbuds
  'BluetoothHFP', // Bluetooth headset in "call" mode
]);

export async function detectHeadphones(): Promise<HeadphoneState> {
  try {
    const info = await AudioManager.getDevicesInfo();
    const outputs = info.currentOutputs;
    if (outputs.length === 0) return 'unknown';
    return outputs.some((o) => HEADPHONE_PORTS.has(o.category)) ? 'connected' : 'disconnected';
  } catch (error) {
    console.warn('[headphones] could not read audio route', error);
    return 'unknown';
  }
}

/**
 * Call `onChange` whenever headphones are plugged in / pulled out.
 * Returns an unsubscribe function.
 */
export function watchHeadphones(onChange: (state: HeadphoneState) => void): () => void {
  const sub = AudioManager.addSystemEventListener('routeChange', () => {
    void detectHeadphones().then(onChange);
  });
  return () => sub?.remove();
}

/**
 * When detection fails, the player is asked once per app session. The
 * answer lives in memory only, so it never overrides detection later.
 */
export const sessionHeadphoneAnswer = new ValueStore<'headphones' | 'speaker' | null>(null);
