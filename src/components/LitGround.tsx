import { Blur, BlurMask, Circle, Group, Image, Mask, Paint, Path, useImage } from '@shopify/react-native-skia';
import { useSyncExternalStore } from 'react';

import type { Obstacle } from '@/data/levels';
import type { Vec2 } from '@/game/geometry';
import type { Trail } from '@/game/trail';

import { trailPaths } from './ColorTrail';
import { ObstacleOverlay } from './ObstacleOverlay';

/** Width of the lit band around the path (world units), before blurring. */
const LIT_WIDTH = 50;
/** How far the light fades out past the band's edge. */
const LIT_BLUR = 16;
/** How strongly the picture shows on the path itself (the full reveal stays the reward). */
const PICTURE_OPACITY = 0.75;
const OBSTACLE_OPACITY = 0.9;

interface LitGroundProps {
  trail: Trail;
  /** Bundled picture of the level (`require('…webp')`). */
  source: number;
  world: { width: number; height: number };
  obstacles: readonly Obstacle[];
  obstacleColor: string;
  /** Hidden sounds not collected yet: each shows as a small light. */
  lights: readonly Vec2[];
  lightColor: string;
}

/**
 * The ground the player's light has passed over stays lit: along the
 * walked path the level's picture, its obstacles and the hidden sounds
 * still waiting to be collected (small lights) show through,
 * brightest on the path and fading outward into the dark.
 *
 * It is the picture and the obstacles drawn through a mask shaped like
 * the trail (a wide, blurred stroke). Draw inside the world-space <Group>.
 */
export function LitGround({
  trail,
  source,
  world,
  obstacles,
  obstacleColor,
  lights,
  lightColor,
}: LitGroundProps) {
  useSyncExternalStore(trail.subscribe, trail.getVersion);
  const image = useImage(source);
  const paths = trailPaths(trail);
  if (paths.length === 0) return null;

  return (
    <Mask
      mode="alpha"
      mask={
        <Group
          layer={
            <Paint>
              <Blur blur={LIT_BLUR} />
            </Paint>
          }
        >
          {paths.map((it) => (
            <Path
              key={it.key}
              path={it.path}
              style="stroke"
              strokeWidth={LIT_WIDTH}
              strokeCap="round"
              strokeJoin="round"
              color="white"
            />
          ))}
        </Group>
      }
    >
      {image && (
        <Image
          image={image}
          x={0}
          y={0}
          width={world.width}
          height={world.height}
          fit="cover"
          opacity={PICTURE_OPACITY}
        />
      )}
      <ObstacleOverlay obstacles={obstacles} opacity={OBSTACLE_OPACITY} color={obstacleColor} />
      {lights.map((p, i) => (
        <Group key={i}>
          <Circle cx={p.x} cy={p.y} r={11} color={lightColor} opacity={0.7}>
            <BlurMask blur={8} style="normal" />
          </Circle>
          <Circle cx={p.x} cy={p.y} r={3.5} color="white" />
        </Group>
      ))}
    </Mask>
  );
}
