import type { Vec2 } from './geometry';

/**
 * Maps world units to screen points: screen = world × scale + offset.
 *
 * The whole level always fits on screen (letterboxed). Because the game is
 * dark, the bars on wider screens (iPad) are invisible.
 */
export interface Camera {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/** Fit a world into a viewport (both in their own units), centred. */
export function fitCamera(
  world: { width: number; height: number },
  viewport: { x: number; y: number; width: number; height: number },
): Camera {
  const scale = Math.min(viewport.width / world.width, viewport.height / world.height);
  return {
    scale,
    offsetX: viewport.x + (viewport.width - world.width * scale) / 2,
    offsetY: viewport.y + (viewport.height - world.height * scale) / 2,
  };
}

export function screenToWorld(camera: Camera, p: Vec2): Vec2 {
  return { x: (p.x - camera.offsetX) / camera.scale, y: (p.y - camera.offsetY) / camera.scale };
}

export function worldToScreen(camera: Camera, p: Vec2): Vec2 {
  return { x: p.x * camera.scale + camera.offsetX, y: p.y * camera.scale + camera.offsetY };
}
