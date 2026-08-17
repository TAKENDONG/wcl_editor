import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { fetchPayout, savePayout } from '../../services/accountService.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { SelectField, TextField } from '../../components/ui/Field.tsx';

// Modules B et G — coordonnées de versement et informations fiscales.
// Le serveur réserve ces données au rôle finance : un gestionnaire de
// catalogue reçoit « forbidden », et l'écran le dit plutôt que d'échouer.
export function PayoutSection({ publisherId }: { publisherId: string }) {
  const { strings } = useLocale();
  const [method, setMethod] = useState('mobile_money');
  const [reference, setReference] = useState('');
  const [currency, setCurrency] = useState('XAF');
  const [taxId, setTaxId] = useState('');
  const [taxRegime, setTaxRegime] = useState('');
  const [denied, setDenied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const current = await fetchPayout(publisherId);
      if (current) {
        setMethod(current.payout_method ?? 'mobile_money');
        setReference(current.payout_reference ?? '');
        setCurrency(current.payout_currency ?? 'XAF');
      }
    } catch (cause) {
      if (cause instanceof Error && cause.message === 'forbidden') setDenied(true);
      else setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }, [publisherId]);

  useEffect(() => { void load(); }, [load]);

  if (denied) {
    return (
      <section>
        <h2>{strings.sectionPayout}</h2>
        <div className="notice notice--empty">{strings.payoutRestricted}</div>
      </section>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await savePayout(publisherId, { method, reference, currency, taxId, taxRegime });
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }

  return (
    <section>
      <h2>{strings.sectionPayout}</h2>
      <form className="card card--form" onSubmit={(e) => void submit(e)}>
        <div className="form-grid">
          <SelectField label={strings.payoutMethod} value={method} onChange={setMethod}>
            <option value="mobile_money">Mobile Money</option>
            <option value="bank_transfer">{strings.bankTransfer}</option>
            <option value="paypal">PayPal</option>
          </SelectField>
          <TextField label={strings.payoutReference} value={reference} onChange={setReference}
                     placeholder="+237 6 00 00 00 00" />
          <TextField label={strings.currency} value={currency} onChange={setCurrency} />
          <TextField label={strings.taxId} value={taxId} onChange={setTaxId} />
          <TextField label={strings.taxRegime} value={taxRegime} onChange={setTaxRegime} />
        </div>
        {saved && <p className="notice" style={{ margin: '0 0 1rem' }}>{strings.saved}</p>}
        {error && <p className="error">{error}</p>}
        <div className="form-actions"><button type="submit">{strings.save}</button></div>
        <p className="muted" style={{ fontSize: '0.82rem', margin: '0.5rem 0 0' }}>
          {strings.payoutHint}
        </p>
      </form>
    </section>
  );
}
