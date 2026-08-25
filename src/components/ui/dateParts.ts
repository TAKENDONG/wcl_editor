// Logique du choix de date, hors composant : elle se teste sans rendu.

/// Nombre de jours d'un mois, annees bissextiles comprises.
///
/// Sans cela, un 31 choisi en janvier puis un passage a fevrier laisserait une
/// date inexistante (`2026-02-31`) que le serveur rejetterait — ou pire,
/// interpreterait.
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/// Compose `AAAA-MM-JJ` en ramenant le jour au dernier jour valide du mois.
export function composeDate(year: number, month: number, day: number): string {
  const m = Math.min(Math.max(month, 1), 12);
  const d = Math.min(Math.max(day, 1), daysInMonth(year, m));
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export type DateParts = { year: number; month: number; day: number };

/// Decoupe `AAAA-MM-JJ`. Une valeur vide ou mal formee rend `null` : c'est au
/// composant d'afficher un choix non renseigne plutot qu'une date inventee.
export function splitDate(value: string): DateParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  return { year: Number(y), month: Number(m), day: Number(d) };
}
