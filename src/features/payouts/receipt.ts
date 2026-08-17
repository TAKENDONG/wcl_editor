import type { PayoutRow } from '../../lib/types.ts';
import { toPdf } from '../../services/exportPdf.ts';
import type { Column, Row } from '../../services/exportTable.ts';
import { formatMoney } from '../royalties/format.ts';

// Reçu de versement — exigence G4.
//
// Un reçu n'est pas un export : il porte un NUMÉRO, une date de règlement et
// une méthode, et sert de pièce comptable chez l'éditeur. Il n'est donc émis
// que pour un versement réellement réglé — délivrer un reçu pour un montant
// « à verser » créerait une pièce fausse, que son porteur pourrait produire de
// bonne foi.

const METHOD_LABELS: Record<string, string> = {
  mobile_money: 'Mobile Money',
  mycoolpay: 'MyCoolPay',
  flutterwave: 'Flutterwave',
  bank_transfer: 'Virement bancaire',
};

export function canIssueReceipt(row: PayoutRow): boolean {
  return row.state === 'paid' && row.receipt_no !== null;
}

/// Lignes du reçu. Le détail du report y figure : il explique pourquoi le
/// montant versé peut différer de ce qui a été gagné sur la seule période.
function receiptRows(row: PayoutRow, publisher: string): Row[] {
  const method = row.method ? METHOD_LABELS[row.method] ?? row.method : 'non précisée';
  return [
    { field: 'Numéro de reçu', value: row.receipt_no ?? '' },
    { field: 'Bénéficiaire', value: publisher },
    { field: 'Période de redevances', value: row.period_start.slice(0, 7) },
    { field: 'Redevances de la période', value: formatMoney(row.earned, row.currency) },
    { field: 'Report des périodes antérieures', value: formatMoney(row.carried_in, row.currency) },
    { field: 'Total dû', value: formatMoney(row.due, row.currency) },
    { field: 'Montant versé', value: formatMoney(row.paid_amount, row.currency) },
    { field: 'Reporté sur la période suivante', value: formatMoney(row.carried_out, row.currency) },
    { field: 'Méthode de versement', value: method },
    {
      field: 'Date de règlement',
      value: row.settled_at
        ? new Date(row.settled_at).toLocaleDateString('fr-FR')
        : 'non réglé',
    },
  ];
}

const COLUMNS: Column[] = [
  { key: 'field', label: 'Libellé' },
  { key: 'value', label: 'Valeur' },
];

export function receiptPdf(row: PayoutRow, publisher: string): Uint8Array {
  return toPdf(
    `Recu de versement ${row.receipt_no ?? ''} - World Conquest Library`,
    COLUMNS,
    receiptRows(row, publisher),
  );
}
