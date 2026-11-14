import { Blur, Group, Paint, Path, Skia, type SkPath } from '@shopify/react-native-skia';
import { useSyncExternalStore } from 'react';
import type { SharedValue } from 'react-native-reanimated';

import type { Vec2 } from '@/game/geometry';
import type { Trail, TrailChunk } from '@/game/trail';
import { cyclePalette } from '@/theme/color';

/** Default world units of walking per palette colour step. */
const DEFAULT_COLOR_STEP = 180;
const GLOW_WIDTH = 20;
const CORE_WIDTH = 2.5;

/**
 * Finished chunks never change, so their paths are built once and cached.
 * A WeakMap keyed by the chunk object frees entries automatically when the
 * trail is reset.
 */
const pathCache = new WeakMap<TrailChunk, SkPath | null>();

/** Smooth path through the points (quadratic curves through midpoints). */
function buildPath(points: readonly Vec2[]): SkPath | null {
  if (points.length < 2) return null;
  const b = Skia.PathBuilder.Make();
  const first = points[0]!;
  b.moveTo(first.x, first.y);
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]!;
    const next = points[i + 1]!;
    b.quadTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
  }
  const last = points[points.length - 1]!;
  b.lineTo(last.x, last.y);
  return b.build();
}

function chunkPath(chunk: TrailChunk): SkPath | null {
  if (!pathCache.has(chunk)) pathCache.set(chunk, buildPath(chunk.points));
  return pathCache.get(chunk) ?? null;
}

interface ColorTrailProps {
  trail: Trail;
  /** Mode palette the trail cycles through. */
  palette: readonly string[];
  /** Overall opacity (dimmed when the reveal image appears). */
  opacity: SharedValue<number>;
  /** World units of walking per colour step (smaller = faster rainbow). */
  colorStep?: number;
}

/**
 * The softly glowing trail behind the player. Two passes:
 *   1. a wide stroke drawn through ONE shared blur layer (soft colour wash),
 *   2. a thin bright core on top (the "thread" of light).
 *
 * Draw inside the world-space <Group>. Re-renders only when the trail
 * changes (subscribes to the Trail store), never the whole level screen.
 */
export function ColorTrail({
  trail,
  palette,
  opacity,
  colorStep = DEFAULT_COLOR_STEP,
}: ColorTrailProps) {
  useSyncExternalStore(trail.subscribe, trail.getVersion);

  const items: { key: number; path: SkPath; color: string }[] = [];
  for (const chunk of trail.finishedChunks) {
    const path = chunkPath(chunk);
    if (path) {
      items.push({
        key: chunk.id,
        path,
        color: cyclePalette(palette, chunk.startDistance / colorStep),
      });
    }
  }
  const live = trail.liveChunk;
  const livePath = buildPath(live.points);
  if (livePath) {
    items.push({
      key: live.id,
      path: livePath,
      color: cyclePalette(palette, live.startDistance / colorStep),
    });
  }

  return (
    <Group opacity={opacity}>
      <Group
        opacity={0.8}
        layer={
          <Paint>
            <Blur blur={9} />
          </Paint>
        }
      >
        {items.map((it) => (
          <Path
            key={it.key}
            path={it.path}
            style="stroke"
            strokeWidth={GLOW_WIDTH}
            strokeCap="round"
            strokeJoin="round"
            color={it.color}
          />
        ))}
      </Group>
      <Group opacity={0.85}>
        {items.map((it) => (
          <Path
            key={it.key}
            path={it.path}
            style="stroke"
            strokeWidth={CORE_WIDTH}
            strokeCap="round"
            strokeJoin="round"
            color={it.color}
          />
        ))}
      </Group>
    </Group>
  );
}
