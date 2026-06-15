import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FollowedBet, MatchAnalysis, SportType, BetResolution } from '../../types';
import { supabase } from '../../services/supabase';
import { useAuth } from './AuthContext';

export const PSYCHOLOGICAL_TAGS = [
  'Confiance Tactique', 'Avis Contrarien', 'Pari de Couverture',
  'Ennui/Impulsion', 'Chasing (Rattrapage)', 'FOMO (Peur de rater)'
];

interface BetsContextType {
  followedBets: FollowedBet[];
  isLoading: boolean;
  followBet: (
    analysis: MatchAnalysis,
    bankrollBalance: number,
    stakeAmount: number,
    currency: string,
    notes?: string,
    psychologicalTags?: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  addCustomBet: (
    bet: { homeTeam: string; awayTeam: string; prediction: string; odds: number; stakeAmount: number; status: 'pending' | 'won' | 'lost'; notes?: string; psychologicalTags?: string[]; sport?: SportType },
    bankrollBalance: number,
    currency: string
  ) => Promise<{ success: boolean; error?: string }>;
  isBetFollowed: (analysisId: string) => boolean;
  updateBetNotesAndTags: (betId: string, notes: string, psychologicalTags: string[]) => void;
  resolvePendingBets: (resolutions: BetResolution[]) => Promise<{ wonCount: number; lostCount: number; totalReturns: number; updates: { betId: string; outcome: 'won'|'lost'; stake: number; odds: number }[] }>;
  computeDisciplineScore: (completedLessonsCount: number) => number;
  resetBets: () => void;
}

const BetsContext = createContext<BetsContextType | undefined>(undefined);

const L_BETS = 'spartanbet_bets';

export const BetsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const userId = authUser?.id;

  const [followedBets, setFollowedBets] = useState<FollowedBet[]>(() => {
    const saved = localStorage.getItem(L_BETS);
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchBets = async () => {
      const { data, error } = await supabase
        .from('followed_bets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SpartanBet] fetch bets error:', error.message);
      } else if (data) {
        const mappedBets: FollowedBet[] = data.map((d: any) => ({
          id: d.id,
          analysisId: d.analysis_id,
          homeTeam: d.home_team,
          awayTeam: d.away_team,
          sport: d.sport,
          prediction: d.prediction,
          odds: d.odds,
          stakeAmount: d.stake_amount,
          stakePercent: d.stake_percent,
          status: d.status,
          notes: d.notes,
          psychologicalTags: d.psychological_tags || [],
          timestamp: d.created_at
        }));
        setFollowedBets(mappedBets);
      }
      setIsLoading(false);
    };

    fetchBets();
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(L_BETS, JSON.stringify(followedBets));
  }, [followedBets]);

  const followBet = async (
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

    let dbId = Math.random().toString(36).substring(2, 9);
    if (userId) {
      const { data, error } = await supabase.from('followed_bets').insert({
        user_id: userId,
        analysis_id: analysis.id,
        home_team: analysis.homeTeam,
        away_team: analysis.awayTeam,
        prediction: analysis.prediction,
        odds: analysis.odds,
        sport: analysis.sport,
        stake_amount: stakeAmount,
        stake_percent: Number(stakePercent.toFixed(1)),
        status: 'pending',
        notes: notes ?? null,
        psychological_tags: psychologicalTags ?? []
      }).select('id').single();

      if (error) {
        console.error('[SpartanBet] followBet error:', error.message);
      } else if (data) {
        dbId = data.id;
      }
    }

    const newBet: FollowedBet = {
      id: dbId,
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

  const addCustomBet = async (
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
    const analysisId = 'custom-' + Math.random().toString(36).substring(2, 9);

    let dbId = Math.random().toString(36).substring(2, 9);
    if (userId) {
      const { data, error } = await supabase.from('followed_bets').insert({
        user_id: userId,
        analysis_id: analysisId,
        home_team: bet.homeTeam,
        away_team: bet.awayTeam,
        prediction: bet.prediction,
        odds: bet.odds,
        sport: bet.sport ?? 'football',
        stake_amount: bet.stakeAmount,
        stake_percent: Number(stakePercent.toFixed(1)),
        status: bet.status,
        notes: bet.notes ?? null,
        psychological_tags: bet.psychologicalTags ?? []
      }).select('id').single();

      if (error) {
        console.error('[SpartanBet] addCustomBet error:', error.message);
      } else if (data) {
        dbId = data.id;
      }
    }

    const newBet: FollowedBet = {
      id: dbId,
      analysisId,
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

  const updateBetNotesAndTags = async (betId: string, notes: string, psychologicalTags: string[]) => {
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

    if (userId) {
      await supabase.from('followed_bets').update({
        notes,
        psychological_tags: psychologicalTags
      }).eq('id', betId).eq('user_id', userId);
    }
  };

  const resolvePendingBets = async (resolutions: BetResolution[]) => {
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

      if (userId) {
        for (const res of resolutions) {
           await supabase.from('followed_bets')
             .update({ status: res.outcome })
             .eq('id', res.betId)
             .eq('user_id', userId);
        }
      }
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

  const resetBets = async () => {
    setFollowedBets([]);
    if (userId) {
      await supabase.from('followed_bets').delete().eq('user_id', userId);
    }
  };

  return (
    <BetsContext.Provider value={{
      followedBets,
      isLoading,
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
