import { supabase } from '../lib/supabase.ts';
import type { RightsStatus, Submission, SubmissionState } from '../lib/types.ts';

export async function fetchSubmissions(publisherId: string): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('publisher_submissions')
    .select(
      'id, publisher_id, state, title, subtitle, authors, language, isbn, description, ' +
        'categories, keywords, declared_rights, file_format, file_sha256, review_notes, ' +
        'submitted_at, updated_at',
    )
    .eq('publisher_id', publisherId)
    .order('updated_at', { ascending: false })
    .returns<Submission[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type SubmissionDraft = {
  id: string | null;
  title: string;
  subtitle: string;
  authors: string;
  language: string;
  description: string;
  isbn: string;
  edition: string;
  categories: string[];
  keywords: string[];
};

export async function saveSubmission(
  publisherId: string,
  draft: SubmissionDraft,
): Promise<string> {
  const { data, error } = await supabase.rpc('submission_save', {
    p_publisher_id: publisherId,
    p_id: draft.id,
    p_title: draft.title,
    p_authors: draft.authors,
    p_language: draft.language,
    p_subtitle: draft.subtitle || null,
    p_description: draft.description || null,
    p_isbn: draft.isbn || null,
    p_edition: draft.edition || null,
    p_categories: draft.categories,
    p_keywords: draft.keywords,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export type RightsDeclaration = {
  rights: RightsStatus;
  territories: string[];
  languages: string[];
};

export async function submitForReview(
  id: string,
  declaration: RightsDeclaration,
): Promise<SubmissionState> {
  const { data, error } = await supabase.rpc('submission_submit', {
    p_id: id,
    p_rights: declaration.rights,
    p_territories: declaration.territories,
    p_languages: declaration.languages,
  });
  if (error) throw new Error(error.message);
  return data as SubmissionState;
}

export async function withdrawSubmission(id: string): Promise<SubmissionState> {
  const { data, error } = await supabase.rpc('submission_withdraw', { p_id: id });
  if (error) throw new Error(error.message);
  return data as SubmissionState;
}

export type MeasuredFile = {
  sha256: string;
  normalized_pages: number | null;
  visible_chars?: number;
  needs_conversion?: boolean;
};

/// Depose le fichier dans le compartiment prive, puis demande au SERVEUR de le
/// mesurer. Le nombre de pages n'est jamais calcule ici : il est l'assiette de
/// la remuneration, et le client est le beneficiaire.
export async function uploadSubmissionFile(
  publisherId: string,
  submissionId: string,
  file: File,
): Promise<MeasuredFile> {
  const format = file.name.split('.').pop()?.toLowerCase() ?? '';
  // UN NOM NEUF À CHAQUE ENVOI, sans « remplacer » (10/10/2026) : le
  // remplacement exige une règle de LECTURE sur le seau, et le seau n'en a
  // volontairement aucune (garantie donnée aux éditeurs). Le serveur garde de
  // toute façon l'historique des versions.
  const objectPath = `${publisherId}/${submissionId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('submissions')
    .upload(objectPath, file);
  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase.functions.invoke('submission-file', {
    body: { submission_id: submissionId, object_path: objectPath, format },
  });
  if (error) throw new Error(error.message);
  return data as MeasuredFile;
}

export async function uploadCover(
  publisherId: string,
  submissionId: string,
  file: File,
): Promise<void> {
  const objectPath = `${publisherId}/${submissionId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from('covers')
    .upload(objectPath, file);
  if (error) throw new Error(error.message);
  // LA COUVERTURE EST ENREGISTRÉE SUR L'OUVRAGE (10/10/2026) : sans cela, elle
  // restait dans le seau, la publication n'en trouvait aucune, et WCL App ne
  // range pas en rayon un titre sans couverture.
  const { error: rpcError } = await supabase.rpc('submission_set_cover', {
    p_id: submissionId, p_cover_key: objectPath,
  });
  if (rpcError) throw new Error(rpcError.message);
}
