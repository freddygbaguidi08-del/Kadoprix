export const metadata = {
  title: 'Conditions générales d\u2019utilisation — Kado Prix',
  description: 'Règles d\u2019utilisation du site Kado Prix, contributions des membres et signalement de contenus.',
};

export default function CGU() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed">
      <h1 className="text-2xl font-black">Conditions générales d&apos;utilisation</h1>
      <p className="text-xs text-slate-500">Dernière mise à jour : à compléter à la publication.</p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">1. Objet</h2>
        <p>
          Les présentes conditions régissent l&apos;accès et l&apos;utilisation du site Kado Prix.
          Naviguer sur le site vaut acceptation de ces conditions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">2. Le service</h2>
        <p>
          Kado Prix référence des offres promotionnelles issues de marchands tiers, de flux
          partenaires et de contributions de membres. Le site est un service d&apos;information :
          il ne vend rien, n&apos;encaisse rien et n&apos;est pas partie au contrat de vente.
        </p>
        <p>
          Toute réclamation relative à une commande, une livraison, un remboursement ou une
          garantie relève exclusivement du marchand concerné.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">3. Exactitude des offres</h2>
        <p>
          Les prix et disponibilités sont relevés automatiquement et peuvent devenir obsolètes
          entre deux mises à jour. Kado Prix indique la date du dernier relevé lorsqu&apos;elle
          est disponible, mais ne garantit pas qu&apos;une offre soit encore valable au moment
          de votre visite.
        </p>
        <p>
          Le site signale les réductions dont le prix de référence paraît supérieur au prix
          habituellement pratiqué. Cette indication est le résultat d&apos;un calcul automatique
          sur l&apos;historique observé : elle constitue une alerte, pas un constat juridique.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">4. Compte utilisateur</h2>
        <p>
          La création d&apos;un compte est gratuite et réservée aux personnes majeures. Vous êtes
          responsable de la confidentialité de vos identifiants et des actions effectuées depuis
          votre compte. Vous pouvez le supprimer à tout moment.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">5. Contributions des membres</h2>
        <p>En publiant une offre ou un commentaire, vous vous engagez à ne pas diffuser :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>de contenu faux, trompeur ou volontairement inexact sur un prix ;</li>
          <li>de contenu injurieux, diffamatoire, haineux ou discriminatoire ;</li>
          <li>de contenu portant atteinte aux droits d&apos;un tiers ;</li>
          <li>de contenu publicitaire dissimulé ou de lien affilié personnel non déclaré ;</li>
          <li>de contenu contraire à la loi.</li>
        </ul>
        <p>
          Vous conservez vos droits sur vos contributions et concédez à Kado Prix une licence
          gratuite et non exclusive pour les afficher sur le site.
        </p>
        <p>
          Kado Prix agit en qualité d&apos;hébergeur des contenus publiés par ses membres. Tout
          contenu manifestement illicite peut être signalé à <b>contact@kdoprix.com</b> et sera
          retiré promptement après examen.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">6. Points et avantages</h2>
        <p>
          Les points attribués pour les contributions n&apos;ont pas de valeur monétaire, ne sont
          ni cessibles ni convertibles en argent, sauf dispositif de reversement expressément
          annoncé et soumis à ses propres conditions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">7. Modération</h2>
        <p>
          Kado Prix peut modifier, dépublier ou supprimer une contribution ne respectant pas les
          présentes conditions, et suspendre un compte en cas de manquement répété. Une
          suspension peut être contestée à l&apos;adresse de contact.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">8. Disponibilité</h2>
        <p>
          Le service est fourni sans garantie de disponibilité continue. Des interruptions
          peuvent survenir pour maintenance ou pour des raisons techniques indépendantes de
          l&apos;éditeur.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">9. Évolution des conditions</h2>
        <p>
          Ces conditions peuvent être modifiées. La version applicable est celle publiée sur
          cette page. Les modifications substantielles seront signalées sur le site.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">10. Droit applicable</h2>
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, une
          solution amiable sera recherchée avant toute action contentieuse. Les consommateurs
          résidant dans l&apos;Union européenne conservent le bénéfice des dispositions
          impératives de leur pays de résidence.
        </p>
      </section>
    </article>
  );
}
