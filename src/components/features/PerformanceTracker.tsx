import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  TrendingUp, BarChart3, Activity, PieChart, Info, 
  ArrowUpRight, ArrowDownRight, Calendar, CircleDot, HelpCircle,
  MessageSquare, FileText, Brain, Save, X, Edit2
} from 'lucide-react';
import { motion } from 'motion/react';
import { BankrollManager } from './BankrollManager';
import { RoiCalculator } from './RoiCalculator';
import { MonthlySummaryCard } from './MonthlySummaryCard';

const PSYCHOLOGICAL_TAGS = [
  { id: 'calculated', labelEn: 'Calculated 📐', labelFr: 'Calculé 📐', color: 'border-emerald-500 bg-emerald-950/20 text-emerald-400' },
  { id: 'disciplined', labelEn: 'Disciplined 🛡️', labelFr: 'Discipliné 🛡️', color: 'border-indigo-500 bg-indigo-950/20 text-indigo-400' },
  { id: 'confident', labelEn: 'Confident 💪', labelFr: 'Confiant 💪', color: 'border-cyan-500 bg-cyan-950/20 text-cyan-400' },
  { id: 'fomo', labelEn: 'FOMO 📈', labelFr: 'FOMO 📈', color: 'border-amber-500 bg-amber-950/20 text-amber-500' },
  { id: 'impulsive', labelEn: 'Impulsive ⚡', labelFr: 'Impulsif ⚡', color: 'border-orange-500 bg-orange-950/20 text-orange-400' },
  { id: 'tilt', labelEn: 'Tilt 😡', labelFr: 'Tilt 😡', color: 'border-rose-500 bg-rose-950/20 text-rose-400' },
  { id: 'bored', labelEn: 'Bored 💤', labelFr: 'Ennui 💤', color: 'border-stone-500 bg-stone-950/20 text-stone-400' },
];

export const PerformanceTracker: React.FC = () => {
  const { user, bankroll, followedBets, updateBetNotesAndTags } = useApp();

  const isFr = user.language === 'fr';

  // Toggle states for qualitative notes and psychological tags
  const [expandedBetId, setExpandedBetId] = useState<string | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editNotesText, setEditNotesText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);

  // 1. Core performance mathematics calculations
  // We want to calculate statistics based on actual followed bets
  const gradedBets = followedBets.filter(b => b.status !== 'pending');
  const wonBets = gradedBets.filter(b => b.status === 'won');
  
  // Volume betted
  const totalStakedVolume = followedBets.reduce((acc, curr) => acc + curr.stakeAmount, 0);
  
  // Calculate raw net profit
  // For won bets: (odds * stake) - stake = stake * (odds - 1)
  // For lost bets: -stake
  // For pending bets: stake amount is currently locked (outside balance)
  const netProfit = followedBets.reduce((acc, curr) => {
    if (curr.status === 'won') {
      return acc + (curr.stakeAmount * (curr.odds - 1));
    } else if (curr.status === 'lost') {
      return acc - curr.stakeAmount;
    }
    // Pending does not contribute to graded profit yet (funds are deducted)
    return acc;
  }, 0);

  // ROI (On initial pool)
  const roi = (bankroll.balance - bankroll.initialBalance) * 100 / bankroll.initialBalance;

  // Yield on total graded volume
  const gradedVolume = gradedBets.reduce((acc, curr) => acc + curr.stakeAmount, 0);
  const yieldRatio = gradedVolume > 0 ? (netProfit / gradedVolume) * 100 : 0;

  // Win rate
  const winRate = gradedBets.length > 0 ? (wonBets.length / gradedBets.length) * 100 : 0;

  // Render progression coordinate charts
  // Let's build full historic coordinates starting from initialBalance
  const chartPoints: { label: string; value: number }[] = [];
  let currentAccumulatorValue = bankroll.initialBalance;
  
  // Start point
  chartPoints.push({ label: 'Start', value: currentAccumulatorValue });

  // Order followedBets chronological for line trend
  // Let's reverse them (oldest first) to build progression
  const chronologicalBets = [...followedBets].reverse();
  chronologicalBets.forEach((bet, index) => {
    if (bet.status === 'won') {
      currentAccumulatorValue += (bet.stakeAmount * (bet.odds - 1));
    } else if (bet.status === 'lost') {
      currentAccumulatorValue -= bet.stakeAmount;
    } else {
      // Pending
      currentAccumulatorValue -= bet.stakeAmount;
    }
    chartPoints.push({ label: `Pari ${index + 1}`, value: Number(currentAccumulatorValue.toFixed(1)) });
  });

  // Calculate SVG Line values
  const svgWidth = 500;
  const svgHeight = 180;
  const paddingX = 25;
  const paddingY = 20;

  const minVal = Math.min(...chartPoints.map(p => p.value)) * 0.98;
  const maxVal = Math.max(...chartPoints.map(p => p.value)) * 1.02;
  const valRange = maxVal - minVal || 1;

  const pointsString = chartPoints.map((point, idx) => {
    const x = paddingX + (idx * (svgWidth - paddingX * 2) / (chartPoints.length - 1 || 1));
    const y = svgHeight - paddingY - ((point.value - minVal) * (svgHeight - paddingY * 2) / valRange);
    return `${x},${y}`;
  }).join(' ');

  // 2. Sports breakdown counting
  const sportsCount = followedBets.reduce((acc, curr) => {
    // Standard simulation helper mapping search words
    let sport = 'Football';
    if (curr.prediction.toLowerCase().includes('celtics') || curr.prediction.toLowerCase().includes('basket')) sport = 'Basketball';
    if (curr.prediction.toLowerCase().includes('sets') || curr.prediction.toLowerCase().includes('alcaraz')) sport = 'Tennis';
    acc[sport] = (acc[sport] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sportsMax = Math.max(...(Object.values(sportsCount) as number[]), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20"
    >
      
      {/* 1. Header description */}
      <div>
        <h2 className="text-2xl font-black text-white font-sans tracking-tight">
          {isFr ? 'RECONNAISSANCE DU RENDEMENT' : 'PERFORMANCE & ROI ANALYTICS'}
        </h2>
        <p className="text-xs text-stone-400 mt-1 font-mono">
          {isFr 
            ? 'Indicateurs clés audités conformes aux mathématiques financières des investissements.'
            : 'Audited ledger statistics and real-time performance indicators.'}
        </p>
      </div>

      {/* 2. Key Stats Grids */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Metric 1: Capital Growth */}
        <div className="bg-[#131316] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
            ROI (CAPITAL PROGRESS)
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-xl sm:text-2xl font-mono font-black ${roi >= 0 ? 'text-emerald-400' : 'text-stone-300'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
            </span>
          </div>
          <span className="block text-[10px] text-neutral-400 mt-1 font-mono">
            {isFr ? 'Sur le capital de départ' : 'On the initial pool'}
          </span>
          <div className="absolute right-3 top-3 text-stone-600">
            <Activity className="w-5 h-5 text-orange-500/30" />
          </div>
        </div>

        {/* Metric 2: Yield Ratio */}
        <div className="bg-[#131316] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
            YELD % (RENDEMENT MENS)
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-xl sm:text-2xl font-mono font-black ${yieldRatio >= 0 ? 'text-orange-500' : 'text-rose-400'}`}>
              {yieldRatio >= 0 ? '+' : ''}{yieldRatio.toFixed(1)}%
            </span>
          </div>
          <span className="block text-[10px] text-neutral-400 mt-1 font-mono">
            {isFr ? 'Par rapport au volume' : 'On graded volume'}
          </span>
          <div className="absolute right-3 top-3 text-stone-600">
            <TrendingUp className="w-5 h-5 text-orange-500/30" />
          </div>
        </div>

        {/* Metric 3: Win Rate */}
        <div className="bg-[#131316] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
            WIN RATE % (SUCCÈS)
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl sm:text-2xl font-mono font-black text-stone-100">
              {winRate.toFixed(0)}%
            </span>
          </div>
          <span className="block text-[10px] text-neutral-400 mt-1 font-mono">
            {wonBets.length} {isFr ? 'gagnés' : 'won'} / {gradedBets.length} {isFr ? 'résolus' : 'graded'}
          </span>
          <div className="absolute right-3 top-3 text-stone-600">
            <BarChart3 className="w-5 h-5 text-orange-500/30" />
          </div>
        </div>

        {/* Metric 4: Net Profit */}
        <div className="bg-[#131316] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
            {isFr ? 'BÉNÉFICICE NET CAPITAL' : 'CUMULATED PROFIT'}
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-xl sm:text-2xl font-mono font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-stone-300'}`}>
              {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} {bankroll.currency}
            </span>
          </div>
          <span className="block text-[10px] text-neutral-400 mt-1 font-mono">
            {isFr ? 'Volume engagé :' : 'Volume wagered:'} {totalStakedVolume.toLocaleString('fr-FR')} {bankroll.currency}
          </span>
          <div className="absolute right-3 top-3 text-stone-600">
            <PieChart className="w-5 h-5 text-orange-500/30" />
          </div>
        </div>

      </div>

      {/* Bankroll Management Controls & Transactions Ledger */}
      <BankrollManager />

      {/* 3. Progression Graphs Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bankroll Chart progression (8 cols) */}
        <div className="lg:col-span-8 bg-[#131316] border border-white/5 rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                <CircleDot className="w-4 h-4 text-orange-500" />
                {isFr ? 'Courbe d’Évolution du Capital' : 'Bankroll Ledger Trend'}
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                {isFr ? 'Visualisation des fluctuations de mise par transaction' : 'Performance charts displaying risk fluctuations'}
              </p>
            </div>
            <span className="text-[10px] font-mono text-neutral-500 border border-white/5 px-2 py-0.5 rounded uppercase font-black">
              {isFr ? 'MISE EN DIRECT' : 'LIVE GRAPH'}
            </span>
          </div>

          {/* SVG Progression Rendering */}
          <div className="w-full bg-[#0A0A0B] rounded-2xl border border-white/5 p-4">
            <div className="relative">
              <svg 
                viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                className="w-full h-auto overflow-visible"
              >
                {/* Grid guidelines */}
                <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#1f1f23" strokeDasharray="3,3" />
                <line x1={paddingX} y1={svgHeight/2} x2={svgWidth - paddingX} y2={svgHeight/2} stroke="#1f1f23" strokeDasharray="3,3" />
                <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#1f1f23" strokeDasharray="3,3" />

                {/* SVG Polyline with Framer Motion Draw simulation */}
                <polyline
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                />

                {/* Draw gradient shading */}
                <path
                  d={`M ${paddingX},${svgHeight - paddingY} L ${pointsString} L ${svgWidth - paddingX},${svgHeight - paddingY} Z`}
                  fill="url(#progression-grade)"
                  opacity="0.08"
                />

                {/* Define gradient parameters */}
                <defs>
                  <linearGradient id="progression-grade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Data reference dots */}
                {chartPoints.map((point, idx) => {
                  const x = paddingX + (idx * (svgWidth - paddingX * 2) / (chartPoints.length - 1 || 1));
                  const y = svgHeight - paddingY - ((point.value - minVal) * (svgHeight - paddingY * 2) / valRange);
                  
                  return (
                    <g key={idx} className="group cursor-pointer">
                      <circle
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#f97316"
                        stroke="#0D0D0F"
                        strokeWidth="1.5"
                      />
                      {/* Interactive dynamic tooltip anchor overlay */}
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill="transparent"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick interactive guidelines */}
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-2 px-1 border-t border-white/5 pt-2">
              <span>{isFr ? 'Initiale' : 'Initial'}</span>
              <span>{chartPoints.length > 2 ? chartPoints[Math.floor(chartPoints.length / 2)].label : ''}</span>
              <span>{isFr ? 'Actuelle' : 'Current'} ({bankroll.balance.toFixed(0)} {bankroll.currency})</span>
            </div>
          </div>
        </div>

        {/* Sport Distribution Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-[#131316] border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              <PieChart className="w-4 h-4 text-orange-500" />
              {isFr ? 'Répartition par Discipline' : 'Sports Diversification'}
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
              {isFr ? 'Diversification du capital engagé' : 'Diversifying risks across sports'}
            </p>
          </div>

          <div className="space-y-3.5 flex-1 flex flex-col justify-center pt-2">
            {Object.keys(sportsCount).length > 0 ? (
              Object.entries(sportsCount).map(([sport, count]) => {
                const percentage = Number(((count as number) * 100 / followedBets.length).toFixed(0));
                
                return (
                  <div key={sport} className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-300 font-medium">{sport}</span>
                      <strong className="text-orange-500 font-mono">{percentage}% ({count})</strong>
                    </div>
                    <div className="w-full bg-[#0A0A0B] h-2.5 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className="bg-orange-500 h-full rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-neutral-500 font-mono py-12">
                {isFr ? 'Enregistrez des paris pour afficher les stats.' : 'Register followed bets first.'}
              </p>
            )}
          </div>

          <div className="text-[10px] text-neutral-400 font-mono leading-relaxed bg-[#0A0A0B] p-3 rounded-xl border border-white/5">
            {isFr 
              ? '💡 Diversifier vos investissements sportifs réduit drastiquement la dépendance à un seul championnat.'
              : '💡 Allocating risk across multiple championships smooths out variance over the long haul.'}
          </div>
        </div>

      </div>

      {/* Monthly summary breakdown */}
      <MonthlySummaryCard />

      {/* ROI & Expected Value Calculator Tool */}
      <RoiCalculator />

      {/* 4. Complete Followed Bets Register list */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white font-sans uppercase tracking-tight italic">
          {isFr ? 'Journal Général d’Investissement' : 'Full Historical Ledger'}
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs bg-[#131316] rounded-2xl border border-white/5 overflow-hidden">
            <thead className="bg-[#0A0A0B] border-b border-white/5 text-[10px] uppercase font-bold text-neutral-400 font-mono">
              <tr>
                <th className="px-4 py-3">{isFr ? 'ÉVÉNEMENT SPORTIF' : 'MATCH / OPP'}</th>
                <th className="px-4 py-3">{isFr ? 'SÉLECTION' : 'PICK RECOMMENDATION'}</th>
                <th className="px-4 py-3 text-center">{isFr ? 'COTE' : 'ODDS'}</th>
                <th className="px-4 py-3 text-right">{isFr ? 'CAPITAL / MISE' : 'STAKE WAGERED'}</th>
                <th className="px-4 py-3 text-right">{isFr ? 'EFFET CAPITAL' : 'NET OUTCOME'}</th>
                <th className="px-4 py-3 text-center">{isFr ? 'STATUT' : 'STATUS'}</th>
                <th className="px-4 py-3 text-center">{isFr ? 'NOTES & RIGUEUR' : 'NOTES & STRENGTH'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {followedBets.length > 0 ? (
                followedBets.flatMap((bet) => {
                  const netReturn = bet.status === 'won' 
                    ? bet.stakeAmount * (bet.odds - 1)
                    : bet.status === 'lost' 
                      ? -bet.stakeAmount 
                      : 0;

                  const hasNotesOrTags = bet.notes || (bet.psychologicalTags && bet.psychologicalTags.length > 0);

                  return [
                    <tr key={bet.id} className="hover:bg-white/[0.02] transition-colors border-b border-white/5">
                      <td className="px-4 py-4.5">
                        <span className="font-bold text-white block">{bet.homeTeam} - {bet.awayTeam}</span>
                        <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">{bet.timestamp}</span>
                      </td>
                      <td className="px-4 py-4.5 font-medium text-stone-300">
                        {bet.prediction}
                      </td>
                      <td className="px-4 py-4.5 text-center font-mono font-bold text-orange-500">
                        {bet.odds.toFixed(2)}
                      </td>
                      <td className="px-4 py-4.5 text-right font-mono">
                        <span className="text-stone-200 block font-bold">{bet.stakeAmount.toLocaleString()} {bankroll.currency}</span>
                        <span className="text-[10px] text-neutral-500 block">({bet.stakePercent}%)</span>
                      </td>
                      <td className={`px-4 py-4.5 text-right font-mono font-bold ${
                        bet.status === 'won' ? 'text-emerald-400' : bet.status === 'lost' ? 'text-rose-400' : 'text-neutral-400'
                      }`}>
                        {bet.status === 'won' ? `+${netReturn.toFixed(1)}` : bet.status === 'lost' ? `${netReturn.toFixed(1)}` : '...'}{' '}
                        {bankroll.currency}
                      </td>
                      <td className="px-4 py-4.5 text-center">
                        <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                          bet.status === 'won' 
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900' 
                            : bet.status === 'lost'
                              ? 'bg-rose-955/40 text-rose-400 border-rose-900'
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                        }`}>
                          {bet.status === 'won' ? (isFr ? 'Succès' : 'Won') : bet.status === 'lost' ? (isFr ? 'Perdu' : 'Lost') : (isFr ? 'En cours' : 'Pending')}
                        </span>
                      </td>
                      <td className="px-4 py-4.5 text-center">
                        <button
                          onClick={() => {
                            if (expandedBetId === bet.id) {
                              setExpandedBetId(null);
                              setIsEditingNotes(false);
                            } else {
                              setExpandedBetId(bet.id);
                              setEditNotesText(bet.notes || '');
                              setEditTags(bet.psychologicalTags || []);
                              setIsEditingNotes(false);
                            }
                          }}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer select-none ${
                            expandedBetId === bet.id
                              ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                              : hasNotesOrTags
                                ? 'bg-orange-950/20 border-orange-500/30 text-orange-450 hover:bg-orange-950/40'
                                : 'bg-transparent border-dashed border-white/10 text-neutral-500 hover:border-orange-500 hover:text-orange-400'
                          }`}
                        >
                          {hasNotesOrTags ? (
                            <>
                              <FileText className="w-3.5 h-3.5" />
                              {isFr ? 'Visualiser' : 'ViewNotes'}
                              {bet.psychologicalTags && bet.psychologicalTags.length > 0 && (
                                <span className="bg-orange-500 text-neutral-950 rounded-full w-3.5 h-3.5 flex items-center justify-center text-[8.5px] font-bold font-sans">
                                  {bet.psychologicalTags.length}
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <MessageSquare className="w-3.5 h-3.5" />
                              {isFr ? '+ Notes' : '+ Notes'}
                            </>
                          )}
                        </button>
                      </td>
                    </tr>,
                    ...(expandedBetId === bet.id ? [
                      <tr key={`${bet.id}-expanded`} className="bg-[#0A0A0B]/80 font-sans">
                        <td colSpan={7} className="px-6 py-5.5 border-b border-white/5">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider font-mono flex items-center gap-2">
                                <Brain className="w-4 h-4 text-orange-500 animate-pulse" />
                                {isFr ? "CONTRÔLE PSYCHOLOGIQUE ET RIGUEUR DU PARI" : "COGNITIVE STABILITY & TRADING DISCIPLINE"}
                              </span>
                              <div className="flex gap-2">
                                {isEditingNotes ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        updateBetNotesAndTags(bet.id, editNotesText, editTags);
                                        setIsEditingNotes(false);
                                      }}
                                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                                    >
                                      <Save className="w-3 h-3" />
                                      {isFr ? 'Enregistrer' : 'Save'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setIsEditingNotes(false);
                                      }}
                                      className="inline-flex items-center gap-1 bg-neutral-900 border border-white/5 hover:bg-stone-800 text-stone-300 font-mono text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                      {isFr ? 'Annuler' : 'Cancel'}
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setIsEditingNotes(true);
                                        setEditNotesText(bet.notes || '');
                                        setEditTags(bet.psychologicalTags || []);
                                      }}
                                      className="inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-505 text-white font-mono text-[10px] font-bold px-3 py-1 rounded-md cursor-pointer transition-colors shadow-sm"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      {isFr ? 'Modifier les notes' : 'Edit notes'}
                                    </button>
                                    <button
                                      onClick={() => setExpandedBetId(null)}
                                      className="inline-flex items-center gap-1 bg-neutral-900 border border-white/5 hover:bg-stone-850 text-neutral-400 font-mono text-[10px] px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                                    >
                                      {isFr ? 'Fermer' : 'Close'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {isEditingNotes ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Text edit notes */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-mono font-bold text-neutral-450 block uppercase">
                                    {isFr ? 'Analyse psychologique & notes qualitatives :' : 'Psychological feelings & notes:'}
                                  </label>
                                  <textarea
                                    value={editNotesText}
                                    onChange={(e) => setEditNotesText(e.target.value)}
                                    placeholder={isFr ? 'Notez les raisons tactiques objectives, sentiment de fatigue, respect irréprochable de la charte...' : 'Record structural H2H analysis, sleep quality, compliance warning...'}
                                    rows={3}
                                    className="w-full text-xs font-sans bg-neutral-950 border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
                                  />
                                </div>

                                {/* Tags select box */}
                                <div className="space-y-2">
                                  <label className="text-[10px] font-mono font-bold text-neutral-450 block uppercase">
                                    {isFr ? "Modifier l'état d'esprit émotionnel :" : 'Modify target emotional tags:'}
                                  </label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {PSYCHOLOGICAL_TAGS.map(tagConfig => {
                                      const isSelected = editTags.includes(tagConfig.id);
                                      return (
                                        <button
                                          key={tagConfig.id}
                                          type="button"
                                          onClick={() => {
                                            if (isSelected) {
                                              setEditTags(prev => prev.filter(t => t !== tagConfig.id));
                                            } else {
                                              setEditTags(prev => [...prev, tagConfig.id]);
                                            }
                                          }}
                                          className={`px-2 py-1 rounded-md text-[9px] font-mono font-bold transition-all border cursor-pointer select-none ${
                                            isSelected
                                              ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-extrabold'
                                              : 'bg-neutral-950 border-white/5 text-neutral-400 hover:bg-neutral-900 hover:text-white'
                                          }`}
                                        >
                                          {isFr ? tagConfig.labelFr : tagConfig.labelEn}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                {/* Qualitative notes display */}
                                <div className="md:col-span-8 bg-neutral-950/50 p-4 rounded-xl border border-white/5">
                                  <label className="text-[9px] font-mono font-bold text-neutral-500 block uppercase mb-1.5">{isFr ? 'Raisons qualitatives rattachées' : 'Qualitative reasons'}</label>
                                  {bet.notes ? (
                                    <p className="text-stone-105 text-xs italic leading-relaxed font-sans font-medium pl-3 border-l-2 border-orange-500">
                                      "{bet.notes}"
                                    </p>
                                  ) : (
                                    <p className="text-neutral-500 text-xs italic font-mono">
                                      {isFr ? 'Aucune note de discipline rédigée. Cliquez sur Modifier pour documenter votre état d’esprit Spartan.' : 'No behavioral notes documented yet. Write clear qualitative reasons to support your sports investment approach.'}
                                    </p>
                                  )}
                                </div>

                                {/* Psychological tags display */}
                                <div className="md:col-span-4 bg-[#0F0F12]/60 p-4 rounded-xl border border-white/5">
                                  <label className="text-[9px] font-mono font-bold text-neutral-500 block uppercase mb-1.5">{isFr ? "Discipline et État d'esprit" : 'Discipline & Psychological status'}</label>
                                  {bet.psychologicalTags && bet.psychologicalTags.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {bet.psychologicalTags.map(tagId => {
                                        const config = PSYCHOLOGICAL_TAGS.find(t => t.id === tagId);
                                        const label = config ? (isFr ? config.labelFr : config.labelEn) : tagId;
                                        const colorClasses = config ? config.color : 'border-stone-850 bg-stone-900 text-stone-400';
                                        return (
                                          <span
                                            key={tagId}
                                            className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold border ${colorClasses}`}
                                          >
                                            {label}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-neutral-600 text-[10px] font-mono italic">
                                      {isFr ? 'Aucun tag émotionnel.' : 'No cognitive status labels.'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ] : [])
                  ];
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 font-mono text-neutral-500 text-xs">
                    {isFr ? 'Aucun investissement sportif actif actuellement.' : 'No followed investments currently in register.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
};
