import { supabase } from './supabase';
import type { Point } from '@/components/PriceTrend';

// Récupère l'historique de prix de plusieurs deals en UNE requête,
// puis regroupe côté JS. Évite le N+1 sur les grilles.
export async function historiquesPour(dealIds: number[]) {
  const map = new Map<number, Point[]>();
  if (!dealIds.length) return map;

  const depuis = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
  const { data } = await supabase
    .from('price_history')
    .select('deal_id, prix, releve_le')
    .in('deal_id', dealIds)
    .gte('releve_le', depuis)
    .order('releve_le', { ascending: true });

  for (const r of data ?? []) {
    const arr = map.get(r.deal_id) ?? [];
    arr.push({ prix: Number(r.prix), releve_le: r.releve_le });
    map.set(r.deal_id, arr);
  }
  return map;
}
