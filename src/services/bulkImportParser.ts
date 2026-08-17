import { readSheet } from 'read-excel-file/browser';

// Module C — ANALYSE des fichiers d'import. Volontairement pur : aucune
// dependance a Supabase, pour rester testable hors navigateur.
//
// L'import ne crée que des BROUILLONS de métadonnées : chaque ouvrage a besoin
// de son propre fichier, qui ne peut pas être joint en lot. C'est la lecture
// utile de « import en masse » du cahier — préparer cent fiches en une fois,
// puis y attacher les fichiers un à un.

export type ImportRow = {
  title: string;
  subtitle: string;
  authors: string;
  language: string;
  isbn: string;
  edition: string;
  description: string;
  categories: string[];
  keywords: string[];
};

/// Ce qu'une cellule de tableur peut contenir. La bibliotheque n'exporte pas ce
/// type nommement et ses surcharges melangent plusieurs formes ; on le declare
/// donc explicitement et on convertit A LA FRONTIERE, une seule fois.
type SheetCell = string | number | boolean | Date | null;

/// Ramene une cellule a du texte.
function cellToText(cell: SheetCell): string {
  if (cell === null || cell === undefined) return '';
  if (cell instanceof Date) return cell.toISOString().slice(0, 10);
  return String(cell);
}

const HEADERS = [
  'titre', 'sous-titre', 'auteurs', 'langue', 'isbn', 'edition', 'description',
  'categories', 'mots-cles',
] as const;

/// Modèle proposé au téléchargement : la première ligne EST le contrat.
export const TEMPLATE_HEADERS = HEADERS;

/// Le separateur de LISTE est l'autre caractere que celui qui separe les
/// CHAMPS. Traiter « , » et « ; » comme delimiteurs a la fois eclatait
/// « Spiritualite;Leadership » sur deux colonnes.
const listWith = (separator: string) => (value: string) =>
  value.split(separator).map((v) => v.trim()).filter(Boolean);

/// Delimiteur de champs, deduit de la ligne d'en-tete : c'est la seule ligne
/// dont on connaisse le nombre exact de colonnes.
export function detectDelimiter(headerLine: string): ',' | ';' {
  const commas = (headerLine.match(/,/g) ?? []).length;
  const semis = (headerLine.match(/;/g) ?? []).length;
  return semis > commas ? ';' : ',';
}

function toRow(cells: string[], splitList: (value: string) => string[]): ImportRow | null {
  const [title, subtitle, authors, language, isbn, edition, description, categories, keywords] =
    cells.map((c) => (c ?? '').trim());
  if (!title || !authors) return null;
  return {
    title, subtitle, authors,
    language: (language || 'fr').slice(0, 2).toLowerCase(),
    isbn, edition, description,
    categories: splitList(categories ?? ''), keywords: splitList(keywords ?? ''),
  };
}

/// Analyse un CSV en tenant compte des guillemets : une description contenant
/// une virgule est courante et ne doit pas décaler toutes les colonnes.
export function parseCsv(text: string): ImportRow[] {
  const delimiter = detectDelimiter(text.split('\n', 1)[0] ?? '');
  const splitList = listWith(delimiter === ',' ? ';' : ',');
  const rows: string[][] = [];
  let cell = '';
  let row: string[] = [];
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
      continue;
    }
    if (char === '"') { quoted = true; continue; }
    if (char === delimiter) { row.push(cell); cell = ''; continue; }
    if (char === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; continue; }
    if (char !== '\r') cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }

  return rows.slice(1)
    .map((cells) => toRow(cells, splitList))
    .filter((r): r is ImportRow => r !== null);
}

export async function parseImportFile(file: File): Promise<ImportRow[]> {
  if (file.name.toLowerCase().endsWith('.csv')) return parseCsv(await file.text());
  const sheet = await readSheet(file);
  return sheet
    .slice(1)
    .map((cells) => toRow((cells as SheetCell[]).map(cellToText), listWith(';')))
    .filter((r): r is ImportRow => r !== null);
}
