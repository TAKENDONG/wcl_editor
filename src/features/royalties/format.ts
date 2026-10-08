// Mise en forme partagee par le releve et l'analytique.


/// Mois courant au format `AAAA-MM`, celui qu'echange `MonthPicker`.
export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/// Montant dans la devise de la periode.
///
/// Le XAF n'a PAS de sous-unite : afficher « 324 000,00 FCFA » signale un
/// arrondi qui n'existe pas et donne au relevé un air de conversion. Les
/// devises a centimes en gardent deux.
export function formatMoney(
  amount: number | string,
  currency: string,
  digits?: number,
): string {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '—';
  const zeroDecimal = currency === 'XAF' || currency === 'XOF';
  const fraction = digits ?? (zeroDecimal ? 0 : 2);
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
  }).format(value);
}

/// Progression moyenne des lecteurs, en pourcentage. `null` quand aucune
/// seance n'a transmis sa progression : afficher « 0 % » ferait croire a une
/// absence de lecture au lieu d'une absence de mesure.
export function formatCompletion(value: number | string | null): string {
  if (value === null || value === undefined) return '—';
  const ratio = Number(value);
  if (!Number.isFinite(ratio)) return '—';
  return `${(Math.min(ratio, 1) * 100).toFixed(1)} %`;
}

/// Part appliquee (0,6 → « 60 % »).
export function formatPart(rate: number | string): string {
  const value = Number(rate);
  if (!Number.isFinite(value)) return '—';
  return `${(Math.round(value * 1000) / 10).toLocaleString('fr-FR')} %`;
}
