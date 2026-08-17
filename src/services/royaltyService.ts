import { supabase } from '../lib/supabase.ts';
import type {
  AnalyticsCountryRow, AnalyticsOverview, AnalyticsTitleRow,
  RoyaltyHistoryRow, RoyaltyStatementLine,
} from '../lib/types.ts';

// Modules E et F. Toutes les RPC filtrent cote serveur sur les editeurs de
// l'appelant : l'interface n'a aucun filtre a poser, et n'en pose aucun — un
// filtre cote client donnerait l'illusion d'un cloisonnement qui n'existerait
// que dans l'affichage.

export async function fetchStatement(
  periodStart: string,
): Promise<RoyaltyStatementLine[]> {
  const { data, error } = await supabase.rpc('publisher_royalty_statement', {
    p_period_start: periodStart,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as RoyaltyStatementLine[];
}

export async function fetchHistory(): Promise<RoyaltyHistoryRow[]> {
  const { data, error } = await supabase.rpc('publisher_royalty_history');
  if (error) throw new Error(error.message);
  return (data ?? []) as RoyaltyHistoryRow[];
}

export async function fetchOverview(
  from: string, to: string,
): Promise<AnalyticsOverview | null> {
  const { data, error } = await supabase.rpc('publisher_analytics_overview', {
    p_from: from, p_to: to,
  });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as AnalyticsOverview[];
  return rows.length > 0 ? rows[0] : null;
}

export async function fetchByTitle(
  from: string, to: string,
): Promise<AnalyticsTitleRow[]> {
  const { data, error } = await supabase.rpc('publisher_analytics_by_title', {
    p_from: from, p_to: to,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as AnalyticsTitleRow[];
}

export async function fetchByCountry(
  from: string, to: string,
): Promise<AnalyticsCountryRow[]> {
  const { data, error } = await supabase.rpc('publisher_analytics_by_country', {
    p_from: from, p_to: to,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as AnalyticsCountryRow[];
}
