import { useEffect, useState, type FormEvent } from 'react';
import {
  saveSubmission,
  submitForReview,
  uploadCover,
  uploadSubmissionFile,
  type MeasuredFile,
  type SubmissionDraft,
} from '../../services/submissionService.ts';
import { useLocale } from '../../i18n/LocaleContext.tsx';
import { SelectField, TextAreaField, TextField } from '../../components/ui/Field.tsx';
import { DropZone } from '../../components/ui/DropZone.tsx';
import type { RightsStatus, Submission } from '../../lib/types.ts';

const EMPTY: SubmissionDraft = {
  id: null, title: '', subtitle: '', authors: '', language: 'fr',
  description: '', isbn: '', edition: '', categories: [], keywords: [],
};

const list = (value: string) => value.split(',').map((v) => v.trim()).filter(Boolean);

// Module C — depot d'un ouvrage, declaration de droits, envoi en validation.
// Le formulaire est decoupe en quatre intentions plutot qu'en une liste de
// champs : l'ouvrage, son classement, ses fichiers, ses droits.
// `initial` : un brouillon déjà enregistré (import en masse, « Enregistrer »,
// ou correction demandée par WCL), rouvert pour y joindre son fichier et
// l'envoyer (10/10/2026). Sans lui, un tel brouillon ne pouvait plus avancer.
export function SubmissionForm({ publisherId, onDone, initial }: {
  publisherId: string; onDone: () => void; initial?: Submission | null;
}) {
  const { strings } = useLocale();
  const [draft, setDraft] = useState<SubmissionDraft>(initial ? {
    id: initial.id, title: initial.title, subtitle: initial.subtitle ?? '', authors: initial.authors,
    language: initial.language, description: initial.description ?? '', isbn: initial.isbn ?? '',
    edition: '', categories: initial.categories ?? [], keywords: initial.keywords ?? [],
  } : EMPTY);
  const [categories, setCategories] = useState((initial?.categories ?? []).join(', '));
  const [keywords, setKeywords] = useState((initial?.keywords ?? []).join(', '));
  // Un fichier déjà mesuré sur le brouillon suffit pour l'envoyer.
  const dejaUnFichier = Boolean(initial?.file_sha256);
  const [rights, setRights] = useState<RightsStatus>(
    initial && initial.declared_rights !== 'unknown' ? initial.declared_rights : 'licensed');
  const [territories, setTerritories] = useState('CM');
  const [book, setBook] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [measured, setMeasured] = useState<MeasuredFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Apercu local de la couverture. L'URL objet doit etre revoquee, sinon chaque
  // choix de fichier fuit une reference tant que l'onglet vit.
  useEffect(() => {
    if (!cover) { setCoverUrl(null); return; }
    const url = URL.createObjectURL(cover);
    setCoverUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [cover]);

  function patch(next: Partial<SubmissionDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function reset() {
    setDraft(EMPTY); setCategories(''); setKeywords('');
    setBook(null); setCover(null); setMeasured(null); setTerritories('CM');
  }

  /// Enregistre, depose les fichiers, puis envoie si demande. Le depot doit
  /// preceder l'envoi : le serveur refuse une soumission sans fichier mesure.
  async function run(sendForReview: boolean, event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const id = await saveSubmission(publisherId, {
        ...draft, categories: list(categories), keywords: list(keywords),
      });

      let measurement = measured;
      if (book) {
        measurement = await uploadSubmissionFile(publisherId, id, book);
        setMeasured(measurement);
      }
      if (cover) await uploadCover(publisherId, id, cover);

      if (sendForReview) {
        if (!measurement && !dejaUnFichier) throw new Error(strings.errFileRequired);
        if (measurement?.needs_conversion) throw new Error(strings.errNeedsConversion);
        await submitForReview(id, {
          rights, territories: list(territories), languages: [draft.language],
        });
        reset();
      } else {
        patch({ id });
      }
      onDone();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erreur inconnue');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card card--form" onSubmit={(event) => void run(false, event)}>
      <fieldset className="fieldset">
        <legend className="fieldset__legend" data-step="01">{strings.sectionWork}</legend>
        <div className="form-grid">
          <TextField label={strings.title} value={draft.title}
                     onChange={(v) => patch({ title: v })} required />
          <TextField label={strings.subtitle} value={draft.subtitle}
                     onChange={(v) => patch({ subtitle: v })} />
          <TextField label={strings.authors} value={draft.authors}
                     onChange={(v) => patch({ authors: v })} required />
          <SelectField label={strings.language} value={draft.language}
                       onChange={(v) => patch({ language: v })}>
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </SelectField>
          <TextField label={strings.isbn} value={draft.isbn}
                     onChange={(v) => patch({ isbn: v })} />
          <TextField label={strings.edition} value={draft.edition}
                     onChange={(v) => patch({ edition: v })} />
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset__legend" data-step="02">{strings.sectionClassify}</legend>
        <div className="form-grid">
          <TextField label={strings.categories} value={categories} onChange={setCategories}
                     placeholder="Spiritualité, Leadership" />
          <TextField label={strings.keywords} value={keywords} onChange={setKeywords}
                     placeholder="vocation, mission" />
          <div className="form-grid__wide">
            <TextAreaField label={strings.description} value={draft.description}
                           onChange={(v) => patch({ description: v })} />
          </div>
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset__legend" data-step="03">{strings.sectionFiles}</legend>
        <div className="grid" style={{ gap: '0.6rem' }}>
          <DropZone label={strings.bookFile} accept=".epub,.pdf,.docx,.txt"
                    hint={strings.bookFileHint} file={book} disabled={busy} onPick={setBook} />
          <DropZone label={strings.coverFile} accept="image/*" hint={strings.coverHint}
                    file={cover} preview={coverUrl} disabled={busy} onPick={setCover} />
        </div>
        {measured && (
          <p className="notice" style={{ margin: '0.9rem 0 0' }}>
            {measured.needs_conversion
              ? strings.errNeedsConversion
              : `${strings.measured} ${measured.normalized_pages} · ${measured.visible_chars} ${strings.chars}`}
          </p>
        )}
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset__legend" data-step="04">{strings.sectionRights}</legend>
        <div className="form-grid">
          <SelectField label={strings.rightsDeclaration} value={rights}
                       onChange={(v) => setRights(v as RightsStatus)}>
            <option value="licensed">Sous licence par contrat éditeur</option>
            <option value="public_domain">Domaine public</option>
            <option value="restricted">Droits réservés — ne pas diffuser</option>
          </SelectField>
          <TextField label={strings.territories} value={territories} onChange={setTerritories}
                     placeholder="CM, FR, BE" />
        </div>
        <p className="muted" style={{ fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
          {strings.submitHint}
        </p>
      </fieldset>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="button" disabled={busy} onClick={(event) => void run(true, event)}>
          {busy ? strings.working : strings.submit}
        </button>
        <button type="submit" className="secondary" disabled={busy}>{strings.save}</button>
      </div>
    </form>
  );
}
