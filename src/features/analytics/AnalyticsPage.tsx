import { useLocale } from '../../i18n/LocaleContext.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';

// Module E. Volontairement VIDE tant que la sonde de lecture n'est pas livree.
// Afficher un graphique de demonstration serait la premiere chose qu'un editeur
// prendrait pour un engagement chiffre.
export default function AnalyticsPage() {
  const { strings } = useLocale();
  return (
    <>
      <h1>{strings.navAnalytics}</h1>
      <EmptyState title={strings.noData} explanation={strings.pendingProbe} />
      <h2>Ce que cet écran affichera</h2>
      <div className="grid grid--3">
        <div className="card">Lectures, pages normalisées lues, lecteurs uniques</div>
        <div className="card">Par titre : pages lues, taux de complétion, temps moyen</div>
        <div className="card">Par pays et par période, avec export Excel / CSV / PDF</div>
      </div>
      <p className="muted" style={{ marginTop: '1rem' }}>
        Chaque relevé portera aussi le <strong>taux de couverture de la sonde</strong> : la part
        des lectures réellement mesurées. Sans lui, un chiffre en baisse serait indistinguable
        d’un parc qui n’a pas mis l’application à jour.
      </p>
    </>
  );
}
