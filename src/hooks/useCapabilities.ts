import { useEffect, useState } from 'react';
import { fetchIsWclStaff } from '../services/capabilityService.ts';
import type { PublisherOverview, PublisherRole } from '../lib/types.ts';

/// Ce que l'utilisateur courant a le droit de FAIRE, et donc de voir.
///
/// Les ecrans sont masques a partir de ces drapeaux. Le masquage n'est PAS la
/// securite — chaque RPC refuse cote serveur — mais montrer a un comptable un
/// « Catalogue » qui lui repondra « permission denied » est une promesse que
/// l'interface ne tient pas.
export type Capabilities = {
  /// Faux tant que les droits ne sont pas connus. Il faut l'attendre avant de
  /// dessiner la navigation : afficher tous les liens puis en retirer la moitie
  /// produit un scintillement qui donne l'impression d'un acces retire.
  ready: boolean;
  isWclStaff: boolean;
  isPublisherMember: boolean;
  canManageCatalog: boolean;
  canViewFinance: boolean;
};

const NONE: Capabilities = {
  ready: false,
  isWclStaff: false,
  isPublisherMember: false,
  canManageCatalog: false,
  canViewFinance: false,
};

/// Les roles sont pris en UNION sur tous les editeurs de l'utilisateur : etre
/// comptable chez l'un suffit a ouvrir les ecrans financiers, meme si l'on est
/// simple gestionnaire de catalogue chez l'autre. L'ecran filtrera ensuite par
/// editeur ; c'est le serveur qui borne les lignes.
function rolesOf(publishers: PublisherOverview[]): Set<PublisherRole> {
  return new Set(publishers.map((p) => p.my_role));
}

export function useCapabilities(
  signedIn: boolean,
  publishers: PublisherOverview[],
  publishersLoading: boolean,
): Capabilities {
  const [staff, setStaff] = useState<boolean | null>(null);

  useEffect(() => {
    if (!signedIn) {
      setStaff(null);
      return;
    }
    let active = true;
    fetchIsWclStaff()
      .then((value) => { if (active) setStaff(value); })
      // Un echec vaut « pas membre du personnel » : le defaut penche du cote
      // qui montre MOINS, jamais du cote qui ouvre un ecran par erreur.
      .catch(() => { if (active) setStaff(false); });
    return () => { active = false; };
  }, [signedIn]);

  if (!signedIn) return { ...NONE, ready: true };
  if (staff === null || publishersLoading) return NONE;

  const roles = rolesOf(publishers);
  return {
    ready: true,
    isWclStaff: staff,
    isPublisherMember: publishers.length > 0,
    canManageCatalog: roles.has('admin') || roles.has('catalog'),
    canViewFinance: roles.has('admin') || roles.has('finance'),
  };
}
