import { saveSubmission } from './submissionService.ts';
import type { ImportRow } from './bulkImportParser.ts';

// Module C — ECRITURE de l'import en masse. L'analyse vit dans
// bulkImportParser.ts, qui reste pur et testable.

export type ImportOutcome = { created: number; errors: string[] };

/// Chaque ligne est créée indépendamment : une ligne fautive ne doit pas faire
/// perdre les quatre-vingt-dix-neuf autres.
export async function importRows(
  publisherId: string, rows: ImportRow[],
): Promise<ImportOutcome> {
  const errors: string[] = [];
  let created = 0;

  for (const row of rows) {
    try {
      await saveSubmission(publisherId, { id: null, ...row });
      created += 1;
    } catch (cause) {
      errors.push(`${row.title} — ${cause instanceof Error ? cause.message : 'erreur'}`);
    }
  }
  return { created, errors };
}
