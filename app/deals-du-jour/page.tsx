import { supabase } from '@/lib/supabase';
import Grille from '@/components/Grille';
import type { Deal } from '@/components/DealCard';

export const revalidate = 900;
export const metadata = {
  title: 'Deals du jour',
  description: 'Les offres publiées aujourd’hui, classées par qualité de réduction réelle.',
};

export default async function DealsDuJour() {
  const { data } = await supabase.from('deals')
    .select('*, merchants(nom)').eq('statut', 'live')
    .gte('created_at', new Date().toISOString().slice(0, 10))
    .order('score_promoz', { ascending: false }).limit(48);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          Deals du jour
        </h1>
        <p className="tnum text-sm text-slate-500">
          {data?.length ?? 0} offre{(data?.length ?? 0) > 1 ? 's' : ''} publiée
          {(data?.length ?? 0) > 1 ? 's' : ''} aujourd’hui
        </p>
      </header>

      {data?.length
        ? <Grille deals={data as Deal[]} />
        : (
          <div className="rounded-xl2 border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-lg font-bold">Rien de neuf aujourd’hui</p>
            <p className="mt-1 text-sm text-slate-500">Le prochain relevé arrive dans la nuit.</p>
          </div>
        )}
    </div>
  );
}
