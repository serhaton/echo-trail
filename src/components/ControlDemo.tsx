import {
  BlurMask,
  Canvas,
  Circle,
  Group,
  RoundedRect,
  vec,
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

import type { ControlScheme } from '@/game/movement';

const W = 260;
const H = 170;
const CX = W / 2;
const CY = H / 2;
const TAU = Math.PI * 2;

interface ControlDemoProps {
  scheme: ControlScheme;
  /** Colour of the player dot (the mode's glow). */
  color: string;
}

/**
 * A small looping animation that shows how the chosen control scheme
 * moves the player:
 *   followFinger – the glowing dot chases a fingertip;
 *   joystick     – a thumb drags a stick, the dot walks that way;
 *   tilt         – the phone leans, the dot rolls toward the low side.
 */
export function ControlDemo({ scheme, color }: ControlDemoProps) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(0);
    t.set(withRepeat(withTiming(1, { duration: 3600, easing: Easing.linear }), -1));
  }, [t, scheme]);

  // --- follow finger: the finger wanders, the dot follows a little behind.
  const finger = useDerivedValue(() => {
    const a = t.get() * TAU;
    return vec(CX + 78 * Math.cos(a), CY + 42 * Math.sin(2 * a));
  });
  const follower = useDerivedValue(() => {
    const a = (t.get() - 0.07) * TAU;
    return vec(CX + 78 * Math.cos(a), CY + 42 * Math.sin(2 * a));
  });

  // --- joystick: the knob circles its ring; the dot moves in the knob's direction.
  const stick = vec(62, H - 54);
  const knob = useDerivedValue(() => {
    const a = t.get() * TAU;
    return vec(stick.x + 22 * Math.cos(a), stick.y + 22 * Math.sin(a));
  });
  const walker = useDerivedValue(() => {
    const a = t.get() * TAU;
    // Position whose direction of travel is (cos a, sin a).
    return vec(172 + 34 * Math.sin(a), 70 - 34 * Math.cos(a));
  });

  // --- tilt: the phone rocks; the dot slides to the lower side.
  const lean = useDerivedValue(() => Math.sin(t.get() * TAU));
  const phoneTransform = useDerivedValue(() => [{ rotate: lean.get() * 0.3 }]);
  const roller = useDerivedValue(() => vec(CX + lean.get() * 26, CY));

  return (
    <Canvas style={{ width: W, height: H }} pointerEvents="none">
      {scheme === 'followFinger' && (
        <Group>
          <Finger at={finger} />
          <Dot at={follower} color={color} />
        </Group>
      )}
      {scheme === 'joystick' && (
        <Group>
          <Circle c={stick} r={34} style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.25)" />
          <Finger at={knob} />
          <Dot at={walker} color={color} />
        </Group>
      )}
      {scheme === 'tilt' && (
        <Group origin={vec(CX, CY)} transform={phoneTransform}>
          <RoundedRect
            x={CX - 44}
            y={CY - 76}
            width={88}
            height={152}
            r={16}
            style="stroke"
            strokeWidth={2}
            color="rgba(255,255,255,0.4)"
          />
          <Dot at={roller} color={color} />
        </Group>
      )}
    </Canvas>
  );
}

type AnimatedPoint = SharedValue<SkPoint>;

function Finger({ at }: { at: AnimatedPoint }) {
  return (
    <Group>
      <Circle c={at} r={17} color="rgba(255,255,255,0.14)" />
      <Circle c={at} r={17} style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.45)" />
    </Group>
  );
}

function Dot({ at, color }: { at: AnimatedPoint; color: string }) {
  return (
    <Group>
      <Circle c={at} r={22} color={color} opacity={0.35}>
        <BlurMask blur={12} style="normal" />
      </Circle>
      <Circle c={at} r={6} color={color} />
    </Group>
  );
}
