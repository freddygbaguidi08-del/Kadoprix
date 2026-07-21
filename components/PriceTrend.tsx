// KADO PRIX — Signature du site : la courbe de prix miniature + le verdict.
// C'est ce qu'aucun agrégateur francophone n'affiche dans une grille.
// Aucune librairie : SVG généré à la main, ~1 ko, rendu côté serveur.

export type Point = { prix: number; releve_le: string };

export function verdict(prix: number, histo: Point[], suspect: boolean) {
  if (suspect) return { texte: 'Prix de référence douteux', ton: 'warn' as const };
  if (histo.length < 5) return null;
  const valeurs = histo.map((h) => Number(h.prix));
  const min = Math.min(...valeurs);
  const max = Math.max(...valeurs);
  if (prix <= min) return { texte: 'Au plus bas depuis 3 mois', ton: 'eco' as const };
  if (max > min && prix <= min + (max - min) * 0.15)
    return { texte: 'Proche du plus bas', ton: 'eco' as const };
  return { texte: 'Prix moyen observé', ton: 'muted' as const };
}

export function Sparkline({
  points, prix, w = 96, h = 26,
}: { points: Point[]; prix: number; w?: number; h?: number }) {
  if (points.length < 5) return null;

  const v = points.map((p) => Number(p.prix));
  const min = Math.min(...v, prix);
  const max = Math.max(...v, prix);
  const span = max - min || 1;
  const pas = w / (v.length - 1);

  const xy = v.map((val, i) => [i * pas, h - ((val - min) / span) * h] as const);
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const aire = `${d} L${w},${h} L0,${h} Z`;
  const yActuel = h - ((prix - min) / span) * h;
  const auPlusBas = prix <= min;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true"
         className="overflow-visible">
      <path d={aire} fill="currentColor" opacity="0.08" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.25"
            strokeLinejoin="round" strokeLinecap="round" opacity="0.5" />
      <circle cx={w} cy={yActuel} r={auPlusBas ? 3 : 2.25} fill="currentColor" />
    </svg>
  );
}
