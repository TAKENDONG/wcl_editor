import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { usePublishers } from './usePublishers.ts';
import { useCapabilities, type Capabilities } from './useCapabilities.ts';

/// Droits de l'utilisateur courant, partages par toute l'application.
///
/// EN CONTEXTE PLUTOT QU'EN PROPRIETE : la navigation, les gardes de route et
/// l'inscription en ont toutes besoin, et `refresh` doit pouvoir etre appele
/// depuis un ecran profond. Sans lui, un editeur qui vient de creer son compte
/// ne voyait PAS apparaitre « Catalogue » : les droits avaient ete lus une fois,
/// au demarrage, quand il n'etait encore membre d'aucun editeur. Il fallait
/// recharger la page pour que le portail le reconnaisse.
type CapabilitiesValue = {
  caps: Capabilities;
  /// A appeler apres toute operation qui CHANGE les droits : creation d'un
  /// editeur, acceptation d'une invitation, revocation d'un membre.
  refresh: () => Promise<void>;
};

const Context = createContext<CapabilitiesValue | null>(null);

export function CapabilitiesProvider(
  { signedIn, children }: { signedIn: boolean; children: ReactNode },
) {
  const { publishers, loading, reload } = usePublishers(signedIn);
  const caps = useCapabilities(signedIn, publishers, loading);

  const refresh = useCallback(async () => { await reload(); }, [reload]);
  const value = useMemo(() => ({ caps, refresh }), [caps, refresh]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCapabilitiesContext(): CapabilitiesValue {
  const value = useContext(Context);
  if (!value) {
    throw new Error('useCapabilitiesContext doit etre utilise dans CapabilitiesProvider');
  }
  return value;
}
