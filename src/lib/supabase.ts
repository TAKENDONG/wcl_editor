import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Echec bruyant au demarrage plutot qu'une page blanche a la premiere requete :
// une variable d'environnement oubliee est l'erreur de deploiement la plus
// frequente sur ce projet (cf. wclAdmin, qui blanchit toute l'application).
if (!url || !anonKey) {
  throw new Error(
    'VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requis. Copier .env.example vers .env.',
  );
}

export const supabase = createClient(url, anonKey);
