-- PROMOZ — 6 deals de démonstration pour voir le site vivre immédiatement
-- (à supprimer une fois l'ingestion réelle en place)
insert into public.deals
 (slug, merchant_id, source, titre, image, url_source, url_affiliee, prix, prix_barre, devise, statut, pays, dedup_hash, code_promo, fin)
values
 ('demo-airfryer-cosori-55l', 2, 'feed', 'Airfryer Cosori 5,5 L 1700 W — cuisson sans huile', null,
  'https://www.cdiscount.com/exemple-airfryer', 'https://www.cdiscount.com/exemple-airfryer',
  59.99, 119.99, 'EUR', 'live', '{FR}', 'demo1', null, now() + interval '5 days'),
 ('demo-ecouteurs-anker-p40i', 1, 'feed', 'Écouteurs Anker Soundcore P40i — ANC, 60 h d''autonomie', null,
  'https://www.amazon.fr/exemple-p40i', 'https://www.amazon.fr/exemple-p40i',
  34.99, 59.99, 'EUR', 'live', '{FR,BE}', 'demo2', null, null),
 ('demo-smartphone-redmi-13c', 4, 'feed', 'Xiaomi Redmi 13C 128 Go — écran 90 Hz', null,
  'https://www.jumia.ci/exemple-redmi', 'https://www.jumia.ci/exemple-redmi',
  55000, 89000, 'XOF', 'live', '{CI}', 'demo3', null, now() + interval '3 days'),
 ('demo-ssd-crucial-1to', 6, 'feed', 'SSD Crucial P3 Plus 1 To NVMe', null,
  'https://www.fnac.com/exemple-ssd', 'https://www.fnac.com/exemple-ssd',
  64.99, 99.99, 'EUR', 'live', '{FR}', 'demo4', 'PROMO10', null),
 ('demo-velo-elect-essentielb', 7, 'feed', 'Vélo électrique urbain 250 W — batterie 468 Wh', null,
  'https://www.boulanger.com/exemple-vae', 'https://www.boulanger.com/exemple-vae',
  699.00, 1099.00, 'EUR', 'live', '{FR}', 'demo5', null, now() + interval '10 days'),
 ('demo-montre-amazfit-bip5', 3, 'feed', 'Montre connectée Amazfit Bip 5 — GPS, 10 jours', null,
  'https://fr.aliexpress.com/exemple-bip5', 'https://fr.aliexpress.com/exemple-bip5',
  49.90, 89.90, 'EUR', 'live', '{FR,BJ,CI,SN}', 'demo6', null, null);

-- Historique de prix factice pour la démo du "prix le plus bas"
insert into public.price_history (deal_id, prix, releve_le)
select d.id, d.prix * (1 + (random()*0.3)), current_date - g
from public.deals d, generate_series(1, 30) g
where d.dedup_hash like 'demo%';
