import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import type { PublisherStatus } from '../../lib/types.ts';

type Verification = {
  status: PublisherStatus;
  verified_at: string | null;
  last_notes: string | null;
  documents: number;
  documents_accepted: number;
  required: boolean;
};

// Où en est la vérification du compte par WCL (09/10/2026). Tant qu'elle est
// en attente, l'éditeur doit savoir POURQUOI il ne peut pas soumettre : sans ce
// bandeau, l'envoi d'un ouvrage échouait sur un refus qu'il ne comprenait pas.
export function VerificationBanner({ publisherId, refreshKey }: { publisherId: string; refreshKey?: number }) {
  const { strings } = useLocale();
  const [v, setV] = useState<Verification | null>(null);

  useEffect(() => {
    let actif = true;
    void supabase.rpc('publisher_verification', { p_publisher: publisherId }).then(({ data, error }) => {
      if (!actif || error) return;
      setV(((data ?? []) as Verification[])[0] ?? null);
    });
    return () => { actif = false; };
  }, [publisherId, refreshKey]);

  if (!v) return null;
  if (v.status === 'pending' && !v.required) return null;

  const texte = {
    pending: strings.verifPending,
    verified: strings.verifVerified,
    suspended: strings.verifSuspended,
    closed: strings.verifClosed,
  }[v.status];

  return (
    <div className={v.status === 'verified' ? 'notice notice--ok' : 'notice'} style={{ marginBottom: '1rem' }}>
      <strong>{strings.verifTitle}</strong>
      <p style={{ margin: '0.35rem 0 0' }}>{texte}</p>
      {v.last_notes && v.status !== 'verified' && (
        <p style={{ margin: '0.35rem 0 0' }}>{strings.verifLastNote} {v.last_notes}</p>
      )}
    </div>
  );
}
