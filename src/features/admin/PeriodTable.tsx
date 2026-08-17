import type { AdminPeriodRow } from '../../lib/types.ts';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';
import { formatMoney } from '../royalties/format.ts';

const LABELS: Record<AdminPeriodRow['state'], string> = {
  open: 'Ouverte',
  consolidated: 'Consolidée',
  paid: 'Versée',
};

export function PeriodTable({ rows }: { rows: AdminPeriodRow[] }) {
  if (rows.length === 0) return <p className="muted">Aucune période calculée.</p>;
  return (
    <>
      <h2>Historique des périodes</h2>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Période</th><th>État</th>
              <th className="num">Pool</th>
              <th className="num">Pages</th>
              <th className="num">Taux</th>
              <th className="num">Distribué</th>
              <th className="num">Non distribué</th>
              <th className="num">Éditeurs</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.period_start}>
                <td>{row.period_start.slice(0, 7)}</td>
                <td>{LABELS[row.state]}</td>
                <td className="num">{formatMoney(row.pool_amount ?? 0, row.currency)}</td>
                <td className="num">{Number(row.total_pages ?? 0).toLocaleString('fr-FR')}</td>
                <td className="num">{formatMoney(row.rate_per_page ?? 0, row.currency, 6)}</td>
                <td className="num">{formatMoney(row.distributed, row.currency)}</td>
                <td className="num">{formatMoney(row.undistributed ?? 0, row.currency)}</td>
                <td className="num">{row.publishers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExportButtons
        basename="periodes-redevances"
        title="Periodes de redevances"
        columns={[
          { key: 'period', label: 'Période' },
          { key: 'state', label: 'État' },
          { key: 'pool', label: 'Pool' },
          { key: 'pages', label: 'Pages validées' },
          { key: 'rate', label: 'Taux par page' },
          { key: 'distributed', label: 'Distribué' },
          { key: 'undistributed', label: 'Non distribué' },
        ]}
        rows={rows.map((row) => ({
          period: row.period_start.slice(0, 7),
          state: LABELS[row.state],
          pool: String(row.pool_amount ?? 0),
          pages: String(row.total_pages ?? 0),
          rate: String(row.rate_per_page ?? 0),
          distributed: String(row.distributed),
          undistributed: String(row.undistributed ?? 0),
        }))}
      />
    </>
  );
}
