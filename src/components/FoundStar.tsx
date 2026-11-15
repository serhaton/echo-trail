import { BlurMask, Circle, Group, Path } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import type { Vec2 } from '@/game/geometry';

const OUTER = 15;
const INNER = 6.2;

/** A five-pointed star centred on the origin, as an SVG path. */
const STAR_PATH =
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? OUTER : INNER;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${i === 0 ? 'M' : 'L'}${(Math.cos(a) * r).toFixed(2)} ${(Math.sin(a) * r).toFixed(2)}`;
  }).join(' ') + ' Z';

interface FoundStarProps {
  /** The target's position. */
  at: Vec2;
  /** The reveal animation's progress, 0 → 1. */
  progress: SharedValue<number>;
  color: string;
}

/**
 * Marks the spot where the sound was found: a glowing star that pops in
 * on the picture once the reveal has opened around it.
 * Draw inside the world-space <Group>.
 */
export function FoundStar({ at, progress, color }: FoundStarProps) {
  // Appears between 35% and 60% of the reveal, slightly overshooting.
  const t = useDerivedValue(() => Math.min(1, Math.max(0, (progress.get() - 0.35) / 0.25)));
  const transform = useDerivedValue(() => {
    const s = t.get() < 1 ? t.get() * 1.25 : 1;
    const settle = 1 + 0.25 * Math.max(0, 1 - (progress.get() - 0.6) / 0.15);
    return [{ translateX: at.x }, { translateY: at.y }, { scale: t.get() < 1 ? s : settle }];
  });

  return (
    <Group opacity={t} transform={transform}>
      <Circle cx={0} cy={0} r={24} color={color} opacity={0.8}>
        <BlurMask blur={14} style="normal" />
      </Circle>
      <Path path={STAR_PATH} color="white" />
      <Path path={STAR_PATH} style="stroke" strokeWidth={1.5} strokeJoin="round" color={color} />
    </Group>
  );
}
