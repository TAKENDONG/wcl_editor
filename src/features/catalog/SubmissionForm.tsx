import { useState, type FormEvent } from 'react';
import { saveSubmission, submitForReview, type SubmissionDraft } from '../../services/submissionService.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field.tsx';
import type { RightsStatus } from '../../lib/types.ts';

const EMPTY: SubmissionDraft = {
  id: null, title: '', authors: '', language: 'fr', description: '', isbn: '',
  categories: [], keywords: [],
};

// Module C — depot d'un ouvrage puis envoi en validation.
export function SubmissionForm({ publisherId, onDone }: {
  publisherId: string; onDone: () => void;
}) {
  const { strings } = useLocale();
  const [draft, setDraft] = useState<SubmissionDraft>(EMPTY);
  const [rights, setRights] = useState<RightsStatus>('licensed');
  const [territories, setTerritories] = useState('CM');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function patch(next: Partial<SubmissionDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  async function run(sendForReview: boolean, event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const id = await saveSubmission(publisherId, draft);
      if (sendForReview) {
        await submitForReview(id, {
          rights,
          territories: territories.split(',').map((t) => t.trim()).filter(Boolean),
          languages: [draft.language],
        });
      }
      setDraft(EMPTY);
      onDone();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={(event) => void run(false, event)}>
      <h2 style={{ marginTop: 0 }}>{strings.newWork}</h2>
      <TextField label={strings.title} value={draft.title} onChange={(v) => patch({ title: v })} required />
      <TextField label={strings.authors} value={draft.authors} onChange={(v) => patch({ authors: v })} required />
      <SelectField label={strings.language} value={draft.language} onChange={(v) => patch({ language: v })}>
        <option value="fr">Français</option><option value="en">English</option><option value="es">Español</option>
      </SelectField>
      <TextField label={strings.isbn} value={draft.isbn} onChange={(v) => patch({ isbn: v })} />
      <TextAreaField label={strings.description} value={draft.description}
                     onChange={(v) => patch({ description: v })} />

      <SelectField label={strings.rightsDeclaration} value={rights}
                   onChange={(v) => setRights(v as RightsStatus)}>
        <option value="licensed">Sous licence par contrat éditeur</option>
        <option value="public_domain">Domaine public</option>
        <option value="restricted">Droits réservés — ne pas diffuser</option>
      </SelectField>
      <TextField label={strings.territories} value={territories} onChange={setTerritories}
                 placeholder="CM, FR, BE" />

      {error && <p className="error">{error}</p>}
      <div className="row">
        <button type="submit" className="secondary" disabled={busy}>{strings.save}</button>
        <button type="button" disabled={busy} onClick={(event) => void run(true, event)}>
          {strings.submit}
        </button>
      </div>
      <p className="muted" style={{ fontSize: '0.82rem', marginBottom: 0 }}>
        L’envoi en validation exige un fichier déposé et une déclaration de droits. Une fois
        envoyé, le dossier n’est plus modifiable : c’est ce que WCL examine.
      </p>
    </form>
  );
}
