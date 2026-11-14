import type { Camera } from './camera';
import { screenToWorld } from './camera';
import { clamp, length, type Vec2 } from './geometry';

/**
 * Turning touch input into a desired walking velocity.
 *
 * Three schemes (chosen in Settings):
 *  - 'followFinger': walk toward the point under the finger.
 *  - 'joystick':     touch anywhere; the drag from the touch-down point is a
 *                    virtual stick. Easier one-handed on big phones.
 *  - 'tilt':         tilt the phone; no touch needed (see src/game/tilt.ts).
 */
export type ControlScheme = 'followFinger' | 'joystick' | 'tilt';

export interface TouchState {
  active: boolean;
  /** Where the finger first touched down (screen points). */
  origin: Vec2;
  /** Where the finger is now (screen points). */
  current: Vec2;
}

export interface MovementTuning {
  /** Top walking speed in world units per second. */
  maxSpeed: number;
  /** Seconds to reach target speed (higher = floatier). */
  accelTime: number;
  /** Seconds to stop after releasing the finger. */
  stopTime: number;
  /** Joystick: drag distance (screen points) that means full speed. */
  joystickRange: number;
  /** Joystick: ignore tiny drags below this (screen points). */
  joystickDeadzone: number;
  /** Follow-finger: start slowing down within this distance (world units). */
  arriveRadius: number;
  /** Tilt: lean away from flat (in g; 0.3 ≈ 17°) that means full speed. */
  tiltRange: number;
  /** Tilt: ignore leans smaller than this (in g; 0.06 ≈ 3.5°), so "flat" is easy to hold. */
  tiltDeadzone: number;
}

export const defaultMovementTuning: MovementTuning = {
  maxSpeed: 110,
  accelTime: 0.12,
  stopTime: 0.08,
  joystickRange: 60,
  joystickDeadzone: 6,
  arriveRadius: 40,
  tiltRange: 0.3,
  tiltDeadzone: 0.06,
};

/** The velocity the player WANTS to have right now (world units / s). */
export function desiredVelocity(
  scheme: ControlScheme,
  touch: TouchState,
  player: Vec2,
  camera: Camera,
  tuning: MovementTuning,
  /** Current lean away from flat (tilt scheme only). */
  lean: Vec2 = { x: 0, y: 0 },
): Vec2 {
  if (scheme === 'tilt') {
    const len = Math.hypot(lean.x, lean.y);
    if (len < tuning.tiltDeadzone) return { x: 0, y: 0 };
    const intensity = clamp(
      (len - tuning.tiltDeadzone) / (tuning.tiltRange - tuning.tiltDeadzone),
      0,
      1,
    );
    const speed = tuning.maxSpeed * intensity;
    return { x: (lean.x / len) * speed, y: (lean.y / len) * speed };
  }
  if (!touch.active) return { x: 0, y: 0 };

  if (scheme === 'joystick') {
    const dx = touch.current.x - touch.origin.x;
    const dy = touch.current.y - touch.origin.y;
    const len = Math.hypot(dx, dy);
    if (len < tuning.joystickDeadzone) return { x: 0, y: 0 };
    const intensity = clamp(
      (len - tuning.joystickDeadzone) / (tuning.joystickRange - tuning.joystickDeadzone),
      0,
      1,
    );
    const speed = tuning.maxSpeed * intensity;
    return { x: (dx / len) * speed, y: (dy / len) * speed };
  }

  // followFinger: head for the world point under the finger, easing off as
  // we arrive so the dot settles under the finger instead of jittering.
  const target = screenToWorld(camera, touch.current);
  const dx = target.x - player.x;
  const dy = target.y - player.y;
  const len = Math.hypot(dx, dy);
  if (len < 1) return { x: 0, y: 0 };
  const speed = tuning.maxSpeed * clamp(len / tuning.arriveRadius, 0, 1);
  return { x: (dx / len) * speed, y: (dy / len) * speed };
}

/**
 * Ease the current velocity toward the desired one. Frame-rate independent
 * (exponential smoothing), so 60 Hz and 120 Hz ProMotion feel identical.
 */
export function smoothVelocity(
  current: Vec2,
  desired: Vec2,
  dt: number,
  tuning: MovementTuning,
): Vec2 {
  const stopping = length(desired) < 1e-3;
  const tau = stopping ? tuning.stopTime : tuning.accelTime;
  const k = 1 - Math.exp(-dt / tau);
  return {
    x: current.x + (desired.x - current.x) * k,
    y: current.y + (desired.y - current.y) * k,
  };
}
