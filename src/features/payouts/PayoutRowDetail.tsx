import type { PayoutRow, PayoutState } from '../../lib/types.ts';
import { formatMoney } from '../royalties/format.ts';

export const STATE_LABELS: Record<PayoutState, string> = {
  pending: 'À verser',
  below_threshold: 'Sous le seuil — reporté',
  processing: 'En cours',
  paid: 'Versé',
  failed: 'Échec',
};

const STATE_CLASS: Record<PayoutState, string> = {
  pending: 'badge badge--warn',
  below_threshold: 'badge',
  processing: 'badge badge--warn',
  paid: 'badge badge--ok',
  failed: 'badge badge--danger',
};

// Une ligne de versement. Les six colonnes de montants sont affichees ensemble
// pour que l'egalite « gagne + report entrant = du = verse + report sortant »
// se verifie a l'oeil : c'est la seule facon qu'un editeur constate qu'aucun
// franc n'a disparu entre deux periodes.
export function PayoutRowDetail({ row }: { row: PayoutRow }) {
  return (
    <tr>
      <td>{row.period_start.slice(0, 7)}</td>
      <td className="num">{formatMoney(row.earned, row.currency)}</td>
      <td className="num">{formatMoney(row.carried_in, row.currency)}</td>
      <td className="num"><strong>{formatMoney(row.due, row.currency)}</strong></td>
      <td className="num muted">{formatMoney(row.threshold, row.currency)}</td>
      <td className="num">{formatMoney(row.paid_amount, row.currency)}</td>
      <td className="num">{formatMoney(row.carried_out, row.currency)}</td>
      <td><span className={STATE_CLASS[row.state]}>{STATE_LABELS[row.state]}</span></td>
      <td>{row.receipt_no ?? '—'}</td>
    </tr>
  );
}
