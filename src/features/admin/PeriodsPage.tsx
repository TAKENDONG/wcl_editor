import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { humaniseServerError } from '../../lib/serverError.ts';
import {
  closePeriod, fetchConcentration, fetchPeriods, preparePayouts,
} from '../../services/adminRoyaltyService.ts';
import type { AdminPeriodRow, ConcentrationRow } from '../../lib/types.ts';
import { currentPeriod, formatMoney } from '../royalties/format.ts';
import { MonthPicker } from '../../components/ui/MonthPicker.tsx';
import { PeriodTable } from './PeriodTable.tsx';
import { ConcentrationTable } from './ConcentrationTable.tsx';

// F1 / F5 et indicateurs internes (§ 7). Reserve aux administrateurs WCL.
//
// Le calcul A BLANC est propose AVANT la consolidation, et separement : une
// periode consolidee est definitivement gelee en base, et decouvrir une donnee
// fausse apres coup n'offrirait aucun recours.
export default function PeriodsPage() {
  const { strings } = useLocale();
  const [periods, setPeriods] = useState<AdminPeriodRow[]>([]);
  const [concentration, setConcentration] = useState<ConcentrationRow[]>([]);
  const [period, setPeriod] = useState(currentPeriod());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (month: string) => {
    try {
      const [rows, shares] = await Promise.all([
        fetchPeriods(),
        fetchConcentration(`${month}-01`),
      ]);
      setPeriods(rows);
      setConcentration(shares);
      setError('');
    } catch (cause) {
      setPeriods([]);
      setConcentration([]);
      setError(humaniseServerError(
        cause instanceof Error ? cause.message : 'unknown', strings.serverErrors));
    }
  }, []);

  useEffect(() => { void load(period); }, [load, period]);

  const run = async (action: () => Promise<string>) => {
    setBusy(true);
    setMessage('');
    try {
      setMessage(await action());
      setError('');
      await load(period);
    } catch (cause) {
      setError(humaniseServerError(
        cause instanceof Error ? cause.message : 'unknown', strings.serverErrors));
    } finally {
      setBusy(false);
    }
  };

  const current = periods.find((row) => row.period_start.slice(0, 7) === period);

  return (
    <>
      <h1>Périodes de redevances</h1>

      <div className="row row--between">
        <MonthPicker
          label={strings.periodLabel}
          value={period}
          max={currentPeriod()}
          onChange={setPeriod}
        />
        <div className="row">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy}
            onClick={() => void run(async () => {
              await closePeriod(`${period}-01`, false);
              return 'Calcul à blanc effectué : les chiffres ci-dessous ne sont pas figés.';
            })}
          >
            Calculer à blanc
          </button>
          <button
            type="button"
            className="btn"
            disabled={busy || current?.state !== 'open'}
            onClick={() => void run(async () => {
              await closePeriod(`${period}-01`, true);
              return 'Période consolidée : ces chiffres ne bougeront plus.';
            })}
          >
            Consolider
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            disabled={busy || !current || current.state === 'open'}
            onClick={() => void run(async () => {
              const count = await preparePayouts(`${period}-01`);
              return `${count} versement(s) préparé(s).`;
            })}
          >
            Préparer les versements
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p className="notice">{message}</p>}

      {current && (
        <p className="muted">
          Assiette du pool : <strong>{current.pool_basis === 'net' ? 'net des frais' : 'brut encaissé'}</strong>.
          {' '}Brut {formatMoney(current.gross_revenue ?? 0, current.currency)},
          {' '}frais {formatMoney(current.provider_fees ?? 0, current.currency)},
          {' '}net {formatMoney(current.net_revenue ?? 0, current.currency)}.
          {' '}Non distribué (domaine public) :{' '}
          <strong>{formatMoney(current.undistributed ?? 0, current.currency)}</strong>.
        </p>
      )}

      {!error && (
        <>
          <ConcentrationTable rows={concentration} currency={current?.currency ?? 'XAF'} />
          <PeriodTable rows={periods} />
        </>
      )}
    </>
  );
}
