import { supabase } from '../lib/supabase.ts';

// §6 du cahier — authentification forte à deux facteurs.
// GoTrue gère le secret et la vérification : le portail n'implémente aucune
// cryptographie et ne stocke jamais le secret.

export type Factor = { id: string; friendlyName: string; verified: boolean };

export type Enrolment = { factorId: string; qrCode: string; secret: string };

export async function listFactors(): Promise<Factor[]> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw new Error(error.message);
  return (data?.all ?? []).map((f) => ({
    id: f.id,
    friendlyName: f.friendly_name ?? 'TOTP',
    verified: f.status === 'verified',
  }));
}

export async function startEnrolment(friendlyName: string): Promise<Enrolment> {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp', friendlyName,
  });
  if (error) throw new Error(error.message);
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

/// Un facteur n'est actif qu'une fois un code valide fourni : sans cette étape,
/// un utilisateur pourrait se verrouiller dehors avec un secret mal recopié.
export async function confirmEnrolment(factorId: string, code: string): Promise<void> {
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) throw new Error(challengeError.message);

  const { error } = await supabase.auth.mfa.verify({
    factorId, challengeId: challenge.id, code,
  });
  if (error) throw new Error(error.message);
}

export async function removeFactor(factorId: string): Promise<void> {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw new Error(error.message);
}
