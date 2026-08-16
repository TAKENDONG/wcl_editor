import { useState } from 'react';
import { useSubmissions } from '../../hooks/useSubmissions.ts';
import { usePublishers } from '../../hooks/usePublishers.ts';
import { withdrawSubmission } from '../../services/submissionService.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { StateBadge } from '../../components/ui/StateBadge.tsx';
import { SubmissionForm } from './SubmissionForm.tsx';

// Module C — catalogue de l'editeur. Le composant n'accede jamais a Supabase
// directement : tout passe par les hooks et le service.
export default function CatalogPage() {
  const { strings } = useLocale();
  const { publishers, loading: loadingPublishers, reload: reloadPublishers } = usePublishers(true);
  const [selected, setSelected] = useState<string | null>(null);
  const publisherId = selected ?? publishers[0]?.publisher_id ?? null;
  const { submissions, error, reload } = useSubmissions(publisherId);

  async function onWithdraw(id: string) {
    await withdrawSubmission(id);
    await reload();
    await reloadPublishers();
  }

  if (loadingPublishers) return <p className="muted">…</p>;

  if (publishers.length === 0) {
    return (
      <>
        <h1>{strings.catalogTitle}</h1>
        <div className="notice">
          Aucun espace éditeur n’est rattaché à ce compte. Créez-en un depuis
          « {strings.heroCta} ».
        </div>
      </>
    );
  }

  return (
    <>
      <h1>{strings.catalogTitle}</h1>
      {publishers.length > 1 && (
        <div className="row" style={{ marginBottom: '1rem' }}>
          {publishers.map((p) => (
            <button key={p.publisher_id} type="button"
                    className={p.publisher_id === publisherId ? '' : 'secondary'}
                    onClick={() => setSelected(p.publisher_id)}>
              {p.display_name}
            </button>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr><th>{strings.title}</th><th>{strings.authors}</th><th>État</th><th /></tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id}>
              <td>{s.title}{s.review_notes && <><br /><span className="muted" style={{ fontSize: '0.82rem' }}>{s.review_notes}</span></>}</td>
              <td>{s.authors}</td>
              <td><StateBadge state={s.state} /></td>
              <td>
                {(s.state === 'draft' || s.state === 'submitted') && (
                  <button type="button" className="danger"
                          onClick={() => void onWithdraw(s.id)}>{strings.withdraw}</button>
                )}
              </td>
            </tr>
          ))}
          {submissions.length === 0 && (
            <tr><td colSpan={4} className="muted">{strings.noData}</td></tr>
          )}
        </tbody>
      </table>

      <h2>{strings.newWork}</h2>
      {publisherId && (
        <SubmissionForm publisherId={publisherId} onDone={() => { void reload(); void reloadPublishers(); }} />
      )}
    </>
  );
}
