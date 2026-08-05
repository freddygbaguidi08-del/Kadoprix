import { supabaseAdmin } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const metadata = { robots: { index: false, follow: false } };

const TAILLE_LOT = 50;

function nettoyerTitre(brut: string): string {
  if (!brut) return brut;
  let t = brut;

  // Retraits simples, sans regex récursive dangereuse
  const bruit = [
    /\b20\d{2}\b/gi, /\bnew\b/gi, /\bhot sale\b/gi, /\bhot\b/gi, /\bsale\b/gi,
    /\bfree shipping\b/gi, /\blivraison gratuite\b/gi, /\bhigh quality\b/gi,
    /\bhaute qualité\b/gi, /\bdropshipping\b/gi, /\bwholesale\b/gi,
    /\bfashion\b/gi, /\bluxury\b/gi, /\bnouveau\b/gi, /\bnouvelle\b/gi,
  ];
  for (const p of bruit) t = t.replace(p, ' ');

  // Couper une éventuelle liste "pour X Y Z..." en fin de titre (sans backtracking)
  t = t.replace(/\s(pour|for|compatible)\s.*$/i, '');

  // Symboles et emojis
  t = t.replace(/[|•★☆✔➤»«#]+/g, ' ');
  t = t.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, ' ');

  // Espaces
  t = t.replace(/\s{2,}/g, ' ').trim();
  t = t.replace(/^[\s,;:.\-]+|[\s,;:.\-]+$/g, '').trim();

  // Max 10 mots
  const mots = t.split(/\s+/).filter(Boolean);
  if (mots.length > 10) t = mots.slice(0, 10).join(' ');

  if (!t) return brut;
  return t.charAt(0).toUpperCase() + t.slice(1);
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
    await db.from('deals')
      .update({ titre: nettoyerTitre(d.titre), titre_nettoye: true })
      .eq('id', d.id);
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-2xl font-extrabold">Rattrapage des titres</h1>
        <p className="mt-1 text-sm text-slate-500">
          Nettoie les titres importés. {TAILLE_LOT} par clic — relance jusqu’à 0.
        </p>
      </header>

      <div className="rounded-xl2 bg-white p-5 text-center shadow-card ring-1 ring-line/60">
        <p className="tnum font-display text-4xl font-extrabold">{restants ?? 0}</p>
        <p className="mt-1 text-sm text-slate-500">titres restant à nettoyer</p>

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
    </div>
  );
}
