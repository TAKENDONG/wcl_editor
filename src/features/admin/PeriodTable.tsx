import type { AdminPeriodRow } from '../../lib/types.ts';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';
import { formatMoney, formatPart } from '../royalties/format.ts';

const LABELS: Record<AdminPeriodRow['state'], string> = {
  open: 'Ouverte',
  consolidated: 'Consolidée',
  paid: 'Versée',
};

const MODELES: Record<AdminPeriodRow['model'], string> = {
  par_abonne: 'Par abonné',
  fonds_commun: 'Fonds commun',
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
              <th>Période</th><th>État</th><th>Modèle</th>
              <th className="num">Recette nette</th>
              <th className="num">Part éditeurs</th>
              <th className="num">Minutes</th>
              <th className="num">Abonnés</th>
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
                <td>{MODELES[row.model] ?? row.model} · {formatPart(row.part_rate)}</td>
                <td className="num">{formatMoney(row.net_revenue ?? 0, row.currency)}</td>
                <td className="num">{formatMoney(row.pool_amount ?? 0, row.currency)}</td>
                <td className="num">{Number(row.total_minutes ?? 0).toLocaleString('fr-FR')}</td>
                <td className="num">{row.paying_readers ?? 0} / {row.subscribers ?? 0}</td>
                <td className="num">{formatMoney(row.distributed ?? 0, row.currency)}</td>
                <td className="num">{formatMoney(row.undistributed ?? 0, row.currency)}</td>
                <td className="num">{row.publishers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: '0.85rem' }}>
        « Abonnés » : abonnés payants qui ont lu / abonnés payants de la période.
      </p>
      <ExportButtons
        basename="periodes-redevances"
        title="Periodes de redevances"
        columns={[
          { key: 'period', label: 'Période' },
          { key: 'state', label: 'État' },
          { key: 'model', label: 'Modèle' },
          { key: 'part', label: 'Part' },
          { key: 'gross', label: 'Recette brute' },
          { key: 'fees', label: 'Frais' },
          { key: 'net', label: 'Recette nette' },
          { key: 'pool', label: 'Part éditeurs' },
          { key: 'minutes', label: 'Minutes' },
          { key: 'distributed', label: 'Distribué' },
          { key: 'undistributed', label: 'Non distribué' },
        ]}
        rows={rows.map((row) => ({
          period: row.period_start.slice(0, 7),
          state: LABELS[row.state],
          model: MODELES[row.model] ?? row.model,
          part: formatPart(row.part_rate),
          gross: String(row.gross_revenue ?? 0),
          fees: String(row.provider_fees ?? 0),
          net: String(row.net_revenue ?? 0),
          pool: String(row.pool_amount ?? 0),
          minutes: String(row.total_minutes ?? 0),
          distributed: String(row.distributed ?? 0),
          undistributed: String(row.undistributed ?? 0),
        }))}
      />
    </>
  );
}
