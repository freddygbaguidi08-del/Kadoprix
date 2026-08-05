import Link from 'next/link';

export default function BlocAfrique() {
  return (
    <Link href="/categorie/voyages"
          className="group flex items-center justify-between gap-4 rounded-xl2 border
                     border-promo/20 bg-promo/[0.04] p-5 transition hover:border-promo/40">
      <div>
        <p className="flex items-center gap-2 font-display text-base font-extrabold text-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-promo">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
          Spécial Afrique de l’Ouest
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
          Vols et bons plans vers Cotonou, Abidjan, Dakar — et guides destination complets.
        </p>
      </div>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
           className="shrink-0 text-promo transition group-hover:translate-x-0.5">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}
