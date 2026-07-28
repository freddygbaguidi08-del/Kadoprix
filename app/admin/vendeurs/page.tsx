// KADO PRIX — Modération des offres commerçants
// Accès : /admin/vendeurs?token=ADMIN_TOKEN
import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

async function publier(formData: FormData) {
  'use server';
  const db = supabaseAdmin();
  const id = Number(formData.get('id'));

  const { data: s } = await db.from('vendor_submissions').select('*').eq('id', id).single();
  if (!s) return;

  const suffixe = Math.random().toString(36).slice(2, 8);
  const { data: deal } = await db.from('deals').insert({
    slug: `${slugify(s.titre)}-${suffixe}`,
    source: 'vendor',
    titre: s.titre,
    description: s.description,
    image: s.image_url,
    // Sans site marchand, la fiche Kado Prix EST la destination
    url_source: s.url_offre || `https://kadoprix.vercel.app/vendeur`,
    url_affiliee: s.url_offre || null,
    prix: s.prix,
    prix_barre: s.prix_barre,
    devise: s.devise,
    categorie_id: s.categorie_id,
    statut: 'live',
    fin: s.fin,
    pays: [s.pays],
    dedup_hash: `vendor-${id}-${suffixe}`,
  }).select('id').single();

  await db.from('vendor_submissions')
    .update({ statut: 'publie', deal_id: deal?.id ?? null }).eq('id', id);

  revalidatePath('/admin/vendeurs');
  revalidatePath('/');
}

async function refuser(formData: FormData) {
  'use server';
  const db = supabaseAdmin();
  await db.from('vendor_submissions')
    .update({ statut: 'refuse', note_moderation: String(formData.get('note') ?? '') })
    .eq('id', Number(formData.get('id')));
  revalidatePath('/admin/vendeurs');
}

export default async function AdminVendeurs({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const attendu = process.env.ADMIN_TOKEN;
  if (!attendu) {
    return <p className="rounded-xl2 bg-warn/10 p-4 text-sm">ADMIN_TOKEN non défini sur Vercel.</p>;
  }
  if (searchParams.token !== attendu) {
    return <p className="rounded-xl2 bg-warn/10 p-4 text-sm">Accès refusé.</p>;
  }

  const db = supabaseAdmin();
  const { data: subs } = await db.from('vendor_submissions')
    .select('*').eq('statut', 'nouveau').order('created_at', { ascending: false }).limit(50);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-2xl font-extrabold">Offres commerçants</h1>
        <p className="mt-1 text-sm text-slate-500">
          {subs?.length ?? 0} en attente. Vérifiez que le prix habituel est crédible avant de publier.
        </p>
      </header>

      {(subs ?? []).map((s: any) => {
        const reduc = s.prix_barre
          ? Math.round(100 - (Number(s.prix) / Number(s.prix_barre)) * 100)
          : null;
        return (
          <div key={s.id} className="rounded-xl2 bg-white p-4 shadow-card ring-1 ring-line/60">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-base font-extrabold">{s.enseigne}</span>
              <span className="text-xs text-slate-400">
                {[s.ville, s.pays].filter(Boolean).join(', ')}
              </span>
              {reduc !== null && (
                <span className={`tnum rounded px-1.5 py-0.5 text-[11px] font-bold ${
                  reduc > 90 ? 'bg-warn/15 text-warn' : 'bg-eco/10 text-eco'
                }`}>
                  −{reduc}%
                </span>
              )}
            </div>

            <p className="mt-2 font-medium">{s.titre}</p>
            {s.description && (
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.description}</p>
            )}
            <p className="tnum mt-2 text-sm">
              <b>{s.prix} {s.devise}</b>
              {s.prix_barre && (
                <span className="ml-2 text-slate-400 line-through">{s.prix_barre} {s.devise}</span>
              )}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Contact : {[s.contact_email, s.contact_whatsapp].filter(Boolean).join(' · ') || '—'}
              {s.url_offre && (
                <>
                  {' · '}
                  <a href={s.url_offre} target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 underline">Voir l’offre ↗</a>
                </>
              )}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <form action={publier}>
                <input type="hidden" name="id" value={s.id} />
                <button className="rounded-full bg-eco px-4 py-1.5 text-sm font-bold text-white">
                  Publier
                </button>
              </form>
              <form action={refuser} className="flex items-center gap-2">
                <input type="hidden" name="id" value={s.id} />
                <input name="note" placeholder="Motif (interne)"
                       className="rounded border border-line px-2 py-1 text-xs" />
                <button className="text-xs text-slate-400 underline">Refuser</button>
              </form>
            </div>
          </div>
        );
      })}

      {!subs?.length && (
        <p className="rounded-xl2 bg-white p-8 text-center text-sm text-slate-500 shadow-card">
          Aucune offre en attente.
        </p>
      )}
    </div>
  );
}
