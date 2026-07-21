// PROMOZ — lib d'ingestion (utilisée par tous les scripts /ingest)
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

export const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // clé service_role => bypass RLS (secrets GitHub)
  { auth: { persistSession: false } }
);

export const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
   .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

export const dedupHash = (domaine, titre, prix) =>
  crypto.createHash('sha1')
    .update(`${domaine}|${slugify(titre)}|${Number(prix).toFixed(2)}`)
    .digest('hex');

// Score Promoz 0-100 (pondération : réduction 40, fraîcheur 30, marchand 15, données 15)
export function scorePromoz({ prix, prix_barre, fiabilite = 5, hasImage, hasEnd }) {
  let score = 0;
  const pct = prix_barre > 0 ? Math.round(100 - (prix / prix_barre) * 100) : 0;
  score += Math.min(40, pct * 0.6);          // -66% => 40 pts max
  score += 30;                               // deal fraîchement ingéré
  score += (fiabilite / 10) * 15;
  score += (hasImage ? 8 : 0) + (hasEnd ? 7 : 0);
  return Math.max(5, Math.min(100, Math.round(score)));
}

// Détection prix barré suspect : comparé à la médiane 90j de price_history
export async function fauxPrixSuspect(dealId, prixBarre) {
  if (!prixBarre) return false;
  const { data } = await db
    .from('price_history')
    .select('prix')
    .eq('deal_id', dealId)
    .gte('releve_le', new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10));
  if (!data || data.length < 7) return false; // pas assez d'historique
  const prix = data.map((r) => Number(r.prix)).sort((a, b) => a - b);
  const mediane = prix[Math.floor(prix.length / 2)];
  return prixBarre > mediane * 1.15;
}

// Upsert d'un deal (dédoublonné par dedup_hash) + relevé price_history du jour
export async function upsertDeal(d) {
  const domaine = new URL(d.url_source).hostname;
  const hash = dedupHash(domaine, d.titre, d.prix);
  const slug = `${slugify(d.titre)}-${hash.slice(0, 6)}`;

  const row = {
    slug,
    merchant_id: d.merchant_id ?? null,
    source: d.source ?? 'feed',
    titre: d.titre.slice(0, 200),
    description: d.description ?? null,
    image: d.image ?? null,
    url_source: d.url_source,
    url_affiliee: d.url_affiliee ?? d.url_source,
    code_promo: d.code_promo ?? null,
    prix: d.prix,
    prix_barre: d.prix_barre ?? null,
    devise: d.devise ?? 'EUR',
    score_promoz: scorePromoz({
      prix: d.prix, prix_barre: d.prix_barre,
      fiabilite: d.fiabilite, hasImage: !!d.image, hasEnd: !!d.fin,
    }),
    statut: 'live',
    fin: d.fin ?? null,
    pays: d.pays ?? ['FR'],
    dedup_hash: hash,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await db
    .from('deals')
    .upsert(row, { onConflict: 'dedup_hash' })
    .select('id')
    .single();
  if (error) throw error;

  // Relevé de prix quotidien (ignore le doublon du jour)
  await db.from('price_history')
    .upsert({ deal_id: data.id, merchant_id: row.merchant_id, prix: d.prix },
            { onConflict: 'deal_id,releve_le', ignoreDuplicates: true })
    .then(() => {});
  return data.id;
}

export async function merchantIdBySlug(slug) {
  const { data } = await db.from('merchants').select('id,fiabilite_score').eq('slug', slug).single();
  return data ?? { id: null, fiabilite_score: 5 };
}
