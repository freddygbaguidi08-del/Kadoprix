import { supabase } from '@/lib/supabase';
import Grille from '@/components/Grille';
import type { Deal } from '@/components/DealCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 900;

const TRIS = [
  { k: 'pertinence', label: 'Pertinence' },
  { k: 'recents', label: 'Récentes' },
  { k: 'reduction', label: 'Réduction' },
  { k: 'prix', label: 'Prix croissant' },
];

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data } = await supabase.from('categories').select('nom').eq('slug', params.slug).single();
  return data ? { title: `Promotions ${data.nom}` } : {};
}

export default async function Categorie({ params, searchParams }:
  { params: { slug: string }; searchParams: { tri?: string; min?: string } }) {
  const { data: cat } = await supabase.from('categories')
    .select('id, nom, icone').eq('slug', params.slug).single();
  if (!cat) notFound();

  const tri = searchParams.tri ?? 'pertinence';
  const min = searchParams.min ? Number(searchParams.min) : null;

  let q = supabase.from('deals').select('*, merchants(nom)')
    .eq('statut', 'live').eq('categorie_id', cat.id);
  if (min) q = q.gte('pct_reduction', min);

  if (tri === 'recents') q = q.order('created_at', { ascending: false });
  else if (tri === 'reduction') q = q.order('pct_reduction', { ascending: false, nullsFirst: false });
  else if (tri === 'prix') q = q.order('prix', { ascending: true });
  else q = q.order('score_promoz', { ascending: false });

  const { data: deals } = await q.limit(48);
  const lien = (p: Record<string, string | null>) => {
    const s = new URLSearchParams();
    const base = { tri, min: min ? String(min) : null, ...p };
    Object.entries(base).forEach(([k, v]) => v && s.set(k, v));
    const qs = s.toString();
    return qs ? `?${qs}` : '?';
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          Catégorie
        </p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          <span className="mr-2">{cat.icone}</span>{cat.nom}
        </h1>
        <p className="tnum text-sm text-slate-500">
          {deals?.length ?? 0} offre{(deals?.length ?? 0) > 1 ? 's' : ''} en cours
        </p>
      </header>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1
                      [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TRIS.map((t) => (
          <Link key={t.k} href={lien({ tri: t.k })} scroll={false}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  tri === t.k
                    ? 'bg-ink text-white'
                    : 'border border-line bg-white text-slate-600 hover:border-ink/25'
                }`}>
            {t.label}
          </Link>
        ))}
        <span className="w-px shrink-0 bg-line" />
        {[30, 50, 70].map((p) => (
          <Link key={p} href={lien({ min: min === p ? null : String(p) })} scroll={false}
                className={`tnum shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  min === p
                    ? 'bg-promo text-white'
                    : 'border border-line bg-white text-slate-600 hover:border-ink/25'
                }`}>
            &minus;{p}% et +
          </Link>
        ))}
      </div>

      {deals?.length
        ? <Grille deals={deals as Deal[]} />
        : (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-lg font-bold">Aucune offre ne correspond</p>
            <p className="mt-1 text-sm text-slate-500">Essayez d’élargir les filtres.</p>
            <Link href={`/categorie/${params.slug}`}
                  className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
              Réinitialiser
            </Link>
          </div>
        )}
    </div>
  );
}
