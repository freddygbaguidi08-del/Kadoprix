'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import IconeCategorie from './IconeCategorie';

type SousCat = { nom: string; slug: string };
type Cat = { nom: string; slug: string; sous: SousCat[] };

export default function MenuCategories({ cats }: { cats: Cat[] }) {
  const [ouvert, setOuvert] = useState(false);
  const [survol, setSurvol] = useState<string | null>(null);
  const [deplie, setDeplie] = useState<string | null>(null);
  const zone = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    const clic = (e: MouseEvent) => {
      if (zone.current && !zone.current.contains(e.target as Node)) setOuvert(false);
    };
    const echap = (e: KeyboardEvent) => { if (e.key === 'Escape') setOuvert(false); };
    document.addEventListener('mousedown', clic);
    document.addEventListener('keydown', echap);
    return () => {
      document.removeEventListener('mousedown', clic);
      document.removeEventListener('keydown', echap);
    };
  }, [ouvert]);

  useEffect(() => {
    document.body.style.overflow = ouvert ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [ouvert]);

  const actif = cats.find((c) => c.slug === survol) ?? cats[0];

  return (
    <div ref={zone} className="relative">
      <button
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-label="Ouvrir le menu des catégories"
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 py-2
                   text-sm font-semibold transition hover:border-ink">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <span className="hidden sm:inline">Catégories</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             strokeWidth="2.5" strokeLinecap="round"
             className={`transition-transform ${ouvert ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {ouvert && (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 hidden w-[560px] rounded-xl2
                        border border-line bg-white p-3 shadow-lift sm:block">
          <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
            {cats.map((c) => {
              const estActif = actif?.slug === c.slug;
              return (
                <Link
                  key={c.slug}
                  href={`/categorie/${c.slug}`}
                  onMouseEnter={() => setSurvol(c.slug)}
                  onClick={() => setOuvert(false)}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-2.5 transition ${
                    estActif ? 'bg-promo/[0.07]' : 'hover:bg-canvas'
                  }`}>
                  <span className={`flex items-center gap-2.5 text-sm ${
                    estActif ? 'font-semibold text-promo' : 'text-ink'
                  }`}>
                    <IconeCategorie slug={c.slug}
                      className={`h-[18px] w-[18px] ${estActif ? 'text-promo' : 'text-slate-400'}`} />
                    {c.nom}
                  </span>
                  {c.sous.length > 0 && (
                    <span className={`text-[11px] ${estActif ? 'text-promo' : 'text-slate-400'}`}>
                      {c.sous.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {actif?.sous.length > 0 && (
            <div className="mt-2 border-t border-line px-2.5 pt-3">
              <p className="mb-2 text-[11px] uppercase tracking-[0.05em] text-slate-400">
                {actif.nom} — sous-catégories
              </p>
              <div className="flex flex-wrap gap-1.5">
                {actif.sous.map((s) => (
                  <Link key={s.slug} href={`/categorie/${s.slug}`}
                        onClick={() => setOuvert(false)}
                        className="rounded-full border border-line bg-canvas px-3 py-1.5 text-[13px]
                                   text-slate-600 transition hover:border-ink/25 hover:text-ink">
                    {s.nom}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {ouvert && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white sm:hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
            <span className="font-display text-base font-extrabold">Catégories</span>
            <button onClick={() => setOuvert(false)} aria-label="Fermer"
                    className="grid h-9 w-9 place-items-center rounded-full text-slate-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {cats.map((c) => {
              const estDeplie = deplie === c.slug;
              return (
                <div key={c.slug}>
                  <div className="flex items-center">
                    <Link href={`/categorie/${c.slug}`} onClick={() => setOuvert(false)}
                          className="flex flex-1 items-center gap-3 rounded-lg px-3 py-3.5">
                      <IconeCategorie slug={c.slug} className="h-[18px] w-[18px] text-slate-400" />
                      <span className="text-sm font-medium">{c.nom}</span>
                    </Link>
                    {c.sous.length > 0 && (
                      <button
                        onClick={() => setDeplie(estDeplie ? null : c.slug)}
                        aria-label={estDeplie ? 'Replier' : 'Déplier'}
                        className="grid h-11 w-11 place-items-center text-slate-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2.5" strokeLinecap="round"
                             className={`transition-transform ${estDeplie ? 'rotate-180' : ''}`}>
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {estDeplie && c.sous.length > 0 && (
                    <div className="flex flex-col pb-2 pl-12">
                      {c.sous.map((s) => (
                        <Link key={s.slug} href={`/categorie/${s.slug}`}
                              onClick={() => setOuvert(false)}
                              className="py-2.5 text-[13px] text-slate-600">
                          {s.nom}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
