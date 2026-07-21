import Link from 'next/link';
import { Sparkline, verdict, type Point } from './PriceTrend';

export type Deal = {
  id: number; slug: string; titre: string; image: string | null;
  prix: number; prix_barre: number | null; devise: string;
  pct_reduction: number | null; temperature: number;
  score_promoz: number; faux_prix_suspect: boolean;
  code_promo: string | null; fin: string | null;
  merchants?: { nom: string } | null;
};

export const prixFmt = (n: number, devise: string) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise || 'EUR',
    maximumFractionDigits: devise === 'XOF' ? 0 : 2,
  }).format(n);

const tons = {
  eco: 'text-eco',
  warn: 'text-warn',
  muted: 'text-slate-400',
} as const;

export default function DealCard({
  deal, histo = [],
}: { deal: Deal; histo?: Point[] }) {
  const v = verdict(Number(deal.prix), histo, deal.faux_prix_suspect);
  const expire = deal.fin ? new Date(deal.fin) : null;
  const joursRestants = expire
    ? Math.ceil((expire.getTime() - Date.now()) / 864e5)
    : null;

  return (
    <Link
      href={`/deal/${deal.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl2 bg-white shadow-card
                 ring-1 ring-line/60 transition-all duration-200
                 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        {deal.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/img?u=${encodeURIComponent(deal.image)}`}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain p-4 transition-transform duration-300
                       group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-200">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.6 7.4 12 3 3.4 7.4 12 12l8.6-4.6ZM3.4 7.4v9.2L12 21m0-9v9m8.6-13.6v9.2L12 21" />
            </svg>
          </div>
        )}

        {deal.pct_reduction ? (
          <span className="tnum absolute right-3 top-3 rounded-lg bg-ink/90 px-2 py-1
                           text-xs font-bold text-white backdrop-blur-sm">
            &minus;{deal.pct_reduction}%
          </span>
        ) : null}

        {joursRestants !== null && joursRestants <= 3 && joursRestants >= 0 && (
          <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2 py-1
                           text-[11px] font-semibold text-warn shadow-sm">
            {joursRestants === 0 ? 'Dernier jour' : `${joursRestants} j restants`}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-line/60 p-3.5">
        {deal.merchants?.nom && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {deal.merchants.nom}
          </p>
        )}

        <h3 className="line-clamp-2 text-[13.5px] font-medium leading-snug text-ink">
          {deal.titre}
        </h3>

        <div className="mt-auto space-y-2 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="tnum font-display text-xl font-extrabold tracking-tight text-ink">
              {prixFmt(Number(deal.prix), deal.devise)}
            </span>
            {deal.prix_barre && (
              <span className="tnum text-xs text-slate-400 line-through">
                {prixFmt(Number(deal.prix_barre), deal.devise)}
              </span>
            )}
          </div>

          {v && (
            <div className={`flex items-center justify-between gap-2 ${tons[v.ton]}`}>
              <span className="text-[11px] font-semibold leading-tight">{v.texte}</span>
              <Sparkline points={histo} prix={Number(deal.prix)} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
