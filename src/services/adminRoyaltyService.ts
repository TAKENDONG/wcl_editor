import { supabase } from '../lib/supabase.ts';
import type { AdminPeriodRow, ConcentrationRow } from '../lib/types.ts';

// Pilotage des periodes, reserve aux administrateurs WCL. Les RPC levent
// 'forbidden' cote serveur ; l'interface ne fait que le refleter.

export async function fetchPeriods(): Promise<AdminPeriodRow[]> {
  const { data, error } = await supabase.rpc('admin_royalty_periods', { p_limit: 24 });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminPeriodRow[];
}

export async function fetchConcentration(
  periodStart: string,
): Promise<ConcentrationRow[]> {
  const { data, error } = await supabase.rpc('admin_royalty_concentration', {
    p_period_start: periodStart,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as ConcentrationRow[];
}

/// Calcule une periode. `consolidate: false` est un calcul A BLANC : il permet
/// de constater les chiffres avant de les figer, et c'est le mode a utiliser
/// tant que la periode n'est pas close.
export async function closePeriod(
  periodStart: string,
  consolidate: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('royalty_close_period', {
    p_period_start: periodStart,
    p_consolidate: consolidate,
  });
  if (error) throw new Error(error.message);
}

export async function preparePayouts(periodStart: string): Promise<number> {
  const { data, error } = await supabase.rpc('payout_prepare_period', {
    p_period_start: periodStart,
  });
  if (error) throw new Error(error.message);
  return Number(data ?? 0);
}
