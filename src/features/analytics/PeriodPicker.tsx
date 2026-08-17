// Filtres de periode (E4) : jour, mois, personnalise.

export type RangeKey = 'day' | 'month' | 'year' | 'custom';

export type CustomRange = { from: string; to: string };

const OPTIONS: { key: RangeKey; label: string }[] = [
  { key: 'day', label: 'Jour' },
  { key: 'month', label: 'Mois' },
  { key: 'year', label: 'Année' },
  { key: 'custom', label: 'Personnalisé' },
];

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
  return (
    <div className="period-picker">
      <div className="segmented">
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={option.key === value ? 'is-active' : ''}
            onClick={() => onChange(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {value === 'custom' && (
        <div className="row">
          <input
            type="date"
            value={custom.from}
            max={custom.to || undefined}
            onChange={(event) => onCustomChange({ ...custom, from: event.target.value })}
          />
          <span className="muted">au</span>
          <input
            type="date"
            value={custom.to}
            min={custom.from || undefined}
            onChange={(event) => onCustomChange({ ...custom, to: event.target.value })}
          />
        </div>
      )}
    </div>
  );
}
