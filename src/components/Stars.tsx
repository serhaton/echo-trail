import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { audioEngine } from '@/audio';
import { colors, spacing } from '@/theme';

interface StarsProps {
  count: 1 | 2 | 3;
  color: string;
  /** Play a rising chime as each earned star appears. */
  withSound?: boolean;
}

const STAR_DELAY = 280;

/**
 * 1–3 star rating that pops in one star at a time. Earned stars glow in the
 * mode's accent colour; missing ones are faint outlines.
 */
export function Stars({ count, color, withSound = true }: StarsProps) {
  useEffect(() => {
    if (!withSound) return;
    // Placeholder star sound (target strike, rising) until common/star exists.
    const timers = Array.from({ length: count }, (_, i) =>
      setTimeout(
        () => audioEngine.playOneShot('placeholderPulse', { playbackRate: 1.5 + i * 0.25, volume: 0.45 }),
        STAR_DELAY * (i + 1),
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, [count, withSound]);

  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={`${count} / 3`}>
      {[0, 1, 2].map((i) => {
        const earned = i < count;
        return (
          <Animated.Text
            key={i}
            entering={ZoomIn.delay(STAR_DELAY * (i + 1)).springify().damping(12)}
            style={[
              styles.star,
              earned
                ? { color, textShadowColor: color, textShadowRadius: 12 }
                : { color: colors.textMuted },
            ]}
          >
            {earned ? '★' : '☆'}
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
  star: { fontSize: 40, textShadowOffset: { width: 0, height: 0 } },
});
