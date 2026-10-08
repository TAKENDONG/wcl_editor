import type { RoyaltyStatementLine } from '../../lib/types.ts';
import { formatMoney, formatPart } from './format.ts';

// Le detail titre par titre du releve mensuel (F3).
//
// Chaque ligne montre `recette attribuee x part` a cote du montant : le cahier
// promet que « la formule et les agregats sont affiches afin que chacun puisse
// verifier son calcul », ce qui n'est vrai que si la multiplication est visible
// sur la ligne meme, et pas seulement en tete de page.
export function StatementTable({ lines, hint }: { lines: RoyaltyStatementLine[]; hint: string }) {
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Titre</th>
            <th className="num">Minutes comptées</th>
            <th className="num">Abonnés lecteurs</th>
            <th className="num" title={hint}>Calcul</th>
            <th className="num">Montant</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.content_id}>
              <td>{line.title}</td>
              <td className="num">{Number(line.minutes).toLocaleString('fr-FR')}</td>
              <td className="num">{Number(line.unique_readers).toLocaleString('fr-FR')}</td>
              <td className="num muted">
                {formatMoney(line.attributed_revenue, line.currency)}
                {' x '}
                {formatPart(line.part_rate)}
              </td>
              <td className="num">
                <strong>{formatMoney(line.amount, line.currency)}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" style={{ fontSize: '0.85rem' }}>{hint}</p>
    </div>
  );
}
