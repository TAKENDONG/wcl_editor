import { useLocale } from '../../i18n/LocaleContext.tsx';
import { boundedPeriod, isMonthUnavailable, selectableYears } from './monthRange.ts';

// Choix d'un mois, en deux listes deroulantes.
//
// POURQUOI PAS `<input type="month">`
// Le controle natif affiche son mois dans la langue du NAVIGATEUR, pas dans
// celle du portail : un editeur camerounais qui lit une interface en francais y
// voyait « August 2026 ». Aucune regle de style ne peut l'atteindre, et le
// portail est explicitement trilingue. Deux listes deroulantes suivent la
// langue choisie, se stylent comme tous les autres champs, et se comportent de
// la meme facon sur tous les navigateurs.
//
// La valeur echangee reste `AAAA-MM`, exactement ce que l'ancien controle
// rendait : les appelants et le serveur n'ont rien a changer.

type Props = {
  /// `AAAA-MM`.
  value: string;
  /// Borne haute incluse, `AAAA-MM`. Une periode future n'a aucun releve.
  max: string;
  onChange: (next: string) => void;
  label: string;
};

/// Noms de mois dans la langue du portail. `Intl` les fournit deja traduits :
/// les inscrire en dur dans les trois langues serait trois listes a maintenir.
function monthNames(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { month: 'long' });
  return Array.from({ length: 12 }, (_, i) =>
    format.format(new Date(Date.UTC(2000, i, 1))));
}

export function MonthPicker({ value, max, onChange, label }: Props) {
  const { locale } = useLocale();
  const [yearText, monthText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const names = monthNames(locale);
  const years = selectableYears(max);
  const emit = (nextYear: number, nextMonth: number) =>
    onChange(boundedPeriod(nextYear, nextMonth, max));

  return (
    <label className="field field--inline">
      <span>{label}</span>
      <select
        value={month}
        aria-label={label}
        onChange={(event) => emit(year, Number(event.target.value))}
      >
        {names.map((name, index) => (
          <option
            key={name}
            value={index + 1}
            // Un mois futur de l'annee courante n'est pas proposable.
            disabled={isMonthUnavailable(year, index + 1, max)}
          >
            {name}
          </option>
        ))}
      </select>
      <select value={year} onChange={(event) => emit(Number(event.target.value), month)}>
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </label>
  );
}
