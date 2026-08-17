import { supabase } from '../lib/supabase.ts';
import type { PublisherRole } from '../lib/types.ts';

// Module B — équipe, contrat, versements, pièces justificatives.
// Tout passe par RPC : le portail n'écrit jamais en table.

export type TeamMember = {
  user_id: string;
  email: string;
  role: PublisherRole;
  status: 'invited' | 'active' | 'revoked';
};

export async function fetchTeam(publisherId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase.rpc('publisher_team', { p_publisher_id: publisherId });
  if (error) throw new Error(error.message);
  return (data ?? []) as TeamMember[];
}

export async function inviteMember(
  publisherId: string, email: string, role: PublisherRole,
): Promise<void> {
  const { error } = await supabase.rpc('publisher_invite_member', {
    p_publisher_id: publisherId, p_email: email, p_role: role,
  });
  if (error) throw new Error(error.message);
}

export async function revokeMember(publisherId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc('publisher_revoke_member', {
    p_publisher_id: publisherId, p_user_id: userId,
  });
  if (error) throw new Error(error.message);
}

export async function signContract(
  publisherId: string, version: string, fullName: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('publisher_sign_contract', {
    p_publisher_id: publisherId, p_version: version, p_full_name: fullName,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export type PayoutDetails = {
  payout_method: string | null;
  payout_reference: string | null;
  payout_currency: string | null;
};

export async function fetchPayout(publisherId: string): Promise<PayoutDetails | null> {
  const { data, error } = await supabase.rpc('publisher_payout_details', {
    p_publisher_id: publisherId,
  });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as PayoutDetails[];
  return rows[0] ?? null;
}

export type PayoutInput = {
  method: string; reference: string; currency: string; taxId: string; taxRegime: string;
};

export async function savePayout(publisherId: string, input: PayoutInput): Promise<void> {
  const { error } = await supabase.rpc('publisher_save_payout', {
    p_publisher_id: publisherId, p_method: input.method, p_reference: input.reference,
    p_currency: input.currency, p_tax_id: input.taxId || null,
    p_tax_regime: input.taxRegime || null,
  });
  if (error) throw new Error(error.message);
}

export type DocumentKind = 'identity' | 'legal_existence' | 'rights_attestation';

export type PublisherDocument = {
  id: string; kind: DocumentKind; status: 'pending' | 'accepted' | 'rejected';
  review_notes: string | null; created_at: string;
};

export async function fetchDocuments(publisherId: string): Promise<PublisherDocument[]> {
  const { data, error } = await supabase
    .from('publisher_documents')
    .select('id, kind, status, review_notes, created_at')
    .eq('publisher_id', publisherId)
    .order('created_at', { ascending: false })
    .returns<PublisherDocument[]>();
  if (error) throw new Error(error.message);
  return data ?? [];
}

/// Dépose la pièce dans le compartiment privé puis l'enregistre. Le fichier
/// n'est jamais re-servi : aucune politique de lecture n'existe sur ce bucket.
export async function uploadDocument(
  publisherId: string, kind: DocumentKind, file: File,
): Promise<void> {
  const objectPath = `${publisherId}/${kind}-${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('publisher-documents').upload(objectPath, file);
  if (uploadError) throw new Error(uploadError.message);

  const { error } = await supabase.rpc('publisher_record_document', {
    p_publisher_id: publisherId, p_kind: kind, p_file_key: objectPath,
  });
  if (error) throw new Error(error.message);
}
