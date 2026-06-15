import React from 'react';
import { useApp } from '../../store/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, ChevronRight, X, Award, CheckCircle, 
  TrendingUp, Coins, Bell, BookOpen, UserCheck
} from 'lucide-react';

export const OnboardingTutorial: React.FC = () => {
  const {
    user,
    isOnboardingActive,
    onboardingStep,
    setOnboardingStep,
    completeOnboarding,
    setActiveTab
  } = useApp();

  if (!isOnboardingActive) return null;

  const isFr = user.language === 'fr';

  // Step definitions
  const steps = [
    {
      title: isFr ? "🛡️ Bienvenue chez Spartanbet !" : "🛡️ Welcome to Spartanbet!",
      description: isFr 
        ? "La seule plateforme d'investissement sportif qui remplace l'obsession du jeu par la discipline rigoureuse des Spartans." 
        : "The only sports investing workspace built to replace gambling behavior with rigid Spartan discipline.",
      targetTab: "dashboard",
      icon: <Shield className="w-8 h-8 text-orange-500" />,
      highlight: isFr 
        ? "Dans cette courte présentation, nous allons vous armer avec les outils clés pour optimiser votre capital."
        : "In this walkthrough, we will arm you with the essential widgets to defend and double your bankroll."
    },
    {
      title: isFr ? "📈 Indice de Discipline Spartan" : "📈 Spartan Discipline Rating",
      description: isFr
        ? "Votre métrique vitale. Elle commence à 75 et évolue selon vos choix : elle augmente lorsque vous complétez des cours, et baisse si vos mises dépassent 5%."
        : "Your survival rating. It rewards learning and penalizes high-risk emotional betting. Keep this score high!",
      targetTab: "dashboard",
      icon: <Award className="w-8 h-8 text-amber-500 animate-pulse" />,
      highlight: isFr
        ? "Règle d'or : Restez sous 3% de mise par pari pour obtenir la note maximale !"
        : "Rule of Gold: Keep all bet sizes strictly below 3% of your ledger to achieve maximum rating."
    },
    {
      title: isFr ? "⚡ Analyses & Signaux de Valeur" : "⚡ Premium Value Picks",
      description: isFr
        ? "Consultez des prévisions mathématiques calculant des valuabilités positives. Cliquez sur 'Suivre' pour engager une mise disciplinée."
        : "Examine advanced statistical recommendations. Follow chosen picks to execute clean, risk-managed wagers.",
      targetTab: "analyses",
      icon: <TrendingUp className="w-8 h-8 text-sky-500" />,
      highlight: isFr
        ? "Chaque fois qu'un pari se résout, vous recevez une notification en temps réel immédiate."
        : "Every single time games end, you will receive real-time push warnings detailing your yields."
    },
    {
      title: isFr ? "⚙️ Gestion de Capital & Alertes" : "⚙️ Bankroll Limits & Triggers",
      description: isFr
        ? "Dans l'onglet Profil, ajustez votre capital de départ et définissez un seuil d'alerte en cas de baisse extrême."
        : "Inside your settings, configure your sandbox starting budget and set maximum pain threshold triggers.",
      targetTab: "profile",
      icon: <Coins className="w-8 h-8 text-emerald-500" />,
      highlight: isFr
        ? "Activez aussi les notifications système de bureau pour rester informé hors-ligne !"
        : "Turn on browser desktop push settings as well to see live grades while browsing elsewhere."
    },
    {
      title: isFr ? "🎓 Vous êtes paré !" : "🎓 Ready for Battle!",
      description: isFr
        ? "Vous possédez désormais la sagesse Spartan. Ne pariez jamais avec vos émotions. Maîtrisez le risque, dominez le long terme."
        : "You now wear the Spartan shield. Never wager under emotion. Master your budget, control the variance.",
      targetTab: "dashboard",
      icon: <UserCheck className="w-8 h-8 text-emerald-405 text-emerald-400" />,
      highlight: isFr
        ? "Terminez le tutoriel pour accéder à l'entièreté de la plateforme."
        : "Complete this school onboarding to begin executing with unmatched mathematical rigor."
    }
  ];

  const currentStepData = steps[onboardingStep];

  const handleNext = () => {
    if (onboardingStep < steps.length - 1) {
      const nextStep = onboardingStep + 1;
      setOnboardingStep(nextStep);
      // Automatically navigate to the correct page tab to show the relevant segment live!
      setActiveTab(steps[nextStep].targetTab as any);
    } else {
      completeOnboarding();
    }
  };

  const handlePrev = () => {
    if (onboardingStep > 0) {
      const prevStep = onboardingStep - 1;
      setOnboardingStep(prevStep);
      setActiveTab(steps[prevStep].targetTab as any);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        {/* Subtle decorative spotlight backdrops */}
        <div className="absolute inset-x-0 top-1/4 h-96 bg-orange-600/10 rounded-full blur-[120px] pointer-events-none select-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#131115] border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.8)] relative z-[110]"
        >
          {/* Top colored strip indicators */}
          <div className="grid grid-cols-5 h-1.5 bg-stone-900">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`transition-all duration-300 ${
                  i <= onboardingStep ? 'bg-orange-500' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Header section */}
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                {currentStepData.icon}
              </div>
              <button 
                onClick={completeOnboarding}
                className="p-1.5 rounded-full hover:bg-white/5 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                title={isFr ? "Passer le didacticiel" : "Skip walkthrough"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Body */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-orange-500">
                {isFr ? `Étape ${onboardingStep + 1} sur ${steps.length}` : `Step ${onboardingStep + 1} of ${steps.length}`}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tight uppercase">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                {currentStepData.description}
              </p>
            </div>

            {/* Spotlight hint box */}
            <div className="p-4 bg-[#0A0A0B] rounded-2xl border border-white/5 space-y-1">
              <span className="block text-[8px] font-mono text-neutral-500 font-bold uppercase tracking-widest">
                {isFr ? "CONSEIL PRO" : "SPARTAN INTEL"}
              </span>
              <p className="text-xs text-neutral-400 leading-normal">
                {currentStepData.highlight}
              </p>
            </div>

            {/* Stepper buttons footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <button
                onClick={handlePrev}
                disabled={onboardingStep === 0}
                className={`text-xs font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all ${
                  onboardingStep === 0 
                    ? 'opacity-30 cursor-not-allowed text-neutral-600' 
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer'
                }`}
              >
                {isFr ? "Précédent" : "Previous"}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={completeOnboarding}
                  className="text-xs font-normal text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                >
                  {isFr ? "Passer" : "Skip"}
                </button>
                <button
                  onClick={handleNext}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-orange-950/20"
                >
                  <span>{onboardingStep === steps.length - 1 ? (isFr ? "Terminer !" : "Finish !") : (isFr ? "Suivant" : "Next")}</span>
                  {onboardingStep !== steps.length - 1 && <ChevronRight className="w-4 h-4 shrink-0" />}
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
