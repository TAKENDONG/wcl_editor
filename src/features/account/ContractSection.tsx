import { useState, type FormEvent } from 'react';
import { signContract } from '../../services/accountService.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { TextField } from '../../components/ui/Field.tsx';

const CONTRACT_VERSION = 'v1-2026-08';

// Module B — acceptation du contrat par signature électronique.
// La signature est un ACTE : elle horodate et fige la version acceptée, et le
// serveur refuse une seconde signature.
export function ContractSection({ publisherId, signedAt, onSigned }: {
  publisherId: string; signedAt: string | null; onSigned: () => void;
}) {
  const { strings } = useLocale();
  const [fullName, setFullName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (signedAt) {
    return (
      <section>
        <h2>{strings.sectionContract}</h2>
        <div className="notice">
          <strong>{strings.contractSigned}</strong>
          <p style={{ margin: '0.35rem 0 0' }}>
            {new Date(signedAt).toLocaleString()} · {CONTRACT_VERSION}
          </p>
        </div>
      </section>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signContract(publisherId, CONTRACT_VERSION, fullName);
      onSigned();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2>{strings.sectionContract}</h2>
      <form className="card card--form" onSubmit={(e) => void submit(e)}>
        <p className="muted" style={{ marginTop: 0, lineHeight: 1.65 }}>{strings.contractIntro}</p>
        <ul className="muted" style={{ lineHeight: 1.7, fontSize: '0.9rem' }}>
          <li>{strings.contractTermPool}</li>
          <li>{strings.contractTermPage}</li>
          <li>{strings.contractTermCap}</li>
          <li>{strings.contractTermProvisional}</li>
        </ul>
        <TextField label={strings.signatureName} value={fullName} onChange={setFullName} required />
        <label className="field" style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
          <input type="checkbox" style={{ width: 'auto', marginTop: '0.2rem' }}
                 checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span style={{ textTransform: 'none', letterSpacing: 0, fontSize: '0.88rem' }}>
            {strings.contractAgree}
          </span>
        </label>
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="submit" disabled={busy || !agreed || !fullName.trim()}>
            {strings.sign}
          </button>
        </div>
      </form>
    </section>
  );
}
