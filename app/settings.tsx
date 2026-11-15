import { useState } from 'react';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MenuButton } from '@/components/MenuButton';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { VolumeBars } from '@/components/VolumeBars';
import type { ControlScheme } from '@/game/movement';
import { useStoreValue } from '@/game/valueStore';
import { useAudioOutput } from '@/hooks/useAudioOutput';
import { useTranslation, type LanguagePreference } from '@/i18n';
import { goBack } from '@/navigation/goBack';
import { ads } from '@/services/ads';
import { useProgress } from '@/services/ProgressProvider';
import { purchases } from '@/services/purchases';
import type { AudioOutputPreference } from '@/services/settings';
import { useSettings } from '@/services/SettingsProvider';
import { colors, spacing, typography } from '@/theme';

/**
 * Settings: language, controls, sound (volumes + output), vibration and
 * purchases. Everything is saved the moment it changes.
 */
export default function SettingsScreen() {
  const { t, preference, setPreference } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const { unlockAll, resetProgress } = useProgress();
  const { detected } = useAudioOutput();
  const [restore, setRestore] = useState<'idle' | 'busy' | 'none' | 'done'>('idle');
  const removeAds = useStoreValue(purchases.removeAds);
  const price = useStoreValue(purchases.price);
  const [buying, setBuying] = useState(false);
  /** Hidden ad status readout (long-press the title); null = closed. */
  const [adStatus, setAdStatus] = useState<string | null>(null);
  const [buyNote, setBuyNote] = useState<string | null>(null);

  const onBuy = async () => {
    setBuying(true);
    setBuyNote(null);
    const result = await purchases.buyRemoveAds();
    setBuying(false);
    if (result === 'failed') setBuyNote(t('settings.buyFailed'));
    if (result === 'unavailable') setBuyNote(t('settings.buyUnavailable'));
  };

  const languageOptions: { value: LanguagePreference; label: string }[] = [
    { value: 'system', label: t('settings.languageSystem') },
    { value: 'tr', label: t('settings.languageTr') },
    { value: 'en', label: t('settings.languageEn') },
  ];
  const controlOptions: { value: ControlScheme; label: string }[] = [
    { value: 'followFinger', label: t('settings.controlFollow') },
    { value: 'joystick', label: t('settings.controlJoystick') },
    { value: 'tilt', label: t('settings.controlTilt') },
  ];
  const controlHelp = {
    followFinger: t('settings.controlFollowHelp'),
    joystick: t('settings.controlJoystickHelp'),
    tilt: t('settings.controlTiltHelp'),
  }[settings.controlScheme];
  const outputOptions: { value: AudioOutputPreference; label: string }[] = [
    { value: 'auto', label: t('settings.outputAuto') },
    { value: 'headphones', label: t('settings.outputHeadphones') },
    { value: 'speaker', label: t('settings.outputSpeaker') },
  ];
  const detectedLabel =
    detected === 'connected'
      ? t('settings.detectedHeadphones')
      : detected === 'disconnected'
        ? t('settings.detectedSpeaker')
        : t('settings.detectedUnknown');

  const onRestore = async () => {
    setRestore('busy');
    setRestore((await purchases.restore()) ? 'done' : 'none');
  };

  return (
    <Screen>
      {/* Long-press the title: hidden ad status readout, for checking a store build. */}
      <Text style={styles.title} onLongPress={() => setAdStatus((s) => (s === null ? ads.diagnostics() : null))}>
        {t('settings.title')}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.help')}</Text>
          <MenuButton
            compact
            variant="primary"
            label={t('settings.howToPlay')}
            onPress={() => router.push('/intro')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
          <Segmented options={languageOptions} value={preference} onChange={setPreference} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.control')}</Text>
          <Segmented
            options={controlOptions}
            value={settings.controlScheme}
            onChange={(controlScheme) => updateSettings({ controlScheme })}
          />
          <Text style={styles.help}>{controlHelp}</Text>
          <Text style={[styles.sectionLabel, styles.subLabel]}>{t('settings.controlIntro')}</Text>
          <Segmented
            options={[
              { value: 'on', label: t('settings.on') },
              { value: 'off', label: t('settings.off') },
            ]}
            value={settings.showControlIntro ? 'on' : 'off'}
            onChange={(v) => updateSettings({ showControlIntro: v === 'on' })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.sound')}</Text>
          <VolumeBars
            label={t('settings.sfxVolume')}
            value={settings.sfxVolume}
            onChange={(sfxVolume) => updateSettings({ sfxVolume })}
          />
          <VolumeBars
            label={t('settings.ambientVolume')}
            value={settings.ambientVolume}
            onChange={(ambientVolume) => updateSettings({ ambientVolume })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.output')}</Text>
          <Segmented
            options={outputOptions}
            value={settings.audioOutput}
            onChange={(audioOutput) => updateSettings({ audioOutput })}
          />
          <Text style={styles.help}>
            {settings.audioOutput === 'auto' ? `${detectedLabel} ` : ''}
            {t('settings.outputHelp')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.haptics')}</Text>
          <Segmented
            options={[
              { value: 'on', label: t('settings.on') },
              { value: 'off', label: t('settings.off') },
            ]}
            value={settings.hapticsEnabled ? 'on' : 'off'}
            onChange={(v) => updateSettings({ hapticsEnabled: v === 'on' })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settings.purchases')}</Text>
          {removeAds ? (
            <Text style={styles.owned}>{t('settings.removeAdsOwned')}</Text>
          ) : (
            <>
              <MenuButton
                compact
                variant="primary"
                label={price ? `${t('settings.removeAds')} · ${price}` : t('settings.removeAds')}
                onPress={onBuy}
                disabled={buying}
              />
              <Text style={styles.help}>{buyNote ?? t('settings.removeAdsHelp')}</Text>
            </>
          )}
          <MenuButton
            compact
            label={restore === 'busy' ? t('settings.restoring') : t('settings.restore')}
            onPress={onRestore}
            disabled={restore === 'busy'}
          />
          {restore === 'none' && <Text style={styles.help}>{t('settings.restoreNone')}</Text>}
          {restore === 'done' && <Text style={styles.help}>{t('settings.restoreDone')}</Text>}
        </View>

        {adStatus !== null && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>AD STATUS</Text>
            <Text style={styles.help} selectable>
              {adStatus}
            </Text>
            <MenuButton compact label="Refresh" onPress={() => setAdStatus(ads.diagnostics())} />
          </View>
        )}

        {/* Developer tools: compiled out of release builds. */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('dev.devOnly')}</Text>
            <View style={styles.devRow}>
              <View style={styles.flex}>
                <MenuButton compact label={t('dev.unlockAll')} onPress={unlockAll} />
              </View>
              <View style={styles.flex}>
                <MenuButton compact label={t('dev.resetProgress')} onPress={resetProgress} />
              </View>
            </View>
            <MenuButton
              compact
              label={removeAds ? t('dev.removeAdsOff') : t('dev.removeAdsOn')}
              onPress={() => purchases.devSetRemoveAds(!removeAds)}
            />
          </View>
        )}
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
  content: { paddingBottom: spacing.lg },
  section: { gap: spacing.sm, marginBottom: spacing.xl },
  help: { ...typography.body, color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  sectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  owned: { ...typography.body, color: colors.success },
  subLabel: { marginTop: spacing.sm },
  devRow: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  footer: { paddingTop: spacing.sm },
});
