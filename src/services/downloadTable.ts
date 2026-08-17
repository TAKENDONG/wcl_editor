import { zipSync } from 'fflate';
import { toPdf } from './exportPdf.ts';
import { toCsv, xlsxParts, type Column, type Row } from './exportTable.ts';

// L'EFFET du telechargement, isole des fonctions de format.
// Ce fichier touche au DOM ; `exportTable` et `exportPdf` n'y touchent pas et
// restent donc testables sans navigateur.

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

/// Recopie dans un `ArrayBuffer` franc.
///
/// `Uint8Array` peut etre adosse a un `SharedArrayBuffer`, que `Blob` refuse ;
/// le compilateur le signale. On recopie plutot que de forcer le type : un
/// transtypage ferait disparaitre l'avertissement sans ecarter le cas.
function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer], { type });
}

/// Delai avant liberation de l'URL du blob.
///
/// Revoquer dans la meme boucle d'evenements que le clic ANNULE le
/// telechargement sur plusieurs navigateurs : le lien est active, mais la
/// ressource a deja disparu quand le navigateur va la lire. On libere au tour
/// suivant — sans liberer du tout, chaque export retiendrait son blob en
/// memoire jusqu'au rechargement de la page.
const REVOKE_DELAY_MS = 1000;

function save(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  // Le lien doit etre DANS le document : un `<a>` detache ne declenche pas de
  // telechargement sur Firefox, et l'export y echouait en silence.
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}

/// Telecharge des octets deja produits. Expose pour que le recu de versement
/// ne redefinisse pas sa propre logique de telechargement — elle portait le
/// meme defaut de revocation prematuree.
export function downloadBytes(bytes: Uint8Array, type: string, filename: string): void {
  save(bytesToBlob(bytes, type), filename);
}

export function downloadTable(
  format: ExportFormat,
  basename: string,
  title: string,
  columns: Column[],
  rows: Row[],
): void {
  if (format === 'csv') {
    save(new Blob([toCsv(columns, rows)], { type: 'text/csv;charset=utf-8' }),
      `${basename}.csv`);
    return;
  }
  if (format === 'pdf') {
    save(bytesToBlob(toPdf(title, columns, rows), 'application/pdf'),
      `${basename}.pdf`);
    return;
  }
  const encoder = new TextEncoder();
  const parts = xlsxParts(columns, rows, title);
  const entries: Record<string, Uint8Array> = {};
  for (const [path, xml] of Object.entries(parts)) entries[path] = encoder.encode(xml);
  save(
    bytesToBlob(
      zipSync(entries),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ),
    `${basename}.xlsx`,
  );
}
