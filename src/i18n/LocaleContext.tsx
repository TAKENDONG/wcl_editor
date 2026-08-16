import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { STRINGS, type Locale, type Strings } from './strings.ts';

// Contexte plutot que passage de props : la langue est un etat global, et le
// cahier interdit implicitement le forage de props sur trois niveaux.

type LocaleValue = { locale: Locale; strings: Strings; setLocale: (next: Locale) => void };

const LocaleContext = createContext<LocaleValue | null>(null);
const STORAGE_KEY = 'wcl.portal.locale';

function initialLocale(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'fr' || stored === 'en' || stored === 'es') return stored;
  const browser = window.navigator.language.slice(0, 2);
  return browser === 'en' || browser === 'es' ? browser : 'fr';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  const value = useMemo<LocaleValue>(
    () => ({ locale, strings: STRINGS[locale], setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleValue {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale doit etre utilise dans LocaleProvider');
  return value;
}
