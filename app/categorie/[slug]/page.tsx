import { supabase } from '@/lib/supabase';
import Grille from '@/components/Grille';
import type { Deal } from '@/components/DealCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { filAriane, listeOffres, Jsonld } from '@/lib/seo';
import { MIN_OFFRES_INDEXABLE } from '@/lib/seo-config';
import IconeCategorie from '@/components/IconeCategorie';

export const revalidate = 900;

const TRIS = [
  { k: 'pertinence', label: 'Pertinence' },
  { k: 'recents', label: 'Récentes' },
  { k: 'reduction', label: 'Réduction' },
  { k: 'prix', label: 'Prix croissant' },
];

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: cat } = await supabase.from('categories').select('id, nom, parent_id').eq('slug', params.slug).single();
  if (!cat) return {};

  // Une catégorie mère inclut ses sous-catégories dans le décompte
  const ids = [cat.id];
  if (cat.parent_id === null) {
    const { data: enfants } = await supabase.from('categories').select('id').eq('parent_id', cat.id);
    (enfants ?? []).forEach((e) => ids.push(e.id));
  }
  const { count } = await supabase.from('deals')
    .select('id', { count: 'exact', head: true })
    .eq('statut', 'live').in('categorie_id', ids);
  const n = count ?? 0;

  const titre = n > 0
    ? `Promotions ${cat.nom} \u2014 ${n} offre${n > 1 ? 's' : ''} v\u00e9rifi\u00e9e${n > 1 ? 's' : ''}`
    : `Promotions ${cat.nom}`;
  return {
    title: titre,
    description: `Toutes les promotions ${cat.nom} du moment, avec historique de prix et d\u00e9tection des fausses r\u00e9ductions. Mis \u00e0 jour chaque jour.`,
    alternates: { canonical: `/categorie/${params.slug}` },
    openGraph: { title: titre, type: 'website' },
    robots: n < MIN_OFFRES_INDEXABLE ? { index: false, follow: true } : undefined,
  };
}

export default async function Categorie({ params, searchParams }:
  { params: { slug: string }; searchParams: { tri?: string; min?: string } }) {
  const { data: cat } = await supabase.from('categories')
    .select('id, nom, parent_id').eq('slug', params.slug).single();
  if (!cat) notFound();

  const tri = searchParams.tri ?? 'pertinence';
  const min = searchParams.min ? Number(searchParams.min) : null;

  // Sous-catégories : si on est sur une mère, on récupère ses enfants.
  // Si on est sur une sous-catégorie, on récupère ses "sœurs" pour naviguer.
  const parentId = cat.parent_id ?? cat.id;
  const { data: soeurs } = await supabase.from('categories')
    .select('id, nom, slug').eq('parent_id', parentId).order('ordre');

  // Le parent (pour le fil d'ariane et l'onglet "Tout")
  let parent = cat;
  if (cat.parent_id) {
    const { data: p } = await supabase.from('categories')
      .select('id, nom, slug').eq('id', cat.parent_id).single();
    if (p) parent = p as any;
  }

  // Deals : sur une mère, on inclut les enfants ; sur une sous-cat, seulement elle.
  const ids = [cat.id];
  if (cat.parent_id === null) (soeurs ?? []).forEach((e) => ids.push(e.id));

  let q = supabase.from('deals').select('*, merchants(nom)')
    .eq('statut', 'live').in('categorie_id', ids);
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

  const surSousCategorie = cat.parent_id !== null;

  return (
    <div className="space-y-6">
      <Jsonld data={[
        filAriane(
          surSousCategorie
            ? [{ nom: 'Accueil', url: '/' },
               { nom: parent.nom, url: `/categorie/${(parent as any).slug}` },
               { nom: cat.nom, url: `/categorie/${params.slug}` }]
            : [{ nom: 'Accueil', url: '/' }, { nom: cat.nom, url: `/categorie/${params.slug}` }]
        ),
        ...(deals?.length ? [listeOffres(deals)] : []),
      ]} />

      <header className="space-y-2">
        {surSousCategorie && (
          <Link href={`/categorie/${(parent as any).slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-ink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6" />
            </svg>
            {parent.nom}
          </Link>
        )}
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          <IconeCategorie slug={surSousCategorie ? (parent as any).slug : params.slug}
                          className="h-7 w-7 shrink-0 text-promo" />
          {cat.nom}
        </h1>
        <p className="tnum text-sm text-slate-500">
          {deals?.length ?? 0} offre{(deals?.length ?? 0) > 1 ? 's' : ''} en cours
        </p>
      </header>

      {/* Onglets de sous-catégories */}
      {(soeurs?.length ?? 0) > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1
                        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href={`/categorie/${(parent as any).slug}`} scroll={false}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  !surSousCategorie
                    ? 'bg-ink text-white'
                    : 'border border-line bg-white text-slate-600 hover:border-ink/25'
                }`}>
            Tout
          </Link>
          {(soeurs ?? []).map((sc) => (
            <Link key={sc.id} href={`/categorie/${sc.slug}`} scroll={false}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                    sc.slug === params.slug
                      ? 'bg-ink text-white'
                      : 'border border-line bg-white text-slate-600 hover:border-ink/25'
                  }`}>
              {sc.nom}
            </Link>
          ))}
        </div>
      )}

      {/* Tris + filtre réduction */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1
                      [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TRIS.map((t) => (
          <Link key={t.k} href={lien({ tri: t.k })} scroll={false}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  tri === t.k
                    ? 'bg-promo text-white'
                    : 'border border-line bg-white text-slate-600 hover:border-ink/25'
                }`}>
            {t.label}
          </Link>
        ))}
        <span className="w-px shrink-0 bg-line" />
        {[30, 50, 70].map((p) => (
          <Link key={p} href={lien({ min: min === p ? null : String(p) })} scroll={false}
                className={`tnum shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                  min === p ? 'bg-eco text-white'
                            : 'border border-line bg-white text-slate-600 hover:border-ink/25'
                }`}>
            &minus;{p}%
          </Link>
        ))}
      </div>

      {deals?.length
        ? <Grille deals={deals as Deal[]} />
        : (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-lg font-bold">Aucune offre ici pour l&apos;instant</p>
            <p className="mt-1 text-sm text-slate-500">Reviens bientôt, le catalogue change chaque jour.</p>
            <Link href={`/categorie/${(parent as any).slug}`}
                  className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
              Voir toute la catégorie
            </Link>
          </div>
        )}
    </div>
  );
}
