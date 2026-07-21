import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { prixFmt } from '@/components/DealCard';
import Link from 'next/link';

export const revalidate = 600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: d } = await supabase.from('deals')
    .select('titre, pct_reduction').eq('slug', params.slug).single();
  return d ? { title: `${d.titre}${d.pct_reduction ? ` — ${d.pct_reduction}%` : ''}` } : {};
}

export default async function DealPage({ params }: { params: { slug: string } }) {
  const { data: d } = await supabase.from('deals')
    .select('*, merchants(nom, fiabilite_score)')
    .eq('slug', params.slug).single();
  if (!d) notFound();

  const { data: histo } = await supabase.from('price_history')
    .select('prix, releve_le').eq('deal_id', d.id)
    .order('releve_le', { ascending: true }).limit(90);

  const pts = (histo ?? []).map((h: any) => Number(h.prix));
  const min = pts.length ? Math.min(...pts) : null;
  const max = pts.length ? Math.max(...pts) : null;
  const auPlusBas = min !== null && Number(d.prix) <= min;
  const expire = d.fin ? new Date(d.fin) : null;

  // Courbe large, générée en SVG
  let courbe = null;
  if (pts.length >= 5 && min !== null && max !== null) {
    const W = 600, H = 120, span = (max - min) || 1, pas = W / (pts.length - 1);
    const xy = pts.map((v, i) => [i * pas, H - ((v - min) / span) * H] as const);
    const dPath = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    courbe = { dPath, aire: `${dPath} L${W},${H} L0,${H} Z`, W, H,
               yNow: H - ((Number(d.prix) - min) / span) * H };
  }

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product',
    name: d.titre, image: d.image ?? undefined,
    offers: {
      '@type': 'Offer', price: d.prix, priceCurrency: d.devise,
      availability: 'https://schema.org/InStock',
      url: `https://kadoprix.vercel.app/deal/${d.slug}`,
    },
  };

  return (
    <article className="mx-auto max-w-3xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="overflow-hidden rounded-xl2 bg-white p-6 shadow-card ring-1 ring-line/60">
          {d.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/img?u=${encodeURIComponent(d.image)}`} alt=""
                 className="mx-auto max-h-64 w-full object-contain" />
          ) : <div className="flex h-56 items-center justify-center text-4xl text-slate-200">◫</div>}
        </div>

        <div className="space-y-4">
          {(d as any).merchants?.nom && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              {(d as any).merchants.nom}
            </p>
          )}
          <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight">
            {d.titre}
          </h1>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="tnum font-display text-4xl font-extrabold tracking-tight text-ink">
              {prixFmt(Number(d.prix), d.devise)}
            </span>
            {d.prix_barre && (
              <span className="tnum text-lg text-slate-400 line-through">
                {prixFmt(Number(d.prix_barre), d.devise)}
              </span>
            )}
            {d.pct_reduction ? (
              <span className="tnum rounded-lg bg-promo px-2 py-1 text-sm font-bold text-white">
                &minus;{d.pct_reduction}%
              </span>
            ) : null}
          </div>

          {d.faux_prix_suspect && (
            <div className="rounded-xl2 border border-warn/25 bg-warn/[0.06] p-3">
              <p className="text-sm font-semibold text-warn">Prix de référence douteux</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                Le prix barré annoncé dépasse nettement le prix habituellement relevé sur
                les trois derniers mois.
              </p>
            </div>
          )}

          {auPlusBas && !d.faux_prix_suspect && (
            <div className="rounded-xl2 border border-eco/25 bg-eco/[0.06] p-3">
              <p className="text-sm font-semibold text-eco">Au plus bas depuis 3 mois</p>
              <p className="mt-1 text-[13px] text-slate-600">
                Nous n’avons jamais relevé ce produit moins cher.
              </p>
            </div>
          )}

          {d.code_promo && (
            <div className="rounded-xl2 border border-dashed border-ink/25 bg-white p-3 text-center">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Code promo</p>
              <p className="tnum select-all font-display text-xl font-extrabold tracking-[0.15em]">
                {d.code_promo}
              </p>
            </div>
          )}

          {expire && (
            <p className="text-sm text-slate-500">
              Se termine le {expire.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </p>
          )}

          <a href={`/api/out/${d.id}`} rel="nofollow sponsored"
             className="hidden w-full rounded-full bg-promo py-3.5 text-center font-display
                        text-base font-extrabold text-white transition hover:brightness-110 sm:block">
            Voir l’offre chez le marchand
          </a>
        </div>
      </div>

      {courbe && (
        <section className="mt-8 rounded-xl2 bg-white p-5 shadow-card ring-1 ring-line/60">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-base font-extrabold">Évolution du prix</h2>
            <p className="tnum text-xs text-slate-500">{pts.length} relevés sur 90 jours</p>
          </div>
          <div className={auPlusBas ? 'text-eco' : 'text-slate-400'}>
            <svg viewBox={`0 0 ${courbe.W} ${courbe.H}`} className="h-28 w-full" role="img"
                 aria-label={`Prix minimum relevé ${min} ${d.devise}, maximum ${max} ${d.devise}`}>
              <path d={courbe.aire} fill="currentColor" opacity="0.10" />
              <path d={courbe.dPath} fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={courbe.W} cy={courbe.yNow} r="4" fill="currentColor" />
            </svg>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line/70 pt-4 text-center">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Plus bas</dt>
              <dd className="tnum font-display text-base font-extrabold text-eco">
                {prixFmt(min!, d.devise)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Actuel</dt>
              <dd className="tnum font-display text-base font-extrabold">
                {prixFmt(Number(d.prix), d.devise)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-slate-400">Plus haut</dt>
              <dd className="tnum font-display text-base font-extrabold text-slate-500">
                {prixFmt(max!, d.devise)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {d.description && (
        <p className="mt-6 text-[15px] leading-relaxed text-slate-600">{d.description}</p>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        Lien affilié — le prix payé reste identique.{' '}
        <Link href="/a-propos" className="underline">En savoir plus</Link>
      </p>

      {/* CTA collant sur mobile */}
      <div className="fixed inset-x-0 bottom-0 z-[55] border-t border-line bg-white/95 p-3
                      backdrop-blur-md sm:hidden">
        <a href={`/api/out/${d.id}`} rel="nofollow sponsored"
           className="block w-full rounded-full bg-promo py-3.5 text-center font-display
                      text-base font-extrabold text-white">
          Voir l’offre &middot; {prixFmt(Number(d.prix), d.devise)}
        </a>
      </div>
      <div className="h-20 sm:hidden" />
    </article>
  );
}
