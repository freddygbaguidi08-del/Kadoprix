// PROMOZ — Scraper Cheerio générique pour pages "promos" statiques.
// Chaque source type 'cheerio' définit ses sélecteurs dans scrape_sources.config, ex :
// {
//   "merchant_slug": "cdiscount", "pays": ["FR"],
//   "selecteurs": {
//     "carte": ".product-card",
//     "titre": ".product-title",
//     "prix": ".price-current",
//     "prix_barre": ".price-old",
//     "image": "img@src",
//     "lien": "a@href"
//   },
//   "base_url": "https://exemple.com"
// }
// Usage : node ingest/scrape-cheerio.mjs
import * as cheerio from 'cheerio';
import { db, upsertDeal, merchantIdBySlug } from './lib.mjs';

const UA = 'PromozBot/1.0 (+https://promoz.vercel.app/bot)'; // identifiable = éthique
const attente = (ms) => new Promise((r) => setTimeout(r, ms));

const lireSel = ($el, sel) => {
  const [css, attr] = sel.split('@');
  const node = $el.find(css).first();
  return attr ? node.attr(attr) : node.text().trim();
};
const parsePrix = (s) => parseFloat(String(s).replace(/[^\d,.]/g, '').replace(',', '.')) || null;

async function run() {
  const { data: sources } = await db
    .from('scrape_sources').select('*').eq('type', 'cheerio').eq('actif', true);

  for (const src of sources ?? []) {
    console.log(`[scrape] ${src.nom}`);
    try {
      const res = await fetch(src.url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const $ = cheerio.load(await res.text());
      const S = src.config.selecteurs;
      const merchant = await merchantIdBySlug(src.config.merchant_slug);
      let count = 0;

      for (const el of $(S.carte).toArray()) {
        const $el = $(el);
        const titre = lireSel($el, S.titre);
        const prix = parsePrix(lireSel($el, S.prix));
        const prixBarre = parsePrix(lireSel($el, S.prix_barre));
        let lien = lireSel($el, S.lien);
        if (!titre || !prix || !prixBarre || prixBarre <= prix || !lien) continue;
        if (lien.startsWith('/')) lien = src.config.base_url + lien;

        await upsertDeal({
          titre, prix, prix_barre: prixBarre,
          image: lireSel($el, S.image) || null,
          url_source: lien,
          merchant_id: merchant.id,
          fiabilite: Number(merchant.fiabilite_score),
          source: 'scraper',
          pays: src.config.pays ?? ['FR'],
        });
        count++;
        await attente(2500); // 1 requête / 2,5 s max côté upserts — politesse
      }
      console.log(`  → ${count} deals`);
      await db.from('scrape_sources')
        .update({ dernier_run: new Date().toISOString(), erreurs: 0 }).eq('id', src.id);
    } catch (e) {
      console.error(`  ✗ ${src.nom}: ${e.message}`);
      await db.from('scrape_sources')
        .update({ erreurs: src.erreurs + 1 }).eq('id', src.id);
    }
    await attente(3000);
  }
}
run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
