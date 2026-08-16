import type { SubmissionState } from '../../lib/types.ts';

// Les six etats du module C. Le libelle reste francais : c'est un terme
// contractuel, pas une chaine d'interface.
const LABELS: Record<SubmissionState, string> = {
  draft: 'Brouillon',
  submitted: 'Soumis',
  in_review: 'En validation',
  published: 'Publié',
  suspended: 'Suspendu',
  withdrawn: 'Retiré',
};

const TONE: Record<SubmissionState, string> = {
  draft: '', submitted: 'badge--warn', in_review: 'badge--warn',
  published: 'badge--ok', suspended: 'badge--danger', withdrawn: 'badge--danger',
};

export function StateBadge({ state }: { state: SubmissionState }) {
  return <span className={`badge ${TONE[state]}`}>{LABELS[state]}</span>;
}
