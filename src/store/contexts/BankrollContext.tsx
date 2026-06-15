import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bankroll } from '../../types';
import { supabase } from '../../services/supabase';
import { useAuth } from './AuthContext';

interface BankrollContextType {
  bankroll: Bankroll;
  isLoading: boolean;
  activateBankroll: (initial: number, currency: string) => void;
  adjustBankrollBalance: (newBalance: number) => void;
  applyBetStake: (amount: number) => void;
  applyBetWin: (stake: number, odds: number) => void;
  applyBetLoss: (stake: number) => void;
  resetBankroll: () => void;
  updateMonthlyGoal: (percent: number) => void;
}

const BankrollContext = createContext<BankrollContextType | undefined>(undefined);

const L_BANKROLL = 'spartanbet_bankroll';

export const BankrollProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth();
  const userId = authUser?.id;

  const [bankroll, setBankroll] = useState<Bankroll>(() => {
    const saved = localStorage.getItem(L_BANKROLL);
    if (saved) return JSON.parse(saved);
    return { balance: 0, initialBalance: 0, currency: '₦', isActive: false, monthlyGoalPercent: 15 };
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchBankroll = async () => {
      const { data, error } = await supabase
        .from('bankrolls')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignore zero rows error
        console.error('[SpartanBet] fetch bankroll error:', error.message);
      } else if (data) {
        setBankroll({
          balance: data.balance,
          initialBalance: data.initial_balance,
          currency: data.currency,
          isActive: data.is_active,
          monthlyGoalPercent: data.monthly_goal_percent
        });
      }
      setIsLoading(false);
    };

    fetchBankroll();
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(L_BANKROLL, JSON.stringify(bankroll));
  }, [bankroll]);

  const activateBankroll = async (initial: number, currency: string = '₦') => {
    setBankroll({
      balance: initial,
      initialBalance: initial,
      currency,
      isActive: true,
      monthlyGoalPercent: 15
    });

    if (userId) {
      await supabase.from('bankrolls').upsert({
        user_id: userId,
        balance: initial,
        initial_balance: initial,
        currency,
        is_active: true,
        monthly_goal_percent: 15
      });
    }
  };

  const adjustBankrollBalance = async (newBalance: number) => {
    setBankroll(prev => ({ ...prev, balance: newBalance }));
    if (userId) {
      await supabase.from('bankrolls').update({ balance: newBalance }).eq('user_id', userId);
    }
  };

  const applyBetStake = async (amount: number) => {
    const newBalance = Number((bankroll.balance - amount).toFixed(2));
    setBankroll(prev => ({ ...prev, balance: newBalance }));
    if (userId) {
      await supabase.from('bankrolls').update({ balance: newBalance }).eq('user_id', userId);
    }
  };

  const applyBetWin = async (stake: number, odds: number) => {
    const newBalance = Number((bankroll.balance + (stake * odds)).toFixed(2));
    setBankroll(prev => ({ ...prev, balance: newBalance }));
    if (userId) {
      await supabase.from('bankrolls').update({ balance: newBalance }).eq('user_id', userId);
    }
  };

  const applyBetLoss = (stake: number) => {
    // No-op: stake was already deducted at placement
  };

  const resetBankroll = async () => {
    setBankroll({
      balance: 2000,
      initialBalance: 2000,
      currency: '₦',
      isActive: false,
      monthlyGoalPercent: 15
    });
    if (userId) {
      await supabase.from('bankrolls').update({
        balance: 2000,
        initial_balance: 2000,
        currency: '₦',
        monthly_goal_percent: 15
      }).eq('user_id', userId);
    }
  };

  const updateMonthlyGoal = async (percent: number) => {
    setBankroll(prev => ({ ...prev, monthlyGoalPercent: percent }));
    if (userId) {
      await supabase.from('bankrolls').update({ monthly_goal_percent: percent }).eq('user_id', userId);
    }
  };

  return (
    <BankrollContext.Provider value={{
      bankroll,
      isLoading,
      activateBankroll,
      adjustBankrollBalance,
      applyBetStake,
      applyBetWin,
      applyBetLoss,
      resetBankroll,
      updateMonthlyGoal
    }}>
      {children}
    </BankrollContext.Provider>
  );
};

export const useBankroll = () => {
  const context = useContext(BankrollContext);
  if (!context) throw new Error('useBankroll must be used within a BankrollProvider');
  return context;
};
