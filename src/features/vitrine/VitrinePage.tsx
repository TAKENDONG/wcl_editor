import { Link } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleContext.tsx';

// Module A — vitrine publique, accessible sans compte, en FR / EN / ES.
//
// Le héros est en deux colonnes sur grand écran : le discours à gauche, la
// FORMULE à droite. C'est elle l'argument du portail — la montrer avant même
// l'inscription vaut mieux que de la promettre, et elle occupe une largeur qui
// resterait sinon vide.
export default function VitrinePage() {
  const { strings } = useLocale();

  const model = [
    strings.modelPool,
    strings.modelPage,
    strings.modelValidated,
    strings.modelRate,
    strings.modelPublicDomain,
  ];

  return (
    <>
      <section className="hero">
        <div>
          <h1>{strings.heroTitle}</h1>
          <p className="lead">{strings.heroLead}</p>
          <div className="row" style={{ marginTop: '1.5rem' }}>
            <Link to="/inscription"><button type="button">{strings.heroCta}</button></Link>
            <Link to="/connexion">
              <button type="button" className="secondary">{strings.signIn}</button>
            </Link>
          </div>
        </div>

        <aside className="hero__panel">
          <span className="hero__panel-label">{strings.heroPanelTitle}</span>
          <pre className="formula" style={{ margin: '0.75rem 0 0' }}>
{strings.formulaRate}
{'\n'}{strings.formulaShare}
          </pre>
          <p className="muted" style={{ fontSize: '0.85rem', margin: '0.9rem 0 0', lineHeight: 1.6 }}>
            {strings.heroPanelNote}
          </p>
        </aside>
      </section>

      <h2>{strings.modelTitle}</h2>
      <ol className="steps">
        {model.map((line) => <li key={line} className="steps__item">{line}</li>)}
      </ol>

      <h2>{strings.faqTitle}</h2>
      <div className="faq">
        <div className="faq__item">
          <h3>{strings.faqVerifyQ}</h3>
          <p>{strings.faqVerifyA}</p>
        </div>
        <div className="faq__item">
          <h3>{strings.faqProtectQ}</h3>
          <p>{strings.faqProtectA}</p>
        </div>
      </div>

      <footer className="site-footer">{strings.footerNote}</footer>
    </>
  );
}
