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
  authors: string;
  language: string;
  description: string;
  isbn: string;
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
    p_description: draft.description || null,
    p_isbn: draft.isbn || null,
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
