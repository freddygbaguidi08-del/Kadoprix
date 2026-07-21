import { supabase } from '@/lib/supabase';
import DealCard, { Deal } from '@/components/DealCard';

export const revalidate = 900;
export const metadata = {
  title: 'Deals du jour — Promoz',
  description: 'Les meilleures promos publiées aujourd’hui, vérifiées et classées par score.',
};

export default async function DealsDuJour() {
  const { data } = await supabase.from('deals_du_jour').select('*').limit(40);
  return (
    <div>
      <h1 className="mb-1 text-2xl font-black">⚡ Deals du jour</h1>
      <p className="mb-4 text-sm text-slate-500">
        {data?.length ?? 0} nouvelles promos aujourd'hui, classées par Score Promoz.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(data ?? []).map((d) => <DealCard key={d.id} deal={d as Deal} />)}
      </div>
    </div>
  );
}
