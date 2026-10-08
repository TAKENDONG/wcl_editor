import { Link } from 'react-router-dom';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { textesModele } from '../../i18n/modele.ts';
import { useModele } from '../../hooks/useModele.ts';

// Module A — vitrine publique, accessible sans compte, en FR / EN / ES.
//
// Le héros est en deux colonnes sur grand écran : le discours à gauche, la
// FORMULE à droite. C'est elle l'argument du portail — la montrer avant même
// l'inscription vaut mieux que de la promettre, et elle occupe une largeur qui
// resterait sinon vide.
export default function VitrinePage({ signedIn }: { signedIn: boolean }) {
  const { strings, locale } = useLocale();
  // Le modèle affiché est celui que le calcul applique (réglages WCL).
  const t = textesModele(locale, useModele());

  return (
    <>
      <section className="hero">
        <div>
          <h1>{t.heroTitle}</h1>
          <p className="lead">{t.heroLead}</p>
          {/* Un visiteur connecte n'a rien a faire de « Se connecter », et
              « Devenir editeur » lui propose une inscription qu'il a deja
              faite. Les deux appels a l'action changent donc ensemble : les
              laisser tels quels donnerait l'impression d'une session perdue. */}
          <div className="row" style={{ marginTop: '1.5rem' }}>
            {signedIn ? (
              <Link to="/compte"><button type="button">{strings.heroCtaSignedIn}</button></Link>
            ) : (
              <>
                <Link to="/inscription">
                  <button type="button">{strings.heroCta}</button>
                </Link>
                <Link to="/connexion">
                  <button type="button" className="secondary">{strings.signIn}</button>
                </Link>
              </>
            )}
          </div>
        </div>

        <aside className="hero__panel">
          <span className="hero__panel-label">{t.panelTitle}</span>
          <pre className="formula" style={{ margin: '0.75rem 0 0', whiteSpace: 'pre-wrap' }}>
{t.formula.join('\n')}
          </pre>
          <p className="muted" style={{ fontSize: '0.85rem', margin: '0.9rem 0 0', lineHeight: 1.6 }}>
            {t.panelNote}
          </p>
        </aside>
      </section>

      <h2>{t.modelTitle}</h2>
      <ol className="steps">
        {t.lines.map((line) => <li key={line} className="steps__item">{line}</li>)}
      </ol>

      <h2>{strings.faqTitle}</h2>
      <div className="faq">
        <div className="faq__item">
          <h3>{t.faqVerifyQ}</h3>
          <p>{t.faqVerifyA}</p>
        </div>
        <div className="faq__item">
          <h3>{strings.faqProtectQ}</h3>
          <p>{strings.faqProtectA}</p>
        </div>
      </div>

      <footer className="site-footer">
        <Link to="/conditions">{strings.termsTitle}</Link>
        {' · '}
        <Link to="/confidentialite">{strings.privacyTitle}</Link>
        {' · '}{strings.footerNote}
      </footer>
    </>
  );
}
