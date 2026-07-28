// KADO PRIX — Ingestion AliExpress Affiliate (AliExpress Open Platform)
// Remplit high-tech, maison, mode… d'un coup, pour FR + Afrique + Canada.
//
// PRÉREQUIS (secrets GitHub, à ajouter quand ta candidature Portals est validée) :
//   ALIEXPRESS_APP_KEY
//   ALIEXPRESS_APP_SECRET
//   ALIEXPRESS_TRACKING_ID   (ton "Tracking ID" créé dans le dashboard Portals)
//
// Tant que ces secrets sont absents, le script se saute proprement (comme feed-csv).
// Usage : node ingest/aliexpress.mjs
import crypto from 'node:crypto';
import { db, upsertDeal } from './lib.mjs';

const APP_KEY = process.env.ALIEXPRESS_APP_KEY;
const APP_SECRET = process.env.ALIEXPRESS_APP_SECRET;
const TRACKING_ID = process.env.ALIEXPRESS_TRACKING_ID;
const GATEWAY = 'https://api-sg.aliexpress.com/sync';

const DEVISE = 'EUR';
const LANGUE = 'FR';
const PAYS_EXPEDITION = 'FR';      // adresse de livraison de référence pour les prix
const REDUCTION_MIN = 20;
const PAGES = 2;                    // 2 x 40 = 80 produits par requête catégorie
const attente = (ms) => new Promise((r) => setTimeout(r, ms));

// Chaque slug de catégorie Kado Prix -> mots-clés AliExpress à rechercher.
// (La recherche par mot-clé est plus fiable que les categoryId, qui changent.)
const RECHERCHES = [
  { slug: 'high-tech',     mots: 'écouteurs bluetooth' },
  { slug: 'high-tech',     mots: 'chargeur rapide usb c' },
  { slug: 'high-tech',     mots: 'montre connectée' },
  { slug: 'maison-jardin', mots: 'organisateur cuisine' },
  { slug: 'maison-jardin', mots: 'lampe led chambre' },
  { slug: 'mode',          mots: 'sac à main femme' },
  { slug: 'mode',          mots: 'montre homme' },
  { slug: 'beaute-sante',  mots: 'soin visage' },
  { slug: 'sports-loisirs', mots: 'accessoires fitness' },
];

// --- Signature TOP : tri des params, concat, HMAC-MD5 encadré du secret, MAJ ---
function signer(params) {
  const tri = Object.keys(params).sort();
  const base = APP_SECRET + tri.map((k) => k + params[k]).join('') + APP_SECRET;
  return crypto.createHash('md5').update(base, 'utf8').digest('hex').toUpperCase();
}

async function appel(method, extra) {
  const params = {
    method,
    app_key: APP_KEY,
    timestamp: String(Date.now()),
    format: 'json',
    v: '2.0',
    sign_method: 'md5',
    ...extra,
  };
  params.sign = signer(params);

  const body = new URLSearchParams(params).toString();
  const res = await fetch(GATEWAY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function categorieIds() {
  const { data } = await db.from('categories').select('id, slug').is('parent_id', null);
  return new Map((data ?? []).map((c) => [c.slug, c.id]));
}

// Extrait la liste de produits quelle que soit la profondeur de la réponse AliExpress
function extraireProduits(json) {
  const resp =
    json?.aliexpress_affiliate_product_query_response ??
    json?.resp_result ?? json;
  const result = resp?.resp_result?.result ?? resp?.result ?? resp;
  const prods = result?.products?.product ?? result?.products ?? [];
  return Array.isArray(prods) ? prods : [];
}

async function run() {
  if (!APP_KEY || !APP_SECRET || !TRACKING_ID) {
    console.log('[aliexpress] secrets absents (APP_KEY / APP_SECRET / TRACKING_ID) — skip');
    return;
  }

  const cats = await categorieIds();
  let total = 0;

  for (const { slug, mots } of RECHERCHES) {
    const catId = cats.get(slug) ?? null;
    console.log(`[aliexpress] "${mots}" -> ${slug}`);

    for (let page = 1; page <= PAGES; page++) {
      try {
        const json = await appel('aliexpress.affiliate.product.query', {
          keywords: mots,
          page_no: String(page),
          page_size: '40',
          target_currency: DEVISE,
          target_language: LANGUE,
          ship_to_country: PAYS_EXPEDITION,
          tracking_id: TRACKING_ID,
          sort: 'LAST_VOLUME_DESC',       // les plus vendus d'abord = qualité
        });

        const produits = extraireProduits(json);
        if (!produits.length) {
          if (page === 1) console.log('   (aucun produit — vérifie tracking_id / permissions)');
          break;
        }

        for (const p of produits) {
          const prix = parseFloat(p.target_sale_price ?? p.sale_price);
          const prixBarre = parseFloat(p.target_original_price ?? p.original_price);
          if (!prix || !prixBarre || prixBarre <= prix) continue;
          if ((1 - prix / prixBarre) * 100 < REDUCTION_MIN) continue;

          await upsertDeal({
            titre: p.product_title,
            prix,
            prix_barre: prixBarre,
            devise: DEVISE,
            image: p.product_main_image_url ?? null,
            // promotion_link contient déjà ton tracking : c'est le lien affilié
            url_source: p.promotion_link ?? p.product_detail_url,
            url_affiliee: p.promotion_link ?? p.product_detail_url,
            merchant_id: null,
            fiabilite: 6,
            source: 'feed',
            categorie_id: catId,
            plateforme: null,
            pays: ['FR', 'BE', 'BJ', 'CI', 'SN', 'CM', 'CA'],
            description: p.evaluate_rate ? `Note vendeur : ${p.evaluate_rate}` : null,
          });
          total++;
        }
        await attente(1500); // l'API pénalise les rafales trop rapprochées
      } catch (e) {
        console.error(`   ✗ ${e.message}`);
        break;
      }
    }
    await attente(1500);
  }

  console.log(`[aliexpress] ${total} deals importés`);
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
