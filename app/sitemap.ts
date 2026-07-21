import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://promoz.vercel.app';
  const [{ data: deals }, { data: cats }] = await Promise.all([
    supabase.from('deals').select('slug, updated_at').eq('statut', 'live').limit(2000),
    supabase.from('categories').select('slug'),
  ]);
  return [
    { url: base, changeFrequency: 'hourly', priority: 1 },
    { url: `${base}/deals-du-jour`, changeFrequency: 'hourly', priority: 0.9 },
    ...(cats ?? []).map((c) => ({ url: `${base}/categorie/${c.slug}`, changeFrequency: 'daily' as const, priority: 0.8 })),
    ...(deals ?? []).map((d) => ({ url: `${base}/deal/${d.slug}`, lastModified: d.updated_at, priority: 0.6 })),
  ];
}
