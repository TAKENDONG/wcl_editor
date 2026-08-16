import { supabase } from '../lib/supabase.ts';
import type { PublisherKind, PublisherOverview } from '../lib/types.ts';

// Toute lecture et toute ecriture passent par une RPC : le portail n'a aucun
// droit direct sur les tables (publishers_rls.sql revoque anon ET authenticated).

export async function fetchOverview(): Promise<PublisherOverview[]> {
  const { data, error } = await supabase.rpc('publisher_overview');
  if (error) throw new Error(error.message);
  return (data ?? []) as PublisherOverview[];
}

export type RegisterInput = {
  kind: PublisherKind;
  displayName: string;
  countryCode: string;
  contactEmail: string;
  legalName?: string;
};

export async function registerPublisher(input: RegisterInput): Promise<string> {
  const { data, error } = await supabase.rpc('publisher_register', {
    p_kind: input.kind,
    p_display_name: input.displayName,
    p_country_code: input.countryCode.toUpperCase(),
    p_contact_email: input.contactEmail,
    p_legal_name: input.legalName ?? null,
  });
  if (error) throw new Error(error.message);
  return data as string;
}
