import { supabaseServer } from '@/lib/supabase-server';
import { prixFmt } from '@/components/DealCard';
import BoutonListe from '@/components/BoutonListe';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ma liste' };

type Ligne = {
  deal_id: number;
  deals: {
    id: number; slug: string; titre: string; image: string | null;
    prix: number; prix_barre: number | null; devise: string;
    pct_reduction: number | null; fin: string | null; statut: string;
    merchants: { nom: string; slug: string } | null;
  } | null;
};

export default async function MaListe() {
  const db = supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  if (!user) redirect('/connexion');

  const { data } = await db.from('favorites')
    .select('deal_id, deals(id, slug, titre, image, prix, prix_barre, devise, pct_reduction, fin, statut, merchants(nom, slug))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const lignes = ((data ?? []) as unknown as Ligne[]).filter((l) => l.deals);

  // Regroupement par marchand : un seul passage chez chacun au lieu d'allers-retours
  const groupes = new Map<string, { nom: string; items: Ligne[] }>();
  for (const l of lignes) {
    const nom = l.deals!.merchants?.nom ?? 'Autres marchands';
    const g = groupes.get(nom) ?? { nom, items: [] };
    g.items.push(l);
    groupes.set(nom, g);
  }

  // Totaux par devise : additionner des EUR et des XOF n'aurait aucun sens
  const totaux = new Map<string, { total: number; economie: number; n: number }>();
  for (const l of lignes) {
    const d = l.deals!;
    if (d.statut !== 'live') continue;
    const t = totaux.get(d.devise) ?? { total: 0, economie: 0, n: 0 };
    t.total += Number(d.prix);
    t.economie += d.prix_barre ? Number(d.prix_barre) - Number(d.prix) : 0;
    t.n += 1;
    totaux.set(d.devise, t);
  }

  if (!lignes.length) {
    return (
      <div className="mx-auto max-w-lg rounded-xl2 border border-dashed border-line bg-white p-10 text-center">
        <p className="font-display text-lg font-bold">Votre liste est vide</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Ajoutez des offres avec le bouton <b>+</b> sur les cartes. On regroupe ensuite vos
          articles par marchand pour limiter les allers-retours, et on surveille leurs prix.
        </p>
        <Link href="/"
              className="mt-5 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">
          Parcourir les offres
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Ma liste</h1>
        <p className="tnum text-sm text-slate-500">
          {lignes.length} article{lignes.length > 1 ? 's' : ''} chez {groupes.size} marchand
          {groupes.size > 1 ? 's' : ''}
        </p>
      </header>

      {/* Le chiffre qui compte */}
      <div className="space-y-3">
        {[...totaux.entries()].map(([devise, t]) => (
          <div key={devise}
               className="flex flex-wrap items-baseline justify-between gap-3 rounded-xl2
                          bg-ink px-5 py-4 text-white">
            <div>
              <p className="text-[11px] uppercase tracking-[0.08em] text-white/60">
                Total {totaux.size > 1 ? `en ${devise}` : ''}
              </p>
              <p className="tnum font-display text-3xl font-extrabold">
                {prixFmt(t.total, devise)}
              </p>
            </div>
            {t.economie > 0 && (
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.08em] text-white/60">Économie</p>
                <p className="tnum font-display text-2xl font-extrabold text-emerald-400">
                  −{prixFmt(t.economie, devise)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Un bloc par marchand = un seul passage en caisse chez chacun */}
      {[...groupes.values()].map((g) => {
        const actifs = g.items.filter((l) => l.deals!.statut === 'live');
        const sousTotal = actifs.reduce((s, l) => s + Number(l.deals!.prix), 0);
        const devise = actifs[0]?.deals!.devise ?? 'EUR';

        return (
          <section key={g.nom} className="overflow-hidden rounded-xl2 bg-white shadow-card ring-1 ring-line/60">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 px-4 py-3">
              <div>
                <h2 className="font-display text-base font-extrabold">{g.nom}</h2>
                <p className="tnum text-xs text-slate-500">
                  {actifs.length} article{actifs.length > 1 ? 's' : ''} · {prixFmt(sousTotal, devise)}
                </p>
              </div>
            </header>

            <ul className="divide-y divide-line/70">
              {g.items.map((l) => {
                const d = l.deals!;
                const expire = d.statut !== 'live';
                return (
                  <li key={d.id} className={`flex items-center gap-3 p-3 ${expire ? 'opacity-50' : ''}`}>
                    <Link href={`/deal/${d.slug}`} className="shrink-0">
                      {d.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/img?u=${encodeURIComponent(d.image)}`} alt=""
                             className="h-14 w-14 rounded-lg object-contain" />
                      ) : <div className="h-14 w-14 rounded-lg bg-canvas" />}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link href={`/deal/${d.slug}`}
                            className="line-clamp-2 text-[13px] font-medium leading-snug hover:underline">
                        {d.titre}
                      </Link>
                      <p className="tnum mt-0.5 text-sm font-bold">
                        {prixFmt(Number(d.prix), d.devise)}
                        {d.prix_barre && (
                          <span className="ml-2 text-xs font-normal text-slate-400 line-through">
                            {prixFmt(Number(d.prix_barre), d.devise)}
                          </span>
                        )}
                      </p>
                      {expire && <p className="text-xs text-warn">Offre expirée</p>}
                    </div>
                    <div className="relative shrink-0">
                      <BoutonListe dealId={d.id} />
                    </div>
                  </li>
                );
              })}
            </ul>

            {actifs.length > 0 && (
              <div className="border-t border-line/70 p-3">
                <div className="flex flex-wrap gap-2">
                  {actifs.map((l) => (
                    <a key={l.deals!.id} href={`/api/out/${l.deals!.id}`}
                       rel="nofollow sponsored" target="_blank"
                       className="rounded-full bg-promo px-3.5 py-2 text-xs font-bold text-white
                                  transition hover:brightness-110">
                      Ouvrir · {l.deals!.titre.slice(0, 22)}
                      {l.deals!.titre.length > 22 ? '…' : ''}
                    </a>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                  Chaque article s’ouvre dans un onglet chez {g.nom} : ajoutez-les à votre panier
                  là-bas, puis payez une seule fois.
                </p>
              </div>
            )}
          </section>
        );
      })}

      <p className="text-center text-xs leading-relaxed text-slate-400">
        Kado Prix ne vend rien et n’encaisse aucun paiement. Le paiement se fait chez chaque
        marchand, au même prix que si vous y alliez directement.
      </p>
    </div>
  );
}
