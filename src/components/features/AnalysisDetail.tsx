import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { MatchAnalysis } from '../../types';
import { 
  Target, Calculator, ShieldCheck, AlertTriangle, ChevronLeft, 
  HelpCircle, Sparkles, Coins, CheckSquare, Dumbbell, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AnalysisDetail: React.FC = () => {
  const { 
    user, bankroll, analyses, isBetFollowed, followBet,
    selectedAnalysis, setSelectedAnalysis, addToast, togglePremium
  } = useApp();

  const isFr = user.language === 'fr';

  // Modal flow state variables
  const [activeAnalysis, setActiveAnalysis] = useState<MatchAnalysis | null>(() => {
    return selectedAnalysis || analyses[0] || null;
  });

  const [showDrawer, setShowDrawer] = useState(false);
  const [stakeValue, setStakeValue] = useState<number>(50); // initial stake numeric wager
  const [usePercent, setUsePercent] = useState(false);
  const [percentStake, setPercentStake] = useState<number>(2.5); // % selection slider
  const [followNotes, setFollowNotes] = useState('');
  const [followTags, setFollowTags] = useState<string[]>([]);

  // Calculate equivalent cash
  const finalStakeAmount = usePercent 
    ? Number((bankroll.balance * (percentStake / 100)).toFixed(2))
    : stakeValue;

  const currentStakePercent = usePercent 
    ? percentStake
    : Number(((stakeValue / bankroll.balance) * 100).toFixed(1));

  // Validation feedback
  const isTooHighRisk = currentStakePercent > 5;
  const isOutOfFunds = finalStakeAmount > bankroll.balance;
  const isInvalid = finalStakeAmount <= 0 || isNaN(finalStakeAmount);

  // Handle Bet confirmation submission
  const handleConfirmFollow = async () => {
    if (!activeAnalysis) return;
    
    if (isOutOfFunds) {
      addToast(isFr ? 'Solde insuffisant dans votre Bankroll.' : 'Insufficient bankroll resources.', 'error');
      return;
    }

    if (isInvalid) {
      addToast(isFr ? 'Veuillez entrer une mise valide.' : 'Please input a valid stake.', 'error');
      return;
    }

    // Call follow bet state mutation
    const result = await followBet(activeAnalysis.id, finalStakeAmount, followNotes, followTags);
    
    if (result.success) {
      setFollowNotes('');
      setFollowTags([]);
      setShowDrawer(false);
    } else {
      addToast(result.error || 'Erreur', 'error');
    }
  };

  const handleOpenDrawer = () => {
    // Default stake suggestions to exactly 2% of current balance for optimal risk management
    const recommendedDefault = Number((bankroll.balance * 0.02).toFixed(0));
    setStakeValue(recommendedDefault > 10 ? recommendedDefault : 20);
    setPercentStake(2);
    setUsePercent(false);
    setShowDrawer(true);
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Header & Quick stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white font-sans tracking-tight">
            {isFr ? 'ANALYSES LOGICIEL' : 'EXPERT PREDICTIONS & BETS'}
          </h2>
          <p className="text-sm text-stone-400 mt-1">
            {isFr 
              ? 'Sélections vérifiées, value bets tactiques et plans de trading récapitulés.'
              : 'Verified picks, statistical edges and structured game reviews.'}
          </p>
        </div>

        {/* Selected active match summary title if applicable */}
        {selectedAnalysis && (
          <button
            onClick={() => {
              setSelectedAnalysis(null);
              // Fallback to first
              if (analyses.length > 0) setActiveAnalysis(analyses[0]);
            }}
            className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            {isFr ? 'Retour à la liste complète' : 'Back to entire selections'}
          </button>
        )}
      </div>

      {/* 2. Main split structure (List left on desktop, details expanded on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Match selection lists (4 cols) */}
        <div className="lg:col-span-4 space-y-3 order-2 lg:order-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block px-1">
            {isFr ? 'CHOIX DU SÉLECTEUR' : 'SELECT THE EVENT'}
          </span>
          <div className="flex flex-col gap-2">
            {analyses.map(match => {
              const isSelected = activeAnalysis?.id === match.id;
              const isFollowed = isBetFollowed(match.id);
              const isPremiumLocked = match.isPremium && user.role !== 'premium';

              return (
                <button
                  key={match.id}
                  id={`match-btn-${match.id}`}
                  onClick={() => {
                    setActiveAnalysis(match);
                    setSelectedAnalysis(null); // Clear search reference
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                    isSelected 
                      ? 'bg-[#131316] border-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.15)]' 
                      : 'bg-stone-900/40 border-stone-800 hover:border-stone-700 hover:bg-stone-900/60'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider block">
                      {match.league}
                    </span>
                    {isFollowed && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-2 py-0.5 rounded leading-none">
                        Suivi ✓
                      </span>
                    )}
                    {isPremiumLocked && (
                      <span className="text-[9px] font-bold text-orange-500 bg-orange-950/30 border border-orange-900/80 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        VIP
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-stone-100 transition-colors mt-2">
                    {match.homeTeam} - {match.awayTeam}
                  </h4>

                  <div className="flex justify-between items-center text-xs text-stone-400 mt-3 font-mono">
                    <span className="truncate max-w-[150px]">{match.prediction}</span>
                    <strong className="text-orange-500 font-bold">@ {match.odds}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-depth report sheet (8 cols) */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          {activeAnalysis ? (
            <div className="bg-stone-900/40 border border-stone-800 rounded-3xl p-6 space-y-6">
              
              {/* Header match detail info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-[10px] uppercase tracking-wider font-mono text-stone-400">
                    {activeAnalysis.league}
                  </span>
                  <h3 className="text-2xl font-extrabold text-white font-sans tracking-tight">
                    {activeAnalysis.homeTeam} VS {activeAnalysis.awayTeam}
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    {isFr ? 'Début de l’événement :' : 'Match kickoff time:'} {activeAnalysis.startTime}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-center bg-stone-950 border border-stone-800 px-3.5 py-2 rounded-xl">
                    <span className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider leading-none">COTE</span>
                    <span className="text-lg font-mono font-black text-orange-500">
                      {activeAnalysis.odds}
                    </span>
                  </div>
                  <div className="text-center bg-stone-950 border border-stone-800 px-3.5 py-2 rounded-xl">
                    <span className="block text-[9px] text-stone-500 font-bold uppercase tracking-wider leading-none">INDICE</span>
                    <span className="text-lg font-mono font-black text-stone-200">
                      {activeAnalysis.confidence}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Locked view for Premium if applicable */}
              {activeAnalysis.isPremium && user.role !== 'premium' ? (
                <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-8 py-12 text-center max-w-lg mx-auto space-y-4">
                  <div className="mx-auto flex justify-center w-12 h-12 rounded-full bg-orange-500/10 text-orange-500">
                    <Sparkles className="w-6 h-6 self-center" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white uppercase tracking-tight">
                      {isFr ? 'Abonnement Professionnel Requis' : 'Pro Premium Access Required'}
                    </h4>
                    <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto">
                      {isFr 
                        ? 'Cette analyse est classée confidentielle de haut niveau. Débloquez-la pour accéder au rapport complet.' 
                        : 'This professional value analysis incorporates premium database statistics. Upgrade to open the complete report.'}
                    </p>
                  </div>
                  <button
                    onClick={togglePremium}
                    className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded transition-all cursor-pointer inline-block"
                  >
                    {isFr ? 'Rejoindre Spartan Premium' : 'Upgrade to Pro'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Analysis Text Overview */}
                  <div className="space-y-3">
                    <h4 className="text-xs text-stone-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-orange-500" />
                      {isFr ? 'RECOMMANDATION SPARTAN' : 'THE STRATEGIC PICK'}
                    </h4>
                    <div className="bg-orange-500/5 border border-orange-500/10 p-4 rounded-2xl">
                      <p className="text-sm font-extrabold text-orange-500">
                        {activeAnalysis.prediction}
                      </p>
                      <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                        {activeAnalysis.analysisText}
                      </p>
                    </div>
                  </div>

                  {/* Bullet analysis parameters */}
                  <div className="space-y-4">
                    <h4 className="text-xs text-stone-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-orange-500" />
                      {isFr ? 'points clés de l’analyse' : 'tactical match breakdown'}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {activeAnalysis.detailedAnalysis.map((bullet, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3 bg-stone-950/60 p-4 border border-stone-800/80 rounded-xl"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-stone-900 border border-stone-800 text-[10px] font-bold font-mono text-stone-400">
                            {index + 1}
                          </span>
                          <p className="text-xs text-stone-300 leading-relaxed font-sans mt-0.5">
                            {bullet}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Danger zone / Discipline indicator */}
                  <div className="bg-stone-950 p-4 border border-stone-800 rounded-xl flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
                      <ShieldCheck className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white mb-0.5">
                        {isFr ? 'Rappel de Discipline' : 'Discipline Guideline'}
                      </h5>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        {isFr 
                          ? 'Une mise unitaire recommandée est de 2% de votre capital global. Ne doublez jamais votre pari sous le coup de l’impulsion.'
                          : 'Our calculated target size for this probability structure is 1 unit (2% of current total ledger status).'}
                      </p>
                    </div>
                  </div>

                  {/* Follow CTA Button */}
                  <div className="pt-4 border-t border-stone-800/60">
                    {isBetFollowed(activeAnalysis.id) ? (
                      <button
                        disabled
                        className="w-full bg-emerald-950 border border-emerald-800 text-emerald-400 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        <CheckSquare className="w-5 h-5" />
                        <span>{isFr ? 'Suivi de Pari Effectué ✓' : 'Bet Registered & Followed ✓'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleOpenDrawer}
                        className="w-full bg-stone-100 hover:bg-stone-200 text-stone-950 py-3.5 rounded-2xl text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <Coins className="w-5 h-5" />
                        <span>{isFr ? 'J’ai suivi ce Pari' : 'Follow This Selection'}</span>
                      </button>
                    )}
                  </div>
                </>
              )}

            </div>
          ) : (
            <div className="text-center py-20 text-stone-500 font-mono">
              {isFr ? 'Sélectionnez une opportunité.' : 'Select an opportunity to review.'}
            </div>
          )}
        </div>

      </div>

      {/* 3. Follow Bet Action Sheet Modal ("Slide-up Drawer") */}
      <AnimatePresence>
        {showDrawer && activeAnalysis && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
            
            {/* Modal backdrop closer */}
            <div 
              className="absolute inset-0 cursor-pointer" 
              onClick={() => setShowDrawer(false)}
            />

            {/* Content Drawer Card */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="bg-stone-950 border-t border-stone-800 w-full max-w-lg rounded-t-3xl p-6 pb-12 shadow-2xl relative z-10 pointer-events-auto"
            >
              {/* Top notch */}
              <div className="w-12 h-1 bg-stone-800 rounded-full mx-auto mb-4" />

              <div className="space-y-5">
                
                {/* Header */}
                <div className="text-center">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest font-mono">
                    {isFr ? 'VOTRE TICKET DE PARI' : 'WAGER REGISTRATION'}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {activeAnalysis.homeTeam} - {activeAnalysis.awayTeam}
                  </h4>
                  <p className="text-xs text-stone-400 font-mono mt-0.5">
                    {activeAnalysis.prediction} (Cote {activeAnalysis.odds})
                  </p>
                </div>

                {/* Switcher percent/cash */}
                <div className="flex bg-stone-900 border border-stone-800 rounded-xl p-1 justify-between text-xs">
                  <button
                    onClick={() => setUsePercent(false)}
                    className={`flex-1 text-center py-1.5 rounded-lg font-bold transition-all ${
                      !usePercent ? 'bg-stone-850 text-white' : 'text-stone-400'
                    }`}
                  >
                    {isFr ? 'Montant Cash (€)' : 'Cash Amount ($)'}
                  </button>
                  <button
                    onClick={() => setUsePercent(true)}
                    className={`flex-1 text-center py-1.5 rounded-lg font-bold transition-all ${
                      usePercent ? 'bg-stone-850 text-white' : 'text-stone-400'
                    }`}
                  >
                    {isFr ? 'Pourcent (%) de la Bankroll' : 'Percent (%) of Capital'}
                  </button>
                </div>

                {/* Input selection based on choice */}
                <div className="bg-stone-900 border border-stone-800/60 p-4 rounded-xl space-y-4">
                  {!usePercent ? (
                    <div>
                      <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider mb-2">
                        {isFr ? 'Somme engagée :' : 'Wager cost:'}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="stake-cash-input"
                          type="number"
                          value={stakeValue}
                          onChange={(e) => setStakeValue(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="bg-stone-950 border border-stone-800 rounded-lg p-2.5 flex-1 font-mono text-center text-white font-bold text-sm focus:outline-none focus:border-orange-500"
                        />
                        <span className="font-mono text-stone-400 font-black">{bankroll.currency}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                          {isFr ? 'Pourcentage total :' : 'Target % ratio:'}
                        </span>
                        <strong className="text-orange-500 font-mono">{percentStake}%</strong>
                      </div>
                      <input
                        id="stake-percent-slider"
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.5"
                        value={percentStake}
                        onChange={(e) => setPercentStake(parseFloat(e.target.value))}
                        className="w-full accent-orange-500 bg-stone-950"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-stone-500 mt-1">
                        <span>Min (0.5%)</span>
                        <span className="text-orange-500/80 font-bold">{isFr ? 'Recommandé (2%)' : 'Suggested (2%)'}</span>
                        <span className="text-orange-500">{isFr ? 'Risqué (>5%)' : 'Aggressive (>5%)'}</span>
                      </div>
                    </div>
                  )}

                  {/* Summary equivalence */}
                  <div className="flex justify-between items-center pt-3 border-t border-stone-800 text-xs">
                    <span className="text-stone-400">{isFr ? 'Équivalence :' : 'Equivalent cost:'}</span>
                    <strong className="font-mono text-stone-500">
                      {finalStakeAmount.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} {bankroll.currency} 
                      <span className="mx-1 text-stone-600">/</span> 
                      {currentStakePercent}% {isFr ? 'de la Bankroll' : 'of Bankroll'}
                    </strong>
                  </div>
                </div>

                {/* Validation and Warning States */}
                {isOutOfFunds ? (
                  <div className="bg-rose-950/40 border border-rose-900 rounded-xl p-3.5 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-rose-400 text-xs uppercase leading-none">
                        {isFr ? 'SOLDE INSUFFISANT' : 'OUT OF FUNDS'}
                      </h5>
                      <p className="text-[10px] text-rose-200 leading-relaxed mt-1">
                        {isFr 
                          ? `Le solde de votre bankroll disponible est de ${bankroll.balance.toLocaleString()} ${bankroll.currency}. Réduisez votre mise.` 
                          : `Your current available balance is ${bankroll.balance.toLocaleString()} ${bankroll.currency}. Reduce the wager.`}
                      </p>
                    </div>
                  </div>
                ) : isTooHighRisk ? (
                  <div className="bg-orange-950/40 border border-orange-900 rounded-xl p-3.5 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-orange-400 text-xs uppercase leading-none">
                        {isFr ? 'RISQUE SÉVÈRE DE FAILLITE' : 'AGGRESSIVE EXPOSURE ALARM'}
                      </h5>
                      <p className="text-[10px] text-orange-200 leading-relaxed mt-1">
                        {isFr 
                          ? `Miser ${currentStakePercent}% compromet gravement votre sécurité financière. La variance négative ("Bad Run") détruira votre capital.` 
                          : `A ${currentStakePercent}% wager profile exceeds standard guidelines. Safe trading parameters recommend <= 3%.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-950/20 border border-emerald-900/60 rounded-xl p-3.5 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-emerald-400 text-xs uppercase leading-none">
                        {isFr ? 'SÉCURITÉ DE TRADING DIRECT' : 'OPTIMAL RISK METRIC'}
                      </h5>
                      <p className="text-[10px] text-emerald-305 leading-relaxed mt-1">
                        {isFr 
                          ? '✓ Taille de mise parfaitement conforme aux chartes Spartan d’investissement.' 
                          : '✓ Conservative size aligns nicely with modern sports investment procedures.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Qualitative Notes and Psychological State Tags */}
                <div className="space-y-3 bg-[#0A0A0B] border border-white/5 p-4 rounded-xl">
                  {/* Notes input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-400 uppercase tracking-wider block">
                      {isFr ? 'Analyse Qualitative / Raisons Personnelles' : 'Qualitative Reason / Personal Notes'}
                    </label>
                    <textarea
                      value={followNotes}
                      onChange={e => setFollowNotes(e.target.value)}
                      placeholder={isFr ? 'Pourquoi suivez-vous cette recommandation ? (ex. Confiance élevée, tactique, discipline...)' : 'Why are you following this match prediction? (e.g., strong H2H, tactical play...)'}
                      rows={2}
                      className="w-full text-xs bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-white placeholder-stone-600 focus:outline-none focus:border-orange-500 resize-none font-sans"
                    />
                  </div>

                  {/* Psychological State Tags */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-stone-400 uppercase tracking-wider block">
                      {isFr ? "État d'Esprit Psychologique" : 'Psychological State Tags'}
                    </label>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { id: 'calculated', label: isFr ? 'Calculé 📐' : 'Calculated 📐' },
                        { id: 'disciplined', label: isFr ? 'Discipliné 🛡️' : 'Disciplined 🛡️' },
                        { id: 'confident', label: isFr ? 'Confiant 💪' : 'Confident 💪' },
                        { id: 'fomo', label: 'FOMO 📈' },
                        { id: 'impulsive', label: isFr ? 'Impulsif ⚡' : 'Impulsive ⚡' },
                        { id: 'tilt', label: 'Tilt 😡' },
                        { id: 'bored', label: isFr ? 'Ennui 💤' : 'Bored 💤' },
                      ].map(tagConfig => {
                        const isSelected = followTags.includes(tagConfig.id);
                        return (
                          <button
                            key={tagConfig.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setFollowTags(prev => prev.filter(t => t !== tagConfig.id));
                              } else {
                                setFollowTags(prev => [...prev, tagConfig.id]);
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-[9px] font-mono font-bold transition-all border cursor-pointer select-none ${
                              isSelected
                                ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-extrabold'
                                : 'bg-stone-900 border-stone-800 text-neutral-400 hover:text-white hover:bg-stone-850'
                            }`}
                          >
                            {tagConfig.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowDrawer(false)}
                    className="flex-1 bg-stone-900 hover:bg-stone-850 text-stone-300 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {isFr ? 'Annuler' : 'Cancel'}
                  </button>
                  <button
                    onClick={handleConfirmFollow}
                    disabled={isOutOfFunds || isInvalid}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isOutOfFunds || isInvalid
                        ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-800'
                        : isTooHighRisk
                          ? 'bg-orange-600 hover:bg-orange-500 text-white font-bold rounded uppercase tracking-wider'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-950 shadow-md'
                    }`}
                  >
                    {isFr ? 'Confirmer le Pari' : 'Confirm Registration'}
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
