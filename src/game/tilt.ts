import { Accelerometer } from 'expo-sensors';

import type { Vec2 } from './geometry';

/**
 * The resting pose: the phone held with its top edge raised a little
 * toward you, this many degrees up from lying flat. It is how a phone is
 * naturally held while looking at the screen.
 */
export const TILT_REST_DEGREES = 25;
/** Accelerometer y at rest (y is 0 lying flat and -1 fully upright). */
const REST_Y = -Math.sin((TILT_REST_DEGREES * Math.PI) / 180);

/**
 * Tilt control: reads the accelerometer and reports how far the phone
 * leans away from its RESTING POSE, as a 2D vector in screen directions
 * (x: right, y: down), in units of g.
 *
 * The resting pose is fixed (see TILT_REST_DEGREES): held like that, the
 * player never moves, however the phone was held when the level started.
 * Nothing is calibrated or remembered.
 *
 * iOS axes (portrait): lying flat x = 0 and y = 0. x grows when the right
 * edge dips; y grows when the top edge dips away from you. So lowering the
 * top edge from the resting pose = "walk up the screen" = negative screen
 * y, and raising it further toward you = "walk down".
 */
export class TiltInput {
  private raw: Vec2 | null = null;
  private subscription: { remove(): void } | null = null;

  start() {
    if (this.subscription) return;
    Accelerometer.setUpdateInterval(16);
    this.subscription = Accelerometer.addListener(({ x, y }) => {
      // Light smoothing (hands tremble, sensors are noisy), seeded with the
      // first reading so there is no jump at the start.
      this.raw = this.raw
        ? { x: this.raw.x + (x - this.raw.x) * 0.25, y: this.raw.y + (y - this.raw.y) * 0.25 }
        : { x, y };
    });
  }

  stop() {
    this.subscription?.remove();
    this.subscription = null;
    this.raw = null;
  }

  /** Lean away from the resting pose, in screen directions. Zero until the first reading. */
  get lean(): Vec2 {
    if (!this.raw) return { x: 0, y: 0 };
    return { x: this.raw.x, y: -(this.raw.y - REST_Y) };
  }
}
