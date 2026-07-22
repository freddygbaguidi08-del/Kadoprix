import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import HeaderCompte from '@/components/HeaderCompte';
import { Bricolage_Grotesque, Inter } from 'next/font/google';

const display = Bricolage_Grotesque({
  subsets: ['latin'], weight: ['600', '800'], variable: '--font-display', display: 'swap',
});
const body = Inter({
  subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Kado Prix — Des promos vérifiées, tous les jours', template: '%s — Kado Prix' },
  description:
    'L’agrégateur de promotions qui vérifie que la réduction est réelle. High-tech, mode, maison, voyages — France, Afrique francophone et Canada.',
};

const nav = [
  { href: '/', label: 'Accueil', icone: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5' },
  { href: '/deals-du-jour', label: 'Du jour', icone: 'M13 2 4.5 13H11l-1 9 8.5-11H12l1-9Z' },
  { href: '/recherche', label: 'Chercher', icone: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3' },
  { href: '/ma-liste', label: 'Ma liste', icone: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans">
        <a href="#contenu"
           className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]
                      focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
          Aller au contenu
        </a>

        <header className="sticky top-0 z-50 border-b border-line/70 bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-6">
            <Link href="/" className="shrink-0 font-display text-[22px] font-extrabold tracking-tight">
              Kado<span className="text-promo">Prix</span>
            </Link>

            <form action="/recherche" className="relative flex-1">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                   width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                name="q" type="search" aria-label="Rechercher une offre"
                placeholder="Un produit, une marque, un magasin…"
                className="w-full rounded-full border border-line bg-canvas py-2.5 pl-10 pr-4
                           text-sm placeholder:text-slate-400 transition
                           focus:border-ink focus:bg-white"
              />
            </form>

            <HeaderCompte />
          </div>
        </header>

        <main id="contenu" className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:pb-10">
          {children}
        </main>

        {/* Navigation mobile : 70 % du trafic attendu */}
        <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95
                        backdrop-blur-md sm:hidden">
          <ul className="mx-auto flex max-w-md">
            {nav.map((n) => (
              <li key={n.href} className="flex-1">
                <Link href={n.href}
                      className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold
                                 text-slate-500 transition active:text-promo">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d={n.icone} />
                  </svg>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="border-t border-line bg-white py-10">
          <div className="mx-auto max-w-6xl space-y-4 px-4 text-center text-xs text-slate-500">
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              <Link href="/a-propos" className="transition hover:text-ink">À propos</Link>
              <Link href="/mentions-legales" className="transition hover:text-ink">Mentions légales</Link>
              <Link href="/confidentialite" className="transition hover:text-ink">Confidentialité</Link>
              <Link href="/cgu" className="transition hover:text-ink">Conditions d’utilisation</Link>
            </nav>
            <p className="mx-auto max-w-xl leading-relaxed">
              Kado Prix référence des offres de marchands tiers et ne vend aucun produit.
              Certains liens sont affiliés : ils financent le service sans surcoût pour vous.
            </p>
            <p>Prix relevés quotidiennement, susceptibles d’évoluer chez le marchand.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
