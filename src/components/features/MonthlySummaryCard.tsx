import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  Calendar, TrendingUp, TrendingDown, Coins, Award, 
  ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, Percent, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MonthlyStats {
  monthKey: string; // e.g. "June 2026"
  label: string;
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  totalStaked: number;
  netProfit: number;
  yieldPercent: number; // profit / staked volume
  winRate: number;
  bets: any[];
}

export const MonthlySummaryCard: React.FC = () => {
  const { user, bankroll, followedBets } = useApp();
  const isFr = user.language === 'fr';

  // State to track which month is expanded to see details
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  // Helper to extract clean month label
  const getMonthDetails = useMemo(() => {
    return (timestamp: string) => {
      const tLower = timestamp.toLowerCase();
      
      if (tLower.includes('jan')) return { key: '2026-01', en: 'January 2026', fr: 'Janvier 2026' };
      if (tLower.includes('feb') || tLower.includes('fév')) return { key: '2026-02', en: 'February 2026', fr: 'Février 2026' };
      if (tLower.includes('mar')) return { key: '2026-03', en: 'March 2026', fr: 'Mars 2026' };
      if (tLower.includes('apr') || tLower.includes('avr')) return { key: '2026-04', en: 'April 2026', fr: 'Avril 2026' };
      if (tLower.includes('may') || tLower.includes('mai')) return { key: '2026-05', en: 'May 2026', fr: 'Mai 2026' };
      if (tLower.includes('jun') || tLower.includes('jui')) {
        if (tLower.includes('juil') || tLower.includes('july')) {
          return { key: '2026-07', en: 'July 2026', fr: 'Juillet 2026' };
        }
        return { key: '2026-06', en: 'June 2026', fr: 'Juin 2026' };
      }
      if (tLower.includes('jul')) return { key: '2026-07', en: 'July 2026', fr: 'Juillet 2026' };
      if (tLower.includes('aug') || tLower.includes('aoû')) return { key: '2026-08', en: 'August 2026', fr: 'Août 2026' };
      if (tLower.includes('sep')) return { key: '2026-09', en: 'September 2026', fr: 'Septembre 2026' };
      if (tLower.includes('oct')) return { key: '2026-10', en: 'October 2026', fr: 'Octobre 2026' };
      if (tLower.includes('nov')) return { key: '2026-11', en: 'November 2026', fr: 'Novembre 2026' };
      if (tLower.includes('dec') || tLower.includes('déc')) return { key: '2026-12', en: 'December 2026', fr: 'Décembre 2026' };

      // Fallback to active date
      return { key: '2026-06', en: 'June 2026', fr: 'Juin 2026' };
    };
  }, []);

  // Aggregation pipeline
  const monthlyAggregations = useMemo(() => {
    const groups: Record<string, MonthlyStats> = {};

    followedBets.forEach(bet => {
      const monthInfo = getMonthDetails(bet.timestamp);
      const key = monthInfo.key;
      const label = isFr ? monthInfo.fr : monthInfo.en;

      if (!groups[key]) {
        groups[key] = {
          monthKey: key,
          label,
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pendingBets: 0,
          totalStaked: 0,
          netProfit: 0,
          yieldPercent: 0,
          winRate: 0,
          bets: []
        };
      }

      const g = groups[key];
      g.totalBets += 1;
      g.totalStaked += bet.stakeAmount;
      g.bets.push(bet);

      if (bet.status === 'won') {
        g.wonBets += 1;
        g.netProfit += bet.stakeAmount * (bet.odds - 1);
      } else if (bet.status === 'lost') {
        g.lostBets += 1;
        g.netProfit -= bet.stakeAmount;
      } else {
        g.pendingBets += 1;
      }
    });

    // Compute mathematical ratios
    const list = Object.values(groups).map(g => {
      const gradedCount = g.wonBets + g.lostBets;
      g.winRate = gradedCount > 0 ? (g.wonBets / gradedCount) * 100 : 0;
      g.yieldPercent = g.totalStaked > 0 ? (g.netProfit / g.totalStaked) * 100 : 0;
      return g;
    });

    // Sort chronologically (most recent first)
    return list.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [followedBets, isFr, getMonthDetails]);

  // Expand helper
  const toggleExpand = (key: string) => {
    setExpandedMonth(expandedMonth === key ? null : key);
  };

  return (
    <div className="bg-[#131316] border border-white/5 rounded-3xl p-5 md:p-6 space-y-5 relative overflow-hidden">
      {/* Visual top accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#0099FF]/10 via-[#0099FF]/30 to-transparent" />

      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#007ACC]/10 text-[#0099FF] flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#0099FF]" />
          </span>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight uppercase italic flex items-center gap-1.5">
              📅 {isFr ? 'Sommaires de Clôture Mensuels' : 'Historical Monthly Performance Summary'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isFr ? 'Analyse globale compilée de vos rendements, ROI de volume et taux de réussite par mois' : 'Aggregated performance matrices, total ROI volume, and absolute net profits grouped by month'}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      {monthlyAggregations.length > 0 ? (
        <div className="space-y-4">
          {monthlyAggregations.map((stats) => {
            const isExpanded = expandedMonth === stats.monthKey;
            const absoluteRoiRatio = (stats.netProfit / bankroll.initialBalance) * 100;
            const profitIsNegative = stats.netProfit < 0;

            return (
              <div 
                key={stats.monthKey} 
                className="bg-[#0A0A0B] border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-white/10 duration-200"
              >
                {/* Expandable Header block */}
                <div 
                  onClick={() => toggleExpand(stats.monthKey)}
                  className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  {/* Left Column: Month Title */}
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-white/5 text-neutral-300">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                        {stats.label}
                      </h4>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                        {stats.totalBets} {isFr ? 'paris enregistrés' : 'total picks logged'}
                      </p>
                    </div>
                  </div>

                  {/* Micro Indicators */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 flex-1 md:justify-end md:text-right px-1 md:px-6">
                    
                    {/* Monthly Profit */}
                    <div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase block">
                        {isFr ? 'Bénéfice Net' : 'Net Outcome'}
                      </span>
                      <strong className={`font-mono text-xs sm:text-sm font-black flex items-center gap-1 md:justify-end ${
                        profitIsNegative ? 'text-rose-400' : stats.netProfit > 0 ? 'text-emerald-400' : 'text-neutral-400'
                      }`}>
                        {!profitIsNegative && stats.netProfit > 0 ? '+' : ''}
                        {stats.netProfit.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} {bankroll.currency}
                        {stats.netProfit > 0 ? (
                          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                        ) : profitIsNegative ? (
                          <TrendingDown className="w-3.5 h-3.5 shrink-0" />
                        ) : null}
                      </strong>
                    </div>

                    {/* Monthly Volume Yield */}
                    <div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase block">
                        {isFr ? 'Taux Yield' : 'Yield ROI'}
                      </span>
                      <strong className={`font-mono text-xs sm:text-sm font-black block ${
                        stats.yieldPercent >= 0 ? 'text-[#0099FF]' : 'text-rose-400'
                      }`}>
                        {stats.yieldPercent >= 0 ? '+' : ''}{stats.yieldPercent.toFixed(1)}%
                      </strong>
                    </div>

                    {/* Win Rate */}
                    <div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase block">
                        {isFr ? 'Réussite' : 'Win Rate'}
                      </span>
                      <strong className="text-xs sm:text-sm font-black text-stone-200 block font-mono">
                        {stats.winRate.toFixed(0)}%
                      </strong>
                    </div>

                    {/* Absolute ROI */}
                    <div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase block">
                        {isFr ? 'ROI Initial' : 'Initial ROI'}
                      </span>
                      <strong className={`font-mono text-xs sm:text-sm font-black block ${
                        absoluteRoiRatio >= 0 ? 'text-neutral-300' : 'text-rose-400'
                      }`}>
                        {absoluteRoiRatio >= 0 ? '+' : ''}{absoluteRoiRatio.toFixed(1)}%
                      </strong>
                    </div>

                  </div>

                  {/* Expansion helper arrow */}
                  <div className="flex items-center justify-end text-neutral-500 hover:text-white transition-colors">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Dropdown audit logs section with animations */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/5 bg-[#0e0e11] overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        {/* Summary Bar Indicators */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-[#0A0A0B] border border-white/5 p-3 rounded-xl flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-mono text-neutral-500 uppercase block">
                                {isFr ? 'Pari Gagné' : 'Bets Won'}
                              </span>
                              <strong className="text-xs font-mono font-black text-emerald-400">
                                {stats.wonBets} / {stats.wonBets + stats.lostBets}
                              </strong>
                            </div>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500/40" />
                          </div>

                          <div className="bg-[#0A0A0B] border border-white/5 p-3 rounded-xl flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-mono text-neutral-500 uppercase block">
                                {isFr ? 'Pari Perdu' : 'Bets Lost'}
                              </span>
                              <strong className="text-xs font-mono font-black text-rose-400">
                                {stats.lostBets}
                              </strong>
                            </div>
                            <XCircle className="w-4 h-4 text-rose-500/40" />
                          </div>

                          <div className="bg-[#0A0A0B] border border-white/5 p-3 rounded-xl flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-mono text-neutral-500 uppercase block">
                                {isFr ? 'Volume Total' : 'Volume Staked'}
                              </span>
                              <strong className="text-xs font-mono font-black text-neutral-200">
                                {stats.totalStaked.toLocaleString()} {bankroll.currency}
                              </strong>
                            </div>
                            <Coins className="w-4 h-4 text-[#0099FF]/40" />
                          </div>
                        </div>

                        {/* List of bets that nested in this month */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                            {isFr ? 'Détails des opérations du mois' : 'Monthly Ticket audit trail'}
                          </span>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {stats.bets.map((bet) => {
                              const betProfit = bet.status === 'won'
                                ? bet.stakeAmount * (bet.odds - 1)
                                : bet.status === 'lost'
                                  ? -bet.stakeAmount
                                  : 0;

                              return (
                                <div 
                                  key={bet.id} 
                                  className="bg-[#0A0A0B] border border-white/5 rounded-xl p-3 flex justify-between items-center text-xs"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <strong className="text-stone-200 font-medium">
                                        {bet.homeTeam} - {bet.awayTeam}
                                      </strong>
                                      <span className="text-[9px] font-mono bg-white/5 text-neutral-500 px-1 rounded">
                                        {bet.timestamp.split(',')[0]}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-0.5 italic">
                                      {isFr ? 'Pronostic :' : 'Pick :'} {bet.prediction} &bull; Odds: <strong className="text-[#33AAFF] font-mono">{bet.odds.toFixed(2)}</strong>
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <span className="text-[10px] text-neutral-500 font-mono block">
                                      {isFr ? 'Mise' : 'Stake'} : {bet.stakeAmount} {bankroll.currency}
                                    </span>
                                    <strong className={`font-mono text-xs ${
                                      bet.status === 'won' ? 'text-emerald-400' : bet.status === 'lost' ? 'text-rose-400' : 'text-neutral-500'
                                    }`}>
                                      {bet.status === 'won' ? `+${betProfit.toFixed(1)}` : bet.status === 'lost' ? `${betProfit.toFixed(1)}` : (isFr ? 'En cours' : 'Pending')} {bankroll.currency}
                                    </strong>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl py-12 text-center">
          <Calendar className="w-8 h-8 text-neutral-600 mx-auto mb-2 opacity-50" />
          <p className="text-xs text-neutral-500 font-mono">
            {isFr 
              ? 'Aucune statistique mensuelle consolidable à ce jour. Enregistrez des paris dans votre journal.'
              : 'No consolidated monthly metrics yet. Follow expert picks or add manual bets to populate month calendars.'}
          </p>
        </div>
      )}
    </div>
  );
};
