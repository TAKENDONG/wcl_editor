// Export d'un tableau — exigence E6 (Excel, CSV, PDF).
//
// Fonctions PURES : elles rendent des octets, ne touchent ni au DOM ni au
// reseau. Le telechargement est un effet separe (`downloadService`), ce qui
// rend le format testable sans navigateur — or un CSV mal echappe ne se voit
// qu'a l'ouverture chez le destinataire.

export type Column = { key: string; label: string };
export type Row = Record<string, string | number | null>;

const cell = (value: string | number | null): string =>
  value === null || value === undefined ? '' : String(value);

/// CSV RFC 4180. Le separateur est le POINT-VIRGULE : Excel en locale
/// francaise — celle de CMCI et de ses editeurs — ouvre un CSV virgule sur une
/// seule colonne, et le destinataire conclut que l'export est casse.
export function toCsv(columns: Column[], rows: Row[]): string {
  const escape = (raw: string): string =>
    /[";\n\r]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
  const lines = [columns.map((c) => escape(c.label)).join(';')];
  for (const row of rows) {
    lines.push(columns.map((c) => escape(cell(row[c.key]))).join(';'));
  }
  // BOM UTF-8 : sans lui Excel affiche « Ã© » a la place de « é ».
  return `﻿${lines.join('\r\n')}\r\n`;
}

/// Feuille XLSX minimale mais VALIDE. Tout est ecrit en chaine de caracteres
/// (`t="inlineStr"`) : un montant ecrit en nombre serait reformate par Excel
/// selon la locale du poste, et un taux par page a huit decimales y perdrait
/// sa precision sans prevenir.
export function toSheetXml(columns: Column[], rows: Row[]): string {
  const esc = (raw: string): string =>
    raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cellXml = (value: string): string =>
    `<c t="inlineStr"><is><t xml:space="preserve">${esc(value)}</t></is></c>`;
  const body = [
    `<row>${columns.map((c) => cellXml(c.label)).join('')}</row>`,
    ...rows.map(
      (row) => `<row>${columns.map((c) => cellXml(cell(row[c.key]))).join('')}</row>`,
    ),
  ].join('');
  return '<?xml version="1.0" encoding="UTF-8"?>'
    + '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
    + `<sheetData>${body}</sheetData></worksheet>`;
}

/// Les cinq entrees d'un classeur XLSX, pretes a zipper.
export function xlsxParts(
  columns: Column[], rows: Row[], sheetName = 'Export',
): Record<string, string> {
  const safeName = sheetName.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Export';
  return {
    '[Content_Types].xml':
      '<?xml version="1.0" encoding="UTF-8"?>'
      + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
      + '<Default Extension="xml" ContentType="application/xml"/>'
      + '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
      + '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
      + '</Types>',
    '_rels/.rels':
      '<?xml version="1.0" encoding="UTF-8"?>'
      + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
      + '</Relationships>',
    'xl/workbook.xml':
      '<?xml version="1.0" encoding="UTF-8"?>'
      + '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
      + 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
      + `<sheets><sheet name="${safeName}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    'xl/_rels/workbook.xml.rels':
      '<?xml version="1.0" encoding="UTF-8"?>'
      + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
      + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
      + '</Relationships>',
    'xl/worksheets/sheet1.xml': toSheetXml(columns, rows),
  };
}
