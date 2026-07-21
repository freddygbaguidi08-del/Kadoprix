// KADO PRIX — Veille RSS
// IMPORTANT : ce script NE PUBLIE RIEN automatiquement.
// Il remplit une file d'attente (table veille_items) que tu valides à la main
// depuis /admin/veille. Tu réécris le titre et tu pointes vers TON lien marchand.
// C'est la différence entre faire de la veille (légal) et recopier un concurrent (non).
// Usage : node ingest/rss-veille.mjs
import Parser from 'rss-parser';
import { db } from './lib.mjs';
import crypto from 'node:crypto';

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'KadoPrixBot/1.0 (veille; +https://kadoprix.vercel.app)' },
});

const RETENTION_JOURS = 7;

async function run() {
  const { data: sources, error } = await db
    .from('scrape_sources').select('*').eq('type', 'rss').eq('actif', true);
  if (error) throw error;

  if (!sources?.length) {
    console.log('[rss] aucune source RSS configurée — ajoute des lignes dans scrape_sources');
    return;
  }

  for (const src of sources) {
    console.log(`[rss] ${src.nom}`);
    try {
      const flux = await parser.parseURL(src.url);
      let nouveaux = 0;

      for (const item of (flux.items ?? []).slice(0, 40)) {
        if (!item.link || !item.title) continue;
        const hash = crypto.createHash('sha1').update(item.link).digest('hex');

        const { error: insErr } = await db.from('veille_items').insert({
          source_nom: src.nom,
          titre: item.title.slice(0, 300),
          lien: item.link,
          extrait: (item.contentSnippet ?? '').slice(0, 500) || null,
          publie_le: item.isoDate ?? null,
          hash,
          statut: 'nouveau',
        });
        // 23505 = doublon (déjà vu) : normal, on ignore
        if (!insErr) nouveaux++;
        else if (insErr.code !== '23505') console.error(`    ! ${insErr.message}`);
      }

      console.log(`  → ${nouveaux} nouveaux éléments en file`);
      await db.from('scrape_sources')
        .update({ dernier_run: new Date().toISOString(), erreurs: 0 }).eq('id', src.id);
    } catch (e) {
      console.error(`  ✗ ${src.nom}: ${e.message}`);
      await db.from('scrape_sources')
        .update({ erreurs: src.erreurs + 1 }).eq('id', src.id);
    }
  }

  // Purge des éléments traités ou anciens pour ne pas saturer les 500 Mo gratuits
  const limite = new Date(Date.now() - RETENTION_JOURS * 864e5).toISOString();
  const { count } = await db.from('veille_items')
    .delete({ count: 'exact' }).lt('created_at', limite).neq('statut', 'publie');
  console.log(`[purge] ${count ?? 0} éléments de veille supprimés (> ${RETENTION_JOURS}j)`);
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
