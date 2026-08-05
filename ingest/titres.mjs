const BRUIT = [
  /\b(20\d{2})\s*(new|nouveau|nouvelle)?\b/gi,
  /\bnew\b/gi, /\bhot\s*sale\b/gi, /\bhot\b/gi, /\bsale\b/gi,
  /\bfree\s*shipping\b/gi, /\blivraison\s*gratuite\b/gi,
  /\bhigh\s*quality\b/gi, /\bhaute\s*qualité\b/gi,
  /\bdropshipping\b/gi, /\bwholesale\b/gi, /\bgros\b/gi,
  /\bfashion\b/gi, /\bluxury\b/gi, /\bluxe\b/gi,
  /\bunisex\b/gi, /\bmen'?s?\b/gi, /\bwomen'?s?\b/gi,
];

const LISTE_MARQUES = /\b(pour|for|compatible)\s+([A-Za-z0-9]+\s*){2,}$/gi;
const SLASH_LISTE = /\b([A-Za-z0-9]+\/){2,}[A-Za-z0-9]+\b/g;

export function nettoyerTitre(brut, maxMots = 10) {
  if (!brut) return brut;
  let t = brut;

  t = t.replace(SLASH_LISTE, '');
  t = t.replace(LISTE_MARQUES, '');
  for (const p of BRUIT) t = t.replace(p, ' ');

  t = t.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, ' ');
  t = t.replace(/[|•★☆✔➤»«#]+/g, ' ');

  t = t.replace(/\s{2,}/g, ' ').replace(/\s+([,;:.])/g, '$1').trim();
  t = t.replace(/^[\s,;:.\-–—]+|[\s,;:.\-–—]+$/g, '').trim();

  const mots = t.split(/\s+/).filter(Boolean);
  if (mots.length > maxMots) t = mots.slice(0, maxMots).join(' ');

  t = t.charAt(0).toUpperCase() + t.slice(1);

  return t || brut;
}

export async function titreIA(brut) {
  const cle = process.env.GROQ_API_KEY;
  if (!cle) return nettoyerTitre(brut);

  const nettoye = nettoyerTitre(brut, 16);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 40,
        messages: [
          {
            role: 'system',
            content:
              "Tu réécris des titres de produits e-commerce en français, courts et vendeurs. " +
              "RÈGLES STRICTES : maximum 9 mots. N'invente AUCUNE caractéristique absente du titre " +
              "d'origine (pas de 'étanche', 'premium', 'garanti' si ce n'est pas déjà dit). " +
              "Garde les infos techniques présentes (Bluetooth 5.0, 128 Go...). " +
              "Réponds UNIQUEMENT par le titre, sans guillemets, sans point final.",
          },
          { role: 'user', content: nettoye },
        ],
      }),
    });
    if (!res.ok) return nettoye;
    const json = await res.json();
    const propose = json?.choices?.[0]?.message?.content?.trim();
    if (!propose || propose.length < 3 || propose.length > 90) return nettoye;
    return propose.replace(/^["'«»]+|["'«».]+$/g, '').trim();
  } catch {
    return nettoye;
  }
}
