import { supabase } from '@/lib/supabase';
import DealCard, { Deal } from '@/components/DealCard';
import Link from 'next/link';

export const revalidate = 600; // ISR : régénérée toutes les 10 min (économie free tier)

export default async function Home() {
  const [{ data: chauds }, { data: recents }, { data: cats }] = await Promise.all([
    supabase.from('deals').select('*').eq('statut', 'live')
      .order('temperature', { ascending: false }).limit(8),
    supabase.from('deals').select('*').eq('statut', 'live')
      .order('created_at', { ascending: false }).limit(12),
    supabase.from('categories').select('nom, slug, icone').is('parent_id', null).order('ordre'),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {(cats ?? []).map((c) => (
          <Link key={c.slug} href={`/categorie/${c.slug}`}
                className="flex min-w-[72px] flex-col items-center gap-1 rounded-xl bg-white p-3 text-xs shadow-sm hover:bg-orange-50">
            <span className="text-2xl">{c.icone}</span>
            <span className="line-clamp-1 text-center">{c.nom.split(' ')[0]}</span>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="mb-3 text-xl font-black">🔥 Les plus chauds</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(chauds ?? []).map((d) => <DealCard key={d.id} deal={d as Deal} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-black">🆕 Derniers deals</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {(recents ?? []).map((d) => <DealCard key={d.id} deal={d as Deal} />)}
        </div>
      </section>
    </div>
  );
}
