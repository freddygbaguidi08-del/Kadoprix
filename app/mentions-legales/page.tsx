export const metadata = {
  title: 'Mentions légales — Kado Prix',
  description: 'Informations légales relatives à l\u2019éditeur et à l\u2019hébergeur du site Kado Prix.',
};

export default function MentionsLegales() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed">
      <h1 className="text-2xl font-black">Mentions légales</h1>
      <p className="text-xs text-slate-500">Dernière mise à jour : à compléter à la publication.</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Éditeur du site</h2>
        <p>
          Le site Kado Prix est édité par <b>[PRÉNOM NOM ou DÉNOMINATION SOCIALE]</b>,
          [statut juridique : micro-entreprise / EI / SASU],
          immatriculé sous le numéro <b>[SIREN / SIRET / RCCM]</b>.
        </p>
        <p>
          Siège social : <b>[adresse complète]</b><br />
          Adresse électronique : <b>[email de contact]</b><br />
          Téléphone : <b>[numéro]</b><br />
          Numéro de TVA intracommunautaire : <b>[le cas échéant]</b>
        </p>
        <p>Directeur de la publication : <b>[PRÉNOM NOM]</b>.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Hébergement</h2>
        <p>
          Le site est hébergé par <b>Vercel Inc.</b>, 340 S Lemon Ave #4133, Walnut, CA 91789,
          États-Unis — vercel.com.
        </p>
        <p>
          Les données de la base sont hébergées par <b>Supabase</b>, sur une infrastructure
          située dans l&apos;Union européenne.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Nature du service</h2>
        <p>
          Kado Prix est un service d&apos;information qui référence et compare des offres
          promotionnelles proposées par des marchands tiers. Kado Prix ne vend aucun produit,
          n&apos;encaisse aucun paiement et n&apos;intervient à aucun moment dans la relation
          contractuelle entre l&apos;utilisateur et le marchand.
        </p>
        <p>
          Les prix, disponibilités et conditions affichés proviennent de sources externes et
          sont susceptibles d&apos;évoluer à tout moment. Seules les informations figurant sur
          le site du marchand au moment de la commande font foi.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Liens affiliés</h2>
        <p>
          Certains liens présents sur le site sont des liens affiliés. Lorsqu&apos;un achat est
          effectué après un clic sur l&apos;un de ces liens, Kado Prix peut percevoir une
          commission de la part du marchand. <b>Cette commission ne modifie en rien le prix
          payé par l&apos;utilisateur.</b> Les offres sponsorisées, lorsqu&apos;il en existe,
          sont signalées par une mention explicite.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Propriété intellectuelle</h2>
        <p>
          La structure du site, sa charte graphique et les contenus rédigés par Kado Prix sont
          protégés. Les marques, logos et visuels produits appartiennent à leurs titulaires
          respectifs et sont reproduits à des fins strictement informatives, dans le cadre du
          référencement des offres.
        </p>
        <p>
          Toute personne estimant qu&apos;un contenu porte atteinte à ses droits peut en
          demander le retrait à l&apos;adresse indiquée ci-dessus. La demande sera traitée
          dans les meilleurs délais.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Responsabilité</h2>
        <p>
          Kado Prix met en œuvre des moyens raisonnables pour vérifier l&apos;exactitude des
          informations publiées, sans pouvoir en garantir l&apos;exhaustivité ni la mise à jour
          permanente. La responsabilité de l&apos;éditeur ne saurait être engagée en raison
          d&apos;une erreur de prix, d&apos;une offre expirée ou du contenu des sites tiers
          vers lesquels le site renvoie.
        </p>
      </section>
    </article>
  );
}
