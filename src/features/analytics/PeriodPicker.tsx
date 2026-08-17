import { useLocale } from '../../i18n/LocaleContext.tsx';
import { DateField } from '../../components/ui/DateField.tsx';

// Filtres de periode (E4) : jour, mois, personnalise.

export type RangeKey = 'day' | 'month' | 'year' | 'custom';

export type CustomRange = { from: string; to: string };

/// Les libelles viennent de l'i18n : ecrits en dur, ils restaient en francais
/// sur un portail explicitement trilingue.
const OPTIONS: RangeKey[] = ['day', 'month', 'year', 'custom'];

const iso = (date: Date): string => date.toISOString().slice(0, 10);

/// Rend l'intervalle demande, borne de fin EXCLUE.
///
/// Exclure la borne haute evite l'erreur classique du « jusqu'au 31 » qui perd
/// les lectures du 31 : toutes les requetes serveur utilisent `< to`.
/// Rend `null` quand un intervalle personnalise est incomplet ou inverse —
/// interroger le serveur avec des bornes inversees rendrait zero page, ce que
/// l'editeur lirait comme une absence de lecture.
export function rangeOf(
  key: RangeKey, from: string, to: string,
): { from: string; to: string } | null {
  const now = new Date();
  if (key === 'custom') {
    if (!from || !to || from > to) return null;
    const end = new Date(`${to}T00:00:00Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    return { from, to: iso(end) };
  }
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  end.setUTCDate(end.getUTCDate() + 1);
  const start = new Date(end);
  if (key === 'day') start.setUTCDate(start.getUTCDate() - 1);
  if (key === 'month') start.setUTCMonth(start.getUTCMonth() - 1);
  if (key === 'year') start.setUTCFullYear(start.getUTCFullYear() - 1);
  return { from: iso(start), to: iso(end) };
}

type Props = {
  value: RangeKey;
  custom: CustomRange;
  onChange: (key: RangeKey) => void;
  onCustomChange: (range: CustomRange) => void;
};

export function PeriodPicker({ value, custom, onChange, onCustomChange }: Props) {
  const { strings } = useLocale();
  return (
    <div className="period-picker">
      <div className="segmented">
        {OPTIONS.map((key) => (
          <button
            key={key}
            type="button"
            className={key === value ? 'is-active' : ''}
            onClick={() => onChange(key)}
          >
            {strings.range[key]}
          </button>
        ))}
      </div>
      {value === 'custom' && (
        <div className="row">
          <DateField
            label={strings.rangeFrom}
            value={custom.from}
            maxYear={new Date().getUTCFullYear()}
            onChange={(from) => onCustomChange({ ...custom, from })}
          />
          <DateField
            label={strings.rangeTo}
            value={custom.to}
            maxYear={new Date().getUTCFullYear()}
            onChange={(to) => onCustomChange({ ...custom, to })}
          />
        </div>
      )}
    </div>
  );
}
