import { useEffect } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '@/i18n';
import { colors, spacing, typography } from '@/theme';

import { MenuButton } from './MenuButton';

interface PanoramaModalProps {
  visible: boolean;
  /** The journey's pictures in order. */
  images: readonly number[];
  /** Closing line of the journey, shown under the landscape. */
  caption: string;
  accent: string;
  onClose: () => void;
}

/** Gap between pictures before they slide together (points). */
const START_GAP = 26;

/**
 * The completed album: all pictures of a journey slide together into one
 * long landscape you can swipe through.
 */
export function PanoramaModal({ visible, images, caption, accent, onClose }: PanoramaModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const tileH = Math.min(height * 0.62, 560);
  const tileW = tileH / 2;

  // 1 = apart, 0 = joined.
  const apart = useSharedValue(1);
  useEffect(() => {
    if (!visible) return;
    apart.set(1);
    apart.set(withDelay(500, withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.cubic) })));
  }, [visible, apart]);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={[styles.hint, { color: accent }]}>{t('album.panoramaHint')} →</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.strip}
          style={styles.scroll}
        >
          {images.map((source, i) => (
            <Tile key={i} source={source} width={tileW} height={tileH} apart={apart} />
          ))}
        </ScrollView>
        <Text style={styles.caption}>{caption}</Text>
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <MenuButton label={t('common.close')} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function Tile({
  source,
  width,
  height,
  apart,
}: {
  source: number;
  width: number;
  height: number;
  apart: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => ({
    marginHorizontal: (START_GAP / 2) * apart.get(),
    borderRadius: 14 * apart.get(),
  }));
  return (
    <Animated.View style={[{ width, height, overflow: 'hidden' }, style]}>
      <Image source={source} style={{ width, height }} resizeMode="cover" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  hint: { ...typography.caption, textAlign: 'center', textTransform: 'uppercase' },
  scroll: { flexGrow: 0, marginTop: spacing.md },
  strip: { paddingHorizontal: spacing.lg, alignItems: 'center' },
  caption: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    flex: 1,
  },
  footer: { paddingHorizontal: spacing.lg },
});
