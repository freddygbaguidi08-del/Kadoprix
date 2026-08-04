import Link from 'next/link';
import { DESTINATIONS } from '@/lib/destinations';

export default function BandeauDestinations() {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-extrabold">Guides destination</h2>
        <p className="text-xs text-slate-500">
          Vol, visa, budget et bons plans — tout pour préparer votre départ
        </p>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2
                      [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DESTINATIONS.map((d) => (
          <Link key={d.slug} href={`/destination/${d.slug}`}
                className="group flex min-w-[150px] shrink-0 flex-col gap-1 rounded-xl2 border
                           border-line/70 bg-white p-4 transition hover:-translate-y-0.5
                           hover:border-ink/20 hover:shadow-card">
            <span className="text-2xl">{d.emoji}</span>
            <span className="font-display text-sm font-extrabold">{d.ville}</span>
            <span className="text-[11px] text-slate-500">{d.pays}</span>
            <span className="mt-1 text-[11px] font-semibold text-promo">
              Guide complet →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
