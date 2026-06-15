import { MatchAnalysis, SchoolLesson } from '../types';

export const INITIAL_ANALYSES: MatchAnalysis[] = [
  {
    id: '1',
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    sport: 'football',
    league: 'UEFA Champions League',
    startTime: 'Ce soir, 21:00',
    prediction: 'Real Madrid ou Nul & Double Chance + Plus de 1.5 buts',
    odds: 1.82,
    confidence: 88,
    category: 'Sélection Safe',
    analysisText: 'Un quart de finale aller sous haute tension à Bernabéu. City souffre défensivement tandis que le Real excelle en vagues de transition rapide.',
    detailedAnalysis: [
      'Historique récent : Sur les 4 derniers affrontements dans cette compétition, 18 buts ont été inscrits. Les deux équipes marquent régulièrement.',
      'Dynamique du Real : Toujours invaincu à domicile cette saison toutes compétitions confondues. Le retour de blessure de Militao solidifie le bloc bas.',
      "Faiblesses de Manchester City : Privé de Kyle Walker pour ce match aller, le flanc droit défensif de Pep Guardiola sera exposé aux courses explosives de Vinicius Jr.",
      'Facteur tactique : Carlo Ancelotti va sciemment concéder la possession pour frapper chirurgicalement en contre-attaque rapide via Bellingham et Rodrygo.'
    ],
    isPremium: false,
    status: 'pending'
  },
  {
    id: '2',
    homeTeam: 'Celtics de Boston',
    awayTeam: 'Nets de Brooklyn',
    sport: 'basketball',
    league: 'NBA',
    startTime: 'Demain, 01:30',
    prediction: 'Boston Celtics -7.5 (Handicap)',
    odds: 1.74,
    confidence: 84,
    category: 'Value Bet',
    analysisText: "Boston affiche un bilan impérial au TD Garden. Brooklyn souffre sur le 'back-to-back' et manque d'armes intérieures pour contenir Tatum.",
    detailedAnalysis: [
      'Différentiel offensif : Boston possède le meilleur rating offensif de la ligue (+11.8). Brooklyn est en reconstruction et peine en transition défensive.',
      'Fatigue / Calendrier : Brooklyn joue son 3ème match en 5 jours, tandis que Boston a bénéficié de 3 jours pleins de repos thérapeutique.',
      'Absences notables : Brooklyn jouera sans son pivot titulaire, laissant la raquette dégagée pour les pénétrations agressives de Jaylen Brown.'
    ],
    isPremium: false,
    status: 'pending'
  },
  {
    id: '3',
    homeTeam: 'Carlos Alcaraz',
    awayTeam: 'Jannik Sinner',
    sport: 'tennis',
    league: 'ATP Roland Garros',
    startTime: '16 Juin, 15:00',
    prediction: 'Plus de 3.5 Sets dans le Match',
    odds: 1.65,
    confidence: 91,
    category: 'Sélection Safe',
    analysisText: "Un choc au sommet sur terre battue. Les duels entre Alcaraz et Sinner se décident toujours dans la durée et l'intensité émotionnelle.",
    detailedAnalysis: [
      'Face à face équilibré : 4-4 dans les duels directs. Aucun joueur ne parvient à dominer l’autre de manière unilatérale sur ce type de surface lente.',
      'Forme physique : Alcaraz a concédé au moins un set lors de ses 3 derniers matchs sur terre battue. Sinner est en pleine confiance mais montre parfois de légères baisses de régime au 2e set.',
      'Scénario anticipé : Un combat physique intense de fond de court qui s’étendra au minimum sur quatre sets disputés.'
    ],
    isPremium: true,
    status: 'pending'
  },
  {
    id: '4',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Arsenal FC',
    sport: 'football',
    league: 'UEFA Champions League',
    startTime: '17 Juin, 21:00',
    prediction: 'Les deux équipes marquent',
    odds: 1.58,
    confidence: 85,
    category: 'Value Bet',
    analysisText: "Arsenal a du mal à garder ses cages inviolées à l'extérieur en Europe, tandis que le potentiel offensif du Bayern à l'Alliance Arena reste immense.",
    detailedAnalysis: [
      'Statistiques clés : Le Bayern a marqué dans 94% de ses matchs officiels à domicile cette saison.',
      "Forme d'Arsenal : Mené par un Saka ultra-décisif, l'offensive d'Arteta marque en moyenne 2.1 buts en déplacement."
    ],
    isPremium: true,
    status: 'pending'
  },
  {
    id: '5',
    homeTeam: 'Corinthians',
    awayTeam: 'Flamengo',
    sport: 'football',
    league: 'Série A Brésil',
    startTime: 'Ce soir, 23:30',
    prediction: 'Moins de 2.5 buts dans le match',
    odds: 1.68,
    confidence: 79,
    category: 'Spéciale',
    analysisText: 'Un duel tactique brésilien très fermé. Les confrontations directes à São Paulo se soldent majoritairement par de petits scores tactiques.',
    detailedAnalysis: [
      'Verrou tactique : Corinthians à domicile n’a concédé que 3 buts lors des 6 dernières rencontres.',
      'Sûreté : Les enjeux de qualifications poussent les entraîneurs à limiter les risques défensifs.'
    ],
    isPremium: false,
    status: 'pending'
  }
];

export const INITIAL_LESSONS: SchoolLesson[] = [
  {
    id: 'l1',
    title: 'La Règle d’Or du Capital (Bankroll Management)',
    description: 'Comprendre pourquoi 95% des parieurs perdants échouent à cause d’une gestion émotionnelle de leur argent.',
    duration: '5 min',
    category: 'Gestion',
    content: [
      'Ne misez jamais de l’argent que vous ne pouvez pas vous permettre de perdre.',
      'Séparez hermétiquement votre budget de vie de votre capital de jeu (votre Bankroll).',
      'Déterminez une taille de mise de référence unitaire (l’Unité de Mise, ou de "Stake"). Elle doit toujours se situer entre 1% et 3% de votre bankroll globale.',
      'Une mise supérieure à 5% est considérée comme un comportement à haut risque ("Rage Betting"). Un Spartan opère comme un investisseur froid et calculateur, pas comme un joueur guidé par l’adrénaline.'
    ],
    isCompleted: false
  },
  {
    id: 'l2',
    title: 'Value Bet vs Sure Bet : L’avantage Mathématique',
    description: 'Trouver l’erreur du bookmaker et parier uniquement quand l’espérance de gain est positive.',
    duration: '8 min',
    category: 'Débutant',
    content: [
      "Qu'est-ce qu'une Probabilité Bookmaker ? C'est l'inverse de la cote (1 / Cote). Une cote de 2.00 représente 50% de probabilité estimative par le site.",
      "Qu'est-ce qu’un Value Bet ? C'est quand vous estimez, après analyse rigoureuse, que la probabilité réelle de l'événement est supérieure à celle du bookmaker.",
      "Formule : (Cote x Votre Probabilité estimée) / 100 > 1. Si le résultat est supérieur à 1, vous tenez un avantage mathématique à long terme.",
      "La patience fait la différence. Parier sur tout et n’importe quoi détruit votre capital. Attendez les anomalies de cotes pour frapper avec discipline."
    ],
    isCompleted: false
  },
  {
    id: 'l3',
    title: 'La Psychologie de l’Investisseur : Gérer un Bad Run',
    description: 'Maîtriser ses émotions face aux pertes inévitables pour éviter la ruine.',
    duration: '6 min',
    category: 'Mental',
    content: [
      "La variance négative (les séries de pertes) touche tous les parieurs professionnels sans exception. Le hasard fait partie de l'équation sur de petits échantillons.",
      "L'erreur fatale : Vouloir 'se refaire' immédiatement en multipliant les mises sur des événements non analysés.",
      "Le code de discipline d'un Spartan :",
      "1. Ne jamais augmenter sa mise unitaire après une défaite.",
      "2. Savoir faire une pause de 24h si la frustration s'installe.",
      "3. Conserver un historique transparent de chaque pari pour analyser les erreurs de jugement à froid."
    ],
    isCompleted: false
  },
  {
    id: 'l4',
    title: 'Le ROI et le Yield : Vos seuls indicateurs de réussite',
    description: 'La différence cruciale entre gagner des paris et faire fructifier durablement de l’argent.',
    duration: '7 min',
    category: 'Intermédiaire',
    content: [
      "Le Taux de Réussite (Win Rate) est un leurre. On peut avoir 70% de réussite et perdre de l'argent s'il s'agit de petites cotes, ou l'inverse.",
      "Le ROI (Retour sur Investissement) mesure le gain net par rapport au capital initial : (Capital Actuel - Capital Initial) / Capital Initial.",
      "Le Yield (Rendement) est le ratio ultime de performance. Il mesure le gain net divisé par le volume total d'argent misé : (Gains Nets / Somme de toutes les Mises) x 100.",
      "Vos statistiques mensuelles sont votre bilan financier. Un Yield durable se situe entre 5% et 12% : c'est supérieur à la quasi-totalité des placements de marché traditionnels !"
    ],
    isCompleted: false
  }
];

export const MOCK_HISTORY_BETS = [
  { id: 'h1', homeTeam: 'PSG', awayTeam: 'Dortmund', prediction: 'PSG gagne', odds: 1.65, stakeAmount: 50, stakePercent: 2.5, timestamp: '14 Juin, 20:45', status: 'won', notes: 'PSG has dominated at home this season. Tactical lineup was superior.', psychologicalTags: ['calculated', 'confident'] },
  { id: 'h2', homeTeam: 'LA Lakers', awayTeam: 'Denver Nuggets', prediction: 'Denver Nuggets gagne', odds: 1.85, stakeAmount: 30, stakePercent: 1.5, timestamp: '13 Juin, 02:00', status: 'won', notes: 'Odds were inflated due to Denver playing back-to-back, but value was still high.', psychologicalTags: ['calculated'] },
  { id: 'h3', homeTeam: 'Novak Djokovic', awayTeam: 'Casper Ruud', prediction: 'Novak Djokovic gagne par 3 sets à 0', odds: 2.10, stakeAmount: 40, stakePercent: 2.0, timestamp: '12 Juin, 14:30', status: 'lost', notes: 'Chose 3-0 set score for extra yield, but Casper Ruud took one sneaky set. Greedy stake choice.', psychologicalTags: ['fomo', 'impulsive'] },
  { id: 'h4', homeTeam: 'Marseille', awayTeam: 'Atalanta', prediction: 'Plus de 2.5 buts', odds: 1.78, stakeAmount: 50, stakePercent: 2.5, timestamp: '11 Juin, 21:00', status: 'won', notes: 'Both teams are highly offensive. High probability based on past 5 h2h matches.', psychologicalTags: ['calculated', 'disciplined'] },
];
