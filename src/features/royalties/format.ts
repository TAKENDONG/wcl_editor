// Mise en forme partagee par le releve et l'analytique.

/// Mois courant au format `AAAA-MM`, celui qu'attend `<input type="month">`.
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

/// Duree de lecture moyenne, en minutes et secondes.
export function formatDwell(ms: number | string): string {
  const total = Math.round(Number(ms) / 1000);
  if (!Number.isFinite(total) || total <= 0) return '—';
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return minutes > 0 ? `${minutes} min ${seconds} s` : `${seconds} s`;
}

/// Taux de completion en pourcentage. `null` quand la pagination normalisee du
/// titre est inconnue : afficher « 0 % » ferait croire a une absence de
/// lecture au lieu d'une absence de mesure.
export function formatCompletion(value: number | string | null): string {
  if (value === null || value === undefined) return '—';
  const ratio = Number(value);
  if (!Number.isFinite(ratio)) return '—';
  return `${(Math.min(ratio, 1) * 100).toFixed(1)} %`;
}
