import { useLocale } from '../../i18n/LocaleContext.tsx';
import { composeDate, daysInMonth, splitDate } from './dateParts.ts';

// Choix d'une date, en trois listes deroulantes.
//
// POURQUOI PAS `<input type="date">`
// Le gabarit affiche par le controle natif suit la langue du NAVIGATEUR et non
// celle du portail. Verifie dans Chrome : un champ `lang="fr"` et un champ
// `lang="en-US"` rendent exactement la meme chose, et le document est deja
// `lang="fr"`. Un editeur lisant une interface francaise y voyait donc
// « dd/mm/yyyy ».
//
// Une premiere tentative ajoutait un rappel « jj/mm/aaaa » a cote du champ :
// deux gabarits contradictoires cote a cote embrouillaient plus qu'ils
// n'aidaient. Trois listes deroulantes suivent la langue du portail, se stylent
// comme tous les autres champs, et se comportent de meme partout.

const FIRST_YEAR = 2026;

type Props = {
  /// `AAAA-MM-JJ`, ou vide.
  value: string;
  onChange: (next: string) => void;
  label: string;
  /// Derniere annee proposable.
  maxYear: number;
};

function monthNames(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { month: 'long' });
  return Array.from({ length: 12 }, (_, i) =>
    format.format(new Date(Date.UTC(2000, i, 1))));
}

export function DateField({ value, onChange, label, maxYear }: Props) {
  const { locale, strings } = useLocale();
  const parts = splitDate(value);
  const names = monthNames(locale);
  const years = Array.from(
    { length: Math.max(1, maxYear - FIRST_YEAR + 1) },
    (_, i) => FIRST_YEAR + i,
  );

  // Rien de choisi : on n'invente pas une date. Le premier choix de l'un des
  // trois selecteurs compose une date complete a partir du jour courant.
  const current = parts ?? { year: maxYear, month: 1, day: 1 };
  const dayCount = daysInMonth(current.year, current.month);

  const emit = (next: Partial<typeof current>) => {
    const merged = { ...current, ...next };
    onChange(composeDate(merged.year, merged.month, merged.day));
  };

  return (
    <label className="field field--inline field--date">
      <span>{label}</span>
      <select
        aria-label={`${label} — ${strings.dayLabel}`}
        value={parts ? current.day : ''}
        onChange={(event) => emit({ day: Number(event.target.value) })}
      >
        {!parts && <option value="">--</option>}
        {Array.from({ length: dayCount }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <select
        aria-label={`${label} — ${strings.monthLabel}`}
        value={parts ? current.month : ''}
        onChange={(event) => emit({ month: Number(event.target.value) })}
      >
        {!parts && <option value="">--</option>}
        {names.map((name, index) => (
          <option key={name} value={index + 1}>{name}</option>
        ))}
      </select>
      <select
        aria-label={`${label} — ${strings.yearLabel}`}
        value={parts ? current.year : ''}
        onChange={(event) => emit({ year: Number(event.target.value) })}
      >
        {!parts && <option value="">--</option>}
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
    </label>
  );
}
