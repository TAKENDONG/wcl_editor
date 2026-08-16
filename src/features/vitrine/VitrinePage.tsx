import { Link } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleContext.tsx';

// Module A — vitrine publique, accessible sans compte, en FR / EN / ES.
export default function VitrinePage() {
  const { strings } = useLocale();

  return (
    <>
      <h1>{strings.heroTitle}</h1>
      <p className="lead">{strings.heroLead}</p>
      <div className="row" style={{ marginTop: '1.25rem' }}>
        <Link to="/inscription"><button type="button">{strings.heroCta}</button></Link>
        <Link to="/connexion"><button type="button" className="secondary">{strings.signIn}</button></Link>
      </div>

      <h2>{strings.modelTitle}</h2>
      <div className="grid grid--3">
        <div className="card">{strings.modelPool}</div>
        <div className="card">{strings.modelPage}</div>
        <div className="card">{strings.modelValidated}</div>
        <div className="card">{strings.modelRate}</div>
        <div className="card">{strings.modelPublicDomain}</div>
      </div>

      <h2>{strings.faqTitle}</h2>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          <strong>Comment vérifier mon relevé ?</strong><br />
          <span className="muted">
            Chaque période publie le montant du pool, le total des pages validées de la
            plateforme et le taux par page. Multipliez vos pages validées par ce taux :
            vous devez retrouver votre part, au centime près.
          </span>
        </p>
        <p>
          <strong>Que protège exactement WCL ?</strong><br />
          <span className="muted">
            Vos fichiers sont stockés dans un espace privé, servis par des liens qui expirent
            en quinze minutes, tronqués à un aperçu pour les non-abonnés, et chiffrés sur
            l’appareil de chaque lecteur. Il n’y a en revanche ni DRM industriel, ni filigrane
            par lecteur, ni effacement à distance : nous préférons l’écrire ici plutôt que de
            le laisser supposer.
          </span>
        </p>
      </div>
    </>
  );
}
