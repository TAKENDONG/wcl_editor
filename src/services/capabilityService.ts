import { supabase } from '../lib/supabase.ts';

// Statut « personnel WCL ». La fonction `is_admin()` existe deja en base et
// sert de garde a toutes les RPC d'administration ; on l'interroge ici pour
// savoir QUELS ECRANS montrer.
//
// Le masquage qui en decoule est de l'ergonomie, pas de la securite : chaque
// RPC verifie de nouveau, et un utilisateur qui forcerait l'URL obtiendrait
// « forbidden ». Mais laisser un editeur cliquer sur « Validation » pour y lire
// un refus est une promesse que l'interface ne tient pas.
export async function fetchIsWclStaff(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) throw new Error(error.message);
  return data === true;
}
