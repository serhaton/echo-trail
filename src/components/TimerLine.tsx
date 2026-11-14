import { BlurMask, Group, Line, vec } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

interface TimerLineProps {
  /** Right end of the line (screen points). */
  right: number;
  y: number;
  length: number;
  /** Time left, 1 → 0. */
  fraction: SharedValue<number>;
  /** 0..1 pulse during the final seconds (brightens the line). */
  urgency: SharedValue<number>;
  color: string;
}

/**
 * The thin, elegant countdown line in the top-right corner. It melts from
 * the left toward the corner as time drains. A faint track shows the full
 * length. Screen-space; draw outside the world-space group.
 */
export function TimerLine({ right, y, length, fraction, urgency, color }: TimerLineProps) {
  const start = useDerivedValue(() => vec(right - length * Math.max(0, fraction.get()), y));
  const glowOpacity = useDerivedValue(() => 0.6 + 0.4 * urgency.get());
  const visible = useDerivedValue(() => (fraction.get() > 0 ? 1 : 0));
  const end = vec(right, y);

  return (
    <Group opacity={visible}>
      {/* Track */}
      <Line
        p1={vec(right - length, y)}
        p2={end}
        color="rgba(255,255,255,0.12)"
        strokeWidth={2.5}
        strokeCap="round"
      />
      {/* Soft glow */}
      <Group opacity={glowOpacity}>
        <Line p1={start} p2={end} color={color} strokeWidth={8} strokeCap="round">
          <BlurMask blur={5} style="normal" />
        </Line>
      </Group>
      {/* Bright thread */}
      <Line p1={start} p2={end} color={color} strokeWidth={2.5} strokeCap="round" />
    </Group>
  );
}
