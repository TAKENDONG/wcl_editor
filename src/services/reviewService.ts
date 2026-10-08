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

// La décision passe par la fonction `submission-publish` (09/10/2026) : à
// l'approbation, elle copie le fichier et la couverture de l'éditeur sur R2,
// d'où l'application lit les livres. La RPC seule publiait un titre que
// personne ne pouvait ouvrir.
export async function decideReview(
  id: string,
  decision: ReviewDecision,
  notes: string,
): Promise<SubmissionState> {
  const { data, error } = await supabase.functions.invoke('submission-publish', {
    body: { submission_id: id, decision, notes: notes || null },
  });
  if (error) {
    // Le serveur renvoie le code métier (`publisher_not_verified`, …) dans le
    // corps : c'est lui que l'écran sait traduire.
    const context = (error as { context?: Response }).context;
    const body = context ? await context.json().catch(() => null) : null;
    throw new Error(String(body?.error ?? error.message));
  }
  return (data as { state: SubmissionState }).state;
}
