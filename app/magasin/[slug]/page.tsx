import { supabase } from '@/lib/supabase';
import Grille from '@/components/Grille';
import type { Deal } from '@/components/DealCard';
import { filAriane, listeOffres, Jsonld } from '@/lib/seo';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: m } = await supabase.from('merchants').select('id, nom').eq('slug', params.slug).single();
  if (!m) return {};
  const { count } = await supabase.from('deals')
    .select('id', { count: 'exact', head: true }).eq('statut', 'live').eq('merchant_id', m.id);
  const n = count ?? 0;
  const titre = n > 0 ? `Promos ${m.nom} — ${n} offre${n > 1 ? 's' : ''} en cours` : `Promos ${m.nom}`;
  return {
    title: titre,
    description: `Toutes les promotions ${m.nom} rep\u00e9r\u00e9es par Kado Prix, avec historique de prix et v\u00e9rification des r\u00e9ductions.`,
    alternates: { canonical: `/magasin/${params.slug}` },
  };
}

export default async function Magasin({ params }: { params: { slug: string } }) {
  const { data: m } = await supabase.from('merchants')
    .select('id, nom, url, pays').eq('slug', params.slug).single();
  if (!m) notFound();

  const { data: deals } = await supabase.from('deals')
    .select('*, merchants(nom)').eq('statut', 'live').eq('merchant_id', m.id)
    .order('score_promoz', { ascending: false }).limit(48);

  // Garde-fou : un marchand sans offre live n'a pas de page indexable
  if (!deals?.length) notFound();

  return (
    <div className="space-y-6">
      <Jsonld data={[
        filAriane([{ nom: 'Accueil', url: '/' }, { nom: m.nom, url: `/magasin/${params.slug}` }]),
        listeOffres(deals),
      ]} />
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Marchand</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{m.nom}</h1>
        <p className="tnum text-sm text-slate-500">
          {deals.length} offre{deals.length > 1 ? 's' : ''} en cours
        </p>
      </header>
      <Grille deals={deals as Deal[]} />
    </div>
  );
}
