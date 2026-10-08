import { NavLink, Outlet } from 'react-router-dom';
import { supabase } from '../../lib/supabase.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { LanguageSwitch } from './LanguageSwitch.tsx';
import { useCapabilitiesContext } from '../../hooks/CapabilitiesContext.tsx';

// Coquille commune. Aucune logique metier ici : la navigation ne fait que
// refleter les droits que lui passe App.
//
// UN LIEN VISIBLE EST UNE PROMESSE. Montrer « Validation » a un editeur, ou
// « Redevances » a un gestionnaire de catalogue, ne fait que le conduire vers un
// refus du serveur. Les liens sont donc filtres par capacite — ce qui reste de
// l'ergonomie : le cloisonnement reel est cote base, et forcer l'URL rend
// « forbidden ».
export function PortalLayout({ signedIn }: { signedIn: boolean }) {
  const { strings } = useLocale();
  const { caps } = useCapabilitiesContext();
  const cls = ({ isActive }: { isActive: boolean }) => (isActive ? 'is-active' : '');

  return (
    <div className="shell">
      <header className="topbar">
        <span className="topbar__brand">{strings.brand}</span>
        <nav>
          <NavLink to="/" className={cls} end>{strings.navVitrine}</NavLink>
          {signedIn && <NavLink to="/compte" className={cls}>{strings.navAccount}</NavLink>}
          {caps.canManageCatalog && (
            <NavLink to="/catalogue" className={cls}>{strings.navCatalog}</NavLink>
          )}
          {caps.isPublisherMember && (
            <NavLink to="/statistiques" className={cls}>{strings.navAnalytics}</NavLink>
          )}
          {caps.canViewFinance && (
            <NavLink to="/redevances" className={cls}>{strings.navRoyalties}</NavLink>
          )}
          {caps.canViewFinance && (
            <NavLink to="/versements" className={cls}>{strings.navPayouts}</NavLink>
          )}
          {caps.isWclStaff && (
            <NavLink to="/validation" className={cls}>{strings.navReview}</NavLink>
          )}
          {caps.isWclStaff && (
            <NavLink to="/periodes" className={cls}>{strings.navPeriods}</NavLink>
          )}
          {caps.isWclStaff && (
            <NavLink to="/editeurs" className={cls}>{strings.navPublishers}</NavLink>
          )}
          {caps.isWclStaff && (
            <NavLink to="/reglages" className={cls}>{strings.navSettings}</NavLink>
          )}
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
