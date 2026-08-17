import { useCallback, useEffect, useState } from 'react';
import {
  fetchDocuments, uploadDocument,
  type DocumentKind, type PublisherDocument,
} from '../../services/accountService.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { DropZone } from '../../components/ui/DropZone.tsx';

const KINDS: DocumentKind[] = ['identity', 'legal_existence', 'rights_attestation'];

// Module B — vérification : pièce d'identité, existence légale de l'éditeur,
// attestation de détention des droits de distribution numérique.
export function DocumentsSection({ publisherId }: { publisherId: string }) {
  const { strings } = useLocale();
  const [docs, setDocs] = useState<PublisherDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<DocumentKind | null>(null);

  const label: Record<DocumentKind, string> = {
    identity: strings.docIdentity,
    legal_existence: strings.docLegal,
    rights_attestation: strings.docRights,
  };
  const tone: Record<PublisherDocument['status'], string> = {
    pending: 'badge--warn', accepted: 'badge--ok', rejected: 'badge--danger',
  };
  const statusLabel: Record<PublisherDocument['status'], string> = {
    pending: strings.docPending, accepted: strings.docAccepted, rejected: strings.docRejected,
  };

  const reload = useCallback(async () => {
    try { setDocs(await fetchDocuments(publisherId)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erreur inconnue'); }
  }, [publisherId]);

  useEffect(() => { void reload(); }, [reload]);

  async function send(kind: DocumentKind, file: File) {
    setBusy(kind);
    setError(null);
    try { await uploadDocument(publisherId, kind, file); await reload(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erreur inconnue'); }
    finally { setBusy(null); }
  }

  return (
    <section>
      <h2>{strings.sectionDocuments}</h2>
      <div className="grid" style={{ gap: '0.6rem' }}>
        {KINDS.map((kind) => {
          const latest = docs.find((d) => d.kind === kind);
          return (
            <div key={kind}>
              <DropZone label={label[kind]} accept=".pdf,image/*" hint={strings.docHint}
                        file={null} disabled={busy !== null}
                        onPick={(file) => void send(kind, file)} />
              {latest && (
                <p className="muted" style={{ fontSize: '0.82rem', margin: '0.35rem 0 0' }}>
                  <span className={`badge ${tone[latest.status]}`}>{statusLabel[latest.status]}</span>
                  {latest.review_notes ? ` — ${latest.review_notes}` : ''}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="error">{error}</p>}
      <p className="muted" style={{ fontSize: '0.82rem' }}>{strings.docPrivacy}</p>
    </section>
  );
}
