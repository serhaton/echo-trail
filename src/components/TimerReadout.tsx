import { StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { FINAL_SECONDS } from '@/game/countdown';
import { useStoreValue, type ValueStore } from '@/game/valueStore';
import { colors } from '@/theme';

interface TimerReadoutProps {
  /** Whole seconds left; null hides the readout (e.g. Zen after time-up). */
  seconds: ValueStore<number | null>;
  /** 0..1 pulse fired on each of the final seconds. */
  urgency: SharedValue<number>;
  /** Colour used during the final seconds. */
  urgentColor: string;
  style?: ViewStyle;
}

/** 84 → "1:24", 7 → "0:07". */
function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Countdown digits in the top-right corner: thin and quiet most of the
 * time; in the final seconds they warm up and swell gently on every tick.
 */
export function TimerReadout({ seconds, urgency, urgentColor, style }: TimerReadoutProps) {
  const value = useStoreValue(seconds);
  const final = value != null && value <= FINAL_SECONDS;

  const pulse = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.18 * urgency.get() }],
  }));

  if (value == null) return null;
  return (
    <Animated.Text
      accessibilityRole="timer"
      style={[
        styles.text,
        final && { color: urgentColor, textShadowColor: urgentColor, textShadowRadius: 10 },
        pulse,
        style,
      ]}
    >
      {format(value)}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 22,
    fontWeight: '200',
    letterSpacing: 1,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    textShadowOffset: { width: 0, height: 0 },
  },
});
