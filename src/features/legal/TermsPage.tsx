import { Link } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleContext.tsx';

// Module A — conditions générales. Le corps reste en français : c'est la langue
// du contrat éditeur et celle de la CMCI. Les intitulés sont traduits et la
// page dit explicitement quelle version fait foi, comme le fait tout texte
// juridique multilingue.
export default function TermsPage() {
  const { strings, locale } = useLocale();

  return (
    <>
      <h1>{strings.termsTitle}</h1>
      <p className="lead">{strings.termsIntro}</p>
      {locale !== 'fr' && <div className="notice">{strings.termsAuthoritative}</div>}

      <h2>1. Objet</h2>
      <div className="card">
        Les présentes conditions régissent l’usage du portail éditeurs de World Conquest
        Library (WCL), édité par la Communauté Missionnaire Chrétienne Internationale (CMCI).
        Elles s’appliquent à tout auteur ou maison d’édition qui y dépose un ouvrage.
      </div>

      <h2>2. Rémunération</h2>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          Un pool égal à <strong>30 % de la recette nette</strong> des abonnements de la période
          est réparti entre les ayants droit. La recette nette s’entend après frais
          d’encaissement des prestataires de paiement et après taxe indirecte.
        </p>
        <p>
          Une <strong>page rémunérée</strong> vaut 1 800 signes de texte courant, mesurés par WCL
          sur le fichier déposé. La rémunération porte sur les pages
          <strong> effectivement parcourues</strong>, jamais sur la longueur totale de l’ouvrage.
        </p>
        <p style={{ marginBottom: 0 }}>
          Taux par page = pool ÷ total des pages validées de la plateforme. Les titres du domaine
          public ne perçoivent rien mais <strong>comptent</strong> dans ce total : sans cela, le
          premier éditeur dont une page est lue capterait la totalité du pool.
        </p>
      </div>

      <h2>3. Plafonds et concentration</h2>
      <div className="card">
        Aucun éditeur ne peut percevoir plus de <strong>25 % du pool</strong> d’une période sans
        revue manuelle. Les plafonds de lecture par lecteur sont <strong>provisoires</strong> et
        seront recalibrés à l’issue de la période d’observation, à la hausse comme à la baisse.
      </div>

      <h2>4. Droits déposés</h2>
      <div className="card">
        L’éditeur atteste détenir les droits de distribution numérique des ouvrages qu’il dépose,
        pour les territoires et les langues qu’il déclare. WCL peut suspendre ou retirer tout
        titre dont les droits sont contestés, sans préjudice des sommes déjà versées.
      </div>

      <h2>5. Protection des fichiers — ce qui est garanti, et ce qui ne l’est pas</h2>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          <strong>Garanti :</strong> stockage dans un espace privé, liens de service expirant en
          quinze minutes, aperçu tronqué pour les non-abonnés, chiffrement du fichier téléchargé
          sur l’appareil de chaque lecteur.
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong>Non garanti :</strong> il n’existe ni DRM industriel, ni filigrane par lecteur,
          ni blocage des captures d’écran, ni effacement à distance. Sur un appareil modifié, une
          personne déterminée peut atteindre le fichier. Le chiffrement protège l’ouvrage au
          repos ; il ne constitue pas un contrôle d’usage.
        </p>
      </div>

      <h2>6. Données de lecture</h2>
      <div className="card">
        Les statistiques communiquées aux éditeurs sont <strong>agrégées</strong>. Aucun lecteur
        n’est jamais identifiable nominativement. Les données de lecture détaillées sont
        conservées le temps nécessaire au calcul et au contrôle des redevances, puis réduites en
        synthèses.
      </div>

      <h2>7. Versements</h2>
      <div className="card">
        Les relevés sont consolidés vers le 15 du mois suivant. Un seuil minimal de versement
        s’applique. Les retenues fiscales éventuellement dues au titre des redevances versées
        hors du Cameroun sont prélevées conformément à la réglementation applicable.
      </div>

      <p className="muted" style={{ marginTop: '2rem' }}>
        <Link to="/">{strings.backHome}</Link>
      </p>
      <footer className="site-footer">{strings.footerNote}</footer>
    </>
  );
}
