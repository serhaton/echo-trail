import { Canvas, DashPathEffect, Path, Skia, type SkPath } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { JOURNEY_LENGTH, lockReason, starsOf, type LockReason } from '@/data/journeys';
import type { LevelDefinition } from '@/data/levels';
import { useTranslation, type TranslationKey } from '@/i18n';
import type { ModePalette } from '@/theme';
import { colors, motion, spacing, typography } from '@/theme';
import { cyclePalette, mixHex, withAlpha } from '@/theme/color';
import type { ProgressData } from '@/services/progress';

const NODE = 60;
const ROW = 124;
const PAD_TOP = 70;
const PAD_BOTTOM = 90;
/** Path segments drawn per canvas strip (keeps every canvas small). */
const SEGMENTS_PER_STRIP = 4;
/** Extra room above and below a strip so stroke ends aren't clipped. */
const STRIP_MARGIN = 4;


interface JourneyMapProps {
  width: number;
  levels: readonly LevelDefinition[];
  progress: ProgressData;
  palette: ModePalette;
  onSelect: (level: LevelDefinition, lock: LockReason | null) => void;
}

/** Vertical centre of a level's node inside the map (index 0 = level 1). */
export function journeyNodeY(index: number) {
  return journeyMapHeight() - PAD_BOTTOM - NODE / 2 - index * ROW;
}

/** Height of the scrollable map for a full journey. */
export function journeyMapHeight() {
  return PAD_TOP + PAD_BOTTOM + (JOURNEY_LENGTH - 1) * ROW + NODE;
}

/**
 * The journey as a gently winding path, level 1 at the bottom, climbing up.
 * Completed stretches glow in the mode's trail colours; the way ahead is a
 * faint dashed line. The background slowly shifts colour bottom → top
 * (in Zen: dawn → night).
 */
export function JourneyMap({ width, levels, progress, palette, onSelect }: JourneyMapProps) {
  const height = journeyMapHeight();

  // Node centres, bottom to top, swaying left/right.
  const points = useMemo(
    () =>
      Array.from({ length: JOURNEY_LENGTH }, (_, i) => ({
        x: width / 2 + Math.sin(i * 1.1) * width * 0.24,
        y: height - PAD_BOTTOM - NODE / 2 - i * ROW,
      })),
    [width, height],
  );

  const completedCount = levels.filter((l) => starsOf(progress, l.id) > 0).length;

  /**
   * The path is drawn in short strips, each its own small canvas. One
   * canvas for the whole map would be taller than the GPU's largest
   * texture once a journey has 30 levels (and wastes memory long before).
   */
  const strips = useMemo(() => {
    const out: { top: number; height: number; segments: { path: SkPath; index: number }[] }[] = [];
    for (let from = 0; from < JOURNEY_LENGTH - 1; from += SEGMENTS_PER_STRIP) {
      const to = Math.min(from + SEGMENTS_PER_STRIP, JOURNEY_LENGTH - 1);
      const top = points[to]!.y - STRIP_MARGIN;
      const segments = [];
      for (let i = from; i < to; i++) {
        const a = points[i]!;
        const b = points[i + 1]!;
        const midY = (a.y + b.y) / 2 - top;
        const path = Skia.PathBuilder.Make()
          .moveTo(a.x, a.y - top)
          .cubicTo(a.x, midY, b.x, midY, b.x, b.y - top)
          .build();
        segments.push({ path, index: i });
      }
      out.push({ top, height: points[from]!.y - top + STRIP_MARGIN, segments });
    }
    return out;
  }, [points]);

  const bottomTint = palette.trail[0] ?? palette.accent;

  return (
    <View style={{ width, height }}>
      {/* Background: a faint wash of the mode's colour. */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: withAlpha(bottomTint, 0.06) }]}
      />

      {strips.map((strip, k) => (
        <Canvas
          key={`strip-${k}`}
          pointerEvents="none"
          style={{ position: 'absolute', left: 0, top: strip.top, width, height: strip.height }}
        >
          {strip.segments.map(({ path, index }) =>
            index < completedCount ? (
              <Path
                key={index}
                path={path}
                style="stroke"
                strokeWidth={3}
                strokeCap="round"
                color={cyclePalette(palette.trail, index / 2)}
              />
            ) : (
              <Path
                key={index}
                path={path}
                style="stroke"
                strokeWidth={2}
                color="rgba(255,255,255,0.12)"
              >
                <DashPathEffect intervals={[3, 9]} />
              </Path>
            ),
          )}
        </Canvas>
      ))}

      {points.map((p, i) => {
        const level = levels[i];
        return (
          <LevelNode
            key={i}
            index={i + 1}
            center={p}
            level={level}
            progress={progress}
            palette={palette}
            onSelect={onSelect}
          />
        );
      })}
    </View>
  );
}

function LevelNode({
  index,
  center,
  level,
  progress,
  palette,
  onSelect,
}: {
  index: number;
  center: { x: number; y: number };
  level: LevelDefinition | undefined;
  progress: ProgressData;
  palette: ModePalette;
  onSelect: (level: LevelDefinition, lock: LockReason | null) => void;
}) {
  const { t } = useTranslation();
  const lock = level ? lockReason(progress, level) : null;
  const stars = level ? starsOf(progress, level.id) : 0;
  const state: 'soon' | 'locked' | 'done' | 'open' = !level
    ? 'soon'
    : lock
      ? 'locked'
      : stars > 0
        ? 'done'
        : 'open';

  // The next playable level breathes gently to say "play me".
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (state !== 'open') return;
    pulse.set(
      withRepeat(
        withTiming(1, { duration: motion.breathe / 2, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [state, pulse]);
  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + 0.5 * pulse.get(),
    transform: [{ scale: 1 + 0.18 * pulse.get() }],
  }));

  const caption =
    state === 'soon'
      ? t('journey.comingSoon')
      : lock?.kind === 'stars'
        ? t('journey.needsStars', { stars: lock.required })
        : level
          ? t(`levels.${level.id}` as TranslationKey)
          : '';

  return (
    <View
      style={[styles.nodeWrap, { left: center.x - 70, top: center.y - NODE / 2 }]}
      pointerEvents="box-none"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${index}. ${caption}`}
        accessibilityState={{ disabled: state === 'soon' }}
        disabled={state === 'soon'}
        onPress={() => level && onSelect(level, lock)}
        hitSlop={8}
        style={({ pressed }) => [pressed && { transform: [{ scale: 0.95 }] }]}
      >
        {state === 'open' && (
          <Animated.View style={[styles.ring, { borderColor: palette.accent }, ringStyle]} />
        )}
        <View
          style={[
            styles.node,
            // Opaque fills so the path never shows through the circles.
            state === 'done' && {
              backgroundColor: mixHex(colors.surface, palette.accent, 0.22),
              borderColor: palette.accent,
            },
            state === 'open' && { borderColor: palette.accent, backgroundColor: colors.surfaceRaised },
            state === 'locked' && styles.nodeLocked,
            state === 'soon' && styles.nodeSoon,
          ]}
        >
          <Text
            style={[
              styles.number,
              (state === 'done' || state === 'open') && { color: colors.textPrimary },
            ]}
          >
            {state === 'locked' ? '🔒' : index}
          </Text>
        </View>
      </Pressable>
      {state !== 'soon' && state !== 'locked' && (
        <Text style={[styles.stars, { color: palette.accent }]}>
          {'★'.repeat(stars)}
          <Text style={styles.starsEmpty}>{'☆'.repeat(3 - stars)}</Text>
        </Text>
      )}
      <Text style={[styles.caption, state === 'soon' && styles.captionSoon]} numberOfLines={1}>
        {caption}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  nodeWrap: { position: 'absolute', width: 140, alignItems: 'center' },
  ring: {
    position: 'absolute',
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 2,
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeLocked: { opacity: 0.55 },
  nodeSoon: { opacity: 0.3, borderStyle: 'dashed' },
  number: { ...typography.subtitle, color: colors.textSecondary },
  stars: {
    fontSize: 13,
    letterSpacing: 2,
    marginTop: spacing.xs,
    textShadowColor: colors.background,
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 0 },
  },
  starsEmpty: { color: colors.textMuted },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    // Keeps labels readable where the path passes behind them.
    textShadowColor: colors.background,
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 0 },
  },
  captionSoon: { color: colors.textMuted },
});
