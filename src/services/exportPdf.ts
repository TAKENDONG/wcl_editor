import type { Column, Row } from './exportTable.ts';

// PDF minimal mais VALIDE — troisieme format exige par E6.
//
// Ecrit a la main plutot qu'avec une bibliotheque : les generateurs PDF pesent
// plusieurs centaines de kilo-octets pour un besoin qui tient en un tableau
// monochrome, et ce portail sera consulte depuis des connexions ou chaque
// centaine de kilo-octets compte.
//
// Police Helvetica standard, encodage WinAnsi : il couvre le francais et
// l'espagnol sans embarquer de fichier de police. Les caracteres hors de cet
// encodage sont remplaces, jamais emis bruts — un octet hors table produirait
// un PDF que certains lecteurs refusent d'ouvrir.

const PAGE_WIDTH = 842;   // A4 paysage : un tableau de six colonnes n'entre pas
const PAGE_HEIGHT = 595;  // en portrait sans troncature.
const MARGIN = 40;
const LINE_HEIGHT = 16;
const FONT_SIZE = 9;
const HEADER_SIZE = 11;

/// Echappe une chaine pour un litteral PDF et la reduit a WinAnsi.
function pdfText(raw: string): string {
  let out = '';
  for (const char of raw) {
    const code = char.codePointAt(0) ?? 63;
    if (char === '(' || char === ')' || char === '\\') out += `\\${char}`;
    else if (code >= 32 && code <= 126) out += char;
    else if (code >= 160 && code <= 255) out += `\\${code.toString(8).padStart(3, '0')}`;
    else out += '?';
  }
  return out;
}

const cell = (value: string | number | null): string =>
  value === null || value === undefined ? '' : String(value);

/// Tronque a la largeur de colonne. Helvetica etant proportionnelle, on
/// approche par 0,5 em — une approximation basse, qui coupe un peu tot plutot
/// que de laisser deux colonnes se chevaucher.
function fit(text: string, widthPt: number): string {
  const max = Math.max(1, Math.floor(widthPt / (FONT_SIZE * 0.5)));
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

export function toPdf(title: string, columns: Column[], rows: Row[]): Uint8Array {
  const usable = PAGE_WIDTH - MARGIN * 2;
  const colWidth = usable / columns.length;
  const perPage = Math.floor((PAGE_HEIGHT - MARGIN * 2 - LINE_HEIGHT * 3) / LINE_HEIGHT);
  const pages: Row[][] = [];
  for (let i = 0; i < Math.max(rows.length, 1); i += perPage) {
    pages.push(rows.slice(i, i + perPage));
  }

  const streams = pages.map((pageRows, index) => {
    let y = PAGE_HEIGHT - MARGIN;
    const parts = [
      'BT', `/F1 ${HEADER_SIZE} Tf`, `1 0 0 1 ${MARGIN} ${y} Tm`,
      `(${pdfText(title)}) Tj`, 'ET',
    ];
    y -= LINE_HEIGHT * 2;
    parts.push('BT', `/F1 ${FONT_SIZE} Tf`);
    columns.forEach((column, ci) => {
      parts.push(
        `1 0 0 1 ${MARGIN + ci * colWidth} ${y} Tm`,
        `(${pdfText(fit(column.label, colWidth))}) Tj`,
      );
    });
    parts.push('ET');
    y -= LINE_HEIGHT;
    for (const row of pageRows) {
      parts.push('BT', `/F1 ${FONT_SIZE} Tf`);
      columns.forEach((column, ci) => {
        parts.push(
          `1 0 0 1 ${MARGIN + ci * colWidth} ${y} Tm`,
          `(${pdfText(fit(cell(row[column.key]), colWidth))}) Tj`,
        );
      });
      parts.push('ET');
      y -= LINE_HEIGHT;
    }
    const footer = `Page ${index + 1} / ${pages.length}`;
    parts.push(
      'BT', `/F1 ${FONT_SIZE} Tf`, `1 0 0 1 ${MARGIN} ${MARGIN} Tm`,
      `(${pdfText(footer)}) Tj`, 'ET',
    );
    return parts.join('\n');
  });

  return assemble(streams);
}

/// Assemble les objets et la table de references croisees.
///
/// Les decalages sont mesures sur les OCTETS deja emis, pas sur la longueur des
/// chaines : un accent occupe deux octets en UTF-8, et compter en caracteres
/// decalerait la table d'autant — le lecteur signalerait alors un fichier
/// corrompu, sans indiquer ou.
function assemble(streams: string[]): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;

  const push = (text: string): void => {
    const bytes = encoder.encode(text);
    chunks.push(bytes);
    length += bytes.length;
  };
  const startObject = (): void => { offsets.push(length); };

  const pageCount = streams.length;
  const kids = streams.map((_, i) => `${4 + pageCount + i} 0 R`).join(' ');

  push('%PDF-1.4\n');
  startObject();
  push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  startObject();
  push(`2 0 obj\n<< /Type /Pages /Count ${pageCount} /Kids [${kids}] >>\nendobj\n`);
  startObject();
  push('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica '
    + '/Encoding /WinAnsiEncoding >>\nendobj\n');

  streams.forEach((stream, i) => {
    startObject();
    const bytes = encoder.encode(stream);
    push(`${4 + i} 0 obj\n<< /Length ${bytes.length} >>\nstream\n${stream}\nendstream\nendobj\n`);
  });
  streams.forEach((_, i) => {
    startObject();
    push(`${4 + pageCount + i} 0 obj\n<< /Type /Page /Parent 2 0 R `
      + `/MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] `
      + `/Resources << /Font << /F1 3 0 R >> >> /Contents ${4 + i} 0 R >>\nendobj\n`);
  });

  const xrefAt = length;
  const total = offsets.length + 1;
  let xref = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    xref += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }
  push(xref);
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) { out.set(chunk, at); at += chunk.length; }
  return out;
}
