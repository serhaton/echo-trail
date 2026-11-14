import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { defaultSettings, loadSettings, saveSettings, type Settings } from './settings';

interface SettingsContextValue {
  settings: Settings;
  /** Change one or more settings; saved immediately. */
  updateSettings: (patch: Partial<Settings>) => void;
  /** False until saved settings have been read. */
  ready: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadSettings().then((loaded) => {
      setSettings(loaded);
      setReady(true);
    });
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, updateSettings, ready }), [settings, updateSettings, ready]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** `const { settings, updateSettings } = useSettings();` */
export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
