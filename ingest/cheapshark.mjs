// KADO PRIX — Ingestion CheapShark (API publique gratuite, sans clé)
// Source légale et documentée : agrège les promos de jeux PC (Steam, GOG, Humble…)
// Doc : https://www.cheapshark.com/api/1.0/deals
// Usage : node ingest/cheapshark.mjs
import { db, upsertDeal } from './lib.mjs';

const API = 'https://www.cheapshark.com/api/1.0';
const PAGES = 3;          // 3 x 60 = 180 deals max par run
const REDUCTION_MIN = 30; // on ne garde que les vraies promos
const attente = (ms) => new Promise((r) => setTimeout(r, ms));

// --- Taux USD -> EUR (API BCE gratuite, sans clé) avec repli si indisponible
async function tauxUsdEur() {
  try {
    const r = await fetch('https://api.frankfurter.app/latest?from=USD&to=EUR');
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    if (j?.rates?.EUR) return j.rates.EUR;
    throw new Error('taux absent');
  } catch (e) {
    console.log(`  [taux] indisponible (${e.message}) — repli sur 0.92`);
    return 0.92;
  }
}

// --- Synchronise les boutiques CheapShark dans la table merchants
async function syncStores() {
  const r = await fetch(`${API}/stores`);
  const stores = await r.json();
  const map = new Map();

  for (const s of stores) {
    if (s.isActive !== 1) continue;
    const slug = `cs-${s.storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const { data } = await db.from('merchants')
      .upsert({
        nom: s.storeName,
        slug,
        url: 'https://www.cheapshark.com',
        pays: ['FR', 'BE', 'CA', 'BJ', 'CI', 'SN'], // boutiques dématérialisées = mondiales
        programme_affilie: 'cheapshark',
        fiabilite_score: 8.0,
      }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (data) map.set(String(s.storeID), data.id);
  }
  console.log(`[stores] ${map.size} boutiques synchronisées`);
  return map;
}

async function run() {
  const taux = await tauxUsdEur();
  console.log(`[taux] 1 USD = ${taux.toFixed(4)} EUR`);
  const stores = await syncStores();

  // Catégorie Gaming (créée par le seed)
  const { data: cat } = await db.from('categories').select('id').eq('slug', 'gaming').single();

  let total = 0;
  for (let page = 0; page < PAGES; page++) {
    const url = `${API}/deals?onSale=1&sortBy=Savings&pageSize=60&pageNumber=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  ✗ page ${page} : HTTP ${res.status}`);
      break;
    }
    const deals = await res.json();
    if (!deals.length) break;

    for (const d of deals) {
      const savings = Math.round(parseFloat(d.savings) || 0);
      if (savings < REDUCTION_MIN) continue;

      const prixUsd = parseFloat(d.salePrice);
      const normalUsd = parseFloat(d.normalPrice);
      if (!prixUsd || !normalUsd || normalUsd <= prixUsd) continue;

      await upsertDeal({
        titre: d.title,
        
        prix: Math.round(prixUsd * taux * 100) / 100,
        prix_barre: Math.round(normalUsd * taux * 100) / 100,
        devise: 'EUR',
        image: d.thumb || null,
        // URL de redirection officielle CheapShark (prévue pour l'usage tiers)
        url_source: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
        merchant_id: stores.get(String(d.storeID)) ?? null,
        categorie_id: cat?.id ?? null,
        fiabilite: 8,
        source: 'feed',
        pays: ['FR', 'BE', 'CA', 'BJ', 'CI', 'SN'],
        description: d.steamRatingPercent && Number(d.steamRatingPercent) > 0
          ? `Note Steam : ${d.steamRatingPercent}% d'avis positifs`
          : null,
      });
      total++;
    }
    await attente(1200); // politesse envers une API gratuite
  }

  console.log(`[cheapshark] ${total} deals jeux importés`);

  // Rattache les deals sans catégorie à Gaming (via leur produit si présent)
  
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
