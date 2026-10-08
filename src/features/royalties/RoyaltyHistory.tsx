import type { RoyaltyHistoryRow } from '../../lib/types.ts';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';
import { formatMoney } from './format.ts';

const LABELS: Record<RoyaltyHistoryRow['state'], string> = {
  open: 'En cours',
  consolidated: 'Consolidé',
  paid: 'Versé',
};

// Historique des periodes (F3). Un editeur doit pouvoir constater qu'un releve
// ancien n'a pas bouge : c'est la contrepartie visible du gel applique en base.
export function RoyaltyHistory({ rows }: { rows: RoyaltyHistoryRow[] }) {
  if (rows.length === 0) return null;
  return (
    <>
      <h2>Historique</h2>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Période</th>
              <th>État</th>
              <th className="num">Minutes comptées</th>
              <th className="num">Montant</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period_start}>
                <td>{row.period_start.slice(0, 7)}</td>
                <td>{LABELS[row.state]}</td>
                <td className="num">{Number(row.minutes).toLocaleString('fr-FR')}</td>
                <td className="num"><strong>{formatMoney(row.amount, row.currency)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExportButtons
        basename="historique-redevances"
        title="Historique des redevances"
        columns={[
          { key: 'period', label: 'Période' },
          { key: 'state', label: 'État' },
          { key: 'minutes', label: 'Minutes comptées' },
          { key: 'amount', label: 'Montant' },
        ]}
        rows={rows.map((row) => ({
          period: row.period_start.slice(0, 7),
          state: LABELS[row.state],
          minutes: row.minutes,
          amount: String(row.amount),
        }))}
      />
    </>
  );
}
