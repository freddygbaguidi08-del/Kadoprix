import Link from 'next/link';

export type Deal = {
  id: number; slug: string; titre: string; image: string | null;
  prix: number; prix_barre: number | null; devise: string;
  pct_reduction: number | null; temperature: number;
  score_promoz: number; faux_prix_suspect: boolean;
  code_promo: string | null; fin: string | null;
};

const fmt = (n: number, devise: string) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise === 'XOF' ? 'XOF' : devise }).format(n);

export default function DealCard({ deal }: { deal: Deal }) {
  return (
    <Link
      href={`/deal/${deal.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md"
    >
      <div className="relative aspect-square bg-white p-3">
        {deal.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={deal.image} alt={deal.titre} loading="lazy"
               className="h-full w-full object-contain transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🏷️</div>
        )}
        {deal.pct_reduction ? (
          <span className="absolute left-2 top-2 rounded-full bg-promo px-2 py-1 text-xs font-black text-white">
            -{deal.pct_reduction}%
          </span>
        ) : null}
        {deal.faux_prix_suspect && (
          <span className="absolute right-2 top-2 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
            ⚠️ prix de réf. douteux
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-medium">{deal.titre}</p>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg font-black text-eco">{fmt(deal.prix, deal.devise)}</span>
          {deal.prix_barre && (
            <span className="text-xs text-slate-400 line-through">{fmt(deal.prix_barre, deal.devise)}</span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className={deal.temperature >= 100 ? 'font-bold text-promo' : ''}>🌡️ {deal.temperature}°</span>
          <span>Score {deal.score_promoz}/100</span>
        </div>
      </div>
    </Link>
  );
}
