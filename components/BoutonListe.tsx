'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function BoutonListe({
  dealId, variante = 'icone',
}: { dealId: number; variante?: 'icone' | 'large' }) {
  const [dans, setDans] = useState<boolean | null>(null);
  const [occupe, setOccupe] = useState(false);
  const router = useRouter();
  const db = supabaseBrowser();

  useEffect(() => {
    let vivant = true;
    (async () => {
      const { data: { user } } = await db.auth.getUser();
      if (!user) { if (vivant) setDans(false); return; }
      const { data } = await db.from('favorites')
        .select('deal_id').eq('user_id', user.id).eq('deal_id', dealId).maybeSingle();
      if (vivant) setDans(!!data);
    })();
    return () => { vivant = false; };
  }, [dealId]);

  async function basculer(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (occupe) return;
    setOccupe(true);

    const { data: { user } } = await db.auth.getUser();
    if (!user) { router.push('/connexion'); return; }

    if (dans) {
      await db.from('favorites').delete().eq('user_id', user.id).eq('deal_id', dealId);
      setDans(false);
    } else {
      await db.from('favorites').insert({ user_id: user.id, deal_id: dealId });
      setDans(true);
    }
    setOccupe(false);
    router.refresh();
  }

  if (variante === 'large') {
    return (
      <button onClick={basculer} disabled={occupe}
              aria-pressed={!!dans}
              className={`w-full rounded-full border py-3 font-display text-sm font-extrabold
                          transition disabled:opacity-50 ${
                dans ? 'border-eco bg-eco/[0.08] text-eco'
                     : 'border-ink/20 bg-white text-ink hover:border-ink'
              }`}>
        {dans ? 'Retiré de ma liste ✓' : 'Ajouter à ma liste'}
      </button>
    );
  }

  return (
    <button onClick={basculer} disabled={occupe}
            aria-label={dans ? 'Retirer de ma liste' : 'Ajouter à ma liste'}
            aria-pressed={!!dans}
            className={`absolute left-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full
                        shadow-sm backdrop-blur-sm transition disabled:opacity-50 ${
              dans ? 'bg-eco text-white' : 'bg-white/90 text-slate-500 hover:text-ink'
            }`}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        {dans ? <path d="M5 13l4 4L19 7" /> : <path d="M12 5v14M5 12h14" />}
      </svg>
    </button>
  );
}
