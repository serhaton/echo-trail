import { BlurMask, Circle, Group, Line, type SkPoint } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

interface HintGlowProps {
  player: SharedValue<SkPoint>;
  /**
   * Where the light floats: the next point on the WALKABLE route to the
   * target (computed by the level with NavGrid), a short way from the player.
   */
  aim: SharedValue<SkPoint>;
  /** 0 → 1 over the hint's lifetime (0 = hidden). */
  progress: SharedValue<number>;
  color: string;
}

/**
 * The hint: a soft light a short way from the player, in the direction you
 * should actually walk (around walls, not through them), with a faint
 * thread back to the player. It re-aims as the player moves, then fades.
 * Draw inside the world-space <Group>.
 */
export function HintGlow({ player, aim, progress, color }: HintGlowProps) {
  // Smooth fade in and out (sin bump), invisible at 0 and 1.
  const opacity = useDerivedValue(() => {
    const t = progress.get();
    return t <= 0 || t >= 1 ? 0 : Math.pow(Math.sin(Math.PI * t), 0.6);
  });
  const haloR = useDerivedValue(() => 22 + 6 * Math.sin(progress.get() * Math.PI * 6));

  return (
    <Group opacity={opacity}>
      <Line p1={player} p2={aim} color={color} strokeWidth={1.5} strokeCap="round" opacity={0.35}>
        <BlurMask blur={2} style="normal" />
      </Line>
      <Circle c={aim} r={haloR} color={color} opacity={0.45}>
        <BlurMask blur={16} style="normal" />
      </Circle>
      <Circle c={aim} r={5} color={color}>
        <BlurMask blur={2} style="solid" />
      </Circle>
    </Group>
  );
}
