// KADO PRIX — Panneau de veille éditoriale
// Accès : /admin/veille?token=XXX  (ADMIN_TOKEN dans les variables Vercel)
// Sécurité volontairement simple pour le MVP : à remplacer par Supabase Auth
// + rôle 'admin' dès que tu ouvres le site à d'autres contributeurs.
import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

// ---- Server Actions ----
async function publier(formData: FormData) {
  'use server';
  const db = supabaseAdmin();
  const id = Number(formData.get('id'));
  const titre = String(formData.get('titre') ?? '').trim();
  const url = String(formData.get('url') ?? '').trim();
  const prix = parseFloat(String(formData.get('prix') ?? ''));
  const prixBarre = parseFloat(String(formData.get('prix_barre') ?? ''));
  const devise = String(formData.get('devise') ?? 'EUR');

  if (!titre || !url || !prix) return;

  const suffixe = Math.random().toString(36).slice(2, 8);
  await db.from('deals').insert({
    slug: `${slugify(titre)}-${suffixe}`,
    source: 'community',
    titre,
    url_source: url,
    url_affiliee: url,
    prix,
    prix_barre: Number.isFinite(prixBarre) && prixBarre > prix ? prixBarre : null,
    devise,
    statut: 'live',
    pays: ['FR'],
    dedup_hash: `manual-${suffixe}-${Date.now()}`,
  });

  await db.from('veille_items').update({ statut: 'publie' }).eq('id', id);
  revalidatePath('/admin/veille');
  revalidatePath('/');
}

async function ignorer(formData: FormData) {
  'use server';
  const db = supabaseAdmin();
  await db.from('veille_items')
    .update({ statut: 'ignore' })
    .eq('id', Number(formData.get('id')));
  revalidatePath('/admin/veille');
}

// ---- Page ----
export default async function VeillePage({ searchParams }: { searchParams: { token?: string } }) {
  const attendu = process.env.ADMIN_TOKEN;

  if (!attendu) {
    return <p className="rounded-xl bg-amber-50 p-4 text-sm">
      Définis la variable d&apos;environnement <code>ADMIN_TOKEN</code> dans Vercel pour activer cette page.
    </p>;
  }
  if (searchParams.token !== attendu) {
    return <p className="rounded-xl bg-red-50 p-4 text-sm">Accès refusé.</p>;
  }

  const db = supabaseAdmin();
  const { data: items } = await db.from('veille_items')
    .select('*').eq('statut', 'nouveau')
    .order('created_at', { ascending: false }).limit(50);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">🔎 Veille éditoriale</h1>
        <p className="mt-1 text-sm text-slate-500">
          {items?.length ?? 0} éléments à traiter. Réécris le titre avec tes mots et pointe
          vers le marchand d&apos;origine (ton lien affilié), pas vers la source de veille.
        </p>
      </div>

      {(items ?? []).map((it: any) => (
        <div key={it.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <p className="text-xs uppercase tracking-wide text-slate-400">{it.source_nom}</p>
          <p className="mt-1 font-semibold">{it.titre}</p>
          {it.extrait && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{it.extrait}</p>}
          <a href={it.lien} target="_blank" rel="noopener noreferrer"
             className="mt-1 inline-block text-xs text-blue-600 underline">
            Voir la source ↗
          </a>

          <form action={publier} className="mt-3 grid gap-2 sm:grid-cols-2">
            <input type="hidden" name="id" value={it.id} />
            <input name="titre" defaultValue={it.titre} placeholder="Titre réécrit"
                   className="rounded border px-2 py-1 text-sm sm:col-span-2" />
            <input name="url" placeholder="URL marchand (ton lien affilié)"
                   className="rounded border px-2 py-1 text-sm sm:col-span-2" />
            <input name="prix" type="number" step="0.01" placeholder="Prix promo"
                   className="rounded border px-2 py-1 text-sm" />
            <input name="prix_barre" type="number" step="0.01" placeholder="Prix barré"
                   className="rounded border px-2 py-1 text-sm" />
            <select name="devise" className="rounded border px-2 py-1 text-sm">
              <option value="EUR">EUR</option>
              <option value="XOF">XOF</option>
              <option value="CAD">CAD</option>
            </select>
            <button type="submit"
                    className="rounded bg-eco px-3 py-1 text-sm font-bold text-white">
              Publier
            </button>
          </form>

          <form action={ignorer} className="mt-2">
            <input type="hidden" name="id" value={it.id} />
            <button type="submit" className="text-xs text-slate-400 underline">Ignorer</button>
          </form>
        </div>
      ))}

      {!items?.length && (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          Rien à traiter. Configure des flux RSS dans <code>scrape_sources</code> puis lance le workflow.
        </p>
      )}
    </div>
  );
}
