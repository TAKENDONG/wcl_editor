import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';
import { MonthPicker } from '../../components/ui/MonthPicker.tsx';
import { fetchHistory, fetchStatement } from '../../services/royaltyService.ts';
import type { RoyaltyHistoryRow, RoyaltyStatementLine } from '../../lib/types.ts';
import { StatementTable } from './StatementTable.tsx';
import { RoyaltyHistory } from './RoyaltyHistory.tsx';
import { currentPeriod, formatMoney, RATE_DISPLAY_DIGITS } from './format.ts';

// Module F — le coeur differenciant. Les AGREGATS DE PLATEFORME sont affiches
// au-dessus du releve : sans le pool et le total des pages de la plateforme,
// l'editeur ne peut pas refaire le calcul, et la transparence promise se
// reduirait a trois chiffres choisis par WCL.
export default function RoyaltiesPage() {
  const { strings } = useLocale();
  const [period, setPeriod] = useState(currentPeriod());
  const [lines, setLines] = useState<RoyaltyStatementLine[]>([]);
  const [history, setHistory] = useState<RoyaltyHistoryRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (month: string) => {
    setLoading(true);
    try {
      const [statement, past] = await Promise.all([
        fetchStatement(`${month}-01`),
        fetchHistory(),
      ]);
      setLines(statement);
      setHistory(past);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(period); }, [load, period]);

  const head = lines[0];
  const total = lines.reduce((sum, line) => sum + Number(line.amount), 0);

  return (
    <>
      <h1>{strings.navRoyalties}</h1>

      <h2>La formule</h2>
      <pre className="formula">
{strings.formulaRate}
{'\n'}{strings.formulaShare}
      </pre>
      <p className="lead">
        Le pool vaut 30 % de la recette nette des abonnements de la période. Les titres du
        domaine public ne perçoivent rien mais <strong>comptent</strong> dans le total des
        pages validées : sans cela, le tout premier éditeur capterait la totalité du pool.
      </p>

      <div className="row row--between">
        <h2>Relevé de la période</h2>
        <MonthPicker
          label={strings.periodLabel}
          value={period}
          max={currentPeriod()}
          onChange={setPeriod}
        />
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Chargement…</p>}

      {!loading && !error && !head && (
        <EmptyState title={strings.noData} explanation={strings.pendingProbe} />
      )}

      {head && (
        <>
          <div className="grid grid--4">
            <div className="card stat">
              <span className="stat__label">Pool de la période</span>
              <strong>{formatMoney(head.pool_amount, head.currency)}</strong>
            </div>
            <div className="card stat">
              <span className="stat__label">Total des pages validées</span>
              <strong>{Number(head.total_pages).toLocaleString('fr-FR')}</strong>
            </div>
            <div className="card stat">
              <span className="stat__label">Taux par page</span>
              <strong>{formatMoney(head.rate_per_page, head.currency, RATE_DISPLAY_DIGITS)}</strong>
            </div>
            <div className="card stat">
              <span className="stat__label">Votre part</span>
              <strong>{formatMoney(total, head.currency)}</strong>
            </div>
          </div>

          <p className="muted">
            {head.state === 'open'
              ? 'Estimation en cours — la période n’est pas consolidée. '
                + 'Consolidation vers le 15 du mois suivant.'
              : 'Chiffres consolidés : ils ne bougeront plus.'}
            {' '}Part du pool non distribuée, correspondant aux pages du domaine public :{' '}
            <strong>{formatMoney(head.undistributed, head.currency)}</strong>.
          </p>

          <StatementTable lines={lines} />
          <ExportButtons
            basename={`releve-${period}`}
            title={`Releve ${period}`}
            columns={[
              { key: 'title', label: 'Titre' },
              { key: 'validated_pages', label: 'Pages validées' },
              { key: 'unique_readers', label: 'Lecteurs uniques' },
              { key: 'rate_per_page', label: 'Taux par page' },
              { key: 'amount', label: 'Montant' },
            ]}
            rows={lines.map((line) => ({
              title: line.title,
              validated_pages: line.validated_pages,
              unique_readers: line.unique_readers,
              rate_per_page: String(line.rate_per_page),
              amount: String(line.amount),
            }))}
          />
        </>
      )}

      <RoyaltyHistory rows={history} />
    </>
  );
}
