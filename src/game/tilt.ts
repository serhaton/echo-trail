import { Accelerometer } from 'expo-sensors';

import type { Vec2 } from './geometry';

/**
 * Tilt control: reads the accelerometer and reports how far the phone
 * leans away from LYING FLAT, as a 2D vector in screen directions
 * (x: right, y: down), in units of g.
 *
 * Flat (screen up, like a tray) is always the zero point: a flat phone
 * never moves the player, however it was held when the level started.
 * Nothing is calibrated or remembered.
 *
 * iOS axes (portrait): lying flat x = 0 and y = 0. x grows when the right
 * edge dips; y grows when the top edge dips away from you. So dipping the
 * top edge = "walk up the screen" = negative screen y.
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

  /** Lean away from flat, in screen directions. Zero until the first reading. */
  get lean(): Vec2 {
    if (!this.raw) return { x: 0, y: 0 };
    return { x: this.raw.x, y: -this.raw.y };
  }
}
