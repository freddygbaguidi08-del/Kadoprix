import { supabase } from '@/lib/supabase';
import DealCard, { Deal } from '@/components/DealCard';

export const dynamic = 'force-dynamic';

export default async function Recherche({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? '').trim();
  const { data } = q
    ? await supabase.from('deals').select('*').eq('statut', 'live')
        .ilike('titre', `%${q}%`).order('score_promoz', { ascending: false }).limit(48)
    : { data: [] };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black">Résultats pour « {q} »</h1>
      {data?.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((d) => <DealCard key={d.id} deal={d as Deal} />)}
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-bold">Aucun deal actif pour « {q} » 😕</p>
          <p className="mt-1 text-sm text-slate-500">
            Crée un compte et une alerte : on te préviendra dès qu'une promo tombe.
          </p>
        </div>
      )}
    </div>
  );
}
