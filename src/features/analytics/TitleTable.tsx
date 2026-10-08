import type { AnalyticsTitleRow } from '../../lib/types.ts';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';
import { formatCompletion } from '../royalties/format.ts';

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
              <th className="num">Minutes lues</th>
              <th className="num">Lecteurs uniques</th>
              <th className="num">Sessions</th>
              <th className="num">Durée moyenne d’une séance</th>
              <th className="num">Complétion</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.content_id}>
                <td>{row.title}</td>
                <td className="num">{Number(row.minutes).toLocaleString('fr-FR')}</td>
                <td className="num">{Number(row.unique_readers).toLocaleString('fr-FR')}</td>
                <td className="num">{Number(row.sessions).toLocaleString('fr-FR')}</td>
                <td className="num">{Number(row.avg_session_minutes).toLocaleString('fr-FR')} min</td>
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
          { key: 'minutes', label: 'Minutes lues' },
          { key: 'readers', label: 'Lecteurs uniques' },
          { key: 'sessions', label: 'Sessions' },
          { key: 'session', label: 'Durée moyenne d’une séance (min)' },
          { key: 'completion', label: 'Complétion' },
        ]}
        rows={rows.map((row) => ({
          title: row.title,
          minutes: row.minutes,
          readers: row.unique_readers,
          sessions: row.sessions,
          session: row.avg_session_minutes,
          completion: formatCompletion(row.completion),
        }))}
      />
    </>
  );
}
