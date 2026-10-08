import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';
import { fetchPayouts } from '../../services/royaltyService.ts';
import { usePublishers } from '../../hooks/usePublishers.ts';
import type { PayoutRow } from '../../lib/types.ts';
import { formatMoney } from '../royalties/format.ts';
import { PayoutRowDetail, STATE_LABELS } from './PayoutRowDetail.tsx';

// Module G. Le registre est reel ; l'EXECUTION des ordres ne l'est pas encore.
// L'ecran le dit explicitement plutot que de laisser croire qu'un virement
// part : un editeur qui voit « en attente » sans savoir de quoi conclut que
// WCL retient son argent.
export default function PayoutsPage() {
  const { strings } = useLocale();
  // `enabled` : le crochet ne charge que pour un utilisateur connecte.
  const { publishers } = usePublishers(true);
  const [rows, setRows] = useState<PayoutRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchPayouts());
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Le report en cours est celui du DERNIER versement : chaque ligne porte déjà
  // tout ce qui restait dû avant elle. Additionner les reports de toutes les
  // lignes compterait plusieurs fois le même argent.
  const latest = rows[0];
  const carried = latest && latest.state !== 'paid' ? Number(latest.carried_out) : 0;
  const currency = latest?.currency ?? 'USD';

  return (
    <>
      <h1>{strings.navPayouts}</h1>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Chargement…</p>}

      {!loading && !error && rows.length === 0 && (
        <EmptyState
          title={strings.noData}
          explanation={
            'Aucun versement préparé. Les ordres sont constitués après la '
            + 'consolidation d’une période par WCL.'
          }
        />
      )}

      {rows.length > 0 && (
        <>
          {carried > 0 && (
            <p className="notice">
              <strong>{formatMoney(carried, currency)}</strong> sont en report
              {latest?.hold_reason === 'editeur_non_verifie'
                ? ' : votre compte n’est pas encore vérifié par WCL. Déposez vos pièces dans « Mon compte » ; le montant partira au premier versement qui suit la vérification.'
                : latest?.hold_reason === 'periode_intermediaire'
                  ? ' : ce mois n’est pas un mois de versement. Le montant partira au prochain.'
                  : ' : ce montant n’a pas atteint le seuil minimal de versement. Il n’est pas perdu — il partira dès que le cumul franchira le seuil.'}
            </p>
          )}

          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Période</th>
                  <th className="num">Gagné</th>
                  <th className="num">Minimum garanti</th>
                  <th className="num">Avance récupérée</th>
                  <th className="num">Report entrant</th>
                  <th className="num">Dû</th>
                  <th className="num">Seuil</th>
                  <th className="num">Versé</th>
                  <th className="num">Report sortant</th>
                  <th>État</th>
                  <th>Reçu</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <PayoutRowDetail
                    key={row.period_start}
                    row={row}
                    publisher={publishers[0]?.display_name ?? ''}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <ExportButtons
            basename="versements"
            title="Versements"
            columns={[
              { key: 'period', label: 'Période' },
              { key: 'earned', label: 'Gagné' },
              { key: 'carried_in', label: 'Report entrant' },
              { key: 'due', label: 'Dû' },
              { key: 'paid', label: 'Versé' },
              { key: 'carried_out', label: 'Report sortant' },
              { key: 'state', label: 'État' },
              { key: 'receipt', label: 'Reçu' },
            ]}
            rows={rows.map((row) => ({
              period: row.period_start.slice(0, 7),
              earned: String(row.earned),
              carried_in: String(row.carried_in),
              due: String(row.due),
              paid: String(row.paid_amount),
              carried_out: String(row.carried_out),
              state: STATE_LABELS[row.state],
              receipt: row.receipt_no ?? '',
            }))}
          />
        </>
      )}

      <h2>Ce qui reste à trancher avant le premier versement</h2>
      <ul className="muted">
        <li>Entité juridique qui paie, et détention des soldes chez les prestataires.</li>
        <li>
          Retenue à la source sur les redevances versées hors du Cameroun —
          l’obligation pèse sur le payeur, pas sur le bénéficiaire.
        </li>
        <li>
          Rails d’exécution : Mobile Money et MyCoolPay au Cameroun, virement et
          Flutterwave à l’international. Le registre ci-dessus les attend ; il ne
          les remplace pas.
        </li>
      </ul>
    </>
  );
}
