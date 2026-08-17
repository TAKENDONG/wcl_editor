import type { AnalyticsTitleRow } from '../../lib/types.ts';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';
import { formatCompletion, formatDwell } from '../royalties/format.ts';

// E2 — par titre.
export function TitleTable({ rows }: { rows: AnalyticsTitleRow[] }) {
  if (rows.length === 0) return null;
  return (
    <>
      <h2>Par titre</h2>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Titre</th>
              <th className="num">Pages lues</th>
              <th className="num">Lecteurs uniques</th>
              <th className="num">Sessions</th>
              <th className="num">Temps moyen par page</th>
              <th className="num">Complétion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.content_id}>
                <td>{row.title}</td>
                <td className="num">{Number(row.pages).toLocaleString('fr-FR')}</td>
                <td className="num">{Number(row.unique_readers).toLocaleString('fr-FR')}</td>
                <td className="num">{Number(row.sessions).toLocaleString('fr-FR')}</td>
                <td className="num">{formatDwell(row.avg_dwell_ms)}</td>
                <td className="num">{formatCompletion(row.completion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExportButtons
        basename="lectures-par-titre"
        title="Lectures par titre"
        columns={[
          { key: 'title', label: 'Titre' },
          { key: 'pages', label: 'Pages lues' },
          { key: 'readers', label: 'Lecteurs uniques' },
          { key: 'sessions', label: 'Sessions' },
          { key: 'dwell', label: 'Temps moyen par page' },
          { key: 'completion', label: 'Complétion' },
        ]}
        rows={rows.map((row) => ({
          title: row.title,
          pages: row.pages,
          readers: row.unique_readers,
          sessions: row.sessions,
          dwell: formatDwell(row.avg_dwell_ms),
          completion: formatCompletion(row.completion),
        }))}
      />
    </>
  );
}
