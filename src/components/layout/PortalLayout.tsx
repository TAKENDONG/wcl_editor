import { NavLink, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { LanguageSwitch } from './LanguageSwitch.tsx';

// Coquille commune. Aucune logique metier ici : la navigation ne fait que
// refleter l'etat d'authentification que lui passe App.
export function PortalLayout({ signedIn }: { signedIn: boolean }) {
  const { strings } = useLocale();
  const cls = ({ isActive }: { isActive: boolean }) => (isActive ? 'is-active' : '');

  return (
    <div className="shell">
      <header className="topbar">
        <span className="topbar__brand">{strings.brand}</span>
        <nav>
          <NavLink to="/" className={cls} end>{strings.navVitrine}</NavLink>
          {signedIn && <NavLink to="/catalogue" className={cls}>{strings.navCatalog}</NavLink>}
          {signedIn && <NavLink to="/statistiques" className={cls}>{strings.navAnalytics}</NavLink>}
          {signedIn && <NavLink to="/redevances" className={cls}>{strings.navRoyalties}</NavLink>}
          {signedIn && <NavLink to="/versements" className={cls}>{strings.navPayouts}</NavLink>}
          {signedIn && <NavLink to="/validation" className={cls}>{strings.navReview}</NavLink>}
        </nav>
        <div className="topbar__spacer" />
        <LanguageSwitch />
        {signedIn && (
          <button type="button" className="secondary" onClick={() => void supabase.auth.signOut()}>
            {strings.navSignOut}
          </button>
        )}
      </header>
      <main><Outlet /></main>
    </div>
  );
}
