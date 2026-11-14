import { difficultyRules, type Difficulty } from './difficulty';

/**
 * Countdown, star rating and the events the level reacts to.
 * Pure logic: driven by the game loop's dt, no timers of its own, so it
 * pauses automatically whenever the loop stops (reveal, background, …).
 */

/** Countdown length in seconds for a level at a difficulty. */
export function levelDuration(baseTimeSeconds: number, difficulty: Difficulty): number {
  return Math.round(baseTimeSeconds * difficultyRules[difficulty].timeMultiplier);
}

/** Share of time left needed for 3 / 2 stars. Anything less → 1 star. */
export const STAR_THRESHOLDS = { three: 0.5, two: 0.2 } as const;

export type StarCount = 1 | 2 | 3;

/**
 * Stars for a finished level. If the countdown already ran out (only
 * possible in modes that let you continue, i.e. Zen) it's always 1 star.
 */
export function starsFor(remaining: number, total: number, timedOut: boolean): StarCount {
  if (timedOut || total <= 0) return 1;
  const ratio = remaining / total;
  if (ratio >= STAR_THRESHOLDS.three) return 3;
  if (ratio >= STAR_THRESHOLDS.two) return 2;
  return 1;
}

export type CountdownEvent =
  /** Fired once for each of the last 10 whole seconds (10, 9, … 1). */
  | { type: 'finalSecond'; secondsLeft: number }
  | { type: 'timeUp' };

/** Seconds at which the "final seconds" haptic pulses begin. */
export const FINAL_SECONDS = 10;

export class Countdown {
  private remainingTime: number;
  private lastWholeSecond: number;
  private finished = false;

  constructor(public total: number) {
    this.remainingTime = total;
    this.lastWholeSecond = Math.ceil(total);
  }

  get remaining() {
    return Math.max(0, this.remainingTime);
  }

  /** 1 → 0 over the level. */
  get fraction() {
    return this.total > 0 ? this.remaining / this.total : 0;
  }

  get isUp() {
    return this.finished;
  }

  /** Advance by dt seconds; returns any events that happened. */
  tick(dt: number): CountdownEvent[] {
    if (this.finished) return [];
    this.remainingTime -= dt;
    const events: CountdownEvent[] = [];
    const whole = Math.ceil(this.remaining);
    if (whole < this.lastWholeSecond) {
      this.lastWholeSecond = whole;
      if (whole > 0 && whole <= FINAL_SECONDS) events.push({ type: 'finalSecond', secondsLeft: whole });
    }
    if (this.remainingTime <= 0) {
      this.finished = true;
      events.push({ type: 'timeUp' });
    }
    return events;
  }

  /** Add time (e.g. rewarded ad "+15 s", collectibles). Re-arms if it was up. */
  addTime(seconds: number) {
    this.remainingTime = this.remaining + seconds;
    this.total = Math.max(this.total, this.remainingTime);
    this.finished = false;
    this.lastWholeSecond = Math.ceil(this.remainingTime);
  }
}
