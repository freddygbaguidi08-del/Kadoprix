// PROMOZ — Job quotidien : expiration, détection faux prix barrés, alertes mots-clés Telegram
// Usage : node ingest/maintenance.mjs
import { db, fauxPrixSuspect } from './lib.mjs';

async function expirerDeals() {
  const { count } = await db.from('deals')
    .update({ statut: 'expired' }, { count: 'exact' })
    .eq('statut', 'live')
    .lt('fin', new Date().toISOString());
  console.log(`[expire] ${count ?? 0} deals expirés (date de fin dépassée)`);

  // Deals sans date de fin, non mis à jour depuis 14 jours => expirés
  const limite = new Date(Date.now() - 14 * 864e5).toISOString();
  const { count: c2 } = await db.from('deals')
    .update({ statut: 'expired' }, { count: 'exact' })
    .eq('statut', 'live').is('fin', null).lt('updated_at', limite);
  console.log(`[expire] ${c2 ?? 0} deals inactifs > 14j expirés`);
}

async function detecterFauxPrix() {
  const { data: deals } = await db.from('deals')
    .select('id, prix_barre').eq('statut', 'live').not('prix_barre', 'is', null).limit(500);
  let flags = 0;
  for (const d of deals ?? []) {
    const suspect = await fauxPrixSuspect(d.id, Number(d.prix_barre));
    if (suspect) {
      await db.from('deals').update({ faux_prix_suspect: true }).eq('id', d.id);
      flags++;
    }
  }
  console.log(`[faux-prix] ${flags} deals marqués suspects`);
}

async function alertesTelegram() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return console.log('[alertes] TELEGRAM_BOT_TOKEN absent — skip');

  const hier = new Date(Date.now() - 864e5).toISOString();
  const { data: alerts } = await db.from('alerts')
    .select('*').eq('actif', true).contains('canaux', ['telegram']).not('telegram_chat_id', 'is', null);

  for (const a of alerts ?? []) {
    let q = db.from('deals').select('titre, slug, prix, devise, pct_reduction')
      .eq('statut', 'live').gte('created_at', hier).limit(3);
    if (a.type === 'keyword') q = q.ilike('titre', `%${a.valeur}%`);
    if (a.seuil_pct) q = q.gte('pct_reduction', a.seuil_pct);
    const { data: hits } = await q;
    if (!hits?.length) continue;

    const texte = hits.map((d) =>
      `🔥 ${d.titre}\n💶 ${d.prix} ${d.devise} (-${d.pct_reduction}%)\nhttps://promoz.vercel.app/deal/${d.slug}`
    ).join('\n\n');

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: a.telegram_chat_id, text: `🔔 Alerte "${a.valeur}"\n\n${texte}` }),
    });
  }
  console.log(`[alertes] ${alerts?.length ?? 0} alertes Telegram traitées`);
}

Promise.resolve()
  .then(expirerDeals)
  .then(detecterFauxPrix)
  .then(alertesTelegram)
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
