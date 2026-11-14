import { clamp, normalize, type Shape, type Vec2 } from './geometry';

/**
 * Simple, physics-engine-free collision for a circular player against
 * rectangles and circles.
 *
 * Strategy: move in small sub-steps (so a fast player can't tunnel through
 * a thin wall), and after each sub-step push the player out of anything it
 * overlaps. Pushing out along the contact normal naturally lets the player
 * SLIDE along walls instead of sticking to them.
 */

export interface MoveResult {
  position: Vec2;
  /**
   * Average contact normal this move (pointing from the obstacle toward the
   * player), or null if nothing was touched. Its direction tells us which
   * side the wall is on, e.g. normal.x > 0 → the wall is to the LEFT.
   */
  contactNormal: Vec2 | null;
}

/**
 * Push a circle out of one shape. Returns the correction vector (zero if
 * not overlapping).
 */
export function penetration(center: Vec2, radius: number, shape: Shape): Vec2 | null {
  if (shape.kind === 'circle') {
    const dx = center.x - shape.x;
    const dy = center.y - shape.y;
    const dist = Math.hypot(dx, dy);
    const minDist = radius + shape.r;
    if (dist >= minDist) return null;
    if (dist < 1e-6) return { x: 0, y: -minDist }; // exactly centred: push up
    const depth = minDist - dist;
    return { x: (dx / dist) * depth, y: (dy / dist) * depth };
  }

  // Rectangle: find the closest point on the rect to the circle centre.
  const closestX = clamp(center.x, shape.x, shape.x + shape.w);
  const closestY = clamp(center.y, shape.y, shape.y + shape.h);
  const dx = center.x - closestX;
  const dy = center.y - closestY;
  const dist = Math.hypot(dx, dy);

  if (dist > 1e-6) {
    if (dist >= radius) return null;
    const depth = radius - dist;
    return { x: (dx / dist) * depth, y: (dy / dist) * depth };
  }

  // Centre is INSIDE the rect: push out through the nearest edge.
  const left = center.x - shape.x;
  const right = shape.x + shape.w - center.x;
  const top = center.y - shape.y;
  const bottom = shape.y + shape.h - center.y;
  const min = Math.min(left, right, top, bottom);
  if (min === left) return { x: -(left + radius), y: 0 };
  if (min === right) return { x: right + radius, y: 0 };
  if (min === top) return { x: 0, y: -(top + radius) };
  return { x: 0, y: bottom + radius };
}

/**
 * Move a circle by `delta`, resolving collisions with `obstacles` and the
 * world bounds (which act as walls).
 */
export function moveWithCollisions(
  from: Vec2,
  delta: Vec2,
  radius: number,
  obstacles: readonly Shape[],
  world: { width: number; height: number },
): MoveResult {
  const travel = Math.hypot(delta.x, delta.y);
  // Sub-step size of half the radius is small enough to never skip a wall
  // thicker than the player, while staying cheap (usually 1–2 steps/frame).
  const steps = Math.max(1, Math.ceil(travel / (radius * 0.5)));
  const stepX = delta.x / steps;
  const stepY = delta.y / steps;

  let x = from.x;
  let y = from.y;
  let nx = 0;
  let ny = 0;
  let touched = false;

  for (let s = 0; s < steps; s++) {
    x += stepX;
    y += stepY;
    // A few relaxation passes handle corners where two shapes meet.
    for (let pass = 0; pass < 3; pass++) {
      let moved = false;
      for (const shape of obstacles) {
        const push = penetration({ x, y }, radius, shape);
        if (push) {
          x += push.x;
          y += push.y;
          nx += push.x;
          ny += push.y;
          touched = true;
          moved = true;
        }
      }
      if (!moved) break;
    }

    // World bounds.
    if (x < radius) {
      nx += radius - x;
      x = radius;
      touched = true;
    } else if (x > world.width - radius) {
      nx -= x - (world.width - radius);
      x = world.width - radius;
      touched = true;
    }
    if (y < radius) {
      ny += radius - y;
      y = radius;
      touched = true;
    } else if (y > world.height - radius) {
      ny -= y - (world.height - radius);
      y = world.height - radius;
      touched = true;
    }
  }

  return {
    position: { x, y },
    contactNormal: touched ? normalize({ x: nx, y: ny }) : null,
  };
}
