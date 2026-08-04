import { supabase } from '@/lib/supabase';
import { destBySlug, DESTINATIONS } from '@/lib/destinations';
import { prixFmt } from '@/components/DealCard';
import { filAriane, Jsonld } from '@/lib/seo';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 900;

export function generateStaticParams() {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const d = destBySlug(params.slug);
  if (!d) return {};
  return {
    title: `Voyage à ${d.ville} (${d.pays}) — vol, visa, budget et bons plans`,
    description:
      `Tout pour préparer votre voyage à ${d.ville} : meilleur prix de vol depuis Paris, formalités de visa, monnaie, meilleure saison et infos pratiques. Mis à jour régulièrement.`,
    alternates: { canonical: `/destination/${d.slug}` },
  };
}

const lienHotel = (ville: string) =>
  `https://search.hotellook.com/?destination=${encodeURIComponent(ville)}&marker=760295`;

export default async function DestinationPage({ params }: { params: { slug: string } }) {
  const d = destBySlug(params.slug);
  if (!d) notFound();

  const { data: vols } = await supabase.from('deals')
    .select('slug, titre, prix, devise')
    .eq('statut', 'live').eq('plateforme', 'Vol')
    .ilike('titre', `%${d.ville}%`)
    .order('prix', { ascending: true }).limit(1);
  const vol = vols?.[0];

  const infos: [string, string][] = [
    ['✈️ Durée de vol', d.dureeVol],
    ['🛂 Visa', d.visa],
    ['💰 Monnaie', d.monnaie],
    ['🕐 Décalage horaire', d.decalage],
    ['🗣️ Langue', d.langue],
    ['💉 Santé', d.vaccins],
    ['☀️ Meilleure saison', d.saison],
    ['💵 Budget sur place', d.budgetJour],
  ];

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Jsonld data={filAriane([
        { nom: 'Accueil', url: '/' },
        { nom: 'Voyages', url: '/categorie/voyages' },
        { nom: d.ville, url: `/destination/${d.slug}` },
      ])} />

      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          Guide destination
        </p>
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
          <span className="mr-2">{d.emoji}</span>Voyage à {d.ville}
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-600">{d.resume}</p>
      </header>

      {vol ? (
        <div className="rounded-xl2 bg-ink p-5 text-white">
          <p className="text-[11px] uppercase tracking-[0.08em] text-white/60">
            Meilleur prix de vol repéré depuis Paris
          </p>
          <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3">
            <span className="tnum font-display text-3xl font-extrabold">
              {prixFmt(Number(vol.prix), vol.devise)}
            </span>
            <Link href={`/deal/${vol.slug}`}
                  className="rounded-full bg-promo px-5 py-2.5 text-sm font-bold text-white
                             transition hover:brightness-110">
              Voir ce vol
            </Link>
          </div>
          <p className="mt-2 text-xs text-white/50">
            Prix indicatif issu des dernières recherches, à confirmer sur le comparateur.
          </p>
        </div>
      ) : (
        <div className="rounded-xl2 border border-dashed border-line bg-white p-5 text-center">
          <p className="text-sm text-slate-500">
            Aucun vol récent en base pour {d.ville}. Consultez directement les prix :
          </p>
          <a href={`https://www.aviasales.com/?marker=760295`} rel="nofollow sponsored"
             className="mt-3 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
            Chercher un vol
          </a>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-xl font-extrabold">Infos pratiques</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          {infos.map(([label, val]) => (
            <div key={label} className="rounded-xl2 bg-white p-4 shadow-card ring-1 ring-line/60">
              <dt className="text-[13px] font-semibold text-ink">{label}</dt>
              <dd className="mt-1 text-[13px] leading-relaxed text-slate-600">{val}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-extrabold">À ne pas manquer</h2>
        <div className="flex flex-wrap gap-2">
          {d.aVoir.map((lieu) => (
            <span key={lieu}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-slate-700">
              {lieu}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-xl2 border border-promo/20 bg-promo/[0.04] p-4">
        <p className="text-[13px] font-semibold text-promo">Le conseil Kado Prix</p>
        <p className="mt-1 text-[14px] leading-relaxed text-slate-700">{d.conseil}</p>
      </section>

      <section className="rounded-xl2 bg-white p-5 text-center shadow-card ring-1 ring-line/60">
        <h2 className="font-display text-lg font-extrabold">Où dormir à {d.ville} ?</h2>
        <p className="mt-1 text-sm text-slate-500">
          Comparez les hôtels et trouvez le meilleur tarif pour vos dates.
        </p>
        <a href={lienHotel(d.ville)} rel="nofollow sponsored" target="_blank"
           className="mt-4 inline-block rounded-full bg-promo px-6 py-3 font-display text-sm
                      font-extrabold text-white transition hover:brightness-110">
          Voir les hôtels à {d.ville}
        </a>
      </section>

      <section className="space-y-3 border-t border-line pt-6">
        <h2 className="font-display text-base font-extrabold">Autres destinations</h2>
        <div className="flex flex-wrap gap-2">
          {DESTINATIONS.filter((x) => x.slug !== d.slug).map((x) => (
            <Link key={x.slug} href={`/destination/${x.slug}`}
                  className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px]
                             font-medium text-slate-700 transition hover:border-ink/25">
              {x.emoji} {x.ville}
            </Link>
          ))}
        </div>
      </section>

      <p className="text-center text-xs leading-relaxed text-slate-400">
        Infos pratiques données à titre indicatif et susceptibles d&apos;évoluer — vérifiez les
        formalités de visa et de santé auprès des sources officielles avant votre départ.
        Certains liens sont affiliés.
      </p>
    </article>
  );
}
