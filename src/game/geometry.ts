/**
 * Basic 2D geometry shared by the game, audio and rendering layers.
 *
 * World coordinates: top-down map, origin top-left, y grows downward
 * (same orientation as the screen). Units are "world units"; a level is
 * WORLD_WIDTH × WORLD_HEIGHT and the camera scales it onto the screen.
 */

export interface Vec2 {
  x: number;
  y: number;
}

/** Every level is one portrait "scene" of this size (≈ a phone screen in points). */
export const WORLD_WIDTH = 450;
export const WORLD_HEIGHT = 900;

export interface RectShape {
  kind: 'rect';
  /** Top-left corner. */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CircleShape {
  kind: 'circle';
  /** Centre. */
  x: number;
  y: number;
  r: number;
}

export type Shape = RectShape | CircleShape;

export const vec = (x: number, y: number): Vec2 => ({ x, y });
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const length = (a: Vec2): number => Math.hypot(a.x, a.y);
export const distance = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);
export const clamp = (v: number, min: number, max: number): number =>
  v < min ? min : v > max ? max : v;

export function normalize(a: Vec2): Vec2 {
  const len = length(a);
  return len > 1e-9 ? { x: a.x / len, y: a.y / len } : { x: 0, y: 0 };
}
