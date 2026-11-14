import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, spacing } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  /** Centre content in a max-width column (menus). Game screens pass false. */
  constrained?: boolean;
  style?: ViewStyle;
}

/**
 * Base screen container: dark background + safe-area padding, so nothing
 * hides under the notch, Dynamic Island or home indicator. On iPad the
 * content column is capped to a comfortable width.
 */
export function Screen({ children, constrained = true, style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top + spacing.md,
          paddingBottom: insets.bottom + spacing.md,
          paddingLeft: insets.left + spacing.lg,
          paddingRight: insets.right + spacing.lg,
        },
      ]}
    >
      <View style={[styles.inner, constrained && styles.constrained, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, alignItems: 'center' },
  inner: { flex: 1, width: '100%' },
  constrained: { maxWidth: layout.contentMaxWidth },
});
