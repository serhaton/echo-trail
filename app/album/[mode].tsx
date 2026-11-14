import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MenuButton } from '@/components/MenuButton';
import { PanoramaModal } from '@/components/PanoramaModal';
import { Segmented } from '@/components/Segmented';
import { journeyLevels, starsOf } from '@/data/journeys';
import type { LevelDefinition } from '@/data/levels';
import { useTranslation, type TranslationKey } from '@/i18n';
import { getMode, isModeId, MODES, type ModeId } from '@/modes';
import { goBack } from '@/navigation/goBack';
import { uiTap } from '@/services/haptics';
import { useProgress } from '@/services/ProgressProvider';
import { colors, layout, palettes, radius, spacing, typography } from '@/theme';

const COLUMNS = 2;
const GAP = spacing.md;

/**
 * Album: the pictures revealed in a journey. Finished levels show their
 * picture (tap to view it with what you found there); the rest stay dark.
 * Once every picture is revealed they can be joined into one landscape.
 */
export default function AlbumScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { progress } = useProgress();
  const [viewing, setViewing] = useState<LevelDefinition | null>(null);
  const [panorama, setPanorama] = useState(false);

  const modeId: ModeId = isModeId(modeParam) && getMode(modeParam).status === 'available' ? modeParam : 'zen';
  const mode = getMode(modeId);
  const palette = palettes[mode.palette];
  const levels = journeyLevels(modeId);
  const revealed = levels.filter((l) => starsOf(progress, l.id) > 0);
  const complete = levels.length > 0 && revealed.length === levels.length;

  const contentWidth = Math.min(screenWidth, layout.contentMaxWidth) - spacing.lg * 2;
  const tileW = (contentWidth - GAP * (COLUMNS - 1)) / COLUMNS;
  const tileH = tileW * 2;

  const available = MODES.filter((m) => m.status === 'available');

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{t('album.title')}</Text>
          <Text style={styles.count}>
            {t('album.progress', { found: revealed.length, total: levels.length })}
          </Text>
        </View>
        <Segmented
          compact
          value={modeId}
          onChange={(next: ModeId) => router.setParams({ mode: next })}
          options={available.map((m) => ({ value: m.id, label: t(`${m.i18nKey}.name`) }))}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.grid, { width: contentWidth + spacing.lg * 2 }]}
        style={styles.flex}
        showsVerticalScrollIndicator={false}
      >
        {/* Big landscape: available once every picture is revealed. */}
        <View style={styles.panoramaRow}>
          {complete ? (
            <MenuButton variant="primary" label={t('album.panorama')} onPress={() => setPanorama(true)} />
          ) : (
            <Text style={styles.panoramaLocked}>
              {t('album.panoramaLocked', { total: levels.length })}
            </Text>
          )}
        </View>

        <View style={styles.tiles}>
          {levels.map((level) => {
            const stars = starsOf(progress, level.id);
            const open = stars > 0;
            return (
              <Pressable
                key={level.id}
                accessibilityRole="button"
                accessibilityLabel={`${level.index}. ${t(`levels.${level.id}` as TranslationKey)}`}
                onPress={() => {
                  uiTap();
                  setViewing(level);
                }}
                style={({ pressed }) => [
                  styles.tile,
                  { width: tileW, height: tileH },
                  open && { borderColor: `${palette.accent}55` },
                  pressed && styles.pressed,
                ]}
              >
                {open ? (
                  <>
                    <Image
                      source={level.revealImage}
                      style={{ width: tileW, height: tileH }}
                      resizeMode="cover"
                    />
                    <View style={styles.tileLabel}>
                      <Text style={[styles.tileStars, { color: palette.accent }]}>
                        {'★'.repeat(stars)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.lockedTile}>
                    <Text style={styles.lockedNumber}>{level.index}</Text>
                    <Text style={styles.lockedIcon}>🔒</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <MenuButton compact label={t('common.back')} onPress={() => goBack()} />
      </View>

      <PictureViewer level={viewing} accent={palette.accent} onClose={() => setViewing(null)} />
      <PanoramaModal
        visible={panorama}
        images={levels.map((l) => l.revealImage)}
        caption={t(`journeyEnd.${modeId}`)}
        accent={palette.accent}
        onClose={() => setPanorama(false)}
      />
    </View>
  );
}

/** One picture, large, with the level's title, stars and what was found there. */
function PictureViewer({
  level,
  accent,
  onClose,
}: {
  level: LevelDefinition | null;
  accent: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { progress } = useProgress();
  if (!level) return null;

  const stars = starsOf(progress, level.id);
  const open = stars > 0;
  const found = new Set(progress.levels[level.id]?.collected ?? []);
  // Time bonuses leave nothing behind; album details and letters do.
  const keepsakes = (level.collectibles ?? []).filter(
    (c) => c.reward.kind === 'albumDetail' || c.reward.kind === 'story',
  );
  const imageH = Math.min(height * 0.5, 460);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.viewer, { paddingTop: insets.top + spacing.lg }]}>
        <ScrollView contentContainerStyle={styles.viewerContent} showsVerticalScrollIndicator={false}>
          {open ? (
            <Image
              source={level.revealImage}
              style={{ width: imageH / 2, height: imageH, borderRadius: radius.md }}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.lockedTile, styles.viewerLocked, { width: imageH / 2, height: imageH }]}>
              <Text style={styles.lockedIcon}>🔒</Text>
            </View>
          )}
          <Text style={styles.viewerTitle}>
            {level.index}. {t(`levels.${level.id}` as TranslationKey)}
          </Text>
          {open ? (
            <Text style={[styles.viewerStars, { color: accent }]}>
              {'★'.repeat(stars)}
              <Text style={styles.starsEmpty}>{'☆'.repeat(3 - stars)}</Text>
            </Text>
          ) : (
            <Text style={styles.viewerNote}>{t('album.locked')}</Text>
          )}
          {open &&
            keepsakes.map((c) =>
              !found.has(c.id) ? (
                <Text key={c.id} style={styles.viewerNote}>
                  {t('album.detailMissing')}
                </Text>
              ) : c.reward.kind === 'story' ? (
                <View key={c.id} style={styles.letter}>
                  <Text style={styles.letterTitle}>{t('album.letter')}</Text>
                  <Text style={styles.letterText}>{t(`stories.${c.reward.storyId}`)}</Text>
                </View>
              ) : (
                <Text key={c.id} style={[styles.viewerNote, { color: accent }]}>
                  {t('album.detailFound')}
                </Text>
              ),
            )}
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <MenuButton label={t('common.close')} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { ...typography.title, color: colors.textPrimary },
  count: { ...typography.body, color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  grid: { alignSelf: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  panoramaRow: { marginBottom: spacing.md },
  panoramaLocked: { ...typography.body, color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.7 },
  tileLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: 'rgba(5, 6, 10, 0.55)',
  },
  tileStars: { fontSize: 14, letterSpacing: 2 },
  lockedTile: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  lockedNumber: { ...typography.title, color: colors.textMuted },
  lockedIcon: { fontSize: 20, opacity: 0.5 },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  viewer: { flex: 1, backgroundColor: 'rgba(5, 6, 10, 0.96)' },
  viewerContent: { alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  viewerLocked: {
    flex: 0,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  viewerTitle: { ...typography.title, color: colors.textPrimary, fontSize: 22, textAlign: 'center' },
  viewerStars: { fontSize: 22, letterSpacing: 4 },
  starsEmpty: { color: colors.textMuted },
  viewerNote: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  letter: {
    alignSelf: 'stretch',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  letterTitle: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  letterText: { ...typography.body, color: colors.textPrimary, fontStyle: 'italic', lineHeight: 22 },
});
