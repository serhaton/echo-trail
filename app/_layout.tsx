import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider, useTranslation } from '@/i18n';
import { ProgressProvider, useProgress } from '@/services/ProgressProvider';
import { ServicesInit } from '@/services/ServicesInit';
import { SettingsEffects } from '@/services/SettingsEffects';
import { SettingsProvider, useSettings } from '@/services/SettingsProvider';
import { colors, motion } from '@/theme';

// Keep the splash visible until saved settings (language, controls) load,
// so the menu never flashes in the wrong language.
void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: motion.slow });

/** Hides the splash once providers report they are ready. */
function SplashGate({ children }: { children: ReactNode }) {
  const { ready: i18nReady } = useTranslation();
  const { ready: settingsReady } = useSettings();
  const { ready: progressReady } = useProgress();
  const ready = i18nReady && settingsReady && progressReady;
  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);
  return ready ? children : null;
}

/**
 * Root layout: global providers + a header-less stack.
 * Screens draw their own minimal chrome to keep the dark atmosphere.
 */
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <I18nProvider>
          <SettingsProvider>
            <SettingsEffects />
            <ProgressProvider>
              <SplashGate>
                <ServicesInit />
                <StatusBar style="light" />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                    contentStyle: { backgroundColor: colors.background },
                  }}
                />
              </SplashGate>
            </ProgressProvider>
          </SettingsProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
