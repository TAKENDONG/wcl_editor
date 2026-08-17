import type { ConcentrationRow } from '../../lib/types.ts';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';
import { formatMoney } from '../royalties/format.ts';

// Correction n° 4 au cahier : rien dans le document n'est PAR EDITEUR.
//
// Un editeur qui capte une part majoritaire du pool rend le modele dependant
// de lui : son depart effondrerait le catalogue, et sa negociation deviendrait
// impossible a refuser. Le seuil de 25 % est SIGNALE, jamais applique d'office
// — ecreter une part deja publiee est une decision contractuelle, pas une
// decision de programme.
export function ConcentrationTable(
  { rows, currency }: { rows: ConcentrationRow[]; currency: string },
) {
  if (rows.length === 0) return null;
  const flagged = rows.filter((row) => row.over_cap);
  return (
    <>
      <h2>Concentration par éditeur</h2>
      {flagged.length > 0 && (
        <p className="notice">
          {flagged.length === 1 ? 'Un éditeur dépasse' : `${flagged.length} éditeurs dépassent`}
          {' '}25 % du pool. À ce niveau, leur départ déstabiliserait le catalogue :
          le plafond contractuel recommandé doit être vérifié avant mise en paiement.
        </p>
      )}
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Éditeur</th>
              <th className="num">Montant</th>
              <th className="num">Part du pool</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.publisher_id}>
                <td>{row.publisher_name}</td>
                <td className="num">{formatMoney(row.amount, currency)}</td>
                <td className="num">
                  {(Number(row.share_of_pool) * 100).toFixed(1)} %
                  {row.over_cap && <span className="badge badge--warn">au-delà de 25 %</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ExportButtons
        basename="concentration-editeurs"
        title="Concentration par editeur"
        columns={[
          { key: 'publisher', label: 'Éditeur' },
          { key: 'amount', label: 'Montant' },
          { key: 'share', label: 'Part du pool' },
          { key: 'over', label: 'Au-delà de 25 %' },
        ]}
        rows={rows.map((row) => ({
          publisher: row.publisher_name,
          amount: String(row.amount),
          share: `${(Number(row.share_of_pool) * 100).toFixed(1)} %`,
          over: row.over_cap ? 'oui' : 'non',
        }))}
      />
    </>
  );
}
