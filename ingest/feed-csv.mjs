// PROMOZ — Ingestion générique de feeds CSV d'affiliation (Awin, Effiliation, Jumia…)
// Lit les sources type 'feed_csv' dans scrape_sources et importe les produits EN PROMO uniquement.
// Usage : node ingest/feed-csv.mjs
import { parse } from 'csv-parse/sync';
import { db, upsertDeal, merchantIdBySlug } from './lib.mjs';

const MAX_PAR_SOURCE = 300; // rester léger sur le free tier

async function run() {
  const { data: sources, error } = await db
    .from('scrape_sources').select('*').eq('type', 'feed_csv').eq('actif', true);
  if (error) throw error;

  for (const src of sources ?? []) {
    if (!src.url || src.url.startsWith('REMPLACER')) {
      console.log(`[skip] ${src.nom} : URL de feed non configurée`);
      continue;
    }
    console.log(`[feed] ${src.nom}`);
    try {
      const res = await fetch(src.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const csv = await res.text();
      const rows = parse(csv, { columns: true, skip_empty_lines: true, relax_column_count: true });

      const m = src.config.mapping;
      const merchant = await merchantIdBySlug(src.config.merchant_slug);
      let count = 0;

      for (const r of rows) {
        const prix = parseFloat(r[m.prix]);
        const prixBarre = parseFloat(r[m.prix_barre]);
        // On ne garde QUE les vraies promos (>= 15% de réduction)
        if (!prix || !prixBarre || prixBarre <= prix) continue;
        if ((1 - prix / prixBarre) < 0.15) continue;

        await upsertDeal({
          titre: r[m.titre],
          prix,
          prix_barre: prixBarre,
          image: r[m.image] || null,
          url_source: r[m.url],
          url_affiliee: r[m.url],
          devise: r[m.devise] || 'EUR',
          merchant_id: merchant.id,
          fiabilite: Number(merchant.fiabilite_score),
          source: 'feed',
          pays: src.config.pays ?? ['FR'],
        });
        if (++count >= MAX_PAR_SOURCE) break;
      }
      console.log(`  → ${count} deals importés`);
      await db.from('scrape_sources')
        .update({ dernier_run: new Date().toISOString(), erreurs: 0 })
        .eq('id', src.id);
    } catch (e) {
      console.error(`  ✗ ${src.nom}: ${e.message}`);
      await db.from('scrape_sources')
        .update({ dernier_run: new Date().toISOString(), erreurs: src.erreurs + 1 })
        .eq('id', src.id);
    }
  }
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
