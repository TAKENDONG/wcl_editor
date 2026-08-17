import type { RightsStatus } from '../../lib/types.ts';

// Les valeurs d'énuméré ne doivent jamais atteindre l'écran telles quelles :
// « licensed » n'est pas un mot de l'interface, c'est une valeur de base.
// Termes contractuels, donc francais quelle que soit la langue d'interface —
// meme regle que les etats de soumission (StateBadge).
const LABELS: Record<RightsStatus, string> = {
  public_domain: 'Domaine public',
  licensed: 'Sous licence éditeur',
  restricted: 'Droits réservés',
  unknown: 'Non déclarés',
};

export function RightsLabel({ status }: { status: RightsStatus }) {
  return <>{LABELS[status]}</>;
}
