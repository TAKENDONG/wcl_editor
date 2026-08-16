import { useLocale } from '../../i18n/LocaleContext.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';

// Module G. Aucun versement n'est possible avant que le moteur de redevances
// ait tourne deux periodes a blanc.
export default function PayoutsPage() {
  const { strings } = useLocale();
  return (
    <>
      <h1>{strings.navPayouts}</h1>
      <EmptyState
        title={strings.noData}
        explanation={
          'Les versements ouvriront après deux périodes calculées à blanc. Rails prévus : ' +
          'Mobile Money et MyCoolPay au Cameroun, virement et Flutterwave à l’international.'
        }
      />
      <h2>Ce qui reste à trancher avant le premier versement</h2>
      <ul className="muted">
        <li>Seuil minimal de versement (recommandation : 5 000 XAF en Mobile Money).</li>
        <li>Retenue à la source sur les redevances versées hors du Cameroun — l’obligation pèse
            sur le payeur.</li>
        <li>Entité juridique qui paie, et détention des soldes chez les prestataires.</li>
      </ul>
    </>
  );
}
