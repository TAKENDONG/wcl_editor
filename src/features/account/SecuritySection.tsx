import { useCallback, useEffect, useState } from 'react';
import {
  confirmEnrolment, listFactors, removeFactor, startEnrolment,
  type Enrolment, type Factor,
} from '../../services/mfaService.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { TextField } from '../../components/ui/Field.tsx';

// §6 — authentification forte à deux facteurs (TOTP).
export function SecuritySection() {
  const { strings } = useLocale();
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try { setFactors(await listFactors()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erreur inconnue'); }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function act(run: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try { await run(); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erreur inconnue'); }
    finally { setBusy(false); }
  }

  const active = factors.filter((f) => f.verified);

  return (
    <section>
      <h2>{strings.sectionSecurity}</h2>

      {active.length > 0 ? (
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <span><span className="badge badge--ok">{strings.mfaActive}</span> {active[0].friendlyName}</span>
            <button type="button" className="danger" disabled={busy}
                    onClick={() => void act(() => removeFactor(active[0].id))}>
              {strings.mfaRemove}
            </button>
          </div>
        </div>
      ) : enrolment ? (
        <div className="card card--form">
          <p className="muted" style={{ marginTop: 0 }}>{strings.mfaScan}</p>
          <img src={enrolment.qrCode} alt="" width={180} height={180}
               style={{ background: '#fff', borderRadius: 8, padding: 8 }} />
          <p className="formula" style={{ margin: '0.9rem 0' }}>{enrolment.secret}</p>
          <TextField label={strings.mfaCode} value={code} onChange={setCode} />
          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="button" disabled={busy || code.trim().length < 6}
                    onClick={() => void act(async () => {
                      await confirmEnrolment(enrolment.factorId, code.trim());
                      setEnrolment(null); setCode('');
                    })}>
              {strings.mfaConfirm}
            </button>
            <button type="button" className="secondary" disabled={busy}
                    onClick={() => void act(async () => {
                      await removeFactor(enrolment.factorId); setEnrolment(null);
                    })}>
              {strings.cancel}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="muted" style={{ marginTop: 0 }}>{strings.mfaIntro}</p>
          {error && <p className="error">{error}</p>}
          <button type="button" disabled={busy}
                  onClick={() => void act(async () => {
                    setEnrolment(await startEnrolment('Portail WCL'));
                  })}>
            {strings.mfaEnable}
          </button>
        </div>
      )}
    </section>
  );
}
