import type { Vec2 } from './geometry';

/**
 * The coloured trail the player leaves behind.
 *
 * Points are grouped into small fixed-size CHUNKS. Finished chunks never
 * change, so the renderer can build their Skia paths once and cache them;
 * only the short "live" chunk at the head is rebuilt while walking. That
 * keeps rendering cost flat no matter how long the trail gets.
 *
 * Each chunk remembers how far along the trail it starts, which drives its
 * colour (the colour slowly cycles through the mode's palette as you walk).
 */

export interface TrailChunk {
  /** Stable id for React keys / caching. */
  id: number;
  points: Vec2[];
  /** Trail distance (world units) at the chunk's first point. */
  startDistance: number;
}

/** Minimum spacing between recorded points (world units). */
const MIN_SPACING = 3;
/** Points per chunk. Small = smoother colour change, more draw calls. */
const CHUNK_SIZE = 20;

type Listener = () => void;

export class Trail {
  private chunks: TrailChunk[] = [];
  private live: TrailChunk = { id: 0, points: [], startDistance: 0 };
  private totalDistance = 0;
  private nextId = 1;
  private listeners = new Set<Listener>();
  /** Incremented on every visible change; used as the external-store snapshot. */
  private version = 0;
  private lastNotify = 0;

  /** Record the player's position; ignores tiny movements. */
  add(p: Vec2, now = Date.now()) {
    const pts = this.live.points;
    const last = pts[pts.length - 1];
    if (last) {
      const d = Math.hypot(p.x - last.x, p.y - last.y);
      if (d < MIN_SPACING) return;
      this.totalDistance += d;
    }
    pts.push({ x: p.x, y: p.y });

    if (pts.length >= CHUNK_SIZE) {
      this.chunks.push(this.live);
      // The new chunk starts at the last point so segments join seamlessly.
      this.live = { id: this.nextId++, points: [pts[pts.length - 1]!], startDistance: this.totalDistance };
      this.emit();
    } else if (now - this.lastNotify > 50) {
      // Live head: refresh at most 20×/s, plenty for a soft glowing line.
      this.emit(now);
    }
  }

  reset() {
    this.chunks = [];
    this.live = { id: this.nextId++, points: [], startDistance: 0 };
    this.totalDistance = 0;
    this.emit();
  }

  get finishedChunks(): readonly TrailChunk[] {
    return this.chunks;
  }

  get liveChunk(): TrailChunk {
    return this.live;
  }

  get length(): number {
    return this.totalDistance;
  }

  // --- external store (useSyncExternalStore) ---
  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getVersion = () => this.version;

  private emit(now = Date.now()) {
    this.version++;
    this.lastNotify = now;
    for (const l of this.listeners) l();
  }
}
