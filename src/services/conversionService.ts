import { supabase } from '../lib/supabase.ts';
import type { ConversionReport } from '../lib/types.ts';

// Conversion assistee Word -> EPUB (C2).

/// Messages des refus serveur. Un code brut ne dit rien a l'editeur, et
/// « erreur » le laisserait croire a une panne alors que le refus est motive.
const REFUSALS: Record<string, string> = {
  pdf_unsupported:
    'Le PDF n’est pas encore converti : une extraction partielle produirait un '
    + 'texte faux, qui serait mesuré et rémunéré sans que personne puisse le '
    + 'détecter. Déposez un EPUB ou un fichier Word.',
  unsupported_format: 'Ce format n’est pas convertible. Déposez un .docx ou un EPUB.',
  not_a_docx:
    'Ce fichier n’est pas un .docx moderne. Un .doc Word 97 doit d’abord être '
    + 'réenregistré au format .docx.',
  empty_document: 'Aucun texte n’a été trouvé dans ce document.',
  not_draft: 'Cet ouvrage n’est plus un brouillon : sa conversion changerait le '
    + 'fichier sous les yeux du valideur.',
  no_file: 'Aucun fichier n’a encore été déposé pour cet ouvrage.',
  forbidden: 'Vous ne gérez pas le catalogue de cet éditeur.',
};

export async function convertSubmission(
  submissionId: string,
): Promise<ConversionReport> {
  const { data, error } = await supabase.functions.invoke('submission-convert', {
    body: { submission_id: submissionId },
  });
  if (error) throw new Error(error.message);
  const payload = data as Partial<ConversionReport> & { error?: string };
  if (payload.error) {
    throw new Error(REFUSALS[payload.error] ?? payload.error);
  }
  return payload as ConversionReport;
}
