import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

const TAILLE_LOT = 100;

const BRUIT = [
  /\b(20\d{2})\s*(new|nouveau|nouvelle)?\b/gi,
  /\bnew\b/gi, /\bhot\s*sale\b/gi, /\bhot\b/gi, /\bsale\b/gi,
  /\bfree\s*shipping\b/gi, /\blivraison\s*gratuite\b/gi,
  /\bhigh\s*quality\b/gi, /\bhaute\s*qualité\b/gi,
  /\bdropshipping\b/gi, /\bwholesale\b/gi, /\bgros\b/gi,
  /\bfashion\b/gi, /\bluxury\b/gi, /\bluxe\b/gi,
  /\bunisex\b/gi, /\bmen'?s?\b/gi, /\bwomen'?s?\b/gi,
];
const LISTE_MARQUES = /\b(pour|for|compatible)\s+([A-Za-z0-9]+\s*){2,}$/gi;
const SLASH_LISTE = /\b([A-Za-z0-9]+\/){2,}[A-Za-z0-9]+\b/g;

function nettoyerTitre(brut: string, maxMots = 10): string {
  if (!brut) return brut;
  let t = brut;
  t = t.replace(SLASH_LISTE, '');
  t = t.replace(LISTE_MARQUES, '');
  for (const p of BRUIT) t = t.replace(p, ' ');
  t = t.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, ' ');
  t = t.replace(/[|•★☆✔➤»«#]+/g, ' ');
  t = t.replace(/\s{2,}/g, ' ').replace(/\s+([,;:.])/g, '$1').trim();
  t = t.replace(/^[\s,;:.\-–—]+|[\s,;:.\-–—]+$/g, '').trim();
  const mots = t.split(/\s+/).filter(Boolean);
  if (mots.length > maxMots) t = mots.slice(0, maxMots).join(' ');
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return t || brut;
}

async function traiterLot() {
  'use server';
  const db = supabaseAdmin();
  const { data: deals } = await db.from('deals')
    .select('id, titre')
    .eq('titre_nettoye', false)
    .eq('source', 'feed')
    .limit(TAILLE_LOT);

  for (const d of deals ?? []) {
    const propre = nettoyerTitre(d.titre);
    await db.from('deals').update({ titre: propre, titre_nettoye: true }).eq('id', d.id);
  }
  revalidatePath('/admin/rattrapage-titres');
}

export default async function RattrapageTitres({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const attendu = process.env.ADMIN_TOKEN;
  if (!attendu || searchParams.token !== attendu) {
    return <p className="rounded-xl2 bg-warn/10 p-4 text-sm">Accès refusé.</p>;
  }

  const db = supabaseAdmin();
  const { count: restants } = await db.from('deals')
    .select('id', { count: 'exact', head: true })
    .eq('titre_nettoye', false)
    .eq('source', 'feed');

  const { data: apercu } = await db.from('deals')
    .select('titre')
    .eq('titre_nettoye', false)
    .eq('source', 'feed').limit(5);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold">Rattrapage des titres</h1>
        <p className="mt-1 text-sm text-slate-500">
          Nettoie les titres importés. Traite {TAILLE_LOT} deals par clic — relance jusqu’à 0.
        </p>
      </header>

      <div className="rounded-xl2 bg-white p-5 text-center shadow-card ring-1 ring-line/60">
        <p className="tnum font-display text-4xl font-extrabold">{restants ?? 0}</p>
        <p className="mt-1 text-sm text-slate-500">titres importés restant à nettoyer</p>

        {(restants ?? 0) > 0 ? (
          <form action={traiterLot} className="mt-4">
            <button className="rounded-full bg-ink px-6 py-3 font-display text-sm font-extrabold text-white">
              Nettoyer les {Math.min(TAILLE_LOT, restants ?? 0)} suivants
            </button>
          </form>
        ) : (
          <p className="mt-4 rounded-full bg-eco/10 px-4 py-2 text-sm font-semibold text-eco">
            Tous les titres sont nettoyés ✓
          </p>
        )}
      </div>

      {apercu && apercu.length > 0 && (
        <div className="space-y-2">
          <p className="text-[13px] font-semibold">Aperçu du prochain lot (avant → après)</p>
          {apercu.map((d: any, i: number) => (
            <div key={i} className="rounded-xl2 bg-white p-3 text-[13px] shadow-card ring-1 ring-line/60">
              <p className="text-slate-400 line-through">{d.titre}</p>
              <p className="mt-1 font-medium text-ink">{nettoyerTitre(d.titre)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
