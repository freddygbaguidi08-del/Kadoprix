import { supabase } from '@/lib/supabase';
import Grille from '@/components/Grille';
import type { Deal } from '@/components/DealCard';
import Link from 'next/link';
import CarrouselCategories from '@/components/CarrouselCategories';
import VedetteDealDuJour from '@/components/VedetteDealDuJour';
import BlocAfrique from '@/components/BlocAfrique';
import { getDealDuJour } from '@/lib/deal-du-jour';

export const revalidate = 600;
const SELECT = '*, merchants(nom)';

export default async function Home() {
  const [
    dealJour,
    { data: chauds },
    { data: baisses },
    { data: recents },
    { data: cats },
    { count },
  ] = await Promise.all([
    getDealDuJour(),
    supabase.from('deals').select(SELECT).eq('statut', 'live')
      .order('vues', { ascending: false }).limit(8),
    supabase.from('deals').select(SELECT).eq('statut', 'live')
      .order('score_promoz', { ascending: false }).limit(8),
    supabase.from('deals').select(SELECT).eq('statut', 'live')
      .order('created_at', { ascending: false }).limit(12),
    supabase.from('categories').select('nom, slug').is('parent_id', null).order('ordre'),
    supabase.from('deals').select('id', { count: 'exact', head: true }).eq('statut', 'live'),
  ]);

  const chaudsFiltres = (chauds ?? []).filter((d: any) => d.id !== dealJour?.id).slice(0, 8);

  return (
    <div className="space-y-12">
      {/* Thèse du site, pas un slogan creux */}
      <section className="space-y-4 pt-2">
        <h1 className="max-w-2xl font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-[42px]">
          Une réduction affichée n’est pas toujours{' '}
          <span className="text-promo">une réduction.</span>
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-slate-600">
          On relève le prix de chaque offre tous les jours. Vous voyez tout de suite si
          c’est le meilleur moment d’acheter — ou si le prix barré est gonflé.
        </p>
        {typeof count === 'number' && count > 0 && (
          <p className="tnum text-sm font-semibold text-slate-500">
            {count.toLocaleString('fr-FR')} offres suivies en ce moment
          </p>
        )}
      </section>

      {/* Catégories */}
      <section>
        <CarrouselCategories cats={cats ?? []} />
      </section>

      {/* LE DEAL DU JOUR */}
      <VedetteDealDuJour deal={dealJour} />

      {/* Les mieux notées (score_promoz) */}
      {(baisses?.length ?? 0) > 0 && (
        <section className="space-y-4">
          <header>
            <h2 className="font-display text-xl font-extrabold tracking-tight">Les mieux notées</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Classées par réduction réelle, pas par pourcentage affiché
            </p>
          </header>
          <Grille deals={(baisses ?? []) as Deal[]} />
        </section>
      )}

      {/* Spécial Afrique */}
      <BlocAfrique />

      {/* Les plus consultés */}
      {chaudsFiltres.length > 0 && (
        <section className="space-y-4">
          <header>
            <h2 className="font-display text-xl font-extrabold tracking-tight">Les plus consultés</h2>
            <p className="mt-0.5 text-xs text-slate-500">Ce que regardent les visiteurs en ce moment</p>
          </header>
          <Grille deals={chaudsFiltres as Deal[]} />
        </section>
      )}

      {/* Dernières offres */}
      {(recents?.length ?? 0) > 0 && (
        <section className="space-y-4">
          <header className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-xl font-extrabold tracking-tight">Dernières offres</h2>
            <Link href="/deals-du-jour"
                  className="shrink-0 text-sm font-semibold text-promo hover:underline">
              Tout voir
            </Link>
          </header>
          <Grille deals={(recents ?? []) as Deal[]} />
        </section>
      )}

      {!recents?.length && (
        <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center">
          <p className="font-display text-lg font-bold">Aucune offre pour le moment</p>
          <p className="mt-1 text-sm text-slate-500">Les prochaines arrivent au prochain relevé.</p>
        </div>
      )}
    </div>
  );
}
