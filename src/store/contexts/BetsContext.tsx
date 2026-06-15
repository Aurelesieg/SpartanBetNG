import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FollowedBet, MatchAnalysis, SportType, BetResolution } from '../../types';
import { MOCK_HISTORY_BETS } from '../mockData';

export const PSYCHOLOGICAL_TAGS = [
  'Confiance Tactique', 'Avis Contrarien', 'Pari de Couverture',
  'Ennui/Impulsion', 'Chasing (Rattrapage)', 'FOMO (Peur de rater)'
];

interface BetsContextType {
  followedBets: FollowedBet[];
  followBet: (
    analysis: MatchAnalysis,
    bankrollBalance: number,
    stakeAmount: number,
    currency: string,
    notes?: string,
    psychologicalTags?: string[]
  ) => { success: boolean; error?: string };
  addCustomBet: (
    bet: { homeTeam: string; awayTeam: string; prediction: string; odds: number; stakeAmount: number; status: 'pending' | 'won' | 'lost'; notes?: string; psychologicalTags?: string[]; sport?: SportType },
    bankrollBalance: number,
    currency: string
  ) => { success: boolean; error?: string };
  isBetFollowed: (analysisId: string) => boolean;
  updateBetNotesAndTags: (betId: string, notes: string, psychologicalTags: string[]) => void;
  resolvePendingBets: (resolutions: BetResolution[]) => { wonCount: number; lostCount: number; totalReturns: number; updates: { betId: string; outcome: 'won'|'lost'; stake: number; odds: number }[] };
  computeDisciplineScore: (completedLessonsCount: number) => number;
  resetBets: () => void;
}

const BetsContext = createContext<BetsContextType | undefined>(undefined);

const L_BETS = 'spartanbet_bets';

export const BetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [followedBets, setFollowedBets] = useState<FollowedBet[]>(() => {
    const saved = localStorage.getItem(L_BETS);
    if (saved) return JSON.parse(saved);
    return MOCK_HISTORY_BETS;
  });

  useEffect(() => {
    localStorage.setItem(L_BETS, JSON.stringify(followedBets));
  }, [followedBets]);

  const followBet = (
    analysis: MatchAnalysis,
    bankrollBalance: number,
    stakeAmount: number,
    currency: string,
    notes?: string,
    psychologicalTags?: string[]
  ) => {
    if (stakeAmount <= 0) {
      return { success: false, error: 'La mise doit être supérieure à 0.' };
    }
    if (stakeAmount > bankrollBalance) {
      return { success: false, error: 'Fonds insuffisants.' };
    }

    const stakePercent = bankrollBalance > 0 ? (stakeAmount / bankrollBalance) * 100 : 0;

    const newBet: FollowedBet = {
      id: Math.random().toString(36).substring(2, 9),
      analysisId: analysis.id,
      homeTeam: analysis.homeTeam,
      awayTeam: analysis.awayTeam,
      sport: analysis.sport,
      prediction: analysis.prediction,
      odds: analysis.odds,
      stakeAmount,
      stakePercent: Number(stakePercent.toFixed(1)),
      timestamp: new Date().toISOString(),
      status: 'pending',
      notes,
      psychologicalTags
    };

    setFollowedBets(prev => [newBet, ...prev]);

    return { success: true };
  };

  const addCustomBet = (
    bet: { homeTeam: string; awayTeam: string; prediction: string; odds: number; stakeAmount: number; status: 'pending' | 'won' | 'lost'; notes?: string; psychologicalTags?: string[]; sport?: SportType },
    bankrollBalance: number,
    currency: string
  ) => {
    if (bet.stakeAmount <= 0) {
      return { success: false, error: 'La mise doit être supérieure à 0.' };
    }
    if (bet.stakeAmount > bankrollBalance) {
      return { success: false, error: 'Fonds insuffisants.' };
    }

    const stakePercent = bankrollBalance > 0 ? (bet.stakeAmount / bankrollBalance) * 100 : 0;

    const newBet: FollowedBet = {
      id: Math.random().toString(36).substring(2, 9),
      analysisId: 'custom-' + Math.random().toString(36).substring(2, 9),
      homeTeam: bet.homeTeam,
      awayTeam: bet.awayTeam,
      sport: bet.sport ?? 'football',
      prediction: bet.prediction,
      odds: bet.odds,
      stakeAmount: bet.stakeAmount,
      stakePercent: Number(stakePercent.toFixed(1)),
      timestamp: new Date().toISOString(),
      status: bet.status,
      notes: bet.notes,
      psychologicalTags: bet.psychologicalTags
    };

    setFollowedBets(prev => [newBet, ...prev]);
    return { success: true };
  };

  const isBetFollowed = (analysisId: string) => {
    return followedBets.some(bet => bet.analysisId === analysisId);
  };

  const updateBetNotesAndTags = (betId: string, notes: string, psychologicalTags: string[]) => {
    setFollowedBets(prev => prev.map(bet => {
      if (bet.id === betId) {
        return {
          ...bet,
          notes,
          psychologicalTags
        };
      }
      return bet;
    }));
  };

  const resolvePendingBets = (resolutions: BetResolution[]) => {
    let wonCount = 0;
    let lostCount = 0;
    let totalReturns = 0;
    const updates: { betId: string; outcome: 'won'|'lost'; stake: number; odds: number }[] = [];

    const updatedBets = followedBets.map(bet => {
      if (bet.status === 'pending') {
        const resolution = resolutions.find(r => r.betId === bet.id);
        if (resolution) {
          const outcome = resolution.outcome;
          const isWin = outcome === 'won';

          if (isWin) {
            wonCount++;
            totalReturns += bet.stakeAmount * bet.odds;
          } else {
            lostCount++;
          }

          updates.push({
            betId: bet.id,
            outcome,
            stake: bet.stakeAmount,
            odds: bet.odds
          });

          return { ...bet, status: outcome };
        }
      }
      return bet;
    });

    if (updates.length > 0) {
      setFollowedBets(updatedBets);
    }

    return { wonCount, lostCount, totalReturns, updates };
  };

  const computeDisciplineScore = (completedLessonsCount: number) => {
    let score = 75; // base score

    score += completedLessonsCount * 6;

    followedBets.forEach(bet => {
      if (bet.stakePercent <= 3) {
        score += 3;
      } else if (bet.stakePercent > 5) {
        score -= 10;
      }
    });

    return Math.max(10, Math.min(100, score));
  };

  const resetBets = () => {
    setFollowedBets(MOCK_HISTORY_BETS);
  };

  return (
    <BetsContext.Provider value={{
      followedBets,
      followBet,
      addCustomBet,
      isBetFollowed,
      updateBetNotesAndTags,
      resolvePendingBets,
      computeDisciplineScore,
      resetBets
    }}>
      {children}
    </BetsContext.Provider>
  );
};

export const useBets = () => {
  const context = useContext(BetsContext);
  if (!context) throw new Error('useBets must be used within a BetsProvider');
  return context;
};
