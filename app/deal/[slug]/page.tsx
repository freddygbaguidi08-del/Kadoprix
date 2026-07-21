import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const revalidate = 600;

const fmt = (n: number, devise: string) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise === 'XOF' ? 'XOF' : devise }).format(n);

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: d } = await supabase.from('deals').select('titre, pct_reduction').eq('slug', params.slug).single();
  return d ? { title: `${d.titre} (-${d.pct_reduction ?? 0}%) — Kado Prix` } : {};
}

export default async function DealPage({ params }: { params: { slug: string } }) {
  const { data: d } = await supabase.from('deals')
    .select('*, merchants(nom, fiabilite_score)')
    .eq('slug', params.slug).single();
  if (!d) notFound();

  const { data: histo } = await supabase.from('price_history')
    .select('prix, releve_le').eq('deal_id', d.id)
    .order('releve_le', { ascending: true }).limit(90);

  const prixMin = histo?.length ? Math.min(...histo.map((h: any) => Number(h.prix))) : null;
  const expire = d.fin ? new Date(d.fin) : null;

  // Données structurées schema.org => rich snippets Google (prix affiché en SERP)
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
    <article className="mx-auto max-w-2xl space-y-5">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        {d.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={d.image} alt={d.titre} referrerPolicy="no-referrer"
               className="mx-auto max-h-72 object-contain" />
        )}
      </div>

      <div className="space-y-2">
        {d.pct_reduction ? (
          <span className="inline-block rounded-full bg-promo px-3 py-1 text-sm font-black text-white">
            -{d.pct_reduction}%
          </span>
        ) : null}
        {d.faux_prix_suspect && (
          <span className="ml-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
            ⚠️ Prix de référence supérieur à la médiane des 90 derniers jours
          </span>
        )}
        <h1 className="text-2xl font-black leading-tight">{d.titre}</h1>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-eco">{fmt(d.prix, d.devise)}</span>
          {d.prix_barre && <span className="text-lg text-slate-400 line-through">{fmt(d.prix_barre, d.devise)}</span>}
        </div>
        {prixMin !== null && (
          <p className="text-sm text-slate-500">
            📉 Prix le plus bas observé : <b>{fmt(prixMin, d.devise)}</b> ({histo!.length} relevés)
            {Number(d.prix) <= prixMin ? ' — c’est le bon moment ✅' : ''}
          </p>
        )}
        {expire && (
          <p className="text-sm font-semibold text-red-600">
            ⏰ Expire le {expire.toLocaleDateString('fr-FR')}
          </p>
        )}
        <p className="text-sm text-slate-500">
          Chez <b>{(d as any).merchants?.nom ?? 'le marchand'}</b> · fiabilité {(d as any).merchants?.fiabilite_score ?? '—'}/10
          · 🌡️ {d.temperature}° · Score Kado <b>{d.score_promoz}/100</b>
        </p>
      </div>

      {d.code_promo && (
        <div className="rounded-xl border-2 border-dashed border-promo bg-orange-50 p-3 text-center">
          <span className="text-xs text-slate-500">Code promo</span>
          <p className="select-all text-xl font-black tracking-widest">{d.code_promo}</p>
        </div>
      )}

      {d.description && <p className="text-sm leading-relaxed text-slate-600">{d.description}</p>}

      <a href={`/api/out/${d.id}`} rel="nofollow sponsored"
         className="fixed inset-x-4 bottom-4 z-40 rounded-full bg-promo py-4 text-center text-lg font-black text-white shadow-lg sm:static sm:block">
        Voir le deal 🔗
      </a>
      <p className="pb-16 text-center text-xs text-slate-400 sm:pb-0">Lien affilié — prix identique pour vous.</p>
    </article>
  );
}
