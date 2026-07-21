import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Client lié à la session de l'utilisateur connecté (lit les cookies).
// Les policies RLS s'appliquent : chacun ne voit que ses propres données.
export function supabaseServer() {
  const store = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (liste) => {
          try {
            liste.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Appelé depuis un Server Component : le refresh est géré par le middleware.
          }
        },
      },
    }
  );
}
