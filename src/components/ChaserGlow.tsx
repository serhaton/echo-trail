import { BlurMask, Circle, Group, type SkPoint } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

interface ChaserGlowProps {
  center: SharedValue<SkPoint>;
  /** 0 (far) … 1 (on top of you). */
  proximity: SharedValue<number>;
  color: string;
  /** Lowest opacity: 0 = invisible until close; >0 = always faintly visible. */
  minOpacity?: number;
}

/**
 * Tension's chaser: unseen while far away, a red haze that swells as it
 * closes in. (Without headphones it stays faintly visible, since its sound
 * alone can't be located.) Draw inside the world-space <Group>.
 */
export function ChaserGlow({ center, proximity, color, minOpacity = 0 }: ChaserGlowProps) {
  const opacity = useDerivedValue(() =>
    Math.max(minOpacity, Math.pow(Math.max(0, proximity.get()), 1.5) * 0.9),
  );
  const r = useDerivedValue(() => 26 + 30 * proximity.get());
  return (
    <Group opacity={opacity}>
      <Circle c={center} r={r} color={color}>
        <BlurMask blur={18} style="normal" />
      </Circle>
      <Circle c={center} r={6} color={color}>
        <BlurMask blur={3} style="solid" />
      </Circle>
    </Group>
  );
}
