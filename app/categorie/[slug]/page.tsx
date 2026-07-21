import { supabase } from '@/lib/supabase';
import DealCard, { Deal } from '@/components/DealCard';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function Categorie({ params, searchParams }:
  { params: { slug: string }; searchParams: { tri?: string; min?: string } }) {
  const { data: cat } = await supabase.from('categories')
    .select('id, nom').eq('slug', params.slug).single();
  if (!cat) notFound();

  let q = supabase.from('deals').select('*').eq('statut', 'live').eq('categorie_id', cat.id);
  if (searchParams.min) q = q.gte('pct_reduction', Number(searchParams.min));
  const tri = searchParams.tri ?? 'chauds';
  if (tri === 'recents') q = q.order('created_at', { ascending: false });
  else if (tri === 'reduction') q = q.order('pct_reduction', { ascending: false, nullsFirst: false });
  else q = q.order('temperature', { ascending: false });

  const { data: deals } = await q.limit(48);

  return (
    <div>
      <h1 className="mb-3 text-2xl font-black">{cat.nom}</h1>
      <div className="mb-4 flex gap-2 text-sm">
        {[['chauds', '🔥 Plus chauds'], ['recents', '🆕 Récents'], ['reduction', '💥 Réduction']].map(([k, label]) => (
          <a key={k} href={`?tri=${k}`}
             className={`rounded-full px-3 py-1 ${tri === k ? 'bg-promo text-white' : 'bg-white ring-1 ring-slate-200'}`}>
            {label}
          </a>
        ))}
        <a href="?min=50" className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">-50% et +</a>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(deals ?? []).map((d) => <DealCard key={d.id} deal={d as Deal} />)}
      </div>
    </div>
  );
}
