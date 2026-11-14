import { Circle, DashPathEffect, Group, Line, Rect, vec } from '@shopify/react-native-skia';

import type { LevelDefinition, ObstacleMaterial } from '@/data/levels';
import { colors } from '@/theme';

/** Debug colours per obstacle material (developer view only). */
const materialColor: Record<ObstacleMaterial, string> = {
  wall: 'rgba(255, 90, 90, 0.5)',
  tree: 'rgba(110, 220, 120, 0.5)',
  rock: 'rgba(180, 180, 180, 0.5)',
  water: 'rgba(90, 160, 255, 0.5)',
  furniture: 'rgba(220, 160, 90, 0.5)',
};

interface DebugOverlayProps {
  level: LevelDefinition;
  world: { width: number; height: number };
  reachRadius: number;
}

/**
 * Level-design view: shows the invisible obstacles, the target and its
 * reach radius, collectibles, the start point and the world bounds.
 *
 * Rendered only in development builds when toggled on; never in release.
 * Draw inside the world-space <Group> (sizes are world units).
 */
export function DebugOverlay({ level, world, reachRadius }: DebugOverlayProps) {
  const { target, start } = level;
  return (
    <Group>
      {/* World bounds */}
      <Rect
        x={0}
        y={0}
        width={world.width}
        height={world.height}
        style="stroke"
        strokeWidth={1}
        color="rgba(255,255,255,0.15)"
      >
        <DashPathEffect intervals={[6, 6]} />
      </Rect>

      {level.obstacles.map((o, i) =>
        o.kind === 'rect' ? (
          <Rect key={i} x={o.x} y={o.y} width={o.w} height={o.h} color={materialColor[o.material]} />
        ) : (
          <Circle key={i} cx={o.x} cy={o.y} r={o.r} color={materialColor[o.material]} />
        ),
      )}

      {/* Start marker: small cross */}
      <Line p1={vec(start.x - 6, start.y)} p2={vec(start.x + 6, start.y)} color="#888" strokeWidth={1} />
      <Line p1={vec(start.x, start.y - 6)} p2={vec(start.x, start.y + 6)} color="#888" strokeWidth={1} />

      {/* Collectibles */}
      {level.collectibles?.map((c) => (
        <Circle key={c.id} cx={c.position.x} cy={c.position.y} r={6} color={colors.debugCollectible} />
      ))}

      {/* Target + reach radius */}
      <Circle
        cx={target.position.x}
        cy={target.position.y}
        r={reachRadius}
        style="stroke"
        strokeWidth={1.5}
        color={colors.debugTarget}
      />
      <Circle cx={target.position.x} cy={target.position.y} r={4} color={colors.debugTarget} />
    </Group>
  );
}
