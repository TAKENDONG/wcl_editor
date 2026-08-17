import { useState } from 'react';
import { usePublishers } from '../../hooks/usePublishers.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { TeamSection } from './TeamSection.tsx';
import { ContractSection } from './ContractSection.tsx';
import { PayoutSection } from './PayoutSection.tsx';
import { DocumentsSection } from './DocumentsSection.tsx';
import { SecuritySection } from './SecuritySection.tsx';

// Module B — l'espace du compte éditeur. La page ne fait qu'assembler : chaque
// section porte sa propre logique et son propre appel de service.
export default function AccountPage() {
  const { strings } = useLocale();
  const { publishers, loading, reload } = usePublishers(true);
  const [selected, setSelected] = useState<string | null>(null);
  const current = publishers.find((p) => p.publisher_id === selected) ?? publishers[0];

  if (loading) return <p className="muted">…</p>;
  if (!current) {
    return (
      <>
        <h1>{strings.navAccount}</h1>
        <div className="notice">{strings.noPublisher}</div>
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

      <ContractSection publisherId={current.publisher_id}
                       signedAt={current.contract_signed_at ?? null} onSigned={reload} />
      <TeamSection publisherId={current.publisher_id} />
      <DocumentsSection publisherId={current.publisher_id} />
      <PayoutSection publisherId={current.publisher_id} />
      <SecuritySection />
    </>
  );
}
