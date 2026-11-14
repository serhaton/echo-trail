import type { TimeSoundKind } from '@/modes';

import type { AudioEngine } from './types';

/**
 * Communicates the remaining time through sound, per mode:
 *
 *  fadingBell (Zen)          a bell every BELL_INTERVAL seconds; each strike is
 *                            quieter and slightly lower as time drains away.
 *                            In the last 10 s a soft high chime marks each second.
 *  acceleratingClock (Mystery) an old wall clock: tick… tock… getting faster
 *                            as time runs out.
 *  heartbeat (Tension)       "lub-dub", faster and louder as time runs out.
 *  chime (Cheerful)          a little marimba tune that speeds up.
 *
 * Time sounds are deliberately centred (not spatial), quieter than the
 * target and in a different register, so they never compete with it.
 *
 * Driven by the game loop: call update(dt, fraction) every frame.
 */

const BELL_INTERVAL = 12;
const CLOCK_SLOWEST = 1.0; // seconds between ticks at the start
const CLOCK_FASTEST = 0.33; // … when time is almost up

const HEART_SLOWEST = 1.1;
const HEART_FASTEST = 0.42;
const CHIME_SLOWEST = 1.4;
const CHIME_FASTEST = 0.4;
/** Pentatonic steps (playback rates) for the Cheerful tune. */
const CHIME_TUNE = [1, 1.125, 1.26, 1.5, 1.68, 1.5, 1.26, 1.125];

export type TimeSoundKey = 'timeBell' | 'timeClockTick' | 'timeHeartbeat' | 'timeMarimba';

/** Which registered sounds a kind needs (for preloading). */
export function timeSoundKeys(kind: TimeSoundKind): TimeSoundKey[] {
  switch (kind) {
    case 'fadingBell':
      return ['timeBell'];
    case 'acceleratingClock':
      return ['timeClockTick'];
    case 'heartbeat':
      return ['timeHeartbeat'];
    case 'chime':
      return ['timeMarimba'];
    default:
      return [];
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export class TimeSoundPlayer {
  private sinceLast = Infinity; // fire immediately on the first update
  private tickIsTock = false;
  private step = 0;
  private dubIn: number | null = null;

  constructor(
    private readonly engine: AudioEngine,
    private readonly kind: TimeSoundKind,
  ) {}

  /**
   * @param dt        seconds since the previous frame
   * @param fraction  time left, 1 (full) → 0 (up)
   */
  update(dt: number, fraction: number) {
    this.sinceLast += dt;
    const used = 1 - Math.max(0, Math.min(1, fraction));

    // Second half of a heartbeat ("dub"), shortly after the "lub".
    if (this.dubIn != null) {
      this.dubIn -= dt;
      if (this.dubIn <= 0) {
        this.dubIn = null;
        this.engine.playOneShot('timeHeartbeat', { volume: lerp(0.35, 0.7, used), playbackRate: 1.15 });
      }
    }

    if (this.kind === 'fadingBell') {
      if (this.sinceLast >= BELL_INTERVAL) {
        this.sinceLast = 0;
        this.engine.playOneShot('timeBell', {
          volume: lerp(0.5, 0.14, used),
          playbackRate: lerp(1, 0.94, used),
        });
      }
    } else if (this.kind === 'acceleratingClock') {
      // Ease-in curve: the speed-up is gentle at first and urgent at the end.
      const interval = lerp(CLOCK_SLOWEST, CLOCK_FASTEST, used * used);
      if (this.sinceLast >= interval) {
        this.sinceLast = 0;
        this.tickIsTock = !this.tickIsTock;
        this.engine.playOneShot('timeClockTick', {
          volume: lerp(0.6, 0.9, used),
          // "tock" is a touch lower than "tick", like a real clock.
          playbackRate: this.tickIsTock ? 0.82 : 1,
        });
      }
    } else {
      this.updateExtra(used);
    }
  }

  private updateExtra(used: number) {
    if (this.kind === 'heartbeat') {
      const interval = lerp(HEART_SLOWEST, HEART_FASTEST, used * used);
      if (this.sinceLast >= interval) {
        this.sinceLast = 0;
        this.engine.playOneShot('timeHeartbeat', { volume: lerp(0.5, 0.95, used) });
        this.dubIn = Math.min(0.16, interval * 0.3);
      }
    } else if (this.kind === 'chime') {
      const interval = lerp(CHIME_SLOWEST, CHIME_FASTEST, used * used);
      if (this.sinceLast >= interval) {
        this.sinceLast = 0;
        const rate = CHIME_TUNE[this.step++ % CHIME_TUNE.length]!;
        this.engine.playOneShot('timeMarimba', { volume: lerp(0.3, 0.5, used), playbackRate: rate });
      }
    }
  }

  /**
   * One of the last 10 seconds just started. Mystery's clock is already
   * racing, so only Zen adds a cue: a short, soft high chime each second.
   */
  finalSecond() {
    if (this.kind === 'fadingBell') {
      this.engine.playOneShot('timeBell', { volume: 0.22, playbackRate: 2 });
    }
  }

  /** The countdown just hit zero. */
  timeUp() {
    if (this.kind === 'fadingBell') {
      // One last deep, quiet strike: the day's bell has faded.
      this.engine.playOneShot('timeBell', { volume: 0.35, playbackRate: 0.75 });
    }
  }

  reset() {
    this.sinceLast = Infinity;
    this.tickIsTock = false;
    this.step = 0;
    this.dubIn = null;
  }
}
