import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { MIN_OFFRES_INDEXABLE } from '@/lib/seo-config';

export const revalidate = 3600;
const BASE = 'https://kadoprix.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: deals }, { data: cats }, { data: merchants }] = await Promise.all([
    supabase.from('deals').select('slug, updated_at, categorie_id, merchant_id').eq('statut', 'live').limit(5000),
    supabase.from('categories').select('slug, id').is('parent_id', null),
    supabase.from('merchants').select('slug, id'),
  ]);

  // Compter les offres live par catégorie et par marchand
  const parCat = new Map<number, number>();
  const parMarch = new Map<number, number>();
  for (const d of deals ?? []) {
    if (d.categorie_id) parCat.set(d.categorie_id, (parCat.get(d.categorie_id) ?? 0) + 1);
    if (d.merchant_id) parMarch.set(d.merchant_id, (parMarch.get(d.merchant_id) ?? 0) + 1);
  }

  const fixes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: 'hourly', priority: 1 },
    { url: `${BASE}/deals-du-jour`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE}/a-propos`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/vendeur`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/mentions-legales`, priority: 0.2 },
    { url: `${BASE}/confidentialite`, priority: 0.2 },
    { url: `${BASE}/cgu`, priority: 0.2 },
  ];

  // Catégories : seulement celles au-dessus du seuil
  const cate = (cats ?? [])
    .filter((c) => (parCat.get(c.id) ?? 0) >= MIN_OFFRES_INDEXABLE)
    .map((c) => ({ url: `${BASE}/categorie/${c.slug}`, changeFrequency: 'daily' as const, priority: 0.8 }));

  // Marchands : idem
  const march = (merchants ?? [])
    .filter((m) => (parMarch.get(m.id) ?? 0) >= MIN_OFFRES_INDEXABLE)
    .map((m) => ({ url: `${BASE}/magasin/${m.slug}`, changeFrequency: 'daily' as const, priority: 0.7 }));

  const offres = (deals ?? []).map((d) => ({
    url: `${BASE}/deal/${d.slug}`, lastModified: d.updated_at, priority: 0.6,
  }));

  return [...fixes, ...cate, ...march, ...offres];
}
