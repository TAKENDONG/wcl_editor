import { Navigate, Route, Routes } from 'react-router-dom';
import { PortalLayout } from '../components/layout/PortalLayout.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import {
  CapabilitiesProvider, useCapabilitiesContext,
} from '../hooks/CapabilitiesContext.tsx';
import VitrinePage from '../features/vitrine/VitrinePage.tsx';
import SignInPage from '../features/auth/SignInPage.tsx';
import RegisterPage from '../features/account/RegisterPage.tsx';
import AccountPage from '../features/account/AccountPage.tsx';
import TermsPage from '../features/legal/TermsPage.tsx';
import PrivacyPage from '../features/legal/PrivacyPage.tsx';
import CatalogPage from '../features/catalog/CatalogPage.tsx';
import AnalyticsPage from '../features/analytics/AnalyticsPage.tsx';
import RoyaltiesPage from '../features/royalties/RoyaltiesPage.tsx';
import PayoutsPage from '../features/payouts/PayoutsPage.tsx';

// Table de routes unique, comme dans wclAdmin. La vitrine (module A) est
// PUBLIQUE : le cahier veut qu'un editeur decouvre le modele avant de creer un
// compte.
export function App() {
  const { session, loading } = useAuth();
  const signedIn = Boolean(session);

  if (loading) return <p style={{ padding: '2rem' }}>…</p>;

  return (
    <CapabilitiesProvider signedIn={signedIn}>
      <PortalRoutes signedIn={signedIn} />
    </CapabilitiesProvider>
  );
}

function PortalRoutes({ signedIn }: { signedIn: boolean }) {
  const { caps } = useCapabilitiesContext();

  const guard = (element: JSX.Element) =>
    signedIn ? element : <Navigate to="/connexion" replace />;

  // LES ROUTES SONT GARDEES, PAS SEULEMENT LES LIENS. Masquer un lien tout en
  // laissant sa route ouverte n'est qu'un habillage : l'URL collee dans la
  // barre d'adresse afficherait l'ecran, qui n'obtiendrait ensuite que des
  // refus du serveur — un ecran cassé plutot qu'un ecran absent.
  //
  // Tant que les droits ne sont pas connus, on ATTEND. Rediriger pendant le
  // chargement renverrait un comptable a l'accueil a chaque rafraichissement.
  const allow = (permitted: boolean, element: JSX.Element) => {
    if (!signedIn) return <Navigate to="/connexion" replace />;
    if (!caps.ready) return <p className="muted" style={{ padding: '2rem' }}>…</p>;
    return permitted ? element : <Navigate to="/compte" replace />;
  };

  return (
    <Routes>
      <Route element={<PortalLayout signedIn={signedIn} />}>
        <Route index element={<VitrinePage signedIn={signedIn} />} />
        <Route path="/conditions" element={<TermsPage />} />
        <Route path="/confidentialite" element={<PrivacyPage />} />
        <Route path="/connexion" element={signedIn ? <Navigate to="/compte" replace /> : <SignInPage />} />
        <Route path="/inscription" element={guard(<RegisterPage />)} />
        <Route path="/compte" element={guard(<AccountPage />)} />
        <Route path="/catalogue" element={allow(caps.canManageCatalog, <CatalogPage />)} />
        <Route path="/statistiques" element={allow(caps.isPublisherMember, <AnalyticsPage />)} />
        <Route path="/redevances" element={allow(caps.canViewFinance, <RoyaltiesPage />)} />
        <Route path="/versements" element={allow(caps.canViewFinance, <PayoutsPage />)} />
        {/* Anciennes adresses du personnel : l'administration est passée dans
            la console WCL (09/10/2026). */}
        {['/validation', '/periodes', '/editeurs', '/reglages'].map((chemin) => (
          <Route key={chemin} path={chemin} element={<VersLaConsole />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function VersLaConsole() {
  window.location.replace('https://account.worldconquestlibrary.org/editeurs');
  return <p className="muted" style={{ padding: '2rem' }}>…</p>;
}
