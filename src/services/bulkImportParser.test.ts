import { describe, expect, it } from 'vitest';
import { detectDelimiter, parseCsv, TEMPLATE_HEADERS } from './bulkImportParser.ts';

const header = TEMPLATE_HEADERS.join(';');

describe('detectDelimiter', () => {
  it('reconnait le point-virgule, celui qu Excel FR produit', () => {
    expect(detectDelimiter('titre;auteurs;langue')).toBe(';');
  });

  it('reconnait la virgule', () => {
    expect(detectDelimiter('titre,auteurs,langue')).toBe(',');
  });

  it('tranche sur l en-tete, pas sur une ligne de donnees', () => {
    // Un titre contenant des virgules ne doit pas faire basculer le choix.
    expect(detectDelimiter('titre;auteurs')).toBe(';');
  });
});

describe('parseCsv', () => {
  it('lit une ligne complete', () => {
    const rows = parseCsv(`${header}\nLe Chemin;Sous-titre;Zach;fr;123;2e;Desc;A;B`);
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe('Le Chemin');
    expect(rows[0].authors).toBe('Zach');
  });

  it('SEPARE LES LISTES avec l autre caractere que le delimiteur', () => {
    // Le defaut historique : « , » et « ; » traites tous deux comme
    // delimiteurs eclataient « Spiritualite,Leadership » sur deux colonnes.
    const rows = parseCsv(`${header}\nT;;A;fr;;;;Spiritualité,Leadership;m1,m2`);
    expect(rows[0].categories).toEqual(['Spiritualité', 'Leadership']);
    expect(rows[0].keywords).toEqual(['m1', 'm2']);
  });

  it('respecte les guillemets : une description a virgules ne decale rien', () => {
    const csv = `${TEMPLATE_HEADERS.join(',')}\n`
      + 'T,,A,fr,,,"Un, deux, trois",Cat,mot';
    const rows = parseCsv(csv);
    expect(rows[0].description).toBe('Un, deux, trois');
    expect(rows[0].categories).toEqual(['Cat']);
  });

  it('double guillemet echappe a l interieur d un champ', () => {
    const csv = `${TEMPLATE_HEADERS.join(',')}\nT,,A,fr,,,"Le ""Chemin""",,`;
    expect(parseCsv(csv)[0].description).toBe('Le "Chemin"');
  });

  it('ecarte une ligne sans titre ou sans auteur', () => {
    const rows = parseCsv(`${header}\n;;;fr;;;;;\nT;;A;fr;;;;;\n;;A;fr;;;;;`);
    expect(rows).toHaveLength(1);
  });

  it('applique « fr » par defaut et normalise la langue', () => {
    const rows = parseCsv(`${header}\nT;;A;;;;;;\nU;;A;FRA;;;;;`);
    expect(rows[0].language).toBe('fr');
    expect(rows[1].language).toBe('fr');
  });

  it('tolere les fins de ligne Windows', () => {
    const rows = parseCsv(`${header}\r\nT;;A;fr;;;;;\r\n`);
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe('T');
  });

  it('ignore les lignes vides en fin de fichier', () => {
    expect(parseCsv(`${header}\nT;;A;fr;;;;;\n\n\n`)).toHaveLength(1);
  });

  it('rend une liste vide, jamais [""], quand la cellule est vide', () => {
    expect(parseCsv(`${header}\nT;;A;fr;;;;;`)[0].categories).toEqual([]);
  });

  it('elague les espaces autour des valeurs', () => {
    expect(parseCsv(`${header}\n  T  ;;  A  ;fr;;;;;`)[0].title).toBe('T');
  });
});
