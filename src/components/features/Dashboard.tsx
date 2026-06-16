import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  ShieldAlert, Sparkles, TrendingUp, ChevronRight, Swords, 
  BookOpen, Trophy, ArrowUpRight, AlertTriangle, Play, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { CalendarWidget } from './CalendarWidget';
import { DailyChallengeWidget } from './DailyChallengeWidget';

export const Dashboard: React.FC = () => {
  const { 
    user, bankroll, analyses, disciplineScore, followedBets, 
    lessons, setActiveTab, setSelectedAnalysis, setShowFollowModal,
    updateMonthlyGoal, togglePremium
  } = useApp();

  const isFr = user.language === 'fr';

  // Monthly goal arithmetic calculations
  const monthlyGoal = bankroll.monthlyGoalPercent || 15;
  const currentGrowth = bankroll.balance - bankroll.initialBalance;
  const targetGrowthAmount = bankroll.initialBalance * (monthlyGoal / 100);
  const progressPercent = targetGrowthAmount > 0 
    ? Math.max(0, Math.min(100, (currentGrowth / targetGrowthAmount) * 100))
    : 0;

  // Progressive circle outline calculations
  const circleRadius = 20;
  const circleStroke = 3.5;
  const circleCircumference = circleRadius * 2 * Math.PI;
  const strokeDashoffset = circleCircumference - (progressPercent / 100) * circleCircumference;

  // 1. Interactive Promotional Carousel State (Auto transitions every 6s)
  const [activeAd, setActiveAd] = useState(0);
  const ads = [
    {
      id: 1,
      tag: isFr ? 'OFFRE PRO' : 'UPGRADE OFFER',
      title: isFr ? 'Passe Premium à -50%' : 'Premium Membership -50%',
      desc: isFr 
        ? 'Découvrez les analyses VIP, doubles opportunités exclusives et alertes instantanées.' 
        : 'Unlock VIP analyses, double prediction chances and system smart suggestions.',
      action: 'premium',
      buttonText: isFr ? 'Devenir Premium' : 'Activate Premium',
    },
    {
      id: 2,
      tag: isFr ? 'FORMATION' : 'SPARTAN SCHOOL',
      title: isFr ? 'Gérez la variance négative' : 'Master your Drawdowns',
      desc: isFr 
        ? 'Comment survivre à une mauvaise série ? Lisez la leçon psychologique gratuite.' 
        : 'How to survive poor variance streaks. Read our free psychology handbook.',
      action: 'school',
      buttonText: isFr ? 'Étudier la discipline' : 'Start Reading',
    },
    {
      id: 3,
      tag: isFr ? 'CODE D’HONNEUR' : 'SPARTAN CODE',
      title: isFr ? 'Règle stricte des 3%' : 'The strict 3% stake rule',
      desc: isFr 
        ? 'Misez de petits montants stables. L’impulsivité détruit la bankroll, la régularité l’enrichit.' 
        : 'Keep stake sizes conservative relative to bankroll. Empathy destroys capital.',
      action: 'tips',
      buttonText: isFr ? 'Comprendre le Yield' : 'Learn ROI Formulas',
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAd(prev => (prev + 1) % ads.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Discipline Status Labeling
  const getDisciplineLabel = (score: number) => {
    if (score >= 90) return { label: isFr ? 'Spartiate Légendaire' : 'Legendary Spartan', color: 'text-[#33AAFF] bg-[#001A33]/40 border-[#002B52]' };
    if (score >= 75) return { label: isFr ? 'Vétéran Discipliné' : 'Disciplined Veteran', color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800' };
    if (score >= 50) return { label: isFr ? 'Parieur Rationnel' : 'Rational Bettor', color: 'text-stone-300 bg-white/5 border-white/5' };
    return { label: isFr ? 'Flambeur Impulsif' : 'Impulsive Gambler', color: 'text-rose-400 bg-rose-950/40 border-rose-800' };
  };

  const disciplineStatus = getDisciplineLabel(disciplineScore);
  const completedLessons = lessons.filter(l => l.isCompleted).length;
  const totalFollowedAmount = followedBets.reduce((acc, b) => acc + b.stakeAmount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      
      {/* 2. Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#131316] border border-white/5 p-5 rounded-2xl">
        <div>
          <h2 className="text-2xl font-bold uppercase italic text-white font-sans tracking-tight">
            {isFr ? `Salut, ${user.name}` : `Welcome back, ${user.name}`}
          </h2>
          <p className="text-sm text-neutral-400 mt-1 font-medium">
            {isFr 
              ? 'La discipline fait la différence. Voici vos opportunités d’investissement aujourd’hui.' 
              : 'Discipline makes the absolute difference. Track today’s key opportunities below.'}
          </p>
        </div>
        
        {/* Rapid Stats counters */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
          <div className="bg-[#0A0A0B] border border-white/5 p-3 rounded-xl min-w-[110px]">
            <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-none">
              {isFr ? 'PARIS SUIVIS' : 'BETS FOLLOWED'}
            </span>
            <span className="block text-lg font-black text-white font-mono mt-1">
              {followedBets.length}
            </span>
          </div>
          <div className="bg-[#0A0A0B] border border-white/5 p-3 rounded-xl min-w-[110px]">
            <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest leading-none">
              {isFr ? 'COURS APPRIS' : 'LESSONS SAVED'}
            </span>
            <span className="block text-lg font-black text-white font-mono mt-1">
              {completedLessons} / {lessons.length}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Adaptive Top KPI Sections (Bankroll + Discipline Score Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Bankroll Tracker Widget */}
        <div className="bg-[#131316] border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded bg-[#007ACC]/10 text-[#0099FF]">
                <Trophy className="w-5 h-5 text-[#0099FF]" />
              </span>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {isFr ? 'Capital Bankroll' : 'Bankroll Ledger'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isFr ? 'Investissements sportifs en direct' : 'Live sport investments status'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-[11px] text-[#0099FF] hover:underline font-mono"
            >
              {isFr ? 'Ajuster' : 'Adjust'}
            </button>
          </div>

          <div className="pt-2">
            <span className="text-3xl font-mono font-bold text-stone-100 tracking-tight">
              {bankroll.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {bankroll.currency}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-bold flex items-center ${
                bankroll.balance >= bankroll.initialBalance ? 'text-emerald-500' : 'text-neutral-400'
              }`}>
                {bankroll.balance >= bankroll.initialBalance ? '+' : ''}
                {((bankroll.balance - bankroll.initialBalance) * 100 / bankroll.initialBalance).toFixed(1)}%
              </span>
              <span className="text-[11px] text-neutral-500">
                {isFr ? 'depuis investissement de base' : 'since initial pool'} ({bankroll.initialBalance} {bankroll.currency})
              </span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between text-xs text-stone-400">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider">{isFr ? 'Engagé' : 'Total Stake'}</span>
              <span className="font-mono text-stone-300 font-bold block mt-0.5">
                {totalFollowedAmount.toLocaleString('fr-FR')} {bankroll.currency}
              </span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 block text-[10px] uppercase font-bold tracking-wider">{isFr ? 'Disponibilité' : 'Available Liquid'}</span>
              <span className="font-mono text-emerald-400 font-bold block mt-0.5">
                {Number((bankroll.balance * 100 / bankroll.initialBalance).toFixed(0))}%
              </span>
            </div>
          </div>

          {/* Interactive Monthly growth goal progress ring */}
          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5 flex-1 min-w-0">
                <span className="text-white font-bold text-xs flex items-center gap-1">
                  🎯 {isFr ? 'Objectif de Croissance' : 'Growth Goal Target'}
                </span>
                <p className="text-[10px] text-neutral-400 truncate">
                  {isFr 
                    ? `Viser +${monthlyGoal}% de profit ce mois-ci` 
                    : `Aiming for +${monthlyGoal}% yield this month`}
                </p>
                <div className="flex items-center gap-1 pt-1.5">
                  <button
                    onClick={() => updateMonthlyGoal(Math.max(1, monthlyGoal - 1))}
                    className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-[10px] rounded text-neutral-400 hover:text-white transition-all cursor-pointer font-bold select-none focus:outline-none"
                    title={isFr ? "Diminuer l'objectif" : "Decrease goal"}
                  >
                    -
                  </button>
                  <span className="px-1.5 text-[10px] font-mono font-bold text-neutral-300">
                    {monthlyGoal}%
                  </span>
                  <button
                    onClick={() => updateMonthlyGoal(Math.min(100, monthlyGoal + 1))}
                    className="w-5 h-5 flex items-center justify-center bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 text-[10px] rounded text-neutral-400 hover:text-white transition-all cursor-pointer font-bold select-none focus:outline-none"
                    title={isFr ? "Augmenter l'objectif" : "Increase goal"}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Vector SVG circular loader indicator */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r={circleRadius}
                    className="text-stone-800"
                    strokeWidth={circleStroke}
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r={circleRadius}
                    className="text-[#0099FF] transition-all duration-500 ease-out"
                    strokeWidth={circleStroke}
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-[10px] font-mono font-bold text-white leading-none">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Trajectory textual descriptions */}
            <div className="mt-2.5 text-[10px] leading-relaxed text-neutral-400 border-t border-white/5 pt-2">
              {currentGrowth > 0 ? (
                <span className="text-emerald-400">
                  🛡️ {isFr
                    ? `Progression active : +${currentGrowth.toFixed(1)} ${bankroll.currency} acquis sur les ${targetGrowthAmount.toFixed(0)} ${bankroll.currency} visés !`
                    : `Active curve: +${currentGrowth.toFixed(1)} ${bankroll.currency} earned out of the ${targetGrowthAmount.toFixed(0)} ${bankroll.currency} target !`}
                </span>
              ) : (
                <span className="text-neutral-500">
                  ⏳ {isFr
                    ? `Objectif cible : gagner +${targetGrowthAmount.toFixed(0)} ${bankroll.currency} pour valider le contrat Spartan.`
                    : `Target amount: realize +${targetGrowthAmount.toFixed(0)} ${bankroll.currency} to fulfill your Spartan contract.`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Gamified Discipline Score Gauge */}
        <div className="bg-[#131316] border border-white/5 p-5 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded bg-[#007ACC]/10 text-[#0099FF]">
                <ShieldAlert className="w-5 h-5 text-[#0099FF]" />
              </span>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {isFr ? 'Indice de Discipline' : 'Discipline Ratio'}
                </h3>
                <p className="text-xs text-neutral-400">
                  {isFr ? 'Calculé par rapport à la taille de vos paris' : 'Calculated based on average stakes'}
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${disciplineStatus.color}`}>
              {disciplineStatus.label}
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-baseline justify-between font-mono">
              <div className="flex items-center gap-1">
                <span className="text-3xl font-black text-[#0099FF]">{disciplineScore}</span>
                <span className="text-neutral-500 text-sm">/ 100</span>
              </div>
              <span className="text-xs text-neutral-500">
                {isFr ? 'Recommandé : >= 80' : 'Goal: >= 80'}
              </span>
            </div>
            
            {/* Elegant full height progress bar */}
            <div className="w-full bg-[#0A0A0B] h-3 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-[#007ACC] to-[#33AAFF] h-full transition-all duration-750 ease-out"
                style={{ width: `${disciplineScore}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-neutral-400 leading-relaxed font-sans pt-1">
            {disciplineScore >= 80 ? (
              <span className="text-emerald-400 font-medium">
                {isFr 
                  ? '✓ Excellent comportement. Vous respectez la gestion des risques et construisez votre profit.' 
                  : '✓ Flawless betting pattern. You respect bankroll rules and minimize volatility.'}
              </span>
            ) : disciplineScore >= 50 ? (
              <span className="text-neutral-400">
                {isFr 
                  ? '⚠️ Attention : Complétez plus de leçons Spartan pour corriger votre mental de trading.' 
                  : '⚠️ Alert: Read further system guidelines and lessons to enforce mental risk structures.'}
              </span>
            ) : (
              <span className="text-rose-400 font-bold">
                {isFr 
                  ? '🚨 Danger de faillite : Vos mises sont déraisonnables. Limitez vos stakes à moins de 3% !' 
                  : '🚨 Extravagant Risk: Your stakes exceed rational guidelines. Return under 3% immediately.'}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Daily Challenge Widget */}
      <DailyChallengeWidget />

      {/* 4. Promotional Interactive Carousel ("Bannières Publicitaires") */}
      <div className="relative overflow-hidden bg-[#131316] border border-white/5 rounded-2xl p-5 md:p-6 shadow-md">
        
        {/* Glowing background accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#0099FF]/10 to-transparent pointer-events-none rounded-r-2xl" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-1.5 flex-1 max-w-2xl">
            <span className="inline-block text-[9px] font-black text-[#0099FF] border border-[#0099FF]/40 px-2 py-0.5 rounded uppercase tracking-widest font-mono">
              {ads[activeAd].tag}
            </span>
            <h3 className="text-lg font-bold uppercase italic text-white font-sans tracking-tight">
              {ads[activeAd].title}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {ads[activeAd].desc}
            </p>
          </div>

          <button
            onClick={() => {
              const action = ads[activeAd].action;
              if (action === 'premium') {
                // Toggle premium directly
                togglePremium();
              } else if (action === 'school') {
                setActiveTab('school');
              } else {
                setActiveTab('performance');
              }
            }}
            className="shrink-0 bg-white hover:bg-stone-200 text-stone-950 text-xs font-bold px-4 py-2.5 rounded uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5"
          >
            {ads[activeAd].buttonText}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pagination Indicators */}
        <div className="flex items-center gap-1.5 mt-4">
          {ads.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveAd(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeAd ? 'w-5 bg-[#0099FF]' : 'w-1.5 bg-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 5. Central Column: Match Analyses & Skeletons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-sans tracking-tight uppercase italic">
            {isFr ? 'opportunités du jour' : 'todays expert selections'}
          </h3>
          <button
            onClick={() => setActiveTab('analyses')}
            className="flex items-center gap-1 text-xs text-[#0099FF] hover:underline font-mono"
          >
            {isFr ? 'Voir toutes les analyses' : 'All analyses'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* List of 3 selections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.slice(0, 3).map((match, idx) => {
            const isPremiumLocked = match.isPremium && user.role !== 'premium';
            
            return (
              <div 
                key={match.id}
                className="bg-[#131316] border border-white/5 hover:border-[#0099FF]/30 rounded-2xl p-4 flex flex-col justify-between space-y-4 transition-all duration-200"
              >
                <div>
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-black">
                      {match.league}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      match.category === 'Sélection Safe' 
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900' 
                        : 'bg-white/5 text-neutral-300'
                    }`}>
                      {match.category}
                    </span>
                  </div>

                  {/* Teams Duel */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="relative">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A0A0B] border border-white/5 font-mono text-xs font-bold text-white">
                        {match.homeTeam.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <span className="text-neutral-500 text-xs font-mono">VS</span>
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#0A0A0B] border border-white/5 font-mono text-xs font-bold text-white">
                      {match.awayTeam.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {match.homeTeam} - {match.awayTeam}
                      </h4>
                      <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                        {match.startTime}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation block / Premium Lock */}
                  {isPremiumLocked ? (
                    <div className="bg-[#0A0A0B] border border-white/5 rounded-xl p-3 mt-4 text-center space-y-2">
                      <div className="flex justify-center text-[#0099FF]">
                        <Sparkles className="w-5 h-5 text-[#0099FF]" />
                      </div>
                      <p className="text-[10px] font-mono text-neutral-400 leading-relaxed">
                        {isFr 
                          ? '🔒 Analyse verrouillée. Abonnés Premium uniquement.' 
                          : '🔒 Expert analysis locked. Premium subscribers only.'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#0A0A0B] border border-white/5 rounded-xl p-3 mt-4 space-y-1.5">
                      <span className="text-[9px] font-bold text-neutral-500 block uppercase tracking-wider">
                        {isFr ? 'RECOMMANDATION SPARTAN' : 'SPARTAN PICK'}
                      </span>
                      <p className="text-xs font-extrabold text-[#0099FF] leading-snug">
                        {match.prediction}
                      </p>
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pt-1.5 border-t border-white/5">
                        <span>Cote: <strong className="text-white">{match.odds}</strong></span>
                        <span>Confidence: <strong className="text-white">{match.confidence}%</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* View/Lock Button */}
                <button
                  onClick={() => {
                    if (isPremiumLocked) {
                      // Trigger upgrade toast helper by toggling membership
                      togglePremium();
                    } else {
                      setSelectedAnalysis(match);
                      setActiveTab('analyses');
                    }
                  }}
                  className={`w-full py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 ${
                    isPremiumLocked
                      ? 'bg-[#0099FF]/10 hover:bg-[#0099FF]/20 text-[#0099FF] border border-[#0099FF]/30'
                      : 'bg-white/5 border border-white/10 hover:bg-[#007ACC] hover:text-white text-neutral-200'
                  }`}
                >
                  {isPremiumLocked ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isFr ? 'Débloquer Sélection' : 'Unlock Selection'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{isFr ? "Entrer l'Analyse" : 'Open Analysis'}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar View Widget representing upcoming opportunities and historical settled wagers */}
      <CalendarWidget />
      
    </motion.div>
  );
};
