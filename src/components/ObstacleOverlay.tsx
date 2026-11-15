import { Circle, Group, RoundedRect } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

import type { Obstacle } from '@/data/levels';

interface ObstacleOverlayProps {
  obstacles: readonly Obstacle[];
  /** 0 = hidden. Animated by the level (hint flash, end-of-level reveal) or fixed. */
  opacity: SharedValue<number> | number;
  color: string;
}

/**
 * The level's normally invisible obstacles, drawn as soft translucent
 * shapes with a light outline. Shown for a moment when a hint is used and
 * over the picture once the level is finished ("so that's what I bumped
 * into"). Draw inside the world-space <Group>.
 */
export function ObstacleOverlay({ obstacles, opacity, color }: ObstacleOverlayProps) {
  return (
    <Group opacity={opacity}>
      {obstacles.map((o, i) =>
        o.kind === 'rect' ? (
          <Group key={i}>
            <RoundedRect x={o.x} y={o.y} width={o.w} height={o.h} r={5} color={`${color}59`} />
            <RoundedRect
              x={o.x}
              y={o.y}
              width={o.w}
              height={o.h}
              r={5}
              style="stroke"
              strokeWidth={2}
              color={`${color}CC`}
            />
          </Group>
        ) : (
          <Group key={i}>
            <Circle cx={o.x} cy={o.y} r={o.r} color={`${color}59`} />
            <Circle cx={o.x} cy={o.y} r={o.r} style="stroke" strokeWidth={2} color={`${color}CC`} />
          </Group>
        ),
      )}
    </Group>
  );
}
