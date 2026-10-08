import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { MODELE_PAR_DEFAUT, type Modele } from '../i18n/modele.ts';

// Le modèle de rémunération EN VIGUEUR (`portail_modele()`, public). Les
// valeurs par défaut s'affichent le temps de la réponse, et restent en place si
// la fonction n'existe pas encore (migration pas collée).
export function useModele(): Modele {
  const [modele, setModele] = useState<Modele>(MODELE_PAR_DEFAUT);
  useEffect(() => {
    let actif = true;
    void supabase.rpc('portail_modele').then(({ data, error }) => {
      if (!actif || error || !data || typeof data !== 'object') return;
      setModele({ ...MODELE_PAR_DEFAUT, ...(data as Partial<Modele>) });
    });
    return () => { actif = false; };
  }, []);
  return modele;
}
