import { Pressable, StyleSheet, Text, View } from 'react-native';

import { uiTap } from '@/services/haptics';
import { colors, spacing, typography } from '@/theme';

const STEPS = 5;

interface VolumeBarsProps {
  label: string;
  /** 0..1 */
  value: number;
  onChange: (value: number) => void;
}

/**
 * Volume control as five rising bars; tap a bar to set that level, tap the
 * speaker to mute. (A drag slider would need another native module.)
 */
export function VolumeBars({ label, value, onChange }: VolumeBarsProps) {
  const level = Math.round(value * STEPS);
  return (
    <View
      style={styles.row}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: STEPS, now: level }}
    >
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => {
          uiTap();
          onChange(0);
        }}
      >
        <Text style={[styles.mute, level === 0 && styles.muteActive]}>{level === 0 ? '🔇' : '🔈'}</Text>
      </Pressable>
      <View style={styles.bars}>
        {Array.from({ length: STEPS }, (_, i) => (
          <Pressable
            key={i}
            hitSlop={{ top: 12, bottom: 12, left: 3, right: 3 }}
            onPress={() => {
              uiTap();
              onChange((i + 1) / STEPS);
            }}
            style={styles.barTouch}
          >
            <View style={[styles.bar, { height: 10 + i * 6 }, i < level && styles.barOn]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48 },
  label: { ...typography.body, color: colors.textSecondary, flex: 1 },
  mute: { fontSize: 18, opacity: 0.5 },
  muteActive: { opacity: 1 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  barTouch: { justifyContent: 'flex-end', height: 40 },
  bar: { width: 22, borderRadius: 4, backgroundColor: colors.surfaceRaised },
  barOn: { backgroundColor: colors.accent },
});
