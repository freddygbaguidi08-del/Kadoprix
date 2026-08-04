export type Destination = {
  slug: string;
  ville: string;
  pays: string;
  iata: string;
  emoji: string;
  resume: string;
  decalage: string;
  monnaie: string;
  langue: string;
  dureeVol: string;
  visa: string;
  vaccins: string;
  saison: string;
  budgetJour: string;
  aVoir: string[];
  conseil: string;
};

export const DESTINATIONS: Destination[] = [
  {
    slug: 'cotonou',
    ville: 'Cotonou',
    pays: 'Bénin',
    iata: 'COO',
    emoji: '🇧🇯',
    resume:
      "Capitale économique du Bénin, Cotonou est la porte d'entrée d'un pays riche en histoire — des palais royaux d'Abomey aux cités lacustres de Ganvié.",
    decalage: 'Aucun décalage (parfois −1 h en été)',
    monnaie: 'Franc CFA (XOF) — 1 € ≈ 656 FCFA (parité fixe)',
    langue: 'Français (langue officielle)',
    dureeVol: '≈ 6 h en vol direct depuis Paris',
    visa:
      "Visa requis pour les ressortissants français. Le Bénin propose un e-Visa en ligne (à vérifier sur le portail officiel avant le départ).",
    vaccins:
      "Fièvre jaune obligatoire. Traitement antipaludéen fortement recommandé. À confirmer avec un centre de vaccination internationale.",
    saison:
      "De novembre à février (saison sèche, moins humide). Éviter mai–juillet, très pluvieux.",
    budgetJour: "Repas local 1 500–3 000 FCFA, nuit d'hôtel correcte 25 000–45 000 FCFA",
    aVoir: ['Cité lacustre de Ganvié', "Palais royaux d'Abomey (UNESCO)", 'Marché Dantokpa', 'Route des Pêches'],
    conseil:
      "La parité fixe du FCFA rend le budget prévisible : pas de mauvaise surprise de change. Emportez des espèces, la carte passe mal hors des grands hôtels.",
  },
  {
    slug: 'abidjan',
    ville: 'Abidjan',
    pays: "Côte d'Ivoire",
    iata: 'ABJ',
    emoji: '🇨🇮',
    resume:
      "Poumon économique de l'Afrique de l'Ouest francophone, Abidjan mêle gratte-ciels du Plateau, lagunes et vie nocturne réputée.",
    decalage: 'Aucun décalage (parfois −1 h en été)',
    monnaie: 'Franc CFA (XOF) — 1 € ≈ 656 FCFA (parité fixe)',
    langue: 'Français (langue officielle)',
    dureeVol: '≈ 6 h 30 en vol direct depuis Paris',
    visa:
      "Visa requis pour les ressortissants français. e-Visa disponible en ligne (à confirmer sur le portail officiel avant départ).",
    vaccins:
      "Fièvre jaune obligatoire. Antipaludéen recommandé. À valider en centre de vaccination internationale.",
    saison:
      "De décembre à avril (saison sèche). Éviter juin–septembre (grande saison des pluies).",
    budgetJour: "Repas maquis 2 000–4 000 FCFA, nuit d'hôtel 30 000–60 000 FCFA",
    aVoir: ['Le Plateau et ses tours', 'Basilique de Yamoussoukro (excursion)', 'Marché de Cocody', 'Îles Ébrié'],
    conseil:
      "Abidjan est vaste et les embouteillages sont légendaires : prévoyez large pour les trajets, surtout aux heures de pointe.",
  },
  {
    slug: 'dakar',
    ville: 'Dakar',
    pays: 'Sénégal',
    iata: 'DKR',
    emoji: '🇸🇳',
    resume:
      "À la pointe la plus occidentale de l'Afrique, Dakar est une ville océane vibrante, entre l'île mémorielle de Gorée et les plages de la Corniche.",
    decalage: '−1 h en hiver, −2 h en été (GMT toute l\u2019année)',
    monnaie: 'Franc CFA (XOF) — 1 € ≈ 656 FCFA (parité fixe)',
    langue: 'Français (officiel), wolof très répandu',
    dureeVol: '≈ 5 h 30 en vol direct depuis Paris',
    visa:
      "Pas de visa pour les ressortissants français pour un séjour touristique de moins de 90 jours (à reconfirmer avant départ).",
    vaccins:
      "Fièvre jaune recommandée (parfois exigée selon provenance). Antipaludéen selon la zone et la saison.",
    saison:
      "De novembre à mai (saison sèche, alizés agréables). Éviter juillet–octobre (hivernage).",
    budgetJour: "Repas 2 500–5 000 FCFA, nuit d'hôtel 35 000–70 000 FCFA",
    aVoir: ['Île de Gorée (UNESCO)', 'Monument de la Renaissance', 'Lac Rose', 'Marché Sandaga'],
    conseil:
      "L'aéroport Blaise-Diagne (DSS) est à ~45 km de Dakar : anticipez le transfert (1 h à 1 h 30). Négociez le taxi avant de monter.",
  },
  {
    slug: 'douala',
    ville: 'Douala',
    pays: 'Cameroun',
    iata: 'DLA',
    emoji: '🇨🇲',
    resume:
      "Capitale économique du Cameroun, Douala est une ville portuaire trépidante, tremplin vers les plages de Kribi et le mont Cameroun.",
    decalage: 'Aucun décalage (parfois −1 h en été)',
    monnaie: 'Franc CFA (XAF) — 1 € ≈ 656 FCFA (parité fixe)',
    langue: 'Français et anglais (officiels)',
    dureeVol: '≈ 6 h 30 en vol direct depuis Paris',
    visa:
      "Visa requis pour les ressortissants français. e-Visa disponible (à confirmer sur le portail officiel avant départ).",
    vaccins:
      "Fièvre jaune obligatoire. Antipaludéen fortement recommandé. À valider en centre agréé.",
    saison:
      "De novembre à février (saison sèche). Douala reste très humide toute l'année.",
    budgetJour: "Repas 1 500–3 500 FCFA, nuit d'hôtel 30 000–55 000 FCFA",
    aVoir: ['Marché des fleurs', 'Plages de Kribi (excursion)', 'La Pagode (Bonanjo)', 'Mont Cameroun (Buea)'],
    conseil:
      "Le FCFA d'Afrique centrale (XAF) et celui de l'Ouest (XOF) ont la même valeur mais ne sont pas interchangeables : changez sur place.",
  },
  {
    slug: 'casablanca',
    ville: 'Casablanca',
    pays: 'Maroc',
    iata: 'CMN',
    emoji: '🇲🇦',
    resume:
      "Métropole moderne du Maroc, Casablanca marie Art déco, la majestueuse mosquée Hassan II sur l'océan, et une scène culturelle en plein essor.",
    decalage: 'Aucun décalage la majeure partie de l\u2019année',
    monnaie: 'Dirham marocain (MAD) — 1 € ≈ 10,8 MAD',
    langue: 'Arabe (officiel), français très répandu',
    dureeVol: '≈ 3 h en vol direct depuis Paris',
    visa:
      "Pas de visa pour les ressortissants français pour un séjour touristique de moins de 90 jours.",
    vaccins: "Aucun vaccin obligatoire. Vaccinations universelles à jour recommandées.",
    saison:
      "Agréable une bonne partie de l'année. Printemps (avril–juin) et automne (septembre–octobre) idéaux.",
    budgetJour: "Repas 40–100 MAD, nuit d'hôtel 300–700 MAD",
    aVoir: ['Mosquée Hassan II', 'Quartier des Habous', 'Corniche Aïn Diab', 'Place Mohammed V'],
    conseil:
      "Casablanca se combine facilement avec Marrakech ou Rabat en train (ligne rapide Al Boraq). Un bon point de chute pour un circuit.",
  },
];

export const destBySlug = (slug: string) => DESTINATIONS.find((d) => d.slug === slug);
export const destByVille = (ville: string) =>
  DESTINATIONS.find((d) => ville.toLowerCase().includes(d.ville.toLowerCase()));
