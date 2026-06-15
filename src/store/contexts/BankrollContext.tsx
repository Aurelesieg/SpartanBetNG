import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Bankroll } from '../../types';

interface BankrollContextType {
  bankroll: Bankroll;
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
  const [bankroll, setBankroll] = useState<Bankroll>(() => {
    const saved = localStorage.getItem(L_BANKROLL);
    if (saved) return JSON.parse(saved);
    return { balance: 0, initialBalance: 0, currency: '₦', isActive: false, monthlyGoalPercent: 10 };
  });

  useEffect(() => {
    localStorage.setItem(L_BANKROLL, JSON.stringify(bankroll));
  }, [bankroll]);

  const activateBankroll = (initial: number, currency: string = '₦') => {
    setBankroll({
      balance: initial,
      initialBalance: initial,
      currency,
      isActive: true,
      monthlyGoalPercent: 10
    });
  };

  const adjustBankrollBalance = (newBalance: number) => {
    setBankroll(prev => ({ ...prev, balance: newBalance }));
  };

  const applyBetStake = (amount: number) => {
    setBankroll(prev => ({
      ...prev,
      balance: Number((prev.balance - amount).toFixed(2))
    }));
  };

  const applyBetWin = (stake: number, odds: number) => {
    setBankroll(prev => ({
      ...prev,
      balance: Number((prev.balance + (stake * odds)).toFixed(2))
    }));
  };

  const applyBetLoss = (stake: number) => {
    // No-op: stake was already deducted at placement
  };

  const resetBankroll = () => {
    setBankroll({
      balance: 0,
      initialBalance: 0,
      currency: '₦',
      isActive: false,
      monthlyGoalPercent: 10
    });
  };

  const updateMonthlyGoal = (percent: number) => {
    setBankroll(prev => ({ ...prev, monthlyGoalPercent: percent }));
  };

  return (
    <BankrollContext.Provider value={{
      bankroll,
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
