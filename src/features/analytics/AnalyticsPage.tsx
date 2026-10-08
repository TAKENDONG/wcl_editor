import { useCallback, useEffect, useState } from 'react';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import {
  fetchByCountry, fetchByTitle, fetchOverview,
} from '../../services/royaltyService.ts';
import type {
  AnalyticsCountryRow, AnalyticsOverview, AnalyticsTitleRow,
} from '../../lib/types.ts';
import { PeriodPicker, rangeOf, type RangeKey } from './PeriodPicker.tsx';
import { TitleTable } from './TitleTable.tsx';
import { CountryTable } from './CountryTable.tsx';

// Module E. Lu EN DIRECT sur les seances de lecture de l'application (temps de
// lecture actif, depuis le 09/10/2026) : tant qu'aucun de vos titres n'a ete
// lu, les tableaux restent VIDES plutot que remplis d'un jeu de demonstration
// — un graphique de demonstration serait la premiere chose qu'un editeur
// prendrait pour un engagement chiffre.
export default function AnalyticsPage() {
  const { strings } = useLocale();
  const [range, setRange] = useState<RangeKey>('month');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [titles, setTitles] = useState<AnalyticsTitleRow[]>([]);
  const [countries, setCountries] = useState<AnalyticsCountryRow[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (key: RangeKey, from: string, to: string) => {
    const span = rangeOf(key, from, to);
    if (!span) return;
    setLoading(true);
    try {
      const [summary, byTitle, byCountry] = await Promise.all([
        fetchOverview(span.from, span.to),
        fetchByTitle(span.from, span.to),
        fetchByCountry(span.from, span.to),
      ]);
      setOverview(summary);
      setTitles(byTitle);
      setCountries(byCountry);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(range, custom.from, custom.to);
  }, [load, range, custom.from, custom.to]);

  const hasData = Number(overview?.minutes ?? 0) > 0;

  return (
    <>
      <div className="row row--between">
        <h1>{strings.navAnalytics}</h1>
        <PeriodPicker
          value={range}
          custom={custom}
          onChange={setRange}
          onCustomChange={setCustom}
        />
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Chargement…</p>}

      {!loading && !error && !hasData && (
        <EmptyState title={strings.noData} explanation={strings.pendingProbe} />
      )}

      {hasData && overview && (
        <>
          <div className="grid grid--4">
            <div className="card stat">
              <span className="stat__label">Minutes de lecture</span>
              <strong>{Number(overview.minutes).toLocaleString('fr-FR')}</strong>
            </div>
            <div className="card stat">
              <span className="stat__label">Lecteurs uniques</span>
              <strong>{Number(overview.unique_readers).toLocaleString('fr-FR')}</strong>
            </div>
            <div className="card stat">
              <span className="stat__label">Sessions de lecture</span>
              <strong>{Number(overview.sessions).toLocaleString('fr-FR')}</strong>
            </div>
            <div className="card stat">
              <span className="stat__label">Titres lus</span>
              <strong>{Number(overview.titles).toLocaleString('fr-FR')}</strong>
            </div>
          </div>

          {/* Exigence E5 : la distinction estimation / consolide doit etre
              explicite. Un editeur qui prend une estimation pour un chiffre
              arrete conteste le releve du mois suivant. */}
          <p className={overview.is_consolidated ? 'muted' : 'notice'}>
            {overview.is_consolidated
              ? 'Chiffres consolidés sur toute la période affichée.'
              : 'Lecture en temps réel, abonnés et lecteurs à l’essai confondus. Seul '
                + 'le temps lu par les abonnés payants entre dans les redevances.'}
          </p>

          <TitleTable rows={titles} />
          <CountryTable rows={countries} />
        </>
      )}
    </>
  );
}
