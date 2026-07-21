import { supabase } from '@/lib/supabase';
import Grille from '@/components/Grille';
import type { Deal } from '@/components/DealCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Recherche' };

export default async function Recherche({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  const { data } = q
    ? await supabase.from('deals').select('*, merchants(nom)').eq('statut', 'live')
        .ilike('titre', `%${q}%`).order('score_promoz', { ascending: false }).limit(48)
    : { data: [] as any[] };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          {q ? <>Résultats pour «&nbsp;{q}&nbsp;»</> : 'Rechercher une offre'}
        </h1>
        {q && (
          <p className="tnum text-sm text-slate-500">
            {data?.length ?? 0} résultat{(data?.length ?? 0) > 1 ? 's' : ''}
          </p>
        )}
      </header>

      {!q && (
        <p className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center
                      text-sm text-slate-500">
          Tapez un produit, une marque ou un magasin dans la barre ci-dessus.
        </p>
      )}

      {q && (data?.length
        ? <Grille deals={data as Deal[]} />
        : (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-lg font-bold">Aucune offre active pour «&nbsp;{q}&nbsp;»</p>
            <p className="mt-1 text-sm text-slate-500">
              Essayez un terme plus court, ou revenez demain : le catalogue change tous les jours.
            </p>
          </div>
        ))}
    </div>
  );
}
