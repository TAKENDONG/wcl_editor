import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { textesModele } from '../../i18n/modele.ts';
import { useModele } from '../../hooks/useModele.ts';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { ExportButtons } from '../../components/ui/ExportButtons.tsx';
import { MonthPicker } from '../../components/ui/MonthPicker.tsx';
import { fetchHistory, fetchStatement } from '../../services/royaltyService.ts';
import type { RoyaltyHistoryRow, RoyaltyStatementLine } from '../../lib/types.ts';
import { StatementTable } from './StatementTable.tsx';
import { RoyaltyHistory } from './RoyaltyHistory.tsx';
import { currentPeriod, formatMoney, formatPart } from './format.ts';

// Module F — le coeur differenciant. Les AGREGATS DE PLATEFORME sont affiches
// au-dessus du releve : sans la part des editeurs et le temps de lecture total,
// l'editeur ne peut pas refaire le calcul, et la transparence promise se
// reduirait a trois chiffres choisis par WCL.
//
// Depuis le 09/10/2026, la redevance suit le TEMPS DE LECTURE des abonnes
// payants (seances de l'application), plus des pages : chaque ligne montre la
// recette attribuee au titre et la part appliquee — leur produit est le montant.
export default function RoyaltiesPage() {
  const { strings, locale } = useLocale();
  const t = textesModele(locale, useModele());
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
  const minutes = lines.reduce((sum, line) => sum + Number(line.minutes), 0);

  return (
    <>
      <h1>{strings.navRoyalties}</h1>

      <h2>{t.panelTitle}</h2>
      <pre className="formula" style={{ whiteSpace: 'pre-wrap' }}>{t.formula.join('\n')}</pre>
      <ul className="muted" style={{ lineHeight: 1.7 }}>
        {t.lines.map((line) => <li key={line}>{line}</li>)}
      </ul>

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
              <span className="stat__label">Part éditeurs de la recette</span>
              <strong>{formatMoney(head.pool_amount, head.currency)}</strong>
            </div>
            <div className="card stat">
              <span className="stat__label">Minutes lues (plateforme)</span>
              <strong>{Number(head.total_minutes).toLocaleString('fr-FR')}</strong>
            </div>
            <div className="card stat">
              <span className="stat__label">Vos minutes comptées</span>
              <strong>{minutes.toLocaleString('fr-FR')}</strong>
            </div>
            <div className="card stat">
              <span className="stat__label">Votre part</span>
              <strong>{formatMoney(total, head.currency)}</strong>
            </div>
          </div>

          <p className="muted">
            {head.state === 'open'
              ? 'Estimation en cours — la période n’est pas consolidée. Les chiffres '
                + 'peuvent encore varier jusqu’à la consolidation par WCL.'
              : 'Chiffres consolidés : ils ne bougeront plus.'}
            {' '}Modèle appliqué : <strong>{head.model === 'par_abonne'
              ? 'chaque abonné finance ce qu’il lit'
              : 'fonds commun partagé au temps de lecture'}</strong>.
            {' '}Part non distribuée (titres sans ayant droit, abonnés qui n’ont rien lu) :{' '}
            <strong>{formatMoney(head.undistributed, head.currency)}</strong>.
          </p>

          <StatementTable lines={lines} hint={t.statementHint} />
          <ExportButtons
            basename={`releve-${period}`}
            title={`Releve ${period}`}
            columns={[
              { key: 'title', label: 'Titre' },
              { key: 'minutes', label: 'Minutes comptées' },
              { key: 'unique_readers', label: 'Abonnés lecteurs' },
              { key: 'attributed_revenue', label: 'Recette attribuée' },
              { key: 'part_rate', label: 'Part' },
              { key: 'amount', label: 'Montant' },
            ]}
            rows={lines.map((line) => ({
              title: line.title,
              minutes: line.minutes,
              unique_readers: line.unique_readers,
              attributed_revenue: String(line.attributed_revenue),
              part_rate: formatPart(line.part_rate),
              amount: String(line.amount),
            }))}
          />
        </>
      )}

      <RoyaltyHistory rows={history} />
    </>
  );
}
