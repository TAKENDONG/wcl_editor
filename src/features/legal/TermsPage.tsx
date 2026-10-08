import { Link } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { useModele } from '../../hooks/useModele.ts';
import { textesModele } from '../../i18n/modele.ts';

// Module A — conditions générales. Le corps reste en français : c'est la langue
// du contrat éditeur et celle de la CMCI. Les intitulés sont traduits et la
// page dit explicitement quelle version fait foi, comme le fait tout texte
// juridique multilingue.
//
// LA RÉMUNÉRATION N'EST PLUS ÉCRITE EN DUR (09/10/2026) : elle se compose des
// réglages EN VIGUEUR, ceux que le calcul applique — WCL décidera de la part, du
// modèle et des versements depuis le portail, et ce texte suivra.
export default function TermsPage() {
  const { strings, locale } = useLocale();
  const modele = useModele();
  const fr = textesModele('fr', modele);

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
        <ul style={{ margin: 0, lineHeight: 1.7 }}>
          {fr.contractTerms.map((terme) => <li key={terme}>{terme}</li>)}
        </ul>
        <p style={{ marginBottom: 0 }}>
          Le temps de lecture est celui que l’application mesure lorsque l’ouvrage est
          réellement ouvert au premier plan. Les titres sans ayant droit comptent dans le
          partage et ne perçoivent rien : la part correspondante n’est redistribuée à personne.
        </p>
      </div>

      <h2>3. Accord-cadre</h2>
      <div className="card">
        Un accord-cadre signé avec WCL peut fixer, pour un éditeur, une autre part, un minimum
        garanti par mois, une avance récupérée sur les redevances et les pays où ses titres sont
        ouverts. À défaut, les règles ci-dessus s’appliquent. Aucun éditeur ne peut percevoir plus
        de <strong>25 %</strong> des redevances d’une période sans revue manuelle.
      </div>

      <h2>4. Droits déposés</h2>
      <div className="card">
        L’éditeur atteste détenir les droits de distribution numérique des ouvrages qu’il dépose,
        pour les territoires et les langues qu’il déclare. Un titre n’est proposé qu’aux lecteurs
        des pays déclarés. WCL peut suspendre ou retirer tout titre dont les droits sont contestés,
        sans préjudice des sommes déjà versées.
      </div>

      <h2>5. Protection des fichiers — ce qui est garanti, et ce qui ne l’est pas</h2>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          <strong>Garanti :</strong> stockage dans un espace privé, lecture dans l’application
          seulement (aucune lecture en ligne sur le site), liens de service à courte durée de vie,
          aperçu tronqué pour les non-abonnés, chiffrement du fichier téléchargé sur l’appareil de
          chaque lecteur.
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
        n’est jamais identifiable nominativement. Les relevés consolidés ne contiennent aucune
        donnée personnelle : ils portent sur des titres, des minutes et des nombres de lecteurs.
      </div>

      <h2>7. Versements</h2>
      <div className="card">
        Chaque mois est calculé, puis consolidé par WCL ; une période consolidée ne change plus.
        Versements {modele.tous_les_n_mois === 1 ? 'mensuels' : `tous les ${modele.tous_les_n_mois} mois`},
        à partir de {modele.versement_seuil} {modele.devise} ; en dessous, le montant est reporté.
        {modele.verification && ' Aucun versement n’est fait à un compte non vérifié : le montant attend la vérification.'}
        {' '}Les retenues fiscales éventuellement dues selon le pays de l’éditeur sont prélevées
        conformément à la réglementation applicable et figurent sur le reçu.
      </div>

      <p className="muted" style={{ marginTop: '2rem' }}>
        <Link to="/">{strings.backHome}</Link>
      </p>
      <footer className="site-footer">{strings.footerNote}</footer>
    </>
  );
}
