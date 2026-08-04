// KADO PRIX — Ingestion Travelpayouts (vols + hôtels)
import { db, upsertDeal } from './lib.mjs';

const TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const MARKER = process.env.TRAVELPAYOUTS_MARKER || '';
const attente = (ms) => new Promise((r) => setTimeout(r, ms));

const ROUTES = [
  { from: 'PAR', to: 'COO', nomFrom: 'Paris', nomTo: 'Cotonou' },
  { from: 'PAR', to: 'ABJ', nomFrom: 'Paris', nomTo: 'Abidjan' },
  { from: 'PAR', to: 'DKR', nomFrom: 'Paris', nomTo: 'Dakar' },
  { from: 'PAR', to: 'DLA', nomFrom: 'Paris', nomTo: 'Douala' },
  { from: 'PAR', to: 'CMN', nomFrom: 'Paris', nomTo: 'Casablanca' },
  { from: 'PAR', to: 'IST', nomFrom: 'Paris', nomTo: 'Istanbul' },
  { from: 'PAR', to: 'DXB', nomFrom: 'Paris', nomTo: 'Dubaï' },
  { from: 'PAR', to: 'BKK', nomFrom: 'Paris', nomTo: 'Bangkok' },
  { from: 'COO', to: 'PAR', nomFrom: 'Cotonou', nomTo: 'Paris' },
  { from: 'ABJ', to: 'PAR', nomFrom: 'Abidjan', nomTo: 'Paris' },
  { from: 'DKR', to: 'PAR', nomFrom: 'Dakar', nomTo: 'Paris' },
];

const VILLES_HOTELS = [
  { iata: 'PAR', nom: 'Paris' },
  { iata: 'DXB', nom: 'Dubaï' },
  { iata: 'IST', nom: 'Istanbul' },
  { iata: 'CMN', nom: 'Casablanca' },
  { iata: 'BKK', nom: 'Bangkok' },
];

async function catId(slug) {
  const { data } = await db.from('categories').select('id').eq('slug', slug).single();
  return data?.id ?? null;
}

function lienVol(from, to, marker) {
  const base = `https://www.aviasales.com/search/${from}${to}1`;
  return marker ? `${base}?marker=${marker}` : base;
}
function lienHotel(ville, marker) {
  const base = `https://search.hotellook.com/?destination=${encodeURIComponent(ville)}`;
  return marker ? `${base}&marker=${marker}` : base;
}

async function vols(idVoyage) {
  let total = 0;
  for (const r of ROUTES) {
    try {
      const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates`
        + `?origin=${r.from}&destination=${r.to}`
        + `&sorting=price&unique=false&limit=3&currency=eur&token=${TOKEN}`;
      const res = await fetch(url, { headers: { 'X-Access-Token': TOKEN } });
      if (!res.ok) { console.error(`  vol ${r.from}-${r.to}: HTTP ${res.status}`); continue; }
      const json = await res.json();
      const offres = json?.data ?? [];
      if (!Array.isArray(offres)) continue;
      const best = offres[0];
      if (!best?.price) continue;
      const prix = Number(best.price);
      await upsertDeal({
        titre: `Vol ${r.nomFrom} → ${r.nomTo}`,
        prix,
        prix_barre: null,
        devise: 'EUR',
        image: null,
        url_source: lienVol(r.from, r.to, MARKER),
        url_affiliee: lienVol(r.from, r.to, MARKER),
        merchant_id: null,
        fiabilite: 7,
        source: 'feed',
        categorie_id: idVoyage,
        plateforme: 'Vol',
        pays: ['FR', 'BJ', 'CI', 'SN', 'CM'],
        description: best.departure_at
          ? `Meilleur prix trouvé, départ vers le ${String(best.departure_at).slice(0, 10)}. Aller simple, à confirmer sur Aviasales.`
          : 'Meilleur prix récent pour cette route.',
      });
      total++;
      await attente(1000);
    } catch (e) {
      console.error(`  vol ${r.from}-${r.to}: ${e.message}`);
    }
  }
  console.log(`[travelpayouts] ${total} vols importés`);
}

async function hotels(idVoyage) {
  let total = 0;
  for (const v of VILLES_HOTELS) {
    try {
      const url = `https://engine.hotellook.com/api/v2/cache.json`
        + `?location=${v.iata}&currency=eur&limit=1&token=${TOKEN}`;
      const res = await fetch(url, { headers: { 'X-Access-Token': TOKEN } });
      if (!res.ok) { console.error(`  hotel ${v.nom}: HTTP ${res.status}`); continue; }
      const json = await res.json();
      const arr = Array.isArray(json) ? json : (json?.data ?? []);
      const h = arr[0];
      if (!h?.priceFrom && !h?.priceAvg) continue;
      const prix = Math.round(Number(h.priceFrom ?? h.priceAvg));
      await upsertDeal({
        titre: `Hôtels à ${v.nom} dès ${prix} €/nuit`,
        prix,
        prix_barre: null,
        devise: 'EUR',
        image: null,
        url_source: lienHotel(v.nom, MARKER),
        url_affiliee: lienHotel(v.nom, MARKER),
        merchant_id: null,
        fiabilite: 7,
        source: 'feed',
        categorie_id: idVoyage,
        plateforme: 'Hôtel',
        pays: ['FR', 'BJ', 'CI', 'SN', 'CM'],
        description: `À partir de ${prix} € la nuit. Comparez et réservez sur Hotellook.`,
      });
      total++;
      await attente(1000);
    } catch (e) {
      console.error(`  hotel ${v.nom}: ${e.message}`);
    }
  }
  console.log(`[travelpayouts] ${total} offres hôtels importées`);
}

async function run() {
  if (!TOKEN) {
    console.log('[travelpayouts] TRAVELPAYOUTS_TOKEN absent — skip');
    return;
  }
  const idVoyage = await catId('voyages');
  if (!idVoyage) {
    console.log('[travelpayouts] catégorie "voyages" introuvable — skip');
    return;
  }
  await vols(idVoyage);
  await hotels(idVoyage);
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
