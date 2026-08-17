import { describe, expect, it } from 'vitest';
import { rangeOf } from './PeriodPicker.tsx';

describe('rangeOf', () => {
  it('rend une borne de fin EXCLUE, sinon le dernier jour est perdu', () => {
    const span = rangeOf('custom', '2026-03-01', '2026-03-31');
    // Le 31 doit etre inclus dans la lecture, donc la borne va au 1er avril.
    expect(span).toEqual({ from: '2026-03-01', to: '2026-04-01' });
  });

  it('franchit correctement une fin de mois', () => {
    expect(rangeOf('custom', '2026-02-01', '2026-02-28')?.to).toBe('2026-03-01');
  });

  it('franchit correctement une annee bissextile', () => {
    expect(rangeOf('custom', '2028-02-01', '2028-02-29')?.to).toBe('2028-03-01');
  });

  it('accepte un intervalle d un seul jour', () => {
    expect(rangeOf('custom', '2026-03-05', '2026-03-05'))
      .toEqual({ from: '2026-03-05', to: '2026-03-06' });
  });

  it('REFUSE un intervalle inverse plutot que de rendre zero page', () => {
    // Interroger le serveur avec des bornes inversees rendrait 0, que
    // l'editeur lirait comme une absence de lecture et non comme une saisie
    // incoherente.
    expect(rangeOf('custom', '2026-03-31', '2026-03-01')).toBeNull();
  });

  it('REFUSE un intervalle incomplet', () => {
    expect(rangeOf('custom', '2026-03-01', '')).toBeNull();
    expect(rangeOf('custom', '', '2026-03-01')).toBeNull();
  });

  it('les periodes relatives sont bien ordonnees et non vides', () => {
    for (const key of ['day', 'month', 'year'] as const) {
      const span = rangeOf(key, '', '');
      expect(span).not.toBeNull();
      expect(span!.from < span!.to).toBe(true);
    }
  });

  it('la periode « jour » couvre exactement un jour', () => {
    const span = rangeOf('day', '', '')!;
    const days = (Date.parse(span.to) - Date.parse(span.from)) / 86400000;
    expect(days).toBe(1);
  });

  it('la periode « annee » est plus large que « mois »', () => {
    const year = rangeOf('year', '', '')!;
    const month = rangeOf('month', '', '')!;
    expect(year.from < month.from).toBe(true);
  });
});
