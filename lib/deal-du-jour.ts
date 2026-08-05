import { supabase } from '@/lib/supabase';

export type DealDuJour = {
  id: number; slug: string; titre: string; image: string | null;
  prix: number; prix_barre: number | null; devise: string;
  pct_reduction: number | null; vues: number; fin: string | null;
  merchants: { nom: string } | null;
} | null;

const champs =
  'id, slug, titre, image, prix, prix_barre, devise, pct_reduction, vues, fin, faux_prix_suspect, merchants(nom)';

export async function getDealDuJour(): Promise<DealDuJour> {
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const { data: manuel } = await supabase.from('deals')
    .select(champs)
    .eq('statut', 'live')
    .eq('deal_du_jour_le', aujourdhui)
    .limit(1)
    .maybeSingle();

  if (manuel) return manuel as any;

  const { data: candidats } = await supabase.from('deals')
    .select(champs)
    .eq('statut', 'live')
    .eq('faux_prix_suspect', false)
    .not('pct_reduction', 'is', null)
    .gte('pct_reduction', 30)
    .not('image', 'is', null)
    .order('pct_reduction', { ascending: false })
    .limit(40);

  const liste = (candidats ?? []) as any[];
  if (!liste.length) return null;

  const scored = liste.map((d) => ({
    d,
    score: Number(d.pct_reduction) + Math.min(Number(d.vues || 0), 50) * 0.3,
  }));
  scored.sort((a, b) => b.score - a.score);

  return scored[0].d as any;
}
