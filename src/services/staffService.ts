import { supabase } from '../lib/supabase.ts';
import type { PayoutState, PublisherKind, PublisherStatus } from '../lib/types.ts';

// Les outils du PERSONNEL WCL (09/10/2026) : vérification des éditeurs, accords,
// réglages des redevances, versements. Chaque fonction serveur vérifie
// `is_admin()` : ce module n'ouvre rien que le serveur ne refuse.

export type StaffPublisher = {
  id: string;
  kind: PublisherKind;
  display_name: string;
  legal_name: string | null;
  country_code: string | null;
  contact_email: string | null;
  status: PublisherStatus;
  verified_at: string | null;
  contract_signed_at: string | null;
  created_at: string;
  documents: number;
  documents_pending: number;
  titles: number;
  members: number;
  has_payout: boolean;
  agreement_part: number | null;
};

export type StaffDocument = {
  id: string;
  kind: 'identity' | 'legal_existence' | 'rights_attestation';
  file_key: string;
  status: 'pending' | 'accepted' | 'rejected';
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Agreement = {
  part: number | null;
  part_effective: number;
  minimum_par_periode: number;
  avance: number;
  avance_recuperee: number;
  debut: string | null;
  fin: string | null;
  territoires: string[];
  notes: string | null;
  devise: string;
};

export type Reglage = { cle: string; valeur: unknown; description: string | null; modifie_le: string | null };

export type StaffPayout = {
  id: string;
  publisher_id: string;
  publisher_name: string;
  country_code: string | null;
  earned: number;
  minimum_topup: number;
  recouped: number;
  carried_in: number;
  due: number;
  paid_amount: number;
  carried_out: number;
  currency: string;
  state: PayoutState;
  hold_reason: string | null;
  method: string | null;
  tax_status: 'not_assessed' | 'exempt' | 'withheld';
  withheld_amount: number;
  net_paid: number | null;
  receipt_no: string | null;
  settled_at: string | null;
};

export type TaxRule = { country_code: string; withholding_rate: number; rationale: string; updated_at: string };

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw new Error(error.message);
  return data as T;
}

export const listPublishers = (status: PublisherStatus | null) =>
  rpc<StaffPublisher[]>('admin_publishers', { p_status: status });

export const listDocuments = (publisherId: string) =>
  rpc<StaffDocument[]>('admin_publisher_documents', { p_publisher: publisherId });

export const decideDocument = (id: string, status: StaffDocument['status'], notes: string) =>
  rpc<void>('admin_publisher_document_decide', { p_document: id, p_status: status, p_notes: notes || null });

export const setPublisherStatus = (id: string, status: PublisherStatus, notes: string) =>
  rpc<PublisherStatus>('admin_publisher_set_status', { p_publisher: id, p_status: status, p_notes: notes || null });

/// Lien de lecture d'une pièce, valable cinq minutes (règle de stockage
/// « Admins read publisher documents »).
export async function documentLink(fileKey: string): Promise<string> {
  const { data, error } = await supabase.storage.from('publisher-documents').createSignedUrl(fileKey, 300);
  if (error || !data) throw new Error(error?.message ?? 'lien_impossible');
  return data.signedUrl;
}

export async function fetchAgreement(publisherId: string): Promise<Agreement | null> {
  const rows = await rpc<Agreement[]>('agreement_of', { p_publisher: publisherId });
  return rows?.[0] ?? null;
}

export const saveAgreement = (publisherId: string, a: {
  part: number | null; minimum: number; avance: number; debut: string | null; fin: string | null;
  territoires: string[]; notes: string;
}) => rpc<void>('admin_agreement_save', {
  p_publisher: publisherId, p_part: a.part, p_minimum: a.minimum, p_avance: a.avance,
  p_debut: a.debut, p_fin: a.fin, p_territoires: a.territoires, p_notes: a.notes || null,
});

export const listReglages = () => rpc<Reglage[]>('admin_reglages_editeurs');
export const saveReglage = (cle: string, valeur: unknown) =>
  rpc<void>('admin_regler_editeurs', { p_cle: cle, p_valeur: valeur });

export const listPayouts = (periodStart: string) =>
  rpc<StaffPayout[]>('admin_payouts', { p_period_start: periodStart });
export const settlePayout = (id: string, reference: string) =>
  rpc<string>('payout_mark_settled', { p_payout_id: id, p_provider_ref: reference });
export const listTaxRules = () => rpc<TaxRule[]>('admin_tax_rules');
export const saveTaxRule = (country: string, rate: number, rationale: string) =>
  rpc<void>('admin_tax_rule_save', { p_country: country, p_rate: rate, p_rationale: rationale });
