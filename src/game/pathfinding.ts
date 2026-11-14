import { penetration } from './collision';
import type { Shape, Vec2 } from './geometry';

/**
 * Grid pathfinding for a circular walker among the level's obstacles.
 *
 * Used by the hint (point along the real walkable route, not through
 * walls) and by Tension's chaser.
 *
 * The level is sampled every NAV_STEP world units. `distanceField(goal)`
 * floods outward from a goal (Dijkstra, 8 directions) and stores, for each
 * walkable cell, the walking distance to it. Following the field downhill
 * from anywhere gives a shortest path, so one field answers "which way
 * from here?" for every position.
 */
export const NAV_STEP = 10;

const SQRT2 = Math.SQRT2;
/** dx, dy, cost */
const NEIGHBOURS = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, SQRT2],
  [1, -1, SQRT2],
  [-1, 1, SQRT2],
  [-1, -1, SQRT2],
] as const;

export class NavGrid {
  readonly cols: number;
  readonly rows: number;
  private readonly walkable: Uint8Array;

  constructor(
    private readonly obstacles: readonly Shape[],
    private readonly world: { width: number; height: number },
    private readonly radius: number,
  ) {
    this.cols = Math.floor(world.width / NAV_STEP) + 1;
    this.rows = Math.floor(world.height / NAV_STEP) + 1;
    this.walkable = new Uint8Array(this.cols * this.rows);
    for (let cy = 0; cy < this.rows; cy++) {
      for (let cx = 0; cx < this.cols; cx++) {
        if (this.isFree({ x: cx * NAV_STEP, y: cy * NAV_STEP })) this.walkable[cy * this.cols + cx] = 1;
      }
    }
  }

  /** Can the walker stand at this point? */
  isFree(p: Vec2): boolean {
    const r = this.radius;
    if (p.x < r || p.y < r || p.x > this.world.width - r || p.y > this.world.height - r) return false;
    for (const o of this.obstacles) if (penetration(p, r, o)) return false;
    return true;
  }

  /** Can the walker go from a to b in a straight line? */
  lineClear(a: Vec2, b: Vec2): boolean {
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(d / 4));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      if (!this.isFree({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })) return false;
    }
    return true;
  }

  /** Index of the walkable cell nearest to p (-1 if none close by). */
  private cellNear(p: Vec2): number {
    const cx = Math.round(p.x / NAV_STEP);
    const cy = Math.round(p.y / NAV_STEP);
    let best = -1;
    let bestD = Infinity;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -3; dx <= 3; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) continue;
        const i = y * this.cols + x;
        if (!this.walkable[i]) continue;
        const d = Math.hypot(x * NAV_STEP - p.x, y * NAV_STEP - p.y);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
    }
    return best;
  }

  /** Walking distance from every cell to `goal` (Infinity = unreachable). */
  distanceField(goal: Vec2): Float32Array {
    const { cols, rows, walkable } = this;
    const dist = new Float32Array(cols * rows).fill(Infinity);
    const start = this.cellNear(goal);
    if (start < 0) return dist;
    dist[start] = 0;
    // Binary min-heap of cell indices ordered by dist.
    const heap: number[] = [start];
    const less = (a: number, b: number) => dist[a]! < dist[b]!;
    const push = (v: number) => {
      let i = heap.push(v) - 1;
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (!less(heap[i]!, heap[parent]!)) break;
        [heap[i], heap[parent]] = [heap[parent]!, heap[i]!];
        i = parent;
      }
    };
    const pop = () => {
      const top = heap[0]!;
      const last = heap.pop()!;
      if (heap.length) {
        heap[0] = last;
        let i = 0;
        for (;;) {
          const l = i * 2 + 1;
          const r = l + 1;
          let m = i;
          if (l < heap.length && less(heap[l]!, heap[m]!)) m = l;
          if (r < heap.length && less(heap[r]!, heap[m]!)) m = r;
          if (m === i) break;
          [heap[i], heap[m]] = [heap[m]!, heap[i]!];
          i = m;
        }
      }
      return top;
    };
    while (heap.length) {
      const cur = pop();
      const cx = cur % cols;
      const cy = (cur - cx) / cols;
      const base = dist[cur]!;
      for (const [dx, dy, cost] of NEIGHBOURS) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const ni = ny * cols + nx;
        if (!walkable[ni]) continue;
        // No cutting corners diagonally past an obstacle.
        if (dx !== 0 && dy !== 0 && (!walkable[cy * cols + nx] || !walkable[ny * cols + cx])) continue;
        const nd = base + cost * NAV_STEP;
        if (nd < dist[ni]!) {
          dist[ni] = nd;
          push(ni);
        }
      }
    }
    return dist;
  }

  /**
   * A point to head for: follow the field downhill from `from` for about
   * `lookahead` units, then pick the farthest point on that stretch that
   * can be reached in a straight line. Returns null if there is no route.
   */
  waypoint(field: Float32Array, from: Vec2, lookahead: number): Vec2 | null {
    const { cols, rows } = this;
    let cur = this.cellNear(from);
    if (cur < 0 || field[cur] === Infinity) return null;
    const path: Vec2[] = [];
    let walked = 0;
    while (walked < lookahead && field[cur]! > 0) {
      const cx = cur % cols;
      const cy = (cur - cx) / cols;
      let next = -1;
      let best = field[cur]!;
      let stepCost = 0;
      for (const [dx, dy, cost] of NEIGHBOURS) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const ni = ny * cols + nx;
        if (dx !== 0 && dy !== 0 && (!this.walkable[cy * cols + nx] || !this.walkable[ny * cols + cx])) continue;
        if (field[ni]! < best) {
          best = field[ni]!;
          next = ni;
          stepCost = cost * NAV_STEP;
        }
      }
      if (next < 0) break;
      cur = next;
      walked += stepCost;
      path.push({ x: (cur % cols) * NAV_STEP, y: Math.floor(cur / cols) * NAV_STEP });
    }
    if (path.length === 0) return null;
    for (let i = path.length - 1; i > 0; i--) {
      if (this.lineClear(from, path[i]!)) return path[i]!;
    }
    return path[0]!;
  }
}
