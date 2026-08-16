import { useLocale } from '../../i18n/LocaleContext.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';

// Module F — le coeur differenciant. La formule est affichee AVANT tout chiffre :
// c'est elle que le cahier promet de rendre verifiable.
export default function RoyaltiesPage() {
  const { strings } = useLocale();
  return (
    <>
      <h1>{strings.navRoyalties}</h1>
      <h2>La formule</h2>
      <p className="formula">
        taux_par_page = pool ÷ total_pages_validées_de_la_plateforme<br />
        votre_part = vos_pages_validées × taux_par_page
      </p>
      <p className="lead">
        Le pool vaut 30 % de la recette nette des abonnements de la période. Les titres du
        domaine public ne perçoivent rien mais <strong>comptent</strong> dans le total des pages
        validées : sans cela, le tout premier éditeur capterait la totalité du pool.
      </p>
      <h2>Relevé de la période</h2>
      <EmptyState title={strings.noData} explanation={strings.pendingProbe} />
      <p className="muted">
        Le relevé publiera le montant du pool, le total des pages validées de la plateforme, le
        taux par page et vos pages validées titre par titre — de sorte que vous puissiez
        recalculer votre part vous-même. Consolidation vers le 15 du mois suivant.
      </p>
    </>
  );
}
