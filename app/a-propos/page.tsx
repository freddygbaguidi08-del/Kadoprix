import Link from 'next/link';

export const metadata = {
  title: 'À propos — Kado Prix',
  description:
    'Pourquoi Kado Prix existe : un agrégateur de promotions francophone qui vérifie que les réductions sont réelles.',
};

export default function APropos() {
  return (
    <article className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-black leading-tight">
          Une promo affichée <span className="text-promo">−70 %</span> n&apos;est pas toujours
          une promo.
        </h1>
        <p className="text-base leading-relaxed text-slate-600">
          C&apos;est le constat qui a donné naissance à Kado Prix. Gonfler un prix de référence
          quelques jours avant de le barrer est une pratique courante, et presque impossible à
          détecter à l&apos;œil nu quand on ne suit pas un produit depuis des semaines.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Ce que fait le site</h2>
        <p className="text-sm leading-relaxed">
          Kado Prix rassemble en un seul endroit les offres promotionnelles de nombreux
          marchands, toutes catégories confondues, et relève leur prix chaque jour. Cet
          historique permet de répondre à la seule question qui compte :
          <b> est-ce que cette réduction en est vraiment une ?</b>
        </p>
        <p className="text-sm leading-relaxed">
          Quand le prix barré affiché dépasse nettement le prix habituellement pratiqué sur les
          trois derniers mois, l&apos;offre est signalée. Quand le prix actuel est le plus bas
          jamais observé, c&apos;est indiqué aussi.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Pour qui</h2>
        <p className="text-sm leading-relaxed">
          Le site est pensé pour l&apos;espace francophone dans son ensemble — France, Afrique de
          l&apos;Ouest, Canada francophone — avec la gestion des devises locales et une
          conception mobile d&apos;abord. Les comparateurs existants ignorent largement les
          marchands africains ; Kado Prix les référence.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Comment le site est financé</h2>
        <p className="text-sm leading-relaxed">
          Kado Prix est gratuit et le restera. Lorsqu&apos;un achat est réalisé après un clic
          depuis le site, une commission peut être perçue auprès du marchand.
          <b> Le prix payé est exactement le même</b> que si vous étiez allé directement chez
          lui.
        </p>
        <p className="text-sm leading-relaxed">
          Ce modèle crée une tension évidente : un site rémunéré à la commission est tenté de
          survendre les offres. La réponse tient en une règle simple — l&apos;alerte sur les
          faux prix barrés s&apos;applique à toutes les offres, y compris à celles qui
          rapportent. Un site de bons plans dont on se méfie ne vaut rien.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Signaler une erreur</h2>
        <p className="text-sm leading-relaxed">
          Un prix inexact, une offre expirée, une réduction douteuse ? Écrivez à
          <b> [email de contact]</b>. Les signalements sont traités rapidement : la fiabilité
          du catalogue est ce qui fait tenir le projet.
        </p>
      </section>

      <div className="flex flex-wrap gap-3 border-t pt-6 text-sm">
        <Link href="/mentions-legales" className="text-promo underline">Mentions légales</Link>
        <Link href="/confidentialite" className="text-promo underline">Confidentialité</Link>
        <Link href="/cgu" className="text-promo underline">Conditions d&apos;utilisation</Link>
      </div>
    </article>
  );
}
