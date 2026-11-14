import { Pressable, StyleSheet, Text, View } from 'react-native';

import { uiTap } from '@/services/haptics';
import { colors, radius, spacing, typography } from '@/theme';

interface SegmentedProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** Smaller variant for dense panels (audio lab). */
  compact?: boolean;
}

/** Quiet segmented picker (radio group) used in settings and dev panels. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  compact = false,
}: SegmentedProps<T>) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              uiTap();
              onChange(option.value);
            }}
            style={[styles.segment, compact && styles.compact, selected && styles.selected]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[styles.text, compact && styles.textCompact, selected && styles.textSelected]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  compact: { minHeight: 36 },
  selected: { backgroundColor: colors.surfaceRaised },
  text: { ...typography.body, color: colors.textSecondary },
  textCompact: { fontSize: 13 },
  textSelected: { color: colors.textPrimary },
});
