import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  Swords, Trophy, Star, CheckCircle, HelpCircle, ArrowRight, ShieldAlert, Zap, Landmark, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Challenge {
  id: string;
  category: 'discipline' | 'growth' | 'school' | 'ledger' | 'shield';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Facile' | 'Moyen' | 'Difficile';
  titleEn: string;
  titleFr: string;
  descEn: string;
  descFr: string;
  actionTextEn: string;
  actionTextFr: string;
  tipEn: string;
  tipFr: string;
  verifier: (state: any) => boolean;
}

export const DailyChallengeWidget: React.FC = () => {
  const { 
    user, bankroll, disciplineScore, followedBets, lessons, analyses, setActiveTab, addToast
  } = useApp();

  const isFr = user.language === 'fr';

  // 1. Defining standard rotation of 7 core spartan challenges
  const challenges: Challenge[] = [
    {
      id: 'discipline_fortress',
      category: 'discipline',
      difficulty: isFr ? 'Moyen' : 'Medium',
      titleEn: 'Discipline Fortress',
      titleFr: 'Forteresse de Discipline',
      descEn: 'Maintain a Spartan Discipline Ratio of 75% or higher to guarantee risk mastery.',
      descFr: 'Maintenir un indice de discipline spartiate de 75% ou plus pour garantir la maîtrise du risque.',
      actionTextEn: 'Verify Discipline Score',
      actionTextFr: 'Vérifier l’Indice',
      tipEn: 'Decrease your customized stakes or complete school lessons to raise your ratio.',
      tipFr: 'Diminuez vos mises personnalisées ou complétez des leçons pour remonter votre indice.',
      verifier: (state) => state.disciplineScore >= 75
    },
    {
      id: 'growth_architect',
      category: 'growth',
      difficulty: isFr ? 'Facile' : 'Easy',
      titleEn: 'Growth Architect',
      titleFr: 'Architecte de Croissance',
      descEn: 'Set and balance your Monthly Growth Goal target between 10% and 25%.',
      descFr: 'Définir et équilibrer l’Objectif de Croissance mensuel entre 10% et 25%.',
      actionTextEn: 'Align Target Goal',
      actionTextFr: 'Ajuster l’Objectif',
      tipEn: 'Use the + or - buttons on the Bankroll Ledger on the Dashboard to coordinate.',
      tipFr: 'Utilisez les boutons + ou - sur l’encart Bankroll du Tableau de bord pour l’ajuster.',
      verifier: (state) => {
        const goal = state.bankroll.monthlyGoalPercent || 0;
        return goal >= 10 && goal <= 25;
      }
    },
    {
      id: 'scholars_wisdom',
      category: 'school',
      difficulty: isFr ? 'Moyen' : 'Medium',
      titleEn: "The Scholar's Path",
      titleFr: "Le Chemin de l'Érudit",
      descEn: 'Absorb professional psychology guidelines by completing at least 2 handbooks in Spartan School.',
      descFr: 'Absorber les conseils de psychologie professionnelle en complétant au moins 2 manuels de formation.',
      actionTextEn: 'Inspect Saved Handbooks',
      actionTextFr: 'Consulter la Spartan School',
      tipEn: 'Switch over to the Spartan School tab and click "Mark as Read" on lessons.',
      tipFr: 'Rendez-vous dans l’onglet Spartan School et marquez des leçons comme lues.',
      verifier: (state) => state.lessons.filter((l: any) => l.isCompleted).length >= 2
    },
    {
      id: 'custom_ledger',
      category: 'ledger',
      difficulty: isFr ? 'Facile' : 'Easy',
      titleEn: 'Custom Ledger Logger',
      titleFr: 'Archiviste Rigoureux',
      descEn: 'Log a custom or manual bet ticket using the QUICK BET tool in the header.',
      descFr: 'Enregistrer un pari personnalisé manuellement grâce au bouton PARI RAPIDE du Header.',
      actionTextEn: 'Record Wager Ticket',
      actionTextFr: 'Enregistrer le Ticket',
      tipEn: 'Click the "QUICK BET" button at the top header, pick an outcome, and confirm.',
      tipFr: 'Cliquez sur le bouton "PARI RAPIDE" dans le header, écrivez les détails et confirmez.',
      verifier: (state) => state.followedBets.some((b: any) => b.id.includes('custom'))
    },
    {
      id: 'capital_shield',
      category: 'shield',
      difficulty: isFr ? 'Difficile' : 'Hard',
      titleEn: 'The Capital Protector',
      titleFr: 'Protecteur de Capital',
      descEn: 'Ensure all registered wagers have conservative stake allocations (5% or less of total funds).',
      descFr: 'S’assurer que chaque pari engagé possède une mise ultra-conservatrice (5% ou moins de vos fonds).',
      actionTextEn: 'Check Exposure',
      actionTextFr: 'Vérifier l’Exposition',
      tipEn: 'Spartans do not risk more than 5% on single sports markets. Keep stakes limited!',
      tipFr: 'Pas plus de 5% par marché pour un vrai Spartiate. Restez mesuré dans vos budgets !',
      verifier: (state) => {
        if (state.followedBets.length === 0) return true;
        return state.followedBets.every((b: any) => b.stakePercent <= 5);
      }
    },
    {
      id: 'market_scout',
      category: 'discipline',
      difficulty: isFr ? 'Facile' : 'Easy',
      titleEn: 'Market Value Auditor',
      titleFr: 'Auditeur de Valeur',
      descEn: 'Follow or inspect at least one professional match analysis to research superior yields.',
      descFr: 'Inspecter ou suivre au moins une analyse de match professionnelle afin d’examiner de bons rendements.',
      actionTextEn: 'Inspect Predictions',
      actionTextFr: 'Parcourir les Sélections',
      tipEn: 'Browse the expert selections list and read recommendations with over 80% confidence.',
      tipFr: 'Lisez les sélections experts et examinez les analyses ayant une confiance de plus de 80%.',
      verifier: (state) => state.followedBets.length > 0
    },
    {
      id: 'ultimate_contract',
      category: 'growth',
      difficulty: isFr ? 'Difficile' : 'Hard',
      titleEn: 'The Spartan Vow',
      titleFr: 'Le Serment Spartiate',
      descEn: 'Maintain a perfect state: Active Bankroll configured alongside at least 1 completed lesson.',
      descFr: 'Maintenir un état optimal : Bankroll de démonstration active combinée à au moins 1 leçon validée.',
      actionTextEn: 'Certify State',
      actionTextFr: 'Certifier l’État',
      tipEn: 'Your active portfolio balance must be properly set, and at least one school lesson completed.',
      tipFr: 'Votre portefeuille doit de préférence être initialisé, et au moins une leçon théorique complétée.',
      verifier: (state) => state.bankroll.isActive && state.lessons.some((l: any) => l.isCompleted)
    }
  ];

  // 2. Select today's deterministic challenge based on the day of the month
  const todayIndex = new Date().getDate() % challenges.length;
  const activeChallenge = challenges[todayIndex];

  // 3. Keep completion histories and stats locally to enrich the user experience
  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() => {
    const saved = localStorage.getItem('L_SPARTAN_CHALLENGES');
    return saved ? JSON.parse(saved) : [];
  });

  const [verificationFeedback, setVerificationFeedback] = useState<'idle' | 'success' | 'failed'>('idle');

  useEffect(() => {
    localStorage.setItem('L_SPARTAN_CHALLENGES', JSON.stringify(completedChallenges));
  }, [completedChallenges]);

  const isCompletedToday = completedChallenges.includes(activeChallenge.id);

  const handleVerify = () => {
    // Collect state indicators to verify
    const state = {
      bankroll,
      disciplineScore,
      followedBets,
      lessons,
      analyses
    };

    const isPassed = activeChallenge.verifier(state);

    if (isPassed) {
      setVerificationFeedback('success');
      if (!isCompletedToday) {
        setCompletedChallenges(prev => [...prev, activeChallenge.id]);
        addToast(
          isFr 
            ? `🏆 Défi spartiate complété ! Félicitations pour votre rigueur.` 
            : `🏆 Spartan challenge completed! Absolute demonstration of rigour.`,
          'success'
        );
      }
    } else {
      setVerificationFeedback('failed');
      addToast(
        isFr 
          ? `❌ Les conditions du défi ne sont pas encore remplies.` 
          : `❌ The challenge conditions are not fulfilled yet.`,
        'error'
      );
    }

    // Reset feedback states after briefly flashing
    setTimeout(() => {
      setVerificationFeedback('idle');
    }, 4000);
  };

  // Icon select logic
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'discipline': return <Swords className="w-5 h-5 text-orange-500" />;
      case 'growth': return <Landmark className="w-5 h-5 text-amber-500" />;
      case 'school': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'ledger': return <Trophy className="w-5 h-5 text-yellow-500" />;
      default: return <ShieldAlert className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="bg-[#131316] border border-white/5 rounded-2xl p-5 md:p-6 overflow-hidden relative">
      {/* Decorative accent graphic in corner */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-500/10 to-transparent pointer-events-none rounded-tr-2xl" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-orange-600/10 text-orange-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-orange-500 animate-pulse" />
          </span>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5 uppercase italic">
              ⚔️ {isFr ? 'Défi Spartiate du Jour' : 'Daily Spartan Challenge'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isFr ? 'Progressez chaque jour grâce à des objectifs calibrés' : 'Build ultimate compounding discipline everyday'}
            </p>
          </div>
        </div>

        {/* Aggregate Stats Badges */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="bg-[#0A0A0B] border border-white/5 px-2.5 py-1 rounded-lg text-neutral-400 leading-none">
            {isFr ? 'DÉFIS COMPLÉTÉS' : 'CHALLENGES SOLVED'} : &nbsp;
            <strong className="text-white text-xs">{completedChallenges.length}</strong>
          </span>
          {completedChallenges.length > 0 && (
            <span className="bg-orange-600/10 text-orange-500 border border-orange-500/10 px-2.5 py-1 rounded-lg font-black flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              STREAK: {completedChallenges.length}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Challenge details */}
        <div className="md:col-span-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#0A0A0B] border border-white/5 p-2 rounded-xl">
              {getCategoryIcon(activeChallenge.category)}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-500">
                  {isFr ? 'DÉFI DU JOUR' : "TODAY'S MISSION"}
                </span>
                <span className="h-1 w-1 rounded-full bg-neutral-700" />
                <span className="text-[9px] uppercase tracking-wider font-bold text-orange-400">
                  {isFr ? 'Difficulté' : 'Difficulty'}: {activeChallenge.difficulty}
                </span>
              </div>
              <h4 className="text-sm font-bold text-stone-100 mt-0.5">
                {isFr ? activeChallenge.titleFr : activeChallenge.titleEn}
              </h4>
            </div>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
            {isFr ? activeChallenge.descFr : activeChallenge.descEn}
          </p>

          <div className="bg-[#0A0A0B] border border-white/5 rounded-xl p-3 flex items-start gap-2 max-w-2xl">
            <HelpCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div className="text-[10px] leading-normal text-neutral-500">
              <span className="font-bold text-stone-300 block uppercase tracking-wider mb-0.5">
                💡 {isFr ? 'Comment réussir ?' : 'Spartan Tactics Guide :'}
              </span>
              {isFr ? activeChallenge.tipFr : activeChallenge.tipEn}
            </div>
          </div>
        </div>

        {/* Action button panel */}
        <div className="md:col-span-4 flex flex-col justify-center items-stretch sm:items-end gap-3">
          {isCompletedToday ? (
            <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
              <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </span>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-white uppercase italic">
                  {isFr ? 'MISSION COMPLÉTÉE' : 'CHALLENGE COMPLETED'}
                </h5>
                <p className="text-[10px] text-neutral-400 font-mono">
                  {isFr ? 'Honneur & Rigueur Militaires' : 'Compounding power certified.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 w-full">
              <button
                id="verify-daily-challenge-btn"
                onClick={handleVerify}
                className="w-full bg-orange-650 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl cursor-pointer shadow-[0_4px_12px_rgba(249,115,22,0.25)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus:outline-none"
              >
                <Swords className="w-4 h-4" />
                {isFr ? activeChallenge.actionTextFr : activeChallenge.actionTextEn}
              </button>

              {/* Dynamic state feedback hints */}
              <AnimatePresence mode="wait">
                {verificationFeedback === 'failed' && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-center text-[10px] text-rose-500 font-mono font-bold bg-rose-500/10 rounded-lg py-2 px-1 border border-rose-500/15"
                  >
                    ⚠️ {isFr ? 'Conditions non atteintes. Réessayez !' : 'Not qualified yet. Check details above!'}
                  </motion.div>
                )}
                {verificationFeedback === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-center text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 rounded-lg py-2 px-1 border border-emerald-555 border-emerald-500/15"
                  >
                    🎉 {isFr ? 'Vérification validée avec succès !' : 'Verification processed successfully!'}
                  </motion.div>
                )}
              </AnimatePresence>

              {activeChallenge.category === 'school' && (
                <button
                  onClick={() => setActiveTab('school')}
                  className="w-full text-center text-xs font-bold text-neural-400 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer font-mono"
                >
                  {isFr ? 'Aller à la Spartan School' : 'Go to Spartan School'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {activeChallenge.category === 'ledger' && (
                <button
                  onClick={() => {
                    const btn = document.getElementById('quick-add-bet-btn');
                    if (btn) btn.click();
                  }}
                  className="w-full text-center text-xs font-bold text-neural-400 hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer font-mono"
                >
                  {isFr ? 'Ouvrir le Ticket Rapide' : 'Open Quick Ticket'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
