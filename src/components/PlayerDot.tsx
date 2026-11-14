import {
  BlurMask,
  Circle,
  Group,
  RadialGradient,
  type SkPoint,
} from '@shopify/react-native-skia';
import { useEffect } from 'react';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { motion } from '@/theme';

interface PlayerDotProps {
  /** Player centre in world units (driven from the game loop). */
  center: SharedValue<SkPoint>;
  /** Collision radius in world units; the bright core matches it. */
  radius: number;
  color: string;
  /** 0 (standing) … 1 (full speed): walking makes the light swell. */
  energy: SharedValue<number>;
  /** 1 → 0 after a bump: a brief ring of light expands and fades. */
  flash: SharedValue<number>;
}

/**
 * The player: a small bright core with a soft, slowly breathing halo.
 * Everything animates on the UI thread. Drawn inside the world-space
 * <Group> of the level canvas, so sizes are in world units.
 */
export function PlayerDot({ center, radius, color, energy, flash }: PlayerDotProps) {
  const breath = useSharedValue(0);
  useEffect(() => {
    breath.set(
      withRepeat(
        withTiming(1, { duration: motion.breathe / 2, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [breath]);

  const haloR = useDerivedValue(() => radius * (6 + 1.2 * breath.get() + 3 * energy.get()));
  const haloOpacity = useDerivedValue(() => 0.55 + 0.15 * breath.get() + 0.3 * energy.get());
  const coreR = useDerivedValue(() => radius * (0.75 + 0.08 * breath.get() + 0.1 * energy.get()));
  const ringR = useDerivedValue(() => radius * (1.5 + 5 * (1 - flash.get())));
  const ringOpacity = useDerivedValue(() => flash.get() * 0.7);

  return (
    <Group>
      <Group opacity={haloOpacity}>
        <Circle c={center} r={haloR}>
          <RadialGradient c={center} r={haloR} colors={[`${color}66`, `${color}1A`, `${color}00`]} />
        </Circle>
      </Group>
      <Group opacity={ringOpacity}>
        <Circle c={center} r={ringR} style="stroke" strokeWidth={1.5} color={color}>
          <BlurMask blur={2} style="solid" />
        </Circle>
      </Group>
      <Circle c={center} r={coreR} color={color}>
        <BlurMask blur={1.5} style="solid" />
      </Circle>
    </Group>
  );
}
