import { BlurMask, Circle, Group, Mask, type SkPoint } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import type { Vec2 } from '@/game/geometry';

/** Radius around the player in which waves are visible (world units). */
const VISIBLE_RADIUS = 120;
/** A wave starts this far before the player (on the target side)… */
const START_BEFORE = 110;
/** …and travels this far in total, passing the player. */
const TRAVEL = 170;

interface WaveRingsProps {
  player: SharedValue<SkPoint>;
  target: Vec2;
  /** One progress value (0 → 1) per wave slot; 0 or 1 = hidden. */
  waves: readonly SharedValue<number>[];
  color: string;
}

/**
 * Visual direction cue for playing WITHOUT headphones.
 *
 * Each wave is a circle centred on the target, expanding outward in time
 * with a target strike. It is only drawn inside a soft window around the
 * player, so what you see is a curved wavefront sweeping past you FROM the
 * target's direction. The curve gets tighter as you approach (closer =
 * more curved), but the target's exact spot is never shown.
 *
 * Draw inside the world-space <Group>.
 */
export function WaveRings({ player, target, waves, color }: WaveRingsProps) {
  return (
    <Mask
      mode="alpha"
      mask={
        <Circle c={player} r={VISIBLE_RADIUS} color="white">
          <BlurMask blur={VISIBLE_RADIUS / 3} style="normal" />
        </Circle>
      }
    >
      {waves.map((progress, i) => (
        <Wave key={i} player={player} target={target} progress={progress} color={color} />
      ))}
    </Mask>
  );
}

function Wave({
  player,
  target,
  progress,
  color,
}: {
  player: SharedValue<SkPoint>;
  target: Vec2;
  progress: SharedValue<number>;
  color: string;
}) {
  const r = useDerivedValue(() => {
    const p = player.get();
    const d = Math.hypot(target.x - p.x, target.y - p.y);
    return Math.max(2, d - START_BEFORE + TRAVEL * progress.get());
  });
  const opacity = useDerivedValue(() => {
    const t = progress.get();
    return t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) * 0.9;
  });
  return (
    <Group opacity={opacity}>
      <Circle
        cx={target.x}
        cy={target.y}
        r={r}
        style="stroke"
        strokeWidth={6}
        color={color}
        opacity={0.35}
      >
        <BlurMask blur={4} style="normal" />
      </Circle>
      <Circle cx={target.x} cy={target.y} r={r} style="stroke" strokeWidth={1.8} color={color} />
    </Group>
  );
}
