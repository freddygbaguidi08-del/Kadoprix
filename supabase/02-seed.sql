-- PROMOZ — Seed catégories principales + marchands
-- À exécuter APRÈS 01-schema.sql

insert into public.categories (nom, slug, icone, ordre) values
 ('Électronique & High-Tech','high-tech','💻',1),
 ('Mode & Accessoires','mode','👟',2),
 ('Maison & Jardin','maison-jardin','🏠',3),
 ('Alimentation & Boissons','alimentation','🛒',4),
 ('Beauté & Santé','beaute-sante','💄',5),
 ('Sports & Loisirs','sports-loisirs','⚽',6),
 ('Voyages & Hôtels','voyages','✈️',7),
 ('Services & Abonnements','services','📺',8),
 ('Auto & Moto','auto-moto','🚗',9),
 ('Bébé & Enfants','bebe-enfants','🍼',10),
 ('Livres & Culture','livres-culture','📚',11),
 ('Jeux Vidéo & Gaming','gaming','🎮',12),
 ('Formations & Éducation','formations','🎓',13),
 ('Téléphonie & Forfaits','telephonie','📱',14),
 ('Restaurants & Food Delivery','restaurants','🍔',15),
 ('Gratuit & Presque gratuit','gratuit','🎁',16);

-- Sous-catégories High-Tech (exemple — dupliquer le motif pour les autres)
insert into public.categories (parent_id, nom, slug, ordre)
select id, x.nom, x.slug, x.ordre from public.categories c,
 (values ('Smartphones & Tablettes','smartphones',1),
         ('Informatique','informatique',2),
         ('TV & Image','tv-image',3),
         ('Audio','audio',4),
         ('Objets connectés','objets-connectes',5)) as x(nom,slug,ordre)
where c.slug = 'high-tech';

insert into public.merchants (nom, slug, url, pays, programme_affilie) values
 ('Amazon FR','amazon-fr','https://www.amazon.fr','{FR,BE}','amazon'),
 ('Cdiscount','cdiscount','https://www.cdiscount.com','{FR}','awin'),
 ('AliExpress','aliexpress','https://fr.aliexpress.com','{FR,BJ,CI,SN,CM}','aliexpress'),
 ('Jumia CI','jumia-ci','https://www.jumia.ci','{CI}','jumia'),
 ('Jumia SN','jumia-sn','https://www.jumia.sn','{SN}','jumia'),
 ('Fnac','fnac','https://www.fnac.com','{FR}','awin'),
 ('Boulanger','boulanger','https://www.boulanger.com','{FR}','awin');

-- Source d'ingestion de démonstration (feed CSV générique)
insert into public.scrape_sources (nom, url, type, config, frequence) values
 ('Feed Awin exemple','REMPLACER_PAR_URL_FEED_AWIN','feed_csv',
  '{"mapping":{"titre":"product_name","prix":"search_price","prix_barre":"rrp_price","image":"merchant_image_url","url":"aw_deep_link","devise":"currency"},"merchant_slug":"cdiscount","pays":["FR"]}',
  'daily');
