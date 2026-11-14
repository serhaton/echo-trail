import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MenuButton } from '@/components/MenuButton';
import { ModeCard } from '@/components/ModeCard';
import { Screen } from '@/components/Screen';
import { completedCount, JOURNEY_LENGTH, totalStars } from '@/data/journeys';
import { useTranslation } from '@/i18n';
import { MODES } from '@/modes';
import { goBack } from '@/navigation/goBack';
import { useProgress } from '@/services/ProgressProvider';
import { colors, spacing, typography } from '@/theme';

/** Pick a journey (mode). Upcoming modes are listed as "coming soon". */
export default function ModeSelect() {
  const { t } = useTranslation();
  const { progress } = useProgress();

  return (
    <Screen>
      <Text style={styles.title}>{t('modeSelect.title')}</Text>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {MODES.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            starsLabel={t('modeSelect.progress', {
              done: completedCount(progress, mode.id),
              total: JOURNEY_LENGTH,
              stars: totalStars(progress, mode.id),
            })}
            onPress={() => router.push({ pathname: '/journey/[mode]', params: { mode: mode.id } })}
          />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <MenuButton label={t('common.back')} onPress={() => goBack()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  list: { gap: spacing.md, paddingBottom: spacing.lg },
  footer: { paddingTop: spacing.sm },
});
