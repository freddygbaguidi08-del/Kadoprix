import DealCard, { type Deal } from './DealCard';
import { historiquesPour } from '@/lib/deals';

export default async function Grille({ deals }: { deals: Deal[] }) {
  const histos = await historiquesPour(deals.map((d) => d.id));
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {deals.map((d) => (
        <DealCard key={d.id} deal={d} histo={histos.get(d.id) ?? []} />
      ))}
    </div>
  );
}
