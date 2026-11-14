import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  Path,
  Rect,
  Skia,
  vec,
  type SkPoint,
} from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors, palettes } from '@/theme';

const W = 280;
const H = 190;
const GLOW = palettes.zen.playerGlow;

export type IntroSceneKind = 'listen' | 'obstacles' | 'trail';

/**
 * Looping illustrations for the "how to play" intro:
 *   listen    – the dot walks toward a sound whose rings come faster and faster;
 *   obstacles – the dot bumps into an invisible wall, which flashes into view;
 *   trail     – a coloured trail draws itself, then the picture blooms at its end.
 */
export function IntroScene({ kind }: { kind: IntroSceneKind }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withRepeat(withTiming(1, { duration: 4200, easing: Easing.linear }), -1));
  }, [t]);

  // listen
  const target = vec(220, 48);
  const walker = useDerivedValue(() => {
    const k = Math.min(1, t.get() / 0.85);
    return vec(50 + (target.x - 50) * k * 0.86, 150 + (target.y - 150) * k * 0.86);
  });
  // Rings repeat faster as the walker gets closer (like the target's strikes).
  const ringPhase = useDerivedValue(() => {
    const p = t.get();
    return (p * 3 + p * p * 9) % 1;
  });
  const ringR = useDerivedValue(() => 6 + ringPhase.get() * 46);
  const ringOpacity = useDerivedValue(() => 1 - ringPhase.get());

  // obstacles
  const bumper = useDerivedValue(() => {
    const p = t.get();
    const x = p < 0.45 ? 60 + (p / 0.45) * 82 : p < 0.7 ? 142 - ((p - 0.45) / 0.25) * 18 : 124;
    return vec(x, H / 2);
  });
  const wallOpacity = useDerivedValue(() => {
    const p = t.get();
    return p < 0.45 ? 0.05 : Math.max(0.05, 0.9 - (p - 0.45) * 2.2);
  });
  const flashR = useDerivedValue(() => 10 + Math.max(0, t.get() - 0.45) * 160);
  const flashOpacity = useDerivedValue(() => {
    const p = t.get();
    return p < 0.45 ? 0 : Math.max(0, 0.8 - (p - 0.45) * 3);
  });

  // trail
  const trailPath = useMemo(
    () =>
      Skia.PathBuilder.Make()
        .moveTo(40, 160)
        .cubicTo(90, 150, 70, 90, 130, 95)
        .cubicTo(190, 100, 170, 50, 232, 44)
        .build(),
    [],
  );
  const trailEnd = useDerivedValue(() => Math.min(1, t.get() / 0.6));
  const bloomR = useDerivedValue(() => Math.max(0, (t.get() - 0.6) / 0.4) * 150);
  const bloomOpacity = useDerivedValue(() => {
    const p = t.get();
    return p < 0.6 ? 0 : Math.min(0.55, (p - 0.6) * 2.5) * (p > 0.92 ? (1 - p) / 0.08 : 1);
  });

  return (
    <Canvas style={{ width: W, height: H }} pointerEvents="none">
      {kind === 'listen' && (
        <Group>
          <Group opacity={ringOpacity}>
            <Circle c={target} r={ringR} style="stroke" strokeWidth={2} color={palettes.zen.waves} />
          </Group>
          <Circle c={target} r={5} color={palettes.zen.waves} />
          <Glow at={walker} />
        </Group>
      )}
      {kind === 'obstacles' && (
        <Group>
          <Group opacity={wallOpacity}>
            <Rect x={152} y={30} width={14} height={H - 60} color={colors.textPrimary} />
          </Group>
          <Group opacity={flashOpacity}>
            <Circle c={bumper} r={flashR} style="stroke" strokeWidth={2} color={GLOW} />
          </Group>
          <Glow at={bumper} />
        </Group>
      )}
      {kind === 'trail' && (
        <Group>
          <Group opacity={bloomOpacity}>
            <Circle cx={232} cy={44} r={bloomR} color={palettes.zen.trail[0]}>
              <BlurMask blur={30} style="normal" />
            </Circle>
          </Group>
          {palettes.zen.trail.slice(0, 3).map((c, i) => (
            <Path
              key={c}
              path={trailPath}
              style="stroke"
              strokeWidth={i === 0 ? 12 : 3}
              strokeCap="round"
              color={c}
              opacity={i === 0 ? 0.3 : 0.9}
              start={i === 2 ? 0.5 : 0}
              end={trailEnd}
            >
              {i === 0 && <BlurMask blur={6} style="normal" />}
            </Path>
          ))}
          <Circle cx={232} cy={44} r={5} color={palettes.zen.waves} />
        </Group>
      )}
    </Canvas>
  );
}

function Glow({ at }: { at: SharedValue<SkPoint> }) {
  return (
    <Group>
      <Circle c={at} r={24} color={GLOW} opacity={0.35}>
        <BlurMask blur={12} style="normal" />
      </Circle>
      <Circle c={at} r={6} color={GLOW} />
    </Group>
  );
}
