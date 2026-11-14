import {
  BlurMask,
  Circle,
  Group,
  Image,
  Mask,
  useImage,
} from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import type { Vec2 } from '@/game/geometry';

interface RevealImageProps {
  /** Bundled image (`require('…webp')`). */
  source: number;
  world: { width: number; height: number };
  /** Where the reveal blooms from (the target). */
  origin: Vec2;
  /** 0 → 1 drives the whole animation. */
  progress: SharedValue<number>;
  /** Colour of the light burst at the origin. */
  burstColor: string;
}

/**
 * End-of-level reveal: a burst of light at the target, then the scene's
 * picture opens outward from that point through a soft-edged circular
 * mask until it fills the level.
 *
 * Draw inside the world-space <Group>.
 */
export function RevealImage({ source, world, origin, progress, burstColor }: RevealImageProps) {
  const image = useImage(source);

  // Radius needed to cover the farthest corner from the origin.
  const maxR = Math.max(
    Math.hypot(origin.x, origin.y),
    Math.hypot(world.width - origin.x, origin.y),
    Math.hypot(origin.x, world.height - origin.y),
    Math.hypot(world.width - origin.x, world.height - origin.y),
  );
  const feather = 90;

  // The mask lags the burst a little so the light "opens" the picture.
  const maskR = useDerivedValue(() => {
    const t = Math.max(0, (progress.get() - 0.08) / 0.92);
    return t * (maxR + feather * 2);
  });
  const burstR = useDerivedValue(() => 12 + progress.get() * 260);
  const burstOpacity = useDerivedValue(() => {
    const p = progress.get();
    return p < 0.05 ? p / 0.05 : Math.max(0, 1 - (p - 0.05) / 0.45);
  });
  const glowR = useDerivedValue(() => 30 + progress.get() * 120);
  const glowOpacity = useDerivedValue(() => Math.max(0, 0.9 - progress.get() * 1.2));

  return (
    <Group>
      {image && (
        <Mask
          mode="alpha"
          mask={
            <Circle cx={origin.x} cy={origin.y} r={maskR} color="white">
              <BlurMask blur={feather / 2} style="normal" />
            </Circle>
          }
        >
          <Image image={image} x={0} y={0} width={world.width} height={world.height} fit="cover" />
        </Mask>
      )}
      {/* Light burst */}
      <Group opacity={glowOpacity}>
        <Circle cx={origin.x} cy={origin.y} r={glowR} color={burstColor}>
          <BlurMask blur={40} style="normal" />
        </Circle>
      </Group>
      <Group opacity={burstOpacity}>
        <Circle cx={origin.x} cy={origin.y} r={burstR} style="stroke" strokeWidth={2} color={burstColor}>
          <BlurMask blur={3} style="solid" />
        </Circle>
      </Group>
    </Group>
  );
}
