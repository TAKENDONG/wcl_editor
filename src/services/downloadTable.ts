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

function save(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Sans revocation, chaque export retient son blob en memoire jusqu'au
  // rechargement de la page.
  URL.revokeObjectURL(url);
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
