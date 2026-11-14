import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientGlow } from '@/components/AmbientGlow';
import { ControlDemo } from '@/components/ControlDemo';
import { IntroScene } from '@/components/IntroScene';
import { MenuButton } from '@/components/MenuButton';
import { Segmented } from '@/components/Segmented';
import { Stars } from '@/components/Stars';
import { useTranslation } from '@/i18n';
import { MODES } from '@/modes';
import { useSettings } from '@/services/SettingsProvider';
import { colors, layout, palettes, spacing, typography } from '@/theme';

const PAGES = [
  'welcome',
  'listen',
  'controls',
  'obstacles',
  'trail',
  'time',
  'modes',
  'headphones',
] as const;
type Page = (typeof PAGES)[number];

/**
 * "How to play": shown once on first launch and any time from Settings.
 * Eight short pages you can swipe through: the idea, following the sound,
 * the three control schemes (pick one), invisible obstacles, the trail and picture, time/stars/hints, the four
 * journeys, and headphones.
 */
export default function IntroScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { settings, updateSettings } = useSettings();
  const scheme = settings.controlScheme;
  const [page, setPage] = useState(0);
  const scroll = useRef<ScrollViewInstance>(null);
  const last = page === PAGES.length - 1;

  const finish = () => {
    updateSettings({ introSeen: true });
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  const next = () => {
    if (last) finish();
    else scroll.current?.scrollTo({ x: width * (page + 1), animated: true });
  };

  const text = (p: Page): { title: string; body?: string } => {
    switch (p) {
      case 'welcome':
        return { title: t('intro.welcomeTitle'), body: t('intro.welcomeBody') };
      case 'listen':
        return { title: t('intro.listenTitle'), body: t('intro.listenBody') };
      case 'controls':
        return { title: t('intro.controlsTitle'), body: t('intro.controlsBody') };
      case 'obstacles':
        return { title: t('intro.obstaclesTitle'), body: t('intro.obstaclesBody') };
      case 'trail':
        return { title: t('intro.trailTitle'), body: t('intro.trailBody') };
      case 'time':
        return { title: t('intro.timeTitle'), body: t('intro.timeBody') };
      case 'modes':
        return { title: t('intro.modesTitle') };
      case 'headphones':
        return { title: t('intro.headphonesTitle'), body: t('intro.headphonesBody') };
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.topRow}>
        {!last && (
          <Pressable accessibilityRole="button" onPress={finish} hitSlop={12}>
            <Text style={styles.skip}>{t('intro.skip')}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={styles.flex}
      >
        {PAGES.map((p, i) => {
          const { title, body } = text(p);
          return (
            <View key={p} style={[styles.page, { width }]}>
              <View style={styles.art}>
                {/* Only the visible page animates and makes sound. */}
                {i === page &&
                  (p === 'controls' ? (
                    <ControlDemo scheme={scheme} color={palettes.zen.playerGlow} />
                  ) : (
                    <Art page={p} />
                  ))}
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{title}</Text>
                {body ? <Text style={styles.body}>{body}</Text> : null}
                {p === 'controls' && (
                  <>
                    <Segmented
                      value={scheme}
                      onChange={(controlScheme) => updateSettings({ controlScheme })}
                      options={[
                        { value: 'followFinger', label: t('settings.controlFollow') },
                        { value: 'joystick', label: t('settings.controlJoystick') },
                        { value: 'tilt', label: t('settings.controlTilt') },
                      ]}
                    />
                    <Text style={styles.body}>
                      {
                        {
                          followFinger: t('settings.controlFollowHelp'),
                          joystick: t('settings.controlJoystickHelp'),
                          tilt: t('settings.controlTiltHelp'),
                        }[scheme]
                      }
                    </Text>
                  </>
                )}
                {p === 'modes' &&
                  MODES.map((m) => (
                    <View key={m.id} style={styles.modeRow}>
                      <Text style={[styles.modeName, { color: palettes[m.palette].accent }]}>
                        {t(`${m.i18nKey}.name`)}
                      </Text>
                      <Text style={styles.modeText}>{t(`${m.i18nKey}.description`)}</Text>
                    </View>
                  ))}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.dots}>
        {PAGES.map((p, i) => (
          <View key={p} style={[styles.dot, i === page && styles.dotOn]} />
        ))}
      </View>
      <View style={styles.footer}>
        <MenuButton variant="primary" label={last ? t('intro.start') : t('intro.next')} onPress={next} />
      </View>
    </View>
  );
}

function Art({ page }: { page: Exclude<Page, 'controls'> }) {
  switch (page) {
    case 'welcome':
      return <AmbientGlow size={220} />;
    case 'listen':
    case 'obstacles':
    case 'trail':
      return <IntroScene kind={page} />;
    case 'time':
      return <Stars count={3} color={colors.accent} withSound={false} />;
    case 'modes':
      return (
        <View style={styles.swatches}>
          {MODES.map((m) => (
            <View key={m.id} style={[styles.swatch, { backgroundColor: palettes[m.palette].accent }]} />
          ))}
        </View>
      );
    case 'headphones':
      return <Text style={styles.headphones}>🎧</Text>;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  topRow: {
    height: 44,
    paddingHorizontal: spacing.lg,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  skip: { ...typography.body, color: colors.textMuted },
  page: { alignItems: 'center', paddingHorizontal: spacing.lg },
  art: { height: 230, alignItems: 'center', justifyContent: 'center' },
  copy: { width: '100%', maxWidth: layout.contentMaxWidth, gap: spacing.md },
  title: { ...typography.title, color: colors.textPrimary, textAlign: 'center' },
  body: { ...typography.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 23 },
  modeRow: { gap: 2 },
  modeName: { ...typography.subtitle },
  modeText: { ...typography.body, color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  swatches: { flexDirection: 'row', gap: spacing.md },
  swatch: { width: 34, height: 34, borderRadius: 17 },
  headphones: { fontSize: 84 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.surfaceRaised },
  dotOn: { backgroundColor: colors.accent, width: 18 },
  footer: {
    paddingHorizontal: spacing.lg,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
});
