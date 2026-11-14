import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { HintSnapshot } from '@/game/hints';
import { useStoreValue, type ValueStore } from '@/game/valueStore';
import { useTranslation } from '@/i18n';
import { uiTap } from '@/services/haptics';
import { colors, radius, spacing, typography } from '@/theme';

interface HintButtonProps {
  hints: ValueStore<HintSnapshot>;
  onPress: () => void;
  color: string;
  disabled?: boolean;
}

/**
 * Round hint button in the thumb zone (bottom-right). Shows:
 *   "Hint" + a badge with free hints left    → tap to use
 *   "Hint ▶"                                  → rewarded video for one more
 *   "12s"                                     → cooling down
 */
export function HintButton({ hints, onPress, color, disabled = false }: HintButtonProps) {
  const { t } = useTranslation();
  const snap = useStoreValue(hints);
  const waiting = snap.status === 'cooldown' || snap.status === 'active';
  const label =
    snap.status === 'cooldown'
      ? t('hint.cooldown', { seconds: snap.cooldownSeconds })
      : snap.status === 'adRequired'
        ? t('hint.watchAd')
        : t('hint.use');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || waiting }}
      disabled={disabled || waiting}
      onPress={() => {
        uiTap();
        onPress();
      }}
      hitSlop={10}
      style={({ pressed }) => [
        styles.button,
        { borderColor: waiting ? colors.border : color },
        waiting && styles.waiting,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, { color: waiting ? colors.textMuted : colors.textPrimary }]}>
        {label}
      </Text>
      {snap.status === 'ready' && snap.freeLeft > 0 && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{snap.freeLeft}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 64,
    height: 64,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 6, 10, 0.6)',
  },
  waiting: { opacity: 0.6 },
  pressed: { opacity: 0.6, transform: [{ scale: 0.96 }] },
  label: { ...typography.caption, fontSize: 13 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.background },
});
