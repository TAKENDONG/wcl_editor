// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadBytes, downloadTable } from './downloadTable.ts';
import type { Column, Row } from './exportTable.ts';

// Le CHEMIN DE TELECHARGEMENT, et non le format des fichiers (couvert
// ailleurs). C'est ici que se logeaient les deux defauts qui font echouer un
// export sans le moindre message : une URL liberee trop tot, et un lien absent
// du document.

const columns: Column[] = [
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
];
const rows: Row[] = [{ a: 'x', b: 1 }];

let created: string[] = [];
let revoked: string[] = [];
let clicked: HTMLAnchorElement[] = [];
let attachedAtClick: boolean[] = [];

beforeEach(() => {
  vi.useFakeTimers();
  created = [];
  revoked = [];
  clicked = [];
  attachedAtClick = [];

  let counter = 0;
  URL.createObjectURL = vi.fn(() => {
    const url = `blob:test/${counter++}`;
    created.push(url);
    return url;
  });
  URL.revokeObjectURL = vi.fn((url: string) => { revoked.push(url); });

  // On intercepte le clic pour constater si le lien est DANS le document a cet
  // instant : c'est la condition que Firefox exige.
  HTMLAnchorElement.prototype.click = function click(this: HTMLAnchorElement) {
    clicked.push(this);
    attachedAtClick.push(document.body.contains(this));
  };
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('downloadTable', () => {
  for (const format of ['csv', 'xlsx', 'pdf'] as const) {
    it(`${format} : declenche un telechargement nomme`, () => {
      downloadTable(format, 'mon-export', 'Titre', columns, rows);
      expect(clicked).toHaveLength(1);
      expect(clicked[0].download).toBe(`mon-export.${format}`);
      expect(created).toHaveLength(1);
    });

    it(`${format} : le lien est DANS le document au moment du clic`, () => {
      // Un <a> detache ne declenche rien sur Firefox, et l'export echouait en
      // silence.
      downloadTable(format, 'e', 'T', columns, rows);
      expect(attachedAtClick).toEqual([true]);
    });

    it(`${format} : l'URL n'est PAS liberee dans la meme boucle`, () => {
      // Liberer synchronement annule le telechargement : le lien est active
      // mais la ressource a deja disparu.
      downloadTable(format, 'e', 'T', columns, rows);
      expect(revoked).toEqual([]);
    });

    it(`${format} : l'URL est liberee ensuite, sans fuite`, () => {
      downloadTable(format, 'e', 'T', columns, rows);
      vi.runAllTimers();
      expect(revoked).toEqual(created);
    });
  }

  it('retire le lien du document apres le clic', () => {
    downloadTable('csv', 'e', 'T', columns, rows);
    expect(document.querySelectorAll('a[download]')).toHaveLength(0);
  });

  it('deux exports successifs liberent leurs deux URL', () => {
    downloadTable('csv', 'un', 'T', columns, rows);
    downloadTable('pdf', 'deux', 'T', columns, rows);
    vi.runAllTimers();
    expect(created).toHaveLength(2);
    expect(revoked.sort()).toEqual(created.sort());
  });
});

describe('downloadBytes', () => {
  it('partage le meme chemin que les exports de tableau', () => {
    downloadBytes(new Uint8Array([1, 2, 3]), 'application/pdf', 'recu.pdf');
    expect(clicked[0].download).toBe('recu.pdf');
    expect(attachedAtClick).toEqual([true]);
    expect(revoked).toEqual([]);
    vi.runAllTimers();
    expect(revoked).toEqual(created);
  });
});
