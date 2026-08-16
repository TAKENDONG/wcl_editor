import { useLocale } from '../../i18n/LocaleContext.tsx';
import type { Locale } from '../../i18n/strings.ts';

const LOCALES: Locale[] = ['fr', 'en', 'es'];

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="row" role="group" aria-label="Langue">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={code === locale ? '' : 'secondary'}
          style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem' }}
          onClick={() => setLocale(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
