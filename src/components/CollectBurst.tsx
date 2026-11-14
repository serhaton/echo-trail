import { BlurMask, Circle, Group } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import type { Vec2 } from '@/game/geometry';

interface CollectBurstProps {
  at: Vec2 | null;
  /** 0 → 1 drives the burst; 0 or 1 = hidden. */
  progress: SharedValue<number>;
  color: string;
}

/**
 * Burst of light where a hidden sound was picked up: a bright flash and two
 * expanding rings. Draw inside the world-space <Group>.
 */
export function CollectBurst({ at, progress, color }: CollectBurstProps) {
  const r1 = useDerivedValue(() => 6 + progress.get() * 60);
  const r2 = useDerivedValue(() => 4 + Math.max(0, progress.get() - 0.15) * 90);
  const ringOpacity = useDerivedValue(() => {
    const t = progress.get();
    return t <= 0 || t >= 1 ? 0 : 1 - t;
  });
  const flashOpacity = useDerivedValue(() => {
    const t = progress.get();
    return t <= 0 || t >= 1 ? 0 : Math.max(0, 1 - t * 3);
  });

  if (!at) return null;
  return (
    <Group>
      <Group opacity={flashOpacity}>
        <Circle cx={at.x} cy={at.y} r={26} color={color}>
          <BlurMask blur={14} style="normal" />
        </Circle>
      </Group>
      <Group opacity={ringOpacity}>
        <Circle cx={at.x} cy={at.y} r={r1} style="stroke" strokeWidth={2} color={color}>
          <BlurMask blur={2} style="solid" />
        </Circle>
        <Circle cx={at.x} cy={at.y} r={r2} style="stroke" strokeWidth={1} color={color} />
      </Group>
    </Group>
  );
}
