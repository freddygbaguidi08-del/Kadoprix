const BASE = 'https://kadoprix.vercel.app';

export const site = BASE;

export function filAriane(items: { nom: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.nom,
      item: `${BASE}${it.url}`,
    })),
  };
}

export function listeOffres(deals: { slug: string; titre: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: deals.length,
    itemListElement: deals.slice(0, 30).map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${BASE}/deal/${d.slug}`,
      name: d.titre,
    })),
  };
}

export function produitOffre(d: {
  slug: string; titre: string; image: string | null;
  prix: number; devise: string; prix_barre: number | null;
  merchants?: { nom: string } | null; fin: string | null;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: d.titre,
    image: d.image ?? undefined,
    offers: {
      '@type': 'Offer',
      price: d.prix,
      priceCurrency: d.devise,
      availability: 'https://schema.org/InStock',
      priceValidUntil: d.fin ?? undefined,
      url: `${BASE}/deal/${d.slug}`,
      seller: d.merchants?.nom ? { '@type': 'Organization', name: d.merchants.nom } : undefined,
    },
  };
}

export function Jsonld({ data }: { data: object | object[] }) {
  const blocs = Array.isArray(data) ? data : [data];
  return blocs.map((b, i) => (
    <script key={i} type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(b) }} />
  ));
}
