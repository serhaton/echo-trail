import { BlurMask, Circle, Group, Line, Oval, Path, vec } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import {
  cancelAnimation,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { Vec2 } from '@/game/geometry';

/** Dark pause between two flashes, and how long a flash stays bright (ms). */
const NOTE_FLASH = { every: 6000, fadeIn: 60, hold: 300, fadeOut: 140 };

interface SoundNotesProps {
  /** Hidden sounds not collected yet. */
  positions: readonly Vec2[];
  color: string;
}

/**
 * Every few seconds, each hidden sound still waiting to be collected
 * flashes for a moment as a bright musical note, so the player gets a
 * glimpse of where it is. Mount it only while the level is being played.
 * Draw inside the world-space <Group>.
 */
export function SoundNotes({ positions, color }: SoundNotesProps) {
  const flash = useSharedValue(0);

  useEffect(() => {
    flash.set(
      withRepeat(
        withSequence(
          withDelay(NOTE_FLASH.every, withTiming(1, { duration: NOTE_FLASH.fadeIn })),
          withDelay(NOTE_FLASH.hold, withTiming(0, { duration: NOTE_FLASH.fadeOut })),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(flash);
  }, [flash]);

  return (
    <Group opacity={flash}>
      {positions.map((p, i) => (
        // An eighth note, about 22 world units tall, centred on the sound.
        <Group key={i} transform={[{ translateX: p.x }, { translateY: p.y }]}>
          <Circle cx={0} cy={0} r={16} color={color} opacity={0.75}>
            <BlurMask blur={10} style="normal" />
          </Circle>
          <Oval x={-8} y={4} width={10} height={7} color="white" />
          <Line p1={vec(1, 7)} p2={vec(1, -11)} strokeWidth={2} color="white" />
          <Path
            path="M1 -11 C 6 -9 9 -5 7 0"
            style="stroke"
            strokeWidth={2}
            strokeCap="round"
            color="white"
          />
        </Group>
      ))}
    </Group>
  );
}
