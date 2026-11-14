import { Modal, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { colors, radius, spacing, typography } from '@/theme';

import { MenuButton } from './MenuButton';

interface HeadphonePromptProps {
  visible: boolean;
  onAnswer: (answer: 'headphones' | 'speaker') => void;
  onCancel: () => void;
}

/**
 * Asked before a level only when headphone detection failed. The answer is
 * kept for this app session (see sessionHeadphoneAnswer).
 */
export function HeadphonePrompt({ visible, onAnswer, onCancel }: HeadphonePromptProps) {
  const { t } = useTranslation();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('headphonePrompt.title')}</Text>
          <Text style={styles.body}>{t('headphonePrompt.body')}</Text>
          <MenuButton
            variant="primary"
            label={t('headphonePrompt.yes')}
            onPress={() => onAnswer('headphones')}
          />
          <MenuButton label={t('headphonePrompt.no')} onPress={() => onAnswer('speaker')} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  title: { ...typography.title, color: colors.textPrimary, fontSize: 22 },
  body: { ...typography.body, color: colors.textSecondary, lineHeight: 21 },
});
