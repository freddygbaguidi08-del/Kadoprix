import Link from 'next/link';
import { prixFmt } from './DealCard';
import BadgeVues from './BadgeVues';
import type { DealDuJour } from '@/lib/deal-du-jour';

export default function VedetteDealDuJour({ deal }: { deal: DealDuJour }) {
  if (!deal) return null;
  const reduc = deal.pct_reduction;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="rounded-full bg-promo/[0.12] px-3 py-1 text-[11px] font-bold uppercase
                         tracking-[0.05em] text-promo">
          Le deal du jour
        </span>
        {deal.fin && (
          <span className="text-xs text-slate-400">
            jusqu’au {new Date(deal.fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </span>
        )}
      </div>

      <Link href={`/deal/${deal.slug}`}
            className="group flex flex-col gap-4 rounded-xl2 bg-white p-4 shadow-card ring-1
                       ring-line/60 transition hover:shadow-lift sm:flex-row sm:items-center sm:p-5">
        <div className="grid aspect-video w-full shrink-0 place-items-center overflow-hidden
                        rounded-xl bg-canvas sm:aspect-square sm:w-44">
          {deal.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/img?u=${encodeURIComponent(deal.image)}`} alt=""
                 className="h-full w-full object-contain p-2 transition group-hover:scale-[1.03]" />
          ) : <span className="text-4xl text-slate-200">◫</span>}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-extrabold leading-snug sm:text-xl">
            {deal.titre}
          </h2>
          <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
            <span className="tnum font-display text-3xl font-extrabold text-ink">
              {prixFmt(Number(deal.prix), deal.devise)}
            </span>
            {deal.prix_barre && (
              <span className="tnum text-base text-slate-400 line-through">
                {prixFmt(Number(deal.prix_barre), deal.devise)}
              </span>
            )}
            {reduc ? (
              <span className="tnum rounded-lg bg-eco px-2 py-1 text-sm font-bold text-white">
                &minus;{reduc}%
              </span>
            ) : null}
            <BadgeVues vues={deal.vues} className="ml-auto" />
          </div>
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-promo px-5 py-2.5
                           font-display text-sm font-extrabold text-white transition
                           group-hover:brightness-110">
            Voir ce deal
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
        </div>
      </Link>
    </section>
  );
}
