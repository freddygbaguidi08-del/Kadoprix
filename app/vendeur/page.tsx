import { supabaseAdmin, supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Vous êtes commerçant ? Publiez vos promotions gratuitement',
  description:
    'Référencez gratuitement vos promotions sur Kado Prix et touchez des acheteurs en France, en Afrique francophone et au Canada. Sans commission, sans abonnement.',
  alternates: { canonical: '/vendeur' },
};

async function soumettre(formData: FormData) {
  'use server';
  const db = supabaseAdmin();

  const t = (k: string) => String(formData.get(k) ?? '').trim();
  const n = (k: string) => {
    const v = parseFloat(String(formData.get(k) ?? '').replace(',', '.'));
    return Number.isFinite(v) ? v : null;
  };

  const enseigne = t('enseigne');
  const titre = t('titre');
  const prix = n('prix');

  // Validation minimale côté serveur : ne jamais faire confiance au navigateur
  if (!enseigne || !titre || prix === null || prix <= 0) {
    redirect('/vendeur?erreur=champs');
  }

  const prixBarre = n('prix_barre');

  const { error } = await db.from('vendor_submissions').insert({
    enseigne,
    contact_nom: t('contact_nom') || null,
    contact_email: t('contact_email') || null,
    contact_whatsapp: t('contact_whatsapp') || null,
    ville: t('ville') || null,
    pays: t('pays') || 'FR',
    site_web: t('site_web') || null,
    titre,
    description: t('description') || null,
    categorie_id: formData.get('categorie_id') ? Number(formData.get('categorie_id')) : null,
    prix,
    prix_barre: prixBarre && prixBarre > prix ? prixBarre : null,
    devise: t('devise') || 'EUR',
    url_offre: t('url_offre') || null,
    image_url: t('image_url') || null,
    fin: t('fin') || null,
  });

  redirect(error ? '/vendeur?erreur=envoi' : '/vendeur?envoye=1');
}

const champ =
  'w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm transition ' +
  'focus:border-ink focus:bg-white';
const label = 'block text-[13px] font-semibold mb-1.5';

export default async function Vendeur({
  searchParams,
}: {
  searchParams: { envoye?: string; erreur?: string };
}) {
  const { data: cats } = await supabase
    .from('categories').select('id, nom').is('parent_id', null).order('ordre');

  if (searchParams.envoye) {
    return (
      <div className="mx-auto max-w-lg rounded-xl2 bg-white p-8 text-center shadow-card ring-1 ring-line/60">
        <p className="font-display text-xl font-extrabold">Offre bien reçue</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Nous la vérifions sous 48 h. Si elle est publiée, vous recevrez le lien de la page.
        </p>
        <a href="/vendeur" className="mt-5 inline-block text-sm font-semibold text-promo hover:underline">
          Proposer une autre offre
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          Espace commerçants
        </p>
        <h1 className="font-display text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl">
          Vos promotions, devant des gens qui cherchent{' '}
          <span className="text-promo">exactement ça.</span>
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-slate-600">
          Boutique en ligne, magasin de quartier ou vendeur Instagram : si vous avez une
          promotion en cours, elle a sa place ici. Le référencement est gratuit.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['Gratuit', 'Ni abonnement, ni commission sur vos ventes.'],
          ['Sans site web', 'Un numéro WhatsApp suffit pour être contacté.'],
          ['Sous 48 h', 'On vérifie l’offre, puis elle est en ligne.'],
        ].map(([titre, texte]) => (
          <div key={titre} className="rounded-xl2 bg-white p-4 shadow-card ring-1 ring-line/60">
            <p className="font-display text-sm font-extrabold">{titre}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{texte}</p>
          </div>
        ))}
      </section>

      {searchParams.erreur && (
        <p className="rounded-xl2 border border-warn/30 bg-warn/[0.06] p-3 text-sm text-warn">
          {searchParams.erreur === 'champs'
            ? 'Merci de renseigner au minimum l’enseigne, le titre de l’offre et le prix.'
            : 'L’envoi a échoué. Réessayez dans un instant.'}
        </p>
      )}

      <form action={soumettre} className="space-y-8">
        <fieldset className="space-y-4 rounded-xl2 bg-white p-5 shadow-card ring-1 ring-line/60">
          <legend className="font-display text-base font-extrabold">Votre commerce</legend>

          <div>
            <label htmlFor="enseigne" className={label}>Nom de l’enseigne *</label>
            <input id="enseigne" name="enseigne" required className={champ}
                   placeholder="Boutique Adjovi, Mode & Style…" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ville" className={label}>Ville</label>
              <input id="ville" name="ville" className={champ} placeholder="Cotonou, Nantes…" />
            </div>
            <div>
              <label htmlFor="pays" className={label}>Pays</label>
              <select id="pays" name="pays" className={champ} defaultValue="FR">
                <option value="FR">France</option>
                <option value="BJ">Bénin</option>
                <option value="CI">Côte d’Ivoire</option>
                <option value="SN">Sénégal</option>
                <option value="CM">Cameroun</option>
                <option value="TG">Togo</option>
                <option value="CA">Canada</option>
                <option value="BE">Belgique</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="contact_email" className={label}>E-mail</label>
              <input id="contact_email" name="contact_email" type="email" className={champ}
                     placeholder="vous@exemple.com" />
            </div>
            <div>
              <label htmlFor="contact_whatsapp" className={label}>WhatsApp</label>
              <input id="contact_whatsapp" name="contact_whatsapp" className={champ}
                     placeholder="+229 …" />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Au moins un moyen de contact, pour vous prévenir de la publication.
          </p>

          <div>
            <label htmlFor="site_web" className={label}>Site web ou page Instagram</label>
            <input id="site_web" name="site_web" className={champ} placeholder="Facultatif" />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-xl2 bg-white p-5 shadow-card ring-1 ring-line/60">
          <legend className="font-display text-base font-extrabold">Votre offre</legend>

          <div>
            <label htmlFor="titre" className={label}>Titre de l’offre *</label>
            <input id="titre" name="titre" required className={champ}
                   placeholder="Ensemble wax deux pièces — collection 2026" />
          </div>

          <div>
            <label htmlFor="categorie_id" className={label}>Catégorie</label>
            <select id="categorie_id" name="categorie_id" className={champ} defaultValue="">
              <option value="">Choisir…</option>
              {(cats ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="prix" className={label}>Prix promo *</label>
              <input id="prix" name="prix" required inputMode="decimal" className={champ}
                     placeholder="15000" />
            </div>
            <div>
              <label htmlFor="prix_barre" className={label}>Prix habituel</label>
              <input id="prix_barre" name="prix_barre" inputMode="decimal" className={champ}
                     placeholder="25000" />
            </div>
            <div>
              <label htmlFor="devise" className={label}>Devise</label>
              <select id="devise" name="devise" className={champ} defaultValue="EUR">
                <option value="EUR">EUR</option>
                <option value="XOF">FCFA</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg bg-canvas p-3">
            <p className="text-[13px] leading-relaxed text-slate-600">
              Le prix habituel doit être celui que vous pratiquez réellement hors promotion.
              Nous suivons l’évolution des prix : une réduction gonflée sera signalée sur
              la fiche, ce qui dessert votre enseigne.
            </p>
          </div>

          <div>
            <label htmlFor="description" className={label}>Description</label>
            <textarea id="description" name="description" rows={3} className={champ}
                      placeholder="Tailles disponibles, matière, conditions…" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="url_offre" className={label}>Lien vers l’offre</label>
              <input id="url_offre" name="url_offre" className={champ} placeholder="Facultatif" />
            </div>
            <div>
              <label htmlFor="fin" className={label}>Date de fin</label>
              <input id="fin" name="fin" type="date" className={champ} />
            </div>
          </div>

          <div>
            <label htmlFor="image_url" className={label}>Lien d’une photo</label>
            <input id="image_url" name="image_url" className={champ}
                   placeholder="https://… — facultatif" />
          </div>
        </fieldset>

        <button type="submit"
                className="w-full rounded-full bg-promo py-3.5 font-display text-base
                           font-extrabold text-white transition hover:brightness-110">
          Envoyer mon offre
        </button>

        <p className="text-center text-xs leading-relaxed text-slate-500">
          Vos coordonnées ne sont jamais publiées ni transmises à des tiers. Elles servent
          uniquement à vous contacter au sujet de cette offre.{' '}
          <a href="/confidentialite" className="underline">Politique de confidentialité</a>
        </p>
      </form>
    </div>
  );
}
