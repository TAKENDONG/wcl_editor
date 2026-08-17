import { useCallback, useEffect, useState } from 'react';
import { decideReview, fetchDuplicates, fetchReviewQueue } from '../../services/reviewService.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { StateBadge } from '../../components/ui/StateBadge.tsx';
import { RightsLabel } from '../../components/ui/RightsLabel.tsx';
import type { DuplicateHint, ReviewDecision, ReviewItem } from '../../lib/types.ts';

// Module D — file de validation WCL. Reservee aux membres d'admin_users : la
// RPC leve 'forbidden', l'interface ne fait que l'afficher.
export default function ReviewQueuePage() {
  const { strings } = useLocale();
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [duplicates, setDuplicates] = useState<Record<string, DuplicateHint[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setItems(await fetchReviewQueue());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function inspect(id: string) {
    setDuplicates((current) => ({ ...current, [id]: [] }));
    setDuplicates((current) => ({ ...current, [id]: [] }));
    const hints = await fetchDuplicates(id);
    setDuplicates((current) => ({ ...current, [id]: hints }));
  }

  async function decide(id: string, decision: ReviewDecision) {
    setError(null);
    try {
      await decideReview(id, decision, notes[id] ?? '');
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    }
  }

  if (error === 'forbidden') {
    return (
      <>
        <h1>{strings.reviewTitle}</h1>
        <div className="notice">
          Cet écran est réservé à l’équipe WCL. Votre compte n’est pas dans <code>admin_users</code>.
        </div>
      </>
    );
  }

  return (
    <>
      <h1>{strings.reviewTitle}</h1>
      <p className="lead">
        Les dossiers sont classés du plus ancien au plus récent : un dossier ne doit jamais être
        doublé par un plus récent. Un refus ou une demande de correction exige un motif.
      </p>
      {error && <p className="error">{error}</p>}

      {items.length === 0 && <p className="muted">{strings.noData}</p>}

      {items.map((item) => (
        <div className="card" key={item.id} style={{ marginBottom: '1rem' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <strong>{item.title}</strong>
            <StateBadge state={item.state} />
          </div>
          <p className="muted" style={{ margin: '0.35rem 0' }}>
            {item.authors} · {item.publisher_name} · {item.language.toUpperCase()}
            {item.isbn ? ` · ISBN ${item.isbn}` : ''} · droits déclarés :{' '}
            <RightsLabel status={item.declared_rights} />
          </p>

          <label className="field">
            <span>{strings.reviewNotes}</span>
            <textarea value={notes[item.id] ?? ''}
                      onChange={(e) => setNotes((c) => ({ ...c, [item.id]: e.target.value }))} />
          </label>

          <div className="row">
            <button type="button" onClick={() => void decide(item.id, 'approve')}>{strings.approve}</button>
            <button type="button" className="secondary"
                    onClick={() => void decide(item.id, 'changes')}>{strings.requestChanges}</button>
            <button type="button" className="danger"
                    onClick={() => void decide(item.id, 'reject')}>{strings.reject}</button>
            <button type="button" className="secondary"
                    onClick={() => void inspect(item.id)}>{strings.duplicates}</button>
          </div>

          {duplicates[item.id]?.length > 0 && (
            <ul className="muted" style={{ fontSize: '0.85rem' }}>
              {duplicates[item.id].map((d) => (
                <li key={d.id}>{d.title} — {d.publisher_name} ({d.reason})</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}
