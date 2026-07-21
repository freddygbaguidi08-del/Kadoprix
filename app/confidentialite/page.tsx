export const metadata = {
  title: 'Politique de confidentialité — Kado Prix',
  description: 'Quelles données Kado Prix collecte, pourquoi, combien de temps, et comment exercer vos droits.',
};

export default function Confidentialite() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 text-sm leading-relaxed">
      <h1 className="text-2xl font-black">Politique de confidentialité</h1>
      <p className="text-xs text-slate-500">Dernière mise à jour : à compléter à la publication.</p>

      <p>
        Cette page décrit les données que Kado Prix collecte, l&apos;usage qui en est fait et
        les droits dont vous disposez. Elle est rédigée en langage clair : si un point vous
        semble ambigu, écrivez à <b>[email de contact]</b>.
      </p>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Responsable du traitement</h2>
        <p>
          <b>[PRÉNOM NOM ou DÉNOMINATION SOCIALE]</b>, éditeur du site — coordonnées complètes
          sur la page Mentions légales. Contact pour toute question relative aux données :
          <b> [email de contact]</b>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Données collectées et finalités</h2>

        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-100">
          <p className="font-semibold">Navigation sans compte</p>
          <p className="mt-1">
            Consulter le site ne nécessite aucun compte. Lorsqu&apos;un lien vers un marchand
            est utilisé, un enregistrement technique est créé : identifiant de l&apos;offre,
            identifiant de suivi anonyme et horodatage. Il sert à mesurer l&apos;audience des
            offres et à rapprocher les commissions d&apos;affiliation.
            <br />Base légale : intérêt légitime (mesure d&apos;audience et fonctionnement du
            modèle économique). Conservation : 13 mois.
          </p>
        </div>

        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-100">
          <p className="font-semibold">Compte utilisateur</p>
          <p className="mt-1">
            Adresse e-mail, pseudonyme, pays et devise préférés. Ces données permettent de vous
            authentifier, d&apos;enregistrer vos favoris et de vous envoyer les alertes que vous
            avez créées.
            <br />Base légale : exécution du service demandé. Conservation : jusqu&apos;à
            suppression du compte, puis 3 mois d&apos;archivage technique.
          </p>
        </div>

        <div className="rounded-lg bg-white p-3 ring-1 ring-slate-100">
          <p className="font-semibold">Alertes et notifications</p>
          <p className="mt-1">
            Mots-clés surveillés, seuils de réduction, canal choisi (e-mail, Telegram, push).
            Envoyées uniquement à votre demande explicite, et interrompues à tout moment depuis
            votre espace personnel.
            <br />Base légale : consentement. Conservation : jusqu&apos;au retrait.
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Cookies et traceurs</h2>
        <p>
          Kado Prix n&apos;utilise pas de cookies publicitaires et ne pratique aucun profilage
          à des fins de ciblage.
        </p>
        <p>
          Seuls des cookies strictement nécessaires au fonctionnement sont déposés :
          maintien de session pour les utilisateurs connectés, et mémorisation de vos
          préférences d&apos;affichage. Ces cookies sont exemptés de consentement préalable.
        </p>
        <p>
          Les sites marchands vers lesquels vous êtes redirigé déposent leurs propres traceurs,
          régis par leurs politiques respectives. Kado Prix n&apos;y a pas accès.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Destinataires et sous-traitants</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li><b>Vercel</b> — hébergement du site et journaux techniques.</li>
          <li><b>Supabase</b> — base de données et authentification, infrastructure UE.</li>
          <li><b>Plateformes d&apos;affiliation</b> — un identifiant de suivi anonyme leur est
            transmis lors d&apos;un clic sortant, afin d&apos;attribuer les commissions. Aucune
            donnée nominative n&apos;est communiquée.</li>
          <li><b>Prestataires d&apos;envoi</b> (e-mail, notifications) — uniquement si vous avez
            créé une alerte.</li>
        </ul>
        <p>
          Certains prestataires peuvent traiter des données hors Union européenne. Ces
          transferts s&apos;appuient sur les clauses contractuelles types de la Commission
          européenne.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Vos droits</h2>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
          limitation, d&apos;opposition et de portabilité de vos données, ainsi que du droit de
          retirer votre consentement à tout moment.
        </p>
        <p>
          Pour les exercer, écrivez à <b>[email de contact]</b>. Une réponse vous sera apportée
          sous un mois.
        </p>
        <p>
          Si la réponse ne vous satisfait pas, vous pouvez saisir la CNIL (cnil.fr) ou
          l&apos;autorité de protection des données de votre pays de résidence.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">Sécurité</h2>
        <p>
          Les échanges sont chiffrés en HTTPS. L&apos;accès aux données est restreint par des
          règles de sécurité au niveau de la base : chaque utilisateur ne peut lire et modifier
          que ses propres données. Aucun mot de passe n&apos;est stocké par Kado Prix,
          l&apos;authentification étant déléguée à Supabase.
        </p>
      </section>
    </article>
  );
}
