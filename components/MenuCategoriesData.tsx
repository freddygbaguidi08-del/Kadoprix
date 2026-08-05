import { supabase } from '@/lib/supabase';
import MenuCategories from './MenuCategories';

export const revalidate = 3600;

export default async function MenuCategoriesData() {
  const { data } = await supabase
    .from('categories')
    .select('nom, slug, parent_id, id, ordre')
    .order('ordre', { ascending: true });

  const toutes = data ?? [];
  const principales = toutes.filter((c) => c.parent_id === null);

  const cats = principales.map((p) => ({
    nom: p.nom,
    slug: p.slug,
    sous: toutes
      .filter((c) => c.parent_id === p.id)
      .map((c) => ({ nom: c.nom, slug: c.slug })),
  }));

  if (!cats.length) return null;
  return <MenuCategories cats={cats} />;
}
