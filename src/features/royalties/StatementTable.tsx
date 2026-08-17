import type { RoyaltyStatementLine } from '../../lib/types.ts';
import { formatMoney, RATE_DISPLAY_DIGITS } from './format.ts';

// Le detail titre par titre du releve mensuel (F3).
//
// Chaque ligne montre `pages x taux` a cote du montant : le cahier promet que
// « la formule et les agregats sont affiches afin que chacun puisse verifier
// son calcul », ce qui n'est vrai que si la multiplication est visible sur la
// ligne meme, et pas seulement en tete de page.
export function StatementTable({ lines }: { lines: RoyaltyStatementLine[] }) {
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Titre</th>
            <th className="num">Pages validées</th>
            <th className="num">Lecteurs uniques</th>
            <th className="num">Calcul</th>
            <th className="num">Montant</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.content_id}>
              <td>{line.title}</td>
              <td className="num">{Number(line.validated_pages).toLocaleString('fr-FR')}</td>
              <td className="num">{Number(line.unique_readers).toLocaleString('fr-FR')}</td>
              <td className="num muted">
                {Number(line.validated_pages).toLocaleString('fr-FR')}
                {' x '}
                {formatMoney(line.rate_per_page, line.currency, RATE_DISPLAY_DIGITS)}
              </td>
              <td className="num">
                <strong>{formatMoney(line.amount, line.currency)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
