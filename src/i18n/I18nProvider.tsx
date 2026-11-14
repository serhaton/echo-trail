import { useLocales } from 'expo-localization';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { readJSON, StorageKeys, writeJSON } from '@/services/storage';

import { en } from './en';
import { tr } from './tr';
import type {
  Language,
  LanguagePreference,
  Translation,
  TranslationKey,
  TranslationParams,
} from './types';

const dictionaries: Record<Language, Translation> = { en, tr };

interface I18nContextValue {
  /** Language actually in use. */
  language: Language;
  /** What the player picked in settings ('system' follows the device). */
  preference: LanguagePreference;
  setPreference: (preference: LanguagePreference) => void;
  /** Translate a key, with optional {{placeholder}} values. */
  t: (key: TranslationKey, params?: TranslationParams) => string;
  /** False until the saved preference has been read from storage. */
  ready: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/** Turkish devices get Turkish; everything else falls back to English. */
function languageFromDevice(languageCode: string | null | undefined): Language {
  return languageCode === 'tr' ? 'tr' : 'en';
}

/** Walk "a.b.c" through the dictionary. Falls back to English, then the key. */
function lookup(dict: Translation, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // useLocales re-renders when the device language changes in iOS Settings.
  const [deviceLocale] = useLocales();
  const [preference, setPreferenceState] = useState<LanguagePreference>('system');
  const [ready, setReady] = useState(false);

  // Load the saved preference once on startup.
  useEffect(() => {
    readJSON<LanguagePreference>(StorageKeys.languagePreference).then((saved) => {
      if (saved === 'tr' || saved === 'en' || saved === 'system') setPreferenceState(saved);
      setReady(true);
    });
  }, []);

  const setPreference = useCallback((next: LanguagePreference) => {
    setPreferenceState(next);
    void writeJSON(StorageKeys.languagePreference, next);
  }, []);

  const language: Language =
    preference === 'system' ? languageFromDevice(deviceLocale.languageCode) : preference;

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => {
      const text = lookup(dictionaries[language], key) ?? lookup(en, key) ?? key;
      return interpolate(text, params);
    },
    [language],
  );

  const value = useMemo(
    () => ({ language, preference, setPreference, t, ready }),
    [language, preference, setPreference, t, ready],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access translations: `const { t } = useTranslation(); t('menu.play')`. */
export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used inside <I18nProvider>');
  return ctx;
}
