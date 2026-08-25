import { describe, expect, it } from 'vitest';
import {
  boundedPeriod, FIRST_YEAR, isMonthUnavailable, selectableYears,
} from './monthRange.ts';

describe('boundedPeriod', () => {
  it('compose AAAA-MM avec un mois sur deux chiffres', () => {
    expect(boundedPeriod(2026, 3, '2027-12')).toBe('2026-03');
  });

  it('borne au mois maximal DANS l annee maximale', () => {
    // Demander decembre 2026 alors que la borne est aout 2026 renverrait un
    // releve inexistant, que l'editeur lirait comme une perte de donnees.
    expect(boundedPeriod(2026, 12, '2026-08')).toBe('2026-08');
  });

  it('ne borne PAS les mois d une annee anterieure', () => {
    expect(boundedPeriod(2026, 12, '2027-03')).toBe('2026-12');
  });

  it('accepte exactement le mois de la borne', () => {
    expect(boundedPeriod(2026, 8, '2026-08')).toBe('2026-08');
  });

  it('ramene une annee future a l annee maximale', () => {
    expect(boundedPeriod(2099, 5, '2026-08')).toBe('2026-05');
  });

  it('ramene une annee trop ancienne a la premiere annee', () => {
    expect(boundedPeriod(1990, 5, '2027-12')).toBe(`${FIRST_YEAR}-05`);
  });

  it('borne un mois hors intervalle', () => {
    expect(boundedPeriod(2026, 0, '2027-12')).toBe('2026-01');
    expect(boundedPeriod(2026, 13, '2027-12')).toBe('2026-12');
  });

  it('rend toujours une valeur analysable par le serveur', () => {
    for (const [y, m] of [[2026, 1], [2030, 12], [1900, 7]] as const) {
      expect(boundedPeriod(y, m, '2030-06')).toMatch(/^\d{4}-\d{2}$/);
    }
  });
});

describe('selectableYears', () => {
  it('va de la premiere annee a celle de la borne', () => {
    expect(selectableYears('2028-01')).toEqual([2026, 2027, 2028]);
  });

  it('rend au moins une annee, meme si la borne precede le lancement', () => {
    expect(selectableYears('2020-01')).toEqual([FIRST_YEAR]);
  });
});

describe('isMonthUnavailable', () => {
  it('un mois futur de l annee maximale est indisponible', () => {
    expect(isMonthUnavailable(2026, 9, '2026-08')).toBe(true);
  });

  it('le mois de la borne reste disponible', () => {
    expect(isMonthUnavailable(2026, 8, '2026-08')).toBe(false);
  });

  it('aucun mois n est bloque sur une annee anterieure', () => {
    expect(isMonthUnavailable(2026, 12, '2027-01')).toBe(false);
  });
});
