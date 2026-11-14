import { StyleSheet, Text, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { colors, motion, radius, spacing, typography } from '@/theme';

interface StoryCaptionProps {
  text: string;
  title: string;
  style?: ViewStyle;
}

/**
 * Subtitle card for a story fragment while its narration plays. Also makes
 * the story accessible without sound and readable before final voice-overs
 * exist.
 */
export function StoryCaption({ text, title, style }: StoryCaptionProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(motion.slow)}
      exiting={FadeOut.duration(motion.slow)}
      style={[styles.card, style]}
      pointerEvents="none"
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: 'rgba(5, 6, 10, 0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  title: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  text: { ...typography.body, color: colors.textPrimary, fontStyle: 'italic', lineHeight: 22 },
});
