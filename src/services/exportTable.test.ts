import { describe, expect, it } from 'vitest';
import { toCsv, toSheetXml, xlsxParts, type Column, type Row } from './exportTable.ts';
import { toPdf } from './exportPdf.ts';

const columns: Column[] = [
  { key: 'title', label: 'Titre' },
  { key: 'pages', label: 'Pages validées' },
  { key: 'amount', label: 'Montant' },
];

const rows: Row[] = [
  { title: 'Le Chemin', pages: 1200, amount: 324000 },
  { title: 'Prière & Jeûne', pages: 40, amount: 10800 },
];

describe('CSV', () => {
  it('separe par point-virgule, pour Excel en locale francaise', () => {
    const csv = toCsv(columns, rows);
    expect(csv.split('\r\n')[1]).toBe('Le Chemin;1200;324000');
  });

  it('porte le BOM UTF-8, sans lequel Excel casse les accents', () => {
    expect(toCsv(columns, rows).charCodeAt(0)).toBe(0xfeff);
  });

  it('echappe un point-virgule contenu dans une valeur', () => {
    const csv = toCsv(columns, [{ title: 'Tome 1; Tome 2', pages: 1, amount: 0 }]);
    expect(csv).toContain('"Tome 1; Tome 2"');
  });

  it('double les guillemets internes', () => {
    const csv = toCsv(columns, [{ title: 'Le "Chemin"', pages: 1, amount: 0 }]);
    expect(csv).toContain('"Le ""Chemin"""');
  });

  it('echappe un saut de ligne, qui casserait la ligne suivante', () => {
    const csv = toCsv(columns, [{ title: 'Ligne1\nLigne2', pages: 1, amount: 0 }]);
    expect(csv.split('\r\n').length).toBe(3); // entete + 1 ligne + fin
  });

  it('rend une valeur nulle comme une cellule vide, pas « null »', () => {
    expect(toCsv(columns, [{ title: null, pages: 1, amount: 0 }])).toContain('\r\n;1;0');
  });
});

describe('XLSX', () => {
  it('echappe les entites XML', () => {
    const xml = toSheetXml(columns, [{ title: 'Prière & Jeûne', pages: 1, amount: 0 }]);
    expect(xml).toContain('Pri&#232;re &amp; Je&#251;ne'.replace(/&#\d+;/g, (m) =>
      String.fromCharCode(Number(m.slice(2, -1)))));
    expect(xml).toContain('&amp;');
  });

  it('n echappe pas deux fois une esperluette', () => {
    const xml = toSheetXml(columns, [{ title: 'A & B', pages: 1, amount: 0 }]);
    expect(xml).not.toContain('&amp;amp;');
  });

  it('ecrit tout en chaine : un taux a huit decimales garde sa precision', () => {
    const xml = toSheetXml(
      [{ key: 'rate', label: 'Taux' }],
      [{ rate: '0.00027451' }],
    );
    expect(xml).toContain('t="inlineStr"');
    expect(xml).toContain('0.00027451');
  });

  it('produit les cinq entrees d un classeur', () => {
    const parts = xlsxParts(columns, rows, 'Relevé');
    expect(Object.keys(parts).sort()).toEqual([
      '[Content_Types].xml', '_rels/.rels', 'xl/_rels/workbook.xml.rels',
      'xl/workbook.xml', 'xl/worksheets/sheet1.xml',
    ]);
  });

  it('nettoie un nom de feuille interdit par Excel', () => {
    const parts = xlsxParts(columns, rows, 'Relevé/2026:03');
    expect(parts['xl/workbook.xml']).toContain('name="Relevé202603"');
  });
});

describe('PDF', () => {
  const bytes = toPdf('Relevé de mars 2026', columns, rows);
  const text = new TextDecoder('latin1').decode(bytes);

  it('commence par un en-tete PDF et finit par EOF', () => {
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('declare une table de references coherente avec le nombre d objets', () => {
    const size = Number(/\/Size (\d+)/.exec(text)?.[1]);
    const entries = (text.slice(text.indexOf('xref')).match(/\d{10} \d{5} [nf] /g) ?? []).length;
    expect(entries).toBe(size);
  });

  it('place startxref sur le vrai decalage de la table', () => {
    const start = Number(/startxref\n(\d+)/.exec(text)?.[1]);
    expect(text.slice(start, start + 4)).toBe('xref');
  });

  it('echappe les parentheses, qui termineraient le litteral', () => {
    const pdf = new TextDecoder('latin1')
      .decode(toPdf('T', columns, [{ title: 'Tome (1)', pages: 1, amount: 0 }]));
    expect(pdf).toContain('Tome \\(1\\)');
  });

  it('encode un accent en octal WinAnsi plutot qu en UTF-8 brut', () => {
    const pdf = new TextDecoder('latin1')
      .decode(toPdf('T', columns, [{ title: 'é', pages: 1, amount: 0 }]));
    expect(pdf).toContain('\\351'); // 0xE9
  });

  it('pagine quand les lignes depassent une page', () => {
    const many: Row[] = Array.from({ length: 120 }, (_, i) => ({
      title: `T${i}`, pages: i, amount: i,
    }));
    const pdf = new TextDecoder('latin1').decode(toPdf('Grand', columns, many));
    expect(/\/Count ([2-9]|\d\d)/.test(pdf)).toBe(true);
  });

  it('produit un document valide meme sans aucune ligne', () => {
    const pdf = new TextDecoder('latin1').decode(toPdf('Vide', columns, []));
    expect(pdf).toContain('/Count 1');
    expect(pdf.trimEnd().endsWith('%%EOF')).toBe(true);
  });
});
