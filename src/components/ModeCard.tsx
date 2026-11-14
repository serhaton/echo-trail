import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ModeDefinition } from '@/modes';
import { useTranslation } from '@/i18n';
import { uiTap } from '@/services/haptics';
import { colors, palettes, radius, spacing, typography } from '@/theme';

interface ModeCardProps {
  mode: ModeDefinition;
  /** "★ 5 / 30" — hidden for modes that aren't available yet. */
  starsLabel?: string;
  onPress: () => void;
}

/**
 * A journey card on the mode-select screen: the mode's colours (a strip of
 * its trail palette), name, one-line description, stars earned. Coming-soon
 * modes are dimmed and not tappable; non-family-friendly modes carry a
 * warning badge.
 */
export function ModeCard({ mode, starsLabel, onPress }: ModeCardProps) {
  const { t } = useTranslation();
  const palette = palettes[mode.palette];
  const available = mode.status === 'available';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !available }}
      disabled={!available}
      onPress={() => {
        uiTap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        { borderColor: available ? `${palette.accent}55` : colors.border },
        !available && styles.dimmed,
        pressed && styles.pressed,
      ]}
    >
      {/* Palette strip: a quick taste of the world's colours. */}
      <View style={styles.strip}>
        {palette.trail.map((c) => (
          <View key={c} style={[styles.swatch, { backgroundColor: c }]} />
        ))}
      </View>
      <View style={styles.header}>
        <Text style={[styles.name, { color: available ? palette.accent : colors.textSecondary }]}>
          {t(`${mode.i18nKey}.name`)}
        </Text>
        {available && starsLabel ? <Text style={styles.stars}>{starsLabel}</Text> : null}
        {!available && <Text style={styles.soon}>{t('common.comingSoon')}</Text>}
      </View>
      <Text style={styles.description}>{t(`${mode.i18nKey}.description`)}</Text>
      {!mode.familyFriendly && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>{t('modes.tension.warning')}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  dimmed: { opacity: 0.45 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  strip: { flexDirection: 'row', height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: spacing.xs },
  swatch: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  name: { ...typography.title },
  stars: { ...typography.body, color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  soon: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  description: { ...typography.body, color: colors.textSecondary, lineHeight: 21 },
  warning: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  warningText: { ...typography.caption, color: colors.danger },
});
