'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import IconeCategorie from './IconeCategorie';

type Cat = { nom: string; slug: string };

export default function CarrouselCategories({ cats }: { cats: Cat[] }) {
  const piste = useRef<HTMLDivElement>(null);
  const [gauche, setGauche] = useState(false);
  const [droite, setDroite] = useState(false);

  // Les flèches n'apparaissent que si un défilement est réellement possible
  // de ce côté-là — une flèche inerte est une promesse non tenue.
  const majFleches = useCallback(() => {
    const el = piste.current;
    if (!el) return;
    const marge = 8;
    setGauche(el.scrollLeft > marge);
    setDroite(el.scrollLeft + el.clientWidth < el.scrollWidth - marge);
  }, []);

  useEffect(() => {
    majFleches();
    const el = piste.current;
    if (!el) return;
    el.addEventListener('scroll', majFleches, { passive: true });
    window.addEventListener('resize', majFleches);
    return () => {
      el.removeEventListener('scroll', majFleches);
      window.removeEventListener('resize', majFleches);
    };
  }, [majFleches, cats.length]);

  const glisser = (sens: -1 | 1) => {
    const el = piste.current;
    if (!el) return;
    el.scrollBy({ left: sens * Math.round(el.clientWidth * 0.8), behavior: 'smooth' });
  };

  const Fleche = ({ sens, actif }: { sens: -1 | 1; actif: boolean }) => (
    <button
      type="button"
      onClick={() => glisser(sens)}
      aria-label={sens === -1 ? 'Catégories précédentes' : 'Catégories suivantes'}
      tabIndex={actif ? 0 : -1}
      className={`absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 place-items-center
                  rounded-full border border-line bg-white/95 text-ink shadow-card
                  backdrop-blur transition duration-200 hover:border-ink/30 hover:shadow-lift
                  sm:grid ${sens === -1 ? 'left-0' : 'right-0'}
                  ${actif ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d={sens === -1 ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
      </svg>
    </button>
  );

  return (
    <div className="relative">
      <Fleche sens={-1} actif={gauche} />
      <Fleche sens={1} actif={droite} />

      {/* Dégradés de bord : indiquent que le contenu continue */}
      <div aria-hidden
           className={`pointer-events-none absolute inset-y-0 left-0 z-[5] w-12
                       bg-gradient-to-r from-canvas to-transparent transition-opacity
                       ${gauche ? 'opacity-100' : 'opacity-0'}`} />
      <div aria-hidden
           className={`pointer-events-none absolute inset-y-0 right-0 z-[5] w-12
                       bg-gradient-to-l from-canvas to-transparent transition-opacity
                       ${droite ? 'opacity-100' : 'opacity-0'}`} />

      <div
        ref={piste}
        className="-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-smooth
                   px-4 pb-2 sm:mx-0 sm:px-0
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cats.map((c) => (
          <Link
            key={c.slug}
            href={`/categorie/${c.slug}`}
            className="group flex min-w-[92px] shrink-0 snap-start flex-col items-center gap-2.5
                       rounded-xl2 border border-line/70 bg-white px-3 py-3.5
                       transition duration-200 hover:-translate-y-0.5 hover:border-ink/20
                       hover:shadow-card"
          >
            <IconeCategorie
              slug={c.slug}
              className="h-6 w-6 text-slate-400 transition-colors duration-200 group-hover:text-promo"
            />
            <span className="text-center text-[11px] font-medium leading-tight text-slate-600
                             transition-colors group-hover:text-ink">
              {c.nom.split(' ')[0].replace('&', '')}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
