import { Pressable, StyleSheet, Text, View } from 'react-native';

import { uiTap } from '@/services/haptics';
import { colors, radius, spacing, typography } from '@/theme';

interface MenuButtonProps {
  label: string;
  onPress?: () => void;
  /** Small caption under the label, e.g. "Coming soon". */
  caption?: string;
  /** Primary buttons get a soft glowing border. */
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  /** Smaller padding for rows of several buttons. */
  compact?: boolean;
}

/**
 * Minimal, quiet menu button. Big touch target for one-handed play,
 * light haptic tick on press, dims when disabled.
 */
export function MenuButton({
  label,
  onPress,
  caption,
  variant = 'secondary',
  disabled = false,
  compact = false,
}: MenuButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={caption ? `${label}, ${caption}` : label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        uiTap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        compact && styles.compact,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[
            styles.label,
            variant === 'primary' && styles.labelPrimary,
            compact && styles.labelCompact,
          ]}
        >
          {label}
        </Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 60,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  primary: {
    borderColor: colors.accent,
    // Solid colour (≈ accent at 6% over the background) so iOS can render
    // the glow shadow efficiently; a translucent fill triggers a slow path.
    backgroundColor: '#141310',
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  secondary: {
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  compact: { minHeight: 48, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.6, transform: [{ scale: 0.98 }] },
  content: { alignItems: 'center' },
  label: { ...typography.subtitle, color: colors.textSecondary },
  labelPrimary: { color: colors.textPrimary },
  labelCompact: { fontSize: 15 },
  caption: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxs,
    textTransform: 'uppercase',
  },
});
