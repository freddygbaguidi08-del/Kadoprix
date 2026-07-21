'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function HeaderCompte() {
  const [connecte, setConnecte] = useState<boolean | null>(null);
  const router = useRouter();
  const db = supabaseBrowser();

  useEffect(() => {
    db.auth.getUser().then(({ data }) => setConnecte(!!data.user));
    const { data: sub } = db.auth.onAuthStateChange((_e, session) => {
      setConnecte(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (connecte === null) return <div className="h-9 w-9" aria-hidden />;

  if (!connecte) {
    return (
      <Link href="/connexion"
            className="shrink-0 rounded-full border border-line px-3.5 py-2 text-sm
                       font-semibold transition hover:border-ink">
        Connexion
      </Link>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Link href="/ma-liste"
            className="rounded-full bg-ink px-3.5 py-2 text-sm font-semibold text-white
                       transition hover:bg-ink/85">
        Ma liste
      </Link>
      <button
        onClick={async () => { await db.auth.signOut(); router.push('/'); router.refresh(); }}
        aria-label="Se déconnecter"
        className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:text-ink">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
      </button>
    </div>
  );
}
