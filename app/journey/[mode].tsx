import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeadphonePrompt } from '@/components/HeadphonePrompt';
import { JourneyMap, journeyMapHeight, journeyNodeY } from '@/components/JourneyMap';
import { MenuButton } from '@/components/MenuButton';
import { Segmented } from '@/components/Segmented';
import {
  completedCount,
  JOURNEY_LENGTH,
  journeyLevels,
  starsOf,
  totalStars,
  type LockReason,
} from '@/data/journeys';
import type { LevelDefinition } from '@/data/levels';
import { DIFFICULTIES, type Difficulty } from '@/game/difficulty';
import { useAudioOutput } from '@/hooks/useAudioOutput';
import { useTranslation } from '@/i18n';
import { getMode, isModeId } from '@/modes';
import { goBack } from '@/navigation/goBack';
import * as haptics from '@/services/haptics';
import { sessionHeadphoneAnswer } from '@/services/headphones';
import { useProgress } from '@/services/ProgressProvider';
import { useSettings } from '@/services/SettingsProvider';
import { colors, layout, motion, palettes, radius, spacing, typography } from '@/theme';

/**
 * A journey: difficulty picker, headphone status and the level path.
 * Tapping an open level starts it (asking about headphones first only if
 * detection failed); tapping a locked one explains why it's locked.
 */
export default function JourneyScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { progress } = useProgress();
  const { settings } = useSettings();
  // Not saved on purpose: every visit to a journey starts on Normal.
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const audio = useAudioOutput();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<LevelDefinition | null>(null);
  const [width, setWidth] = useState(0);
  const scroll = useRef<ScrollViewInstance>(null);
  const [viewport, setViewport] = useState(0);
  const centred = useRef(false);

  // Hide the "locked" explanation after a moment.
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 2200);
    return () => clearTimeout(id);
  }, [message]);

  // Keep the last completed level in the middle of the screen (level 1 for a
  // new journey): when the screen opens, and again when coming back from a
  // level that was just finished.
  const validMode = isModeId(modeParam) && getMode(modeParam).status === 'available';
  const lastDone = (validMode ? journeyLevels(modeParam) : []).reduce(
    (best, l, i) => (starsOf(progress, l.id) > 0 ? i : best),
    0,
  );
  const centreOnProgress = useCallback(
    (animated: boolean) => {
      if (viewport === 0) return;
      const max = Math.max(0, journeyMapHeight() - viewport);
      const y = Math.min(max, Math.max(0, journeyNodeY(lastDone) - viewport / 2));
      scroll.current?.scrollTo({ y, animated });
    },
    [viewport, lastDone],
  );
  useEffect(() => {
    if (viewport === 0 || width === 0) return;
    // First time without animation, afterwards glide to the new position.
    const id = setTimeout(() => {
      centreOnProgress(centred.current);
      centred.current = true;
    }, 0);
    return () => clearTimeout(id);
  }, [viewport, width, centreOnProgress]);
  useFocusEffect(
    useCallback(() => {
      if (centred.current) centreOnProgress(true);
    }, [centreOnProgress]),
  );

  if (!validMode) {
    return null;
  }
  const mode = getMode(modeParam);
  const palette = palettes[mode.palette];
  const levels = journeyLevels(mode.id);

  const start = (level: LevelDefinition) => {
    router.push({
      pathname: '/level/[id]',
      params: { id: level.id, difficulty },
    });
  };

  const onSelect = (level: LevelDefinition, lock: LockReason | null) => {
    if (lock) {
      haptics.bump();
      setMessage(
        lock.kind === 'stars'
          ? t('journey.needsStars', { stars: lock.required })
          : t('journey.locked'),
      );
      return;
    }
    if (audio.needsAnswer) {
      setPending(level);
      return;
    }
    start(level);
  };

  const headphoneLabel =
    settings.audioOutput === 'headphones'
      ? t('journey.headphonesManual')
      : settings.audioOutput === 'speaker'
        ? t('journey.speakerManual')
        : audio.needsAnswer
          ? t('journey.headphonesUnknown')
          : audio.usingHeadphones
            ? t('journey.headphonesOn')
            : t('journey.headphonesOff');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => goBack('/mode-select')}
            hitSlop={16}
            style={styles.back}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text style={[styles.title, { color: palette.accent }]}>{t(`${mode.i18nKey}.name`)}</Text>
          <Text style={styles.stars}>
            {t('modeSelect.progress', {
              done: completedCount(progress, mode.id),
              total: JOURNEY_LENGTH,
              stars: totalStars(progress, mode.id),
            })}
          </Text>
        </View>
        <Segmented
          compact
          value={difficulty}
          onChange={setDifficulty}
          options={DIFFICULTIES.map((d) => ({ value: d, label: t(`difficulty.${d}`) }))}
        />
        <Pressable onPress={() => router.push('/settings')} hitSlop={6}>
          <Text style={styles.headphones}>{headphoneLabel}</Text>
        </Pressable>
      </View>

      {/* Level path (scrolls; starts at the bottom, where the journey begins) */}
      <ScrollView
        ref={scroll}
        style={styles.flex}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => {
          setWidth(Math.min(e.nativeEvent.layout.width, layout.contentMaxWidth));
          setViewport(e.nativeEvent.layout.height);
        }}
        contentContainerStyle={styles.mapContainer}
      >
        {width > 0 && (
          <JourneyMap
            width={width}
            levels={levels}
            progress={progress}
            palette={palette}
            onSelect={onSelect}
          />
        )}
      </ScrollView>

      {message && (
        <Animated.Text
          entering={FadeIn.duration(motion.fast)}
          exiting={FadeOut.duration(motion.normal)}
          style={[styles.message, { bottom: insets.bottom + 96 }]}
          pointerEvents="none"
        >
          {message}
        </Animated.Text>
      )}

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <MenuButton
          compact
          label={t('journey.album')}
          onPress={() => router.push({ pathname: '/album/[mode]', params: { mode: mode.id } })}
        />
      </View>

      <HeadphonePrompt
        visible={pending != null}
        onCancel={() => setPending(null)}
        onAnswer={(answer) => {
          sessionHeadphoneAnswer.set(answer);
          const level = pending;
          setPending(null);
          if (level) start(level);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  back: { width: 44, height: 44, justifyContent: 'center' },
  backText: { fontSize: 34, fontWeight: '200', color: colors.textSecondary, marginTop: -4 },
  title: { ...typography.title, flex: 1 },
  stars: { ...typography.body, color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  headphones: { ...typography.caption, color: colors.textMuted, letterSpacing: 0.4 },
  mapContainer: { alignItems: 'center' },
  message: {
    ...typography.body,
    position: 'absolute',
    alignSelf: 'center',
    color: colors.textPrimary,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
});
