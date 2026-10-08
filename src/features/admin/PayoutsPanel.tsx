import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { formatMoney } from '../royalties/format.ts';
import {
  listPayouts, listTaxRules, saveTaxRule, settlePayout,
  type StaffPayout, type TaxRule,
} from '../../services/staffService.ts';

const ETATS: Record<StaffPayout['state'], string> = {
  pending: 'À verser',
  below_threshold: 'Sous le seuil (reporté)',
  carried: 'Reporté',
  processing: 'En cours',
  paid: 'Versé',
  failed: 'Échec',
};

const MOTIFS: Record<string, string> = {
  editeur_non_verifie: 'éditeur non vérifié',
  periode_intermediaire: 'hors mois de versement',
};

const FISCAL: Record<StaffPayout['tax_status'], string> = {
  not_assessed: 'Retenue non appréciée',
  exempt: 'Exonéré',
  withheld: 'Retenue appliquée',
};

// Les versements d'une période consolidée, et ce qu'il faut pour les régler :
// une règle de retenue à la source par pays (sans elle, le serveur refuse le
// règlement — une absence de règle ne vaut pas exonération), puis le virement
// fait hors du portail, dont on saisit la référence.
export function PayoutsPanel({ period, refreshKey }: { period: string; refreshKey: number }) {
  const [rows, setRows] = useState<StaffPayout[]>([]);
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [rule, setRule] = useState({ country: '', rate: '', rationale: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [payouts, taxes] = await Promise.all([listPayouts(`${period}-01`), listTaxRules()]);
      setRows(payouts);
      setRules(taxes);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }, [period]);

  useEffect(() => { void load(); }, [load, refreshKey]);

  async function settle(row: StaffPayout) {
    setMessage('');
    try {
      const receipt = await settlePayout(row.id, refs[row.id] ?? '');
      setMessage(`Versement réglé : reçu ${receipt}.`);
      await load();
    } catch (cause) {
      const text = cause instanceof Error ? cause.message : '';
      setError(text === 'tax_not_assessed'
        ? `Aucune règle de retenue pour ${row.country_code ?? 'ce pays'} : ajoutez-la ci-dessous avant de régler.`
        : text);
    }
  }

  async function addRule(event: FormEvent) {
    event.preventDefault();
    try {
      await saveTaxRule(rule.country, Number(rule.rate.replace(',', '.')) / 100, rule.rationale);
      setRule({ country: '', rate: '', rationale: '' });
      setMessage('Règle enregistrée ; les versements en attente de ce pays sont réévalués.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }

  return (
    <>
      <h2>Versements de la période</h2>
      {error && <p className="error">{error}</p>}
      {message && <p className="notice">{message}</p>}
      {rows.length === 0 ? (
        <p className="muted">Aucun versement préparé pour cette période.</p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Éditeur</th>
                <th className="num">Gagné</th>
                <th className="num">Minimum</th>
                <th className="num">Avance</th>
                <th className="num">Report</th>
                <th className="num">Dû</th>
                <th>État</th>
                <th>Fiscalité</th>
                <th>Règlement</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.publisher_name} <span className="muted">({row.country_code ?? '—'})</span></td>
                  <td className="num">{formatMoney(row.earned, row.currency)}</td>
                  <td className="num">{formatMoney(row.minimum_topup, row.currency)}</td>
                  <td className="num">−{formatMoney(row.recouped, row.currency)}</td>
                  <td className="num">{formatMoney(row.carried_in, row.currency)}</td>
                  <td className="num"><strong>{formatMoney(row.due, row.currency)}</strong></td>
                  <td>
                    {ETATS[row.state]}
                    {row.hold_reason && <span className="muted"> — {MOTIFS[row.hold_reason] ?? row.hold_reason}</span>}
                  </td>
                  <td>
                    {FISCAL[row.tax_status]}
                    {row.tax_status === 'withheld' && (
                      <span className="muted"> ({formatMoney(row.withheld_amount, row.currency)} ; net {formatMoney(row.net_paid ?? 0, row.currency)})</span>
                    )}
                  </td>
                  <td>
                    {row.state === 'paid' ? (
                      <span>{row.receipt_no}</span>
                    ) : row.state === 'pending' ? (
                      <div className="row">
                        <input
                          placeholder="Référence du virement"
                          value={refs[row.id] ?? ''}
                          onChange={(e) => setRefs({ ...refs, [row.id]: e.target.value })}
                          style={{ maxWidth: '12rem' }}
                        />
                        <button type="button" className="btn" onClick={() => void settle(row)}>Marquer versé</button>
                      </div>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Retenue à la source par pays</h2>
      <p className="muted">
        Taux à appliquer selon le pays de l’éditeur, sur avis fiscal. Sans règle pour un pays,
        aucun versement de ce pays ne peut être réglé.
      </p>
      {rules.length > 0 && (
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th>Pays</th><th className="num">Taux</th><th>Motif</th></tr></thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.country_code}>
                  <td>{r.country_code}</td>
                  <td className="num">{(Number(r.withholding_rate) * 100).toLocaleString('fr-FR')} %</td>
                  <td>{r.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <form className="row" onSubmit={(e) => void addRule(e)} style={{ alignItems: 'flex-end' }}>
        <label className="field">Pays (ISO)
          <input value={rule.country} maxLength={2} required
                 onChange={(e) => setRule({ ...rule, country: e.target.value.toUpperCase() })} />
        </label>
        <label className="field">Taux (%)
          <input value={rule.rate} required inputMode="decimal"
                 onChange={(e) => setRule({ ...rule, rate: e.target.value })} />
        </label>
        <label className="field" style={{ flex: 1 }}>Motif / avis
          <input value={rule.rationale} required
                 onChange={(e) => setRule({ ...rule, rationale: e.target.value })} />
        </label>
        <button type="submit" className="btn">Enregistrer</button>
      </form>
    </>
  );
}
