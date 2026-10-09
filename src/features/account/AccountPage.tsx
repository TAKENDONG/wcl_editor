import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase.ts';
import { registerPublisher } from '../../services/publisherService.ts';
import { useCapabilitiesContext } from '../../hooks/CapabilitiesContext.tsx';
import { lireInscription, oublierInscription } from '../auth/inscriptionEnAttente.ts';
import { usePublishers } from '../../hooks/usePublishers.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { TeamSection } from './TeamSection.tsx';
import { ContractSection } from './ContractSection.tsx';
import { PayoutSection } from './PayoutSection.tsx';
import { DocumentsSection } from './DocumentsSection.tsx';
import { SecuritySection } from './SecuritySection.tsx';
import { VerificationBanner } from './VerificationBanner.tsx';

// Module B — l'espace du compte éditeur. La page ne fait qu'assembler : chaque
// section porte sa propre logique et son propre appel de service.
export default function AccountPage() {
  const { strings } = useLocale();
  const { publishers, loading, reload } = usePublishers(true);
  const [selected, setSelected] = useState<string | null>(null);
  const current = publishers.find((p) => p.publisher_id === selected) ?? publishers[0];
  const { refresh } = useCapabilitiesContext();
  const [creation, setCreation] = useState(false);
  const [erreurCreation, setErreurCreation] = useState<string | null>(null);
  const tente = useRef(false);

  // L'INSCRIPTION SAISIE SUR « CRÉER UN COMPTE ÉDITEUR » se termine ici, dès
  // que la personne est connectée : après son code, ou à la connexion si son
  // adresse avait déjà un compte WCL App. Une seule tentative par visite.
  useEffect(() => {
    if (loading || publishers.length > 0 || tente.current) return;
    tente.current = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const enAttente = lireInscription(data.user?.email);
      if (!enAttente) return;
      setCreation(true);
      try {
        await registerPublisher({
          kind: enAttente.kind,
          displayName: enAttente.displayName,
          countryCode: enAttente.country,
          contactEmail: enAttente.contactEmail,
          legalName: enAttente.kind === 'publisher' ? enAttente.legalName : undefined,
        });
        oublierInscription();
        await refresh();
        reload();
      } catch (cause) {
        setErreurCreation(cause instanceof Error ? cause.message : 'Erreur inconnue');
      } finally {
        setCreation(false);
      }
    })();
  }, [loading, publishers.length, refresh, reload]);

  if (loading || creation) {
    return <p className="muted">{creation ? strings.finishingRegistration : '…'}</p>;
  }
  if (!current) {
    return (
      <>
        <h1>{strings.navAccount}</h1>
        {erreurCreation && <p className="error">{erreurCreation}</p>}
        <div className="notice">{strings.noPublisher}</div>
        <p style={{ marginTop: '1rem' }}>
          <Link to="/inscription"><button type="button">{strings.signUpPublisher}</button></Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1>{current.display_name}</h1>
      <p className="lead">{strings.accountLead}</p>

      {publishers.length > 1 && (
        <div className="row" style={{ marginBottom: '0.5rem' }}>
          {publishers.map((p) => (
            <button key={p.publisher_id} type="button"
                    className={p.publisher_id === current.publisher_id ? '' : 'secondary'}
                    onClick={() => setSelected(p.publisher_id)}>
              {p.display_name}
            </button>
          ))}
        </div>
      )}

      <VerificationBanner publisherId={current.publisher_id} />
      <ContractSection publisherId={current.publisher_id}
                       signedAt={current.contract_signed_at ?? null} onSigned={reload} />
      <TeamSection publisherId={current.publisher_id} />
      <DocumentsSection publisherId={current.publisher_id} />
      <PayoutSection publisherId={current.publisher_id} />
      <SecuritySection />
    </>
  );
}
