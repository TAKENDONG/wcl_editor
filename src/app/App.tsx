import { Navigate, Route, Routes } from 'react-router-dom';
import { PortalLayout } from '../components/layout/PortalLayout.tsx';
import { useAuth } from '../hooks/useAuth.ts';
import VitrinePage from '../features/vitrine/VitrinePage.tsx';
import SignInPage from '../features/auth/SignInPage.tsx';
import RegisterPage from '../features/account/RegisterPage.tsx';
import CatalogPage from '../features/catalog/CatalogPage.tsx';
import ReviewQueuePage from '../features/review/ReviewQueuePage.tsx';
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

  const guard = (element: JSX.Element) =>
    signedIn ? element : <Navigate to="/connexion" replace />;

  return (
    <Routes>
      <Route element={<PortalLayout signedIn={signedIn} />}>
        <Route index element={<VitrinePage />} />
        <Route path="/connexion" element={signedIn ? <Navigate to="/catalogue" replace /> : <SignInPage />} />
        <Route path="/inscription" element={guard(<RegisterPage />)} />
        <Route path="/catalogue" element={guard(<CatalogPage />)} />
        <Route path="/statistiques" element={guard(<AnalyticsPage />)} />
        <Route path="/redevances" element={guard(<RoyaltiesPage />)} />
        <Route path="/versements" element={guard(<PayoutsPage />)} />
        <Route path="/validation" element={guard(<ReviewQueuePage />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
