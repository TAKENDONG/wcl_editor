import { describe, expect, it } from 'vitest';
import { composeDate, daysInMonth, splitDate } from './dateParts.ts';

describe('daysInMonth', () => {
  it('connait les mois de 30 et 31 jours', () => {
    expect(daysInMonth(2026, 1)).toBe(31);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it('gere fevrier, annee commune et bissextile', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
  });

  it('gere le siecle : 2000 bissextile, 2100 non', () => {
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(2100, 2)).toBe(28);
  });
});

describe('composeDate', () => {
  it('compose avec deux chiffres partout', () => {
    expect(composeDate(2026, 3, 7)).toBe('2026-03-07');
  });

  it('RAMENE le jour au dernier jour valide du mois', () => {
    // Choisir le 31 en janvier puis passer a fevrier laissait `2026-02-31`,
    // une date que le serveur rejette — ou, pire, reinterprete.
    expect(composeDate(2026, 2, 31)).toBe('2026-02-28');
    expect(composeDate(2028, 2, 31)).toBe('2028-02-29');
    expect(composeDate(2026, 4, 31)).toBe('2026-04-30');
  });

  it('borne un mois hors intervalle', () => {
    expect(composeDate(2026, 0, 5)).toBe('2026-01-05');
    expect(composeDate(2026, 13, 5)).toBe('2026-12-05');
  });

  it('borne un jour hors intervalle', () => {
    expect(composeDate(2026, 5, 0)).toBe('2026-05-01');
    expect(composeDate(2026, 5, 99)).toBe('2026-05-31');
  });

  it('rend toujours une date analysable', () => {
    for (const [y, m, d] of [[2026, 2, 30], [2026, 13, 40], [2028, 2, 29]] as const) {
      const out = composeDate(y, m, d);
      expect(out).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(out))).toBe(false);
    }
  });
});

describe('splitDate', () => {
  it('decoupe une date bien formee', () => {
    expect(splitDate('2026-08-17')).toEqual({ year: 2026, month: 8, day: 17 });
  });

  it('rend null sur une valeur vide ou mal formee', () => {
    // Le composant doit afficher « non renseigne » plutot qu'une date inventee.
    for (const bad of ['', '2026-08', '17/08/2026', 'demain', '2026-8-7']) {
      expect(splitDate(bad)).toBeNull();
    }
  });

  it('fait l aller-retour avec composeDate', () => {
    const parts = splitDate('2028-02-29');
    expect(parts).not.toBeNull();
    expect(composeDate(parts!.year, parts!.month, parts!.day)).toBe('2028-02-29');
  });
});
