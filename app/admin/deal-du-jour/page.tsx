import { supabaseAdmin } from '@/lib/supabase';
import { getDealDuJour } from '@/lib/deal-du-jour';
import { prixFmt } from '@/components/DealCard';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

async function designer(formData: FormData) {
  'use server';
  const db = supabaseAdmin();
  const slug = String(formData.get('slug') ?? '').trim();
  const aujourdhui = new Date().toISOString().slice(0, 10);

  await db.from('deals').update({ deal_du_jour_le: null }).eq('deal_du_jour_le', aujourdhui);
  if (slug) {
    await db.from('deals').update({ deal_du_jour_le: aujourdhui }).eq('slug', slug);
  }
  revalidatePath('/');
  revalidatePath('/admin/deal-du-jour');
}

async function retirer() {
  'use server';
  const db = supabaseAdmin();
  const aujourdhui = new Date().toISOString().slice(0, 10);
  await db.from('deals').update({ deal_du_jour_le: null }).eq('deal_du_jour_le', aujourdhui);
  revalidatePath('/');
  revalidatePath('/admin/deal-du-jour');
}

export default async function AdminDealDuJour({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const attendu = process.env.ADMIN_TOKEN;
  if (!attendu || searchParams.token !== attendu) {
    return <p className="rounded-xl2 bg-warn/10 p-4 text-sm">Accès refusé.</p>;
  }

  const db = supabaseAdmin();
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const actuel = await getDealDuJour();

  const { data: manuel } = await db.from('deals')
    .select('slug, titre').eq('deal_du_jour_le', aujourdhui).maybeSingle();

  const { data: candidats } = await db.from('deals')
    .select('slug, titre, prix, devise, pct_reduction, vues')
    .eq('statut', 'live').eq('faux_prix_suspect', false)
    .not('pct_reduction', 'is', null).gte('pct_reduction', 30)
    .not('image', 'is', null)
    .order('pct_reduction', { ascending: false }).limit(20);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold">Deal du jour</h1>
        <p className="mt-1 text-sm text-slate-500">
          Par défaut, il est choisi automatiquement (meilleure baisse vérifiée).
          Tu peux en imposer un précis pour aujourd’hui.
        </p>
      </header>

      <div className="rounded-xl2 bg-white p-4 shadow-card ring-1 ring-line/60">
        <p className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
          Affiché en ce moment {manuel ? '(désigné manuellement)' : '(choix automatique)'}
        </p>
        {actuel ? (
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="font-display font-extrabold">{actuel.titre}</p>
              <p className="tnum text-sm text-slate-500">
                {prixFmt(Number(actuel.prix), actuel.devise)}
                {actuel.pct_reduction ? ` · −${actuel.pct_reduction}%` : ''}
              </p>
            </div>
            {manuel && (
              <form action={retirer}>
                <button className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold
                                   text-slate-500 hover:border-warn hover:text-warn">
                  Repasser en auto
                </button>
              </form>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">Aucun deal éligible pour l’instant.</p>
        )}
      </div>

      <form action={designer} className="rounded-xl2 bg-white p-4 shadow-card ring-1 ring-line/60">
        <label className="block text-[13px] font-semibold">Désigner par slug</label>
        <p className="mb-2 text-xs text-slate-500">
          Le slug est la fin de l’URL d’un deal : /deal/<b>ce-morceau-ci</b>
        </p>
        <div className="flex gap-2">
          <input name="slug" placeholder="slug-du-deal"
                 className="flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm" />
          <button className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">
            Désigner
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <p className="text-[13px] font-semibold">Suggestions (grosses baisses vérifiées)</p>
        {(candidats ?? []).map((c: any) => (
          <form action={designer} key={c.slug}
                className="flex items-center justify-between gap-3 rounded-xl2 bg-white p-3
                           shadow-card ring-1 ring-line/60">
            <input type="hidden" name="slug" value={c.slug} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{c.titre}</p>
              <p className="tnum text-xs text-slate-500">
                {prixFmt(Number(c.prix), c.devise)} · −{c.pct_reduction}%
                {c.vues ? ` · ${c.vues} vues` : ''}
              </p>
            </div>
            <button className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs
                               font-semibold hover:border-ink">
              Choisir
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
