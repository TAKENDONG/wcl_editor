// Logique du choix de mois, hors composant : elle se teste sans rendu.

/// Premiere annee proposee. WCL n'a pas de redevances anterieures a son propre
/// lancement ; proposer 1970 n'aiderait personne a trouver la bonne periode.
export const FIRST_YEAR = 2026;

/// Compose `AAAA-MM` en bornant au mois maximal.
///
/// Choisir decembre alors qu'on est en aout demanderait un releve qui n'existe
/// pas, et l'ecran afficherait un vide que l'editeur prendrait pour une perte de
/// donnees. On ramene donc au dernier mois disponible plutot que de laisser
/// partir une requete sans reponse possible.
export function boundedPeriod(year: number, month: number, max: string): string {
  const [maxYear, maxMonth] = max.split('-').map(Number);
  const y = Math.min(Math.max(year, FIRST_YEAR), maxYear);
  const raw = Math.min(Math.max(month, 1), 12);
  const m = y === maxYear ? Math.min(raw, maxMonth) : raw;
  return `${y}-${String(m).padStart(2, '0')}`;
}

/// Annees proposables, de la premiere jusqu'a celle de la borne haute.
export function selectableYears(max: string): number[] {
  const maxYear = Number(max.split('-')[0]);
  const span = Math.max(1, maxYear - FIRST_YEAR + 1);
  return Array.from({ length: span }, (_, i) => FIRST_YEAR + i);
}

/// Un mois est-il hors de portee pour l'annee affichee ?
export function isMonthUnavailable(year: number, month: number, max: string): boolean {
  const [maxYear, maxMonth] = max.split('-').map(Number);
  return year === maxYear && month > maxMonth;
}
