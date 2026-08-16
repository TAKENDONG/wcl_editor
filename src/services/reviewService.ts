import { supabase } from '../lib/supabase.ts';
import type { DuplicateHint, ReviewDecision, ReviewItem, SubmissionState } from '../lib/types.ts';

// Module D — file de validation WCL. Reservee aux membres d'admin_users : la
// RPC leve 'forbidden' cote serveur, l'interface ne fait que le refleter.

export async function fetchReviewQueue(): Promise<ReviewItem[]> {
  const { data, error } = await supabase.rpc('admin_review_queue', { p_limit: 50 });
  if (error) throw new Error(error.message);
  return (data ?? []) as ReviewItem[];
}

export async function fetchDuplicates(id: string): Promise<DuplicateHint[]> {
  const { data, error } = await supabase.rpc('admin_review_duplicates', { p_id: id });
  if (error) throw new Error(error.message);
  return (data ?? []) as DuplicateHint[];
}

export async function decideReview(
  id: string,
  decision: ReviewDecision,
  notes: string,
): Promise<SubmissionState> {
  const { data, error } = await supabase.rpc('admin_review_decide', {
    p_id: id,
    p_decision: decision,
    p_notes: notes || null,
  });
  if (error) throw new Error(error.message);
  return data as SubmissionState;
}
