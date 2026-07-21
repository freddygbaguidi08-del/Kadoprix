'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function Connexion() {
  const [email, setEmail] = useState('');
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'envoye' | 'erreur'>('repos');
  const [message, setMessage] = useState('');

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setEtat('envoi');
    const { error } = await supabaseBrowser().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setEtat('erreur');
      setMessage(error.message);
    } else {
      setEtat('envoye');
    }
  }

  if (etat === 'envoye') {
    return (
      <div className="mx-auto max-w-md rounded-xl2 bg-white p-8 text-center shadow-card ring-1 ring-line/60">
        <p className="font-display text-xl font-extrabold">Vérifiez votre boîte mail</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Un lien de connexion a été envoyé à <b>{email}</b>. Il expire dans une heure.
        </p>
        <button onClick={() => { setEtat('repos'); setEmail(''); }}
                className="mt-5 text-sm font-semibold text-promo hover:underline">
          Utiliser une autre adresse
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Se connecter</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          Pas de mot de passe : on vous envoie un lien de connexion par e-mail.
        </p>
      </header>

      <form onSubmit={envoyer} className="space-y-3 rounded-xl2 bg-white p-6 shadow-card ring-1 ring-line/60">
        <label htmlFor="email" className="block text-sm font-semibold">Adresse e-mail</label>
        <input
          id="email" type="email" required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
          className="w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-sm
                     transition focus:border-ink focus:bg-white"
        />
        <button type="submit" disabled={etat === 'envoi'}
                className="w-full rounded-full bg-ink py-3 font-display text-sm font-extrabold
                           text-white transition hover:bg-ink/85 disabled:opacity-50">
          {etat === 'envoi' ? 'Envoi en cours…' : 'Recevoir mon lien'}
        </button>
        {etat === 'erreur' && (
          <p className="text-sm text-warn">Connexion impossible : {message}</p>
        )}
      </form>

      <p className="text-center text-xs leading-relaxed text-slate-500">
        En vous connectant, vous acceptez nos{' '}
        <a href="/cgu" className="underline">conditions d’utilisation</a>. Votre adresse sert
        uniquement à vous identifier et à vous envoyer les alertes que vous créez.
      </p>
    </div>
  );
}
