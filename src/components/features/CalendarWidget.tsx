import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  Calendar, ChevronLeft, ChevronRight, Clock, Trophy, 
  Sparkles, CheckCircle, XCircle, ArrowUpRight, Play, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MatchAnalysis, FollowedBet } from '../../types';

export const CalendarWidget: React.FC = () => {
  const { 
    user, bankroll, analyses, followedBets, setSelectedAnalysis, setActiveTab 
  } = useApp();

  const isFr = user.language === 'fr';

  // Fixed year since all mock data points around June 2026 (today being June 15, 2026)
  const currentYear = 2026;
  const [currentMonthIndex, setCurrentMonthIndex] = useState(5); // 5 = June
  const [selectedDay, setSelectedDay] = useState<number>(15);    // Default to June 15 (Today)

  const monthNamesFr = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdaysFr = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const weekdaysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDaysInMonth = (year: number, monthIndex: number) => {
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const getStartDayOfWeek = (year: number, monthIndex: number) => {
    const day = new Date(year, monthIndex, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday starts as index 0, Sunday as 6
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonthIndex);
  const startDayOfWeek = getStartDayOfWeek(currentYear, currentMonthIndex);

  // Helper matching logic that maps a record's timestamp or startTime to a particular day
  const isMatchOnDate = (dateStr: string, year: number, monthIndex: number, day: number): boolean => {
    if (!dateStr) return false;
    const normalized = dateStr.toLowerCase().trim();

    // Map all mock and dynamic June 2026 records
    if (year === 2026 && monthIndex === 5) {
      if (day === 15) {
        if (
          normalized.includes('à l’instant') || 
          normalized.includes('just now') || 
          normalized.includes('ce soir') || 
          normalized.includes('today')
        ) {
          return true;
        }
      }
      if (day === 16) {
        if (normalized.includes('demain') || normalized.includes('tomorrow')) {
          return true;
        }
      }

      const match = normalized.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num === day) {
          if (
            normalized.includes('juin') || 
            normalized.includes('june') || 
            normalized.includes('ce soir') || 
            normalized.includes('demain') || 
            normalized.includes('today') || 
            normalized.includes('tomorrow') ||
            normalized.includes('old_') ||
            normalized.includes('h')
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Switch month navigation
  const handlePrevMonth = () => {
    if (currentMonthIndex > 4) { // Bound around May-July for premium mock showcase
      setCurrentMonthIndex(prev => prev - 1);
      setSelectedDay(1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < 6) {
      setCurrentMonthIndex(prev => prev + 1);
      setSelectedDay(1);
    }
  };

  // Build calendar matrix layout cells
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  // Generate lists of active analyses + followed bets for the selected date
  const selectedDayAnalyses = analyses.filter(analysis => 
    isMatchOnDate(analysis.startTime, currentYear, currentMonthIndex, selectedDay)
  );

  const selectedDayBets = followedBets.filter(bet => 
    isMatchOnDate(bet.timestamp, currentYear, currentMonthIndex, selectedDay)
  );

  // Total summary of items of the day
  const hasItemsOnDay = selectedDayAnalyses.length > 0 || selectedDayBets.length > 0;

  return (
    <div className="bg-[#131316] border border-white/5 rounded-2xl p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#007ACC]/10 text-[#0099FF]">
            <Calendar className="w-5 h-5 text-[#0099FF]" />
          </span>
          <div>
            <h3 className="font-bold text-white text-sm">
              {isFr ? 'Calendrier de Trading Spartan' : 'Spartan Trading Calendar'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isFr ? 'Suivi et planification des investissements' : 'Investment tracking & schedule blueprint'}
            </p>
          </div>
        </div>

        {/* Month selector */}
        <div className="flex items-center gap-2.5 bg-[#0A0A0B] border border-white/5 p-1 rounded-xl">
          <button
            onClick={handlePrevMonth}
            disabled={currentMonthIndex === 4}
            className={`p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer ${
              currentMonthIndex === 4 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            title={isFr ? 'Mois précédent' : 'Previous month'}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-stone-100 font-mono w-24 text-center select-none">
            {isFr ? monthNamesFr[currentMonthIndex] : monthNamesEn[currentMonthIndex]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            disabled={currentMonthIndex === 6}
            className={`p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-all cursor-pointer ${
              currentMonthIndex === 6 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            title={isFr ? 'Mois suivant' : 'Next month'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Calendar Grid (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-bold text-neutral-500 tracking-wider">
            {(isFr ? weekdaysFr : weekdaysEn).map((day, idx) => (
              <div key={idx} className="py-1 uppercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarCells.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square bg-transparent rounded-xl" />;
              }

              // Compute stats for indicators on this cell
              const matchesForDay = analyses.filter(analysis => 
                isMatchOnDate(analysis.startTime, currentYear, currentMonthIndex, day)
              );
              const betsForDay = followedBets.filter(bet => 
                isMatchOnDate(bet.timestamp, currentYear, currentMonthIndex, day)
              );

              const hasUpcomingPicks = matchesForDay.length > 0;
              const hasWonBets = betsForDay.some(b => b.status === 'won');
              const hasLostBets = betsForDay.some(b => b.status === 'lost');
              const hasPendingBets = betsForDay.some(b => b.status === 'pending');

              const isSelected = selectedDay === day;
              // June 15, 2026 is today
              const isToday = currentMonthIndex === 5 && day === 15;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-xl border relative flex flex-col justify-between p-1.5 transition-all text-left group focus:outline-none cursor-pointer ${
                    isSelected
                      ? 'bg-[#007ACC] bg-[#007ACC] border-[#0099FF] text-white shadow-[0_8px_16px_rgba(0,153,255,0.25)]'
                      : isToday
                      ? 'bg-[#181514] border-[#0099FF]/50 hover:bg-stone-900 hover:border-[#0099FF]/80 text-[#0099FF]'
                      : 'bg-[#0A0A0B] border-white/5 hover:bg-stone-900 hover:border-white/10 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-mono font-bold leading-none select-none">
                      {day}
                    </span>
                    {isToday && (
                      <span className={`text-[7px] font-sans font-black uppercase px-1 py-0.5 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-[#001A33]/40 text-[#33AAFF]'
                      }`}>
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Dot telemetry highlights */}
                  <div className="flex flex-wrap items-center gap-1 mt-auto">
                    {hasUpcomingPicks && (
                      <span 
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#0099FF]'}`}
                        title={isFr ? 'Matchs disponibles' : 'Upcoming picks available'}
                      />
                    )}
                    {hasWonBets && (
                      <span 
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} 
                        title={isFr ? 'Paris gagnés' : 'Wagers won'}
                      />
                    )}
                    {hasLostBets && (
                      <span 
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white animate-none' : 'bg-rose-450 bg-rose-500'}`} 
                        title={isFr ? 'Paris perdus' : 'Wagers lost'}
                      />
                    )}
                    {hasPendingBets && (
                      <span 
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-400 animate-pulse'}`} 
                        title={isFr ? 'Paris en attente de score' : 'Pending outcomes'}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick legend info box */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] font-mono text-neutral-500 border-t border-white/5 pt-3">
            <span className="flex items-center gap-1 uppercase select-none">
              <span className="w-1.5 h-1.5 bg-[#0099FF] rounded-full" />
              {isFr ? 'opportunités' : 'picks'}
            </span>
            <span className="flex items-center gap-1 uppercase select-none">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              {isFr ? 'gagné' : 'won'}
            </span>
            <span className="flex items-center gap-1 uppercase select-none">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
              {isFr ? 'perdu' : 'lost'}
            </span>
            <span className="flex items-center gap-1 uppercase select-none">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              {isFr ? 'en cours' : 'pending'}
            </span>
          </div>
        </div>

        {/* Right column: Details for the selected day (5 cols) */}
        <div className="lg:col-span-5 bg-[#0A0A0B] border border-white/5 rounded-2xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-2">
              <span className="text-[10px] font-mono font-black text-[#0099FF] uppercase tracking-widest block">
                {isFr ? 'SÉLECTION SPARTAN' : 'RECORD OF DAY'}
              </span>
              <h4 className="text-xs font-bold text-white italic uppercase mt-0.5">
                📅 &nbsp;{selectedDay} {isFr ? monthNamesFr[currentMonthIndex] : monthNamesEn[currentMonthIndex]} {currentYear}
              </h4>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[220px] pr-1">
              {!hasItemsOnDay ? (
                <div className="text-center py-8">
                  <span className="block text-2xl mb-1 select-none">🛡️</span>
                  <p className="text-[10px] text-neutral-500 font-medium leading-normal max-w-[200px] mx-auto">
                    {isFr 
                      ? 'Aucun investissement ni signal de match sur ce jour clé.' 
                      : 'No financial match signals or followed wagers scheduled this day.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Matches scheduled */}
                  {selectedDayAnalyses.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                        🏟️ {isFr ? 'SELECTIONS & ANALYSES DISPONIBLES :' : 'OPPORTUNITIES SCHEDULED :'}
                      </span>
                      {selectedDayAnalyses.map(analysis => (
                        <div 
                          key={analysis.id}
                          className="bg-[#131316] border border-white/5 rounded-xl p-3 space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] font-mono text-neutral-400 tracking-wider">
                                {analysis.league}
                              </span>
                              <span className="bg-[#0099FF]/10 text-[#33AAFF] text-[8px] px-1.5 py-0.5 rounded font-black font-mono">
                                CONF: {analysis.confidence}%
                              </span>
                            </div>
                            <h5 className="text-[11px] font-bold text-white mt-1 leading-snug">
                              {analysis.homeTeam} - {analysis.awayTeam}
                            </h5>
                            <p className="text-[10px] font-mono text-[#33AAFF] font-extrabold mt-0.5">
                              {analysis.prediction}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedAnalysis(analysis);
                              setActiveTab('analyses');
                            }}
                            className="w-full mt-1 bg-white/5 hover:bg-[#007ACC] hover:text-white transition-all text-neutral-300 text-[9px] font-bold uppercase tracking-wider py-1.5 rounded font-mono cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Play className="w-2.5 h-2.5" />
                            {isFr ? 'Voir l’analyse' : 'Read analysis'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Settled or pending bets tracked */}
                  {selectedDayBets.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                        📊 {isFr ? 'MISES ET PARIS ENGAGÉS :' : 'WAGERS & STATEMENTS :'}
                      </span>
                      {selectedDayBets.map(bet => {
                        const payout = bet.stakeAmount * bet.odds;
                        const netProfit = payout - bet.stakeAmount;

                        return (
                          <div 
                            key={bet.id}
                            className="bg-[#131316] border border-white/5 rounded-xl p-3 flex items-center justify-between gap-3"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <h5 className="text-[11px] font-bold text-stone-100 truncate">
                                {bet.homeTeam} VS {bet.awayTeam}
                              </h5>
                              <p className="text-[10px] text-neutral-400 truncate font-mono">
                                {isFr ? 'Pari' : 'Bet'}: <strong className="text-white">{bet.prediction}</strong>
                              </p>
                              <div className="flex items-center gap-2 text-[9px] font-mono text-neutral-500 pt-1">
                                <span>{isFr ? 'Mise' : 'Stake'}: <strong className="text-stone-300">{bet.stakeAmount} {bankroll.currency}</strong></span>
                                <span>Cote: <strong className="text-stone-300">{bet.odds}</strong></span>
                              </div>
                            </div>

                            {/* Profit/Badge outcome representation */}
                            <div className="shrink-0 text-right">
                              {bet.status === 'won' ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-0.5 bg-emerald-950 text-emerald-400 text-[8px] font-black uppercase px-1.5 py-0.5 rounded font-mono">
                                    <Trophy className="w-2.5 h-2.5" />
                                    {isFr ? 'GAGNÉ' : 'WON'}
                                  </span>
                                  <span className="block text-[10px] font-mono font-bold text-emerald-400">
                                    +{netProfit.toFixed(1)} {bankroll.currency}
                                  </span>
                                </div>
                              ) : bet.status === 'lost' ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-0.5 bg-rose-950 text-rose-450 text-[8px] font-black uppercase px-1.5 py-0.5 rounded font-mono">
                                    <XCircle className="w-2.5 h-2.5" />
                                    {isFr ? 'PERDU' : 'LOST'}
                                  </span>
                                  <span className="block text-[10px] font-mono font-bold text-rose-400">
                                    -{bet.stakeAmount} {bankroll.currency}
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-0.5 bg-amber-950 text-amber-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded font-mono animate-pulse">
                                    <Clock className="w-2.5 h-2.5" />
                                    {isFr ? 'EN COURS' : 'PENDING'}
                                  </span>
                                  <span className="block text-[9px] font-mono text-neutral-400">
                                    {isFr ? 'Calcul...' : 'Settle...'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-3">
            <p className="text-[10px] leading-relaxed text-neutral-500">
              💡 {isFr 
                ? 'Naviguez sur la grille pour planifier vos investissements ou réviser vos performances sportives passées.' 
                : 'Click calendar days above to inspect upcoming selection analyses or audit cash settlements.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
