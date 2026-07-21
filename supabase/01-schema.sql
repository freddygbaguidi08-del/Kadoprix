-- ============================================================
-- PROMOZ — Schéma Supabase (PostgreSQL) — v1 MVP
-- À coller tel quel dans Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists pg_trgm;

-- ---------- PROFILS (liés à auth.users de Supabase) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text unique,
  pays text default 'FR',            -- FR, BJ, CI, SN, CM, CA...
  devise text default 'EUR',         -- EUR, XOF, CAD
  karma int not null default 0,
  points int not null default 0,
  role text not null default 'user' check (role in ('user','contributor','vendor','moderator','admin')),
  created_at timestamptz not null default now()
);

-- Création auto du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, pseudo)
  values (new.id, coalesce(new.raw_user_meta_data->>'pseudo', split_part(new.email,'@',1)));
  return new;
end $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- MARCHANDS ----------
create table public.merchants (
  id bigint generated always as identity primary key,
  nom text not null,
  slug text not null unique,
  url text,
  logo text,
  pays text[] not null default '{FR}',
  fiabilite_score numeric(3,1) not null default 5.0,   -- /10
  programme_affilie text,                              -- awin, amazon, jumia, direct...
  created_at timestamptz not null default now()
);

-- ---------- CATÉGORIES (arborescence) ----------
create table public.categories (
  id bigint generated always as identity primary key,
  parent_id bigint references public.categories(id) on delete cascade,
  nom text not null,
  slug text not null unique,
  icone text,
  ordre int not null default 0
);

-- ---------- PRODUITS (optionnel, pour historique/comparateur) ----------
create table public.products (
  id bigint generated always as identity primary key,
  nom_normalise text not null,
  marque text,
  categorie_id bigint references public.categories(id),
  image text,
  ean text,
  created_at timestamptz not null default now()
);
create index products_nom_trgm on public.products using gin (nom_normalise gin_trgm_ops);

-- ---------- DEALS (table centrale) ----------
create table public.deals (
  id bigint generated always as identity primary key,
  slug text not null unique,
  product_id bigint references public.products(id),
  merchant_id bigint references public.merchants(id),
  user_id uuid references public.profiles(id),
  source text not null default 'scraper' check (source in ('scraper','feed','community','vendor')),
  titre text not null,
  description text,
  image text,
  url_source text not null,          -- URL marchand d'origine
  url_affiliee text,                 -- URL trackée (fallback: url_source)
  code_promo text,
  prix numeric(12,2) not null,
  prix_barre numeric(12,2),
  devise text not null default 'EUR',
  pct_reduction int generated always as (
    case when prix_barre is not null and prix_barre > 0
      then round(100 - (prix / prix_barre * 100))::int else null end
  ) stored,
  score_promoz int not null default 50,       -- 0-100, calculé à l'ingestion
  temperature int not null default 0,         -- somme des votes
  faux_prix_suspect boolean not null default false,
  statut text not null default 'live' check (statut in ('pending','live','expired','rejected')),
  debut timestamptz,
  fin timestamptz,
  pays text[] not null default '{FR}',
  clics int not null default 0,
  dedup_hash text not null,                   -- hash(domaine+titre normalisé+prix)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index deals_dedup on public.deals (dedup_hash);
create index deals_statut_created on public.deals (statut, created_at desc);
create index deals_temp on public.deals (statut, temperature desc);
create index deals_fin on public.deals (fin) where statut = 'live';
create index deals_titre_trgm on public.deals using gin (titre gin_trgm_ops);

-- ---------- HISTORIQUE DE PRIX ----------
create table public.price_history (
  id bigint generated always as identity primary key,
  product_id bigint references public.products(id) on delete cascade,
  deal_id bigint references public.deals(id) on delete cascade,
  merchant_id bigint references public.merchants(id),
  prix numeric(12,2) not null,
  releve_le date not null default current_date
);
create unique index ph_unique_day on public.price_history (coalesce(product_id,0), coalesce(deal_id,0), coalesce(merchant_id,0), releve_le);

-- ---------- VOTES / COMMENTAIRES / FAVORIS / ALERTES ----------
create table public.votes (
  user_id uuid references public.profiles(id) on delete cascade,
  deal_id bigint references public.deals(id) on delete cascade,
  valeur smallint not null check (valeur in (-1,1)),
  created_at timestamptz not null default now(),
  primary key (user_id, deal_id)
);

-- Mise à jour auto de la température
create or replace function public.refresh_temperature()
returns trigger language plpgsql security definer set search_path = public as $$
declare d bigint;
begin
  d := coalesce(new.deal_id, old.deal_id);
  update public.deals
    set temperature = coalesce((select sum(valeur)*7 from public.votes where deal_id = d),0),
        updated_at = now()
  where id = d;
  return null;
end $$;
create trigger votes_refresh after insert or update or delete on public.votes
  for each row execute function public.refresh_temperature();

create table public.comments (
  id bigint generated always as identity primary key,
  deal_id bigint not null references public.deals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id bigint references public.comments(id) on delete cascade,
  contenu text not null check (char_length(contenu) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid references public.profiles(id) on delete cascade,
  deal_id bigint references public.deals(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, deal_id)
);

create table public.alerts (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('keyword','brand','category','price_target')),
  valeur text not null,                -- "ps5", "samsung", slug catégorie...
  seuil_pct int,                       -- ex: 40 => -40% mini
  prix_cible numeric(12,2),
  canaux text[] not null default '{email}',   -- email, telegram, push
  telegram_chat_id text,
  actif boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- TRACKING AFFILIATION / CASHBACK ----------
create table public.clicks (
  id bigint generated always as identity primary key,
  deal_id bigint not null references public.deals(id) on delete cascade,
  user_id uuid references public.profiles(id),
  subid text not null,                 -- transmis à la régie (rapprochement CSV)
  created_at timestamptz not null default now()
);
create index clicks_subid on public.clicks (subid);

create table public.cashback_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id),
  click_id bigint references public.clicks(id),
  montant_commission numeric(12,2) not null,
  part_user numeric(12,2) not null,
  devise text not null default 'EUR',
  statut text not null default 'pending' check (statut in ('pending','valide','paye','annule')),
  source_csv text,
  created_at timestamptz not null default now()
);

-- ---------- SOURCES DE SCRAPING ----------
create table public.scrape_sources (
  id bigint generated always as identity primary key,
  nom text not null,
  url text not null,
  type text not null check (type in ('feed_csv','rss','cheerio','playwright')),
  config jsonb not null default '{}',
  frequence text not null default 'daily',
  dernier_run timestamptz,
  erreurs int not null default 0,
  actif boolean not null default true
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Lecture publique du contenu live ; écritures utilisateur limitées ;
-- l'ingestion (GitHub Actions) utilise la clé service_role qui bypass RLS.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.merchants enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.deals enable row level security;
alter table public.price_history enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.favorites enable row level security;
alter table public.alerts enable row level security;
alter table public.clicks enable row level security;
alter table public.cashback_ledger enable row level security;
alter table public.scrape_sources enable row level security;

-- Lecture publique
create policy "read merchants" on public.merchants for select using (true);
create policy "read categories" on public.categories for select using (true);
create policy "read products" on public.products for select using (true);
create policy "read live deals" on public.deals for select using (statut in ('live','expired'));
create policy "read price history" on public.price_history for select using (true);
create policy "read comments" on public.comments for select using (true);
create policy "read profiles public" on public.profiles for select using (true);

-- Utilisateur connecté : son profil, ses votes, favoris, alertes, commentaires
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "vote insert" on public.votes for insert with check (auth.uid() = user_id);
create policy "vote update" on public.votes for update using (auth.uid() = user_id);
create policy "vote delete" on public.votes for delete using (auth.uid() = user_id);
create policy "read own votes" on public.votes for select using (auth.uid() = user_id);
create policy "comment insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "fav all" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "alerts all" on public.alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Soumission communautaire de deals (statut pending imposé)
create policy "community deal submit" on public.deals for insert
  with check (auth.uid() = user_id and source = 'community' and statut = 'pending');

-- Clicks : insertion ouverte (anonyme autorisé), lecture par le propriétaire
create policy "click insert" on public.clicks for insert with check (true);
create policy "click read own" on public.clicks for select using (auth.uid() = user_id);
create policy "cashback read own" on public.cashback_ledger for select using (auth.uid() = user_id);

-- ---------- RPC : incrément de clics (appelé par la route /api/out) ----------
create or replace function public.increment_clicks(p_deal_id bigint)
returns void language sql security definer set search_path = public as
$$ update public.deals set clics = clics + 1 where id = p_deal_id; $$;

-- ---------- VUE : deals du jour ----------
create or replace view public.deals_du_jour as
  select * from public.deals
  where statut = 'live' and created_at >= current_date
  order by score_promoz desc, temperature desc;
