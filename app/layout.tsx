import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Promoz — Toutes les promos du web, un seul endroit',
  description:
    'Des promos vérifiées 365 jours par an : high-tech, mode, maison, voyages… France, Afrique francophone et Canada.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
            <Link href="/" className="text-2xl font-black tracking-tight">
              Promo<span className="text-promo">z</span>
            </Link>
            <form action="/recherche" className="flex-1">
              <input
                name="q"
                placeholder="Chercher un produit, une marque, un magasin…"
                className="w-full rounded-full border border-slate-200 bg-fond px-4 py-2 text-sm outline-none focus:border-promo"
              />
            </form>
            <Link href="/deals-du-jour" className="hidden text-sm font-semibold text-promo sm:block">
              🔥 Deals du jour
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-12 border-t bg-white py-8 text-center text-xs text-slate-500">
          <p>Promoz — Certains liens sont affiliés : ils financent le service sans surcoût pour vous.</p>
          <p className="mt-1">Prix vérifiés quotidiennement, susceptibles d'évoluer chez le marchand.</p>
        </footer>
      </body>
    </html>
  );
}
