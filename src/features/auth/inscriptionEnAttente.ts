import type { PublisherKind } from '../../lib/types.ts';

// L'inscription d'un éditeur se fait en DEUX temps (10/10/2026) : le compte WCL
// App (confirmé par un code reçu par e-mail), puis la fiche éditeur — qui
// exige d'être connecté. Ce que la personne a saisi au premier temps est gardé
// ici, dans son navigateur, et la fiche est créée dès qu'elle est connectée
// (`AccountPage`), qu'elle ait confirmé par le code ou qu'elle ait déjà un
// compte WCL App. Rien à ressaisir.

export type InscriptionEnAttente = {
  email: string;
  kind: PublisherKind;
  displayName: string;
  legalName: string;
  country: string;
  contactEmail: string;
};

const CLE = 'wcl.portal.inscription';

export function garderInscription(i: InscriptionEnAttente): void {
  try { window.localStorage.setItem(CLE, JSON.stringify(i)); } catch { /* navigation privée */ }
}

export function lireInscription(email: string | null | undefined): InscriptionEnAttente | null {
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return null;
    const i = JSON.parse(brut) as InscriptionEnAttente;
    return email && i.email.toLowerCase() === email.toLowerCase() ? i : null;
  } catch {
    return null;
  }
}

export function oublierInscription(): void {
  try { window.localStorage.removeItem(CLE); } catch { /* rien */ }
}
