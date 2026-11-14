import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { Settings, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { audioEngine, preloadSounds } from '@/audio';
import { AmbientGlow } from '@/components/AmbientGlow';
import { MenuButton } from '@/components/MenuButton';
import { Screen } from '@/components/Screen';
import { SCREENSHOT_MODE } from '@/config/screenshotMode';
import { useTranslation } from '@/i18n';
import { useSettings } from '@/services/SettingsProvider';
import { colors, spacing, typography } from '@/theme';

/**
 * Main menu.
 *
 * Layout is bottom-heavy on purpose: buttons sit in the lower half so the
 * whole menu is reachable with one thumb.
 */
/** Pad volume when the dot is smallest / largest (follows the Ambience setting). */
const PAD_QUIET = 0.1;
const PAD_LOUD = 0.6;

export default function MainMenu() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const glowSize = Math.min(width * 0.8, 340);

  // Screenshot builds only: open the screen named by the launch argument
  // `-ScreenshotRoute /journey/zen` (see scripts/take-screenshots.sh).
  useEffect(() => {
    if (!SCREENSHOT_MODE) return;
    const route = Settings.get('ScreenshotRoute') as string | undefined;
    if (route) router.push(route as never);
  }, []);

  // First launch: show "how to play" once.
  const { settings } = useSettings();
  useEffect(() => {
    if (!settings.introSeen) router.push('/intro');
  }, [settings.introSeen]);

  // A soft, mysterious pad plays only while the menu is on screen and
  // breathes with the dot: louder as the light grows, quieter as it shrinks.
  const padOn = useRef(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      preloadSounds(['menuPad'])
        .then(() => {
          if (!active) return;
          audioEngine.startAmbience('menuPad', PAD_QUIET);
          padOn.current = true;
        })
        .catch((error) => console.warn('[menu] pad failed to load', error));
      return () => {
        active = false;
        padOn.current = false;
        audioEngine.stopAmbience();
      };
    }, []),
  );
  const onBreath = useCallback((direction: 'in' | 'out', seconds: number) => {
    if (padOn.current) audioEngine.rampAmbience(direction === 'in' ? PAD_LOUD : PAD_QUIET, seconds);
  }, []);

  return (
    <Screen>
      <View style={styles.hero}>
        <AmbientGlow size={glowSize} onBreath={onBreath} />
        <Text style={styles.title}>ECHO TRAIL</Text>
        <Text style={styles.tagline}>{t('menu.tagline')}</Text>
      </View>

      <View style={styles.actions}>
        <MenuButton
          variant="primary"
          label={t('menu.play')}
          onPress={() => router.push('/mode-select')}
        />
        <MenuButton
          label={t('menu.album')}
          onPress={() => router.push({ pathname: '/album/[mode]', params: { mode: 'zen' } })}
        />
        <MenuButton label={t('menu.settings')} onPress={() => router.push('/settings')} />
        {/* Developer tools: compiled out of release builds (__DEV__ is false). */}
        {__DEV__ && (
          <MenuButton
            label={t('dev.audioLab')}
            caption={t('dev.devOnly')}
            onPress={() => router.push('/dev/audio-lab')}
          />
        )}
        {__DEV__ && (
          <MenuButton
            label={t('dev.testLevel')}
            caption={t('dev.devOnly')}
            onPress={() => router.push('/level/test-01')}
          />
        )}
        <Text style={styles.hint}>🎧 {t('menu.headphonesHint')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginTop: -spacing.xxl,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  actions: { gap: spacing.md, paddingBottom: spacing.md },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
