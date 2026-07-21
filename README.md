# 🛒 Promoz — Starter MVP (Next.js 14 + Supabase + Vercel + GitHub Actions)

Agrégateur de deals & promotions — 100 % free tier, déployable entièrement depuis le navigateur.
**Build vérifié ✅** (`next build` passe sans erreur).

## 📂 Contenu

```
supabase/01-schema.sql      → schéma complet (tables, RLS, triggers, vue deals_du_jour)
supabase/02-seed.sql        → catégories + marchands de départ
supabase/03-deals-demo.sql  → 6 deals de démo pour voir le site vivre tout de suite
app/                        → Next.js 14 App Router (accueil, catégorie, deal, recherche,
                              deals-du-jour, sitemap, robots, route /api/out trackée)
components/DealCard.tsx     → carte deal réutilisable
ingest/                     → pipeline : feeds CSV affiliés, scraper Cheerio, maintenance
.github/workflows/ingest.yml→ crons GitHub Actions (ingestion 1×/j, maintenance /4 h)
```

## 🚀 Déploiement en 8 étapes (≈ 30 min, 0 €)

### 1. Supabase
1. https://supabase.com → New project (région **EU West**), note le mot de passe.
2. SQL Editor → colle **01-schema.sql** → Run. Puis **02-seed.sql** → Run. Puis **03-deals-demo.sql** → Run.
3. Settings → API : copie `Project URL`, `anon public key`, `service_role key`.

### 2. GitHub
1. Crée un repo **public** `promoz` (Actions illimitées en public).
2. Upload de TOUS les fichiers de ce dossier (glisser-déposer, "Add file → Upload files").
3. Settings → Secrets and variables → Actions → New repository secret :
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key
   - `TELEGRAM_BOT_TOKEN` (optionnel — via @BotFather)

### 3. Vercel
1. https://vercel.com → Add New → Project → Import du repo `promoz`.
2. Environment Variables :
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key
3. Deploy → le site est en ligne sur `promoz-xxx.vercel.app` avec les 6 deals de démo. 🎉

### 4. Premier run d'ingestion
GitHub → onglet **Actions** → "Ingestion Promoz" → **Run workflow**.
(Tant que la source Awin n'est pas configurée, le job feed est simplement "skippé" proprement.)

### 5. Brancher un vrai feed d'affiliation
1. Inscris-toi sur **Awin** (éditeur) et/ou **Jumia affiliate program**.
2. Récupère l'URL du datafeed CSV d'un annonceur accepté (Awin → Toolbox → Create-a-Feed).
3. Supabase → Table Editor → `scrape_sources` → remplace `REMPLACER_PAR_URL_FEED_AWIN`
   par l'URL réelle et adapte `config.mapping` aux noms de colonnes du feed.
4. Relance le workflow → les vraies promos arrivent (filtrées ≥ 15 % de réduction).

### 6. Ajouter un scraper Cheerio
Insère une ligne dans `scrape_sources` avec `type='cheerio'` et un `config` de sélecteurs
(exemple documenté en tête de `ingest/scrape-cheerio.mjs`). Toujours vérifier robots.txt.

### 7. Nettoyer la démo
```sql
delete from public.deals where dedup_hash like 'demo%';
```

### 8. Ensuite (V1 → V1.5)
- Auth Supabase (magic link) + page profil + favoris (RLS déjà prêtes côté DB).
- Bot Telegram : crée le bot, mets le token en secret, ajoute des lignes dans `alerts`
  avec `telegram_chat_id` → les notifications partent au prochain run maintenance.
- Google Search Console : soumets `/sitemap.xml` (généré automatiquement).

## 🔑 Points d'architecture à connaître

- **Dédoublonnage** : `dedup_hash = sha1(domaine + titre normalisé + prix)` avec index
  unique → un même deal re-scrapé met à jour la ligne au lieu de créer un doublon.
- **Score Promoz** : calculé à l'ingestion dans `ingest/lib.mjs` (réduction 40 pts,
  fraîcheur 30, fiabilité marchand 15, qualité des données 15).
- **Anti-fausse promo** : `maintenance.mjs` compare le prix barré à la médiane 90 j de
  `price_history` → badge "⚠️ prix de référence douteux" affiché sur le site.
- **Tracking affiliation** : chaque clic passe par `/api/out/[id]` qui log un SubID
  (`clickref` Awin / `ascsubtag` Amazon) → rapprochement cashback via les exports CSV.
- **Free tier friendly** : pages en ISR (10-15 min), le cron quotidien écrit en base
  chaque jour → le projet Supabase ne se met jamais en pause.

## ⚖️ Rappels légaux avant mise en ligne publique
Mentions légales + politique de confidentialité (templates CNIL), mention "liens
affiliés" (déjà dans le footer et sur les pages deal), respect robots.txt des sources.
