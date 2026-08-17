import type { AnalyticsCountryRow } from '../../lib/types.ts';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';

// E3 — par zone geographique.
//
// Un TABLEAU, pas une carte. Le cahier demande « carte et tableau » ; une carte
// du monde pese plusieurs centaines de kilo-octets de trace vectorielle pour
// afficher, au lancement, deux pays. Le tableau porte la meme information, et
// la carte pourra s'ajouter quand la repartition en comptera assez pour qu'elle
// apprenne quelque chose.
export function CountryTable({ rows }: { rows: AnalyticsCountryRow[] }) {
  if (rows.length === 0) return null;
  const names = new Intl.DisplayNames(['fr'], { type: 'region' });
  const total = rows.reduce((sum, row) => sum + Number(row.pages), 0);
  const label = (code: string | null): string => {
    if (!code) return 'Pays non déterminé';
    try {
      return names.of(code) ?? code;
    } catch {
      return code;
    }
  };
  return (
    <>
      <h2>Par pays</h2>
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Pays</th>
              <th className="num">Pages lues</th>
              <th className="num">Part</th>
              <th className="num">Lecteurs uniques</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.country ?? 'inconnu'}>
                <td>{label(row.country)}</td>
                <td className="num">{Number(row.pages).toLocaleString('fr-FR')}</td>
                <td className="num">
                  {total > 0 ? `${((Number(row.pages) / total) * 100).toFixed(1)} %` : '—'}
                </td>
                <td className="num">{Number(row.unique_readers).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExportButtons
        basename="lectures-par-pays"
        title="Lectures par pays"
        columns={[
          { key: 'country', label: 'Pays' },
          { key: 'pages', label: 'Pages lues' },
          { key: 'readers', label: 'Lecteurs uniques' },
        ]}
        rows={rows.map((row) => ({
          country: label(row.country),
          pages: row.pages,
          readers: row.unique_readers,
        }))}
      />
    </>
  );
}
