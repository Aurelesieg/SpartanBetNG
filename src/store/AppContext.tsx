import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { ToastProvider, useToast, ToastItem } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { BankrollProvider, useBankroll } from './contexts/BankrollContext';
import { BetsProvider, useBets } from './contexts/BetsContext';
import { AnalysesProvider, useAnalyses } from './contexts/AnalysesContext';
import { NotificationsProvider, useNotifications } from './contexts/NotificationsContext';
import { UIProvider, useUI } from './contexts/UIContext';
import { UserProfile, Bankroll, MatchAnalysis, FollowedBet, SchoolLesson, AppNotification, NotificationPrefs, SportType, BetResolution } from '../types';

interface AppContextType {
  // User Profile
  user: UserProfile;
  setLanguage: (lang: 'fr' | 'en') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  togglePremium: () => void;
  completeOnboarding: () => void;
  
  // Bankroll State
  bankroll: Bankroll;
  activateBankroll: (initial: number, currency: string) => void;
  adjustBankrollBalance: (newBalance: number) => void;
  resetBankroll: () => void;
  updateMonthlyGoal: (percent: number) => void;

  // Analyses State
  analyses: MatchAnalysis[];
  setAnalyses: React.Dispatch<React.SetStateAction<MatchAnalysis[]>>; // Mock for backward compatibility
  
  // Followed Bets State
  followedBets: FollowedBet[];
  followBet: (analysisId: string, stakeAmount: number, notes?: string, psychologicalTags?: string[]) => Promise<{ success: boolean; error?: string }>;
  addCustomBet: (bet: {
    homeTeam: string;
    awayTeam: string;
    prediction: string;
    odds: number;
    stakeAmount: number;
    status: 'pending' | 'won' | 'lost';
    notes?: string;
    psychologicalTags?: string[];
    sport?: SportType;
  }) => Promise<{ success: boolean; error?: string }>;
  isBetFollowed: (analysisId: string) => boolean;
  updateBetNotesAndTags: (betId: string, notes: string, psychologicalTags: string[]) => void;
  
  // School Lessons
  lessons: SchoolLesson[];
  toggleLessonCompleted: (lessonId: string) => void;
  
  // Gamified Discipline Score
  disciplineScore: number;
  
  // UI State / Toasts
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  activeTab: 'dashboard' | 'analyses' | 'performance' | 'school' | 'profile';
  setActiveTab: (tab: 'dashboard' | 'analyses' | 'performance' | 'school' | 'profile') => void;
  selectedAnalysis: MatchAnalysis | null;
  setSelectedAnalysis: (match: MatchAnalysis | null) => void;
  showFollowModal: boolean;
  setShowFollowModal: (show: boolean) => void;
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;

  // Notification states
  notifications: AppNotification[];
  notificationPrefs: NotificationPrefs;
  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
  addSystemNotification: (title: string, message: string, type?: 'bet_outcome' | 'bankroll_alert' | 'system', betId?: string, outcome?: 'won' | 'lost') => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  resolvePendingBets: (resolutions: BetResolution[]) => void;
  requestDesktopNotifications: () => Promise<boolean>;

  // Onboarding states
  isOnboardingActive: boolean;
  onboardingStep: number;
  setOnboardingActive: (active: boolean) => void;
  setOnboardingStep: (step: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// The Orchestrator combines all contexts into the old AppContext interface
const Orchestrator: React.FC<{ children: ReactNode }> = ({ children }) => {
  const toastCtx = useToast();
  const userCtx = useUser();
  const bankrollCtx = useBankroll();
  const betsCtx = useBets();
  const analysesCtx = useAnalyses();
  const notificationsCtx = useNotifications();
  const uiCtx = useUI();

  const isFr = userCtx.user.language === 'fr';

  // Bankroll threshold monitor
  useEffect(() => {
    if (notificationsCtx.notificationPrefs.bankrollThreshold) {
      if (bankrollCtx.bankroll.balance < notificationsCtx.notificationPrefs.bankrollThresholdValue) {
        const lastAlertTime = sessionStorage.getItem('last_bankroll_alert_time');
        const now = Date.now();
        // Warn at most once per 30 seconds
        if (!lastAlertTime || (now - Number(lastAlertTime) > 30000)) {
          notificationsCtx.addSystemNotification(
            isFr ? '⚠️ Alerte Seuil de Bankroll' : '⚠️ Bankroll Threshold Alert',
            isFr
              ? `Votre balance (${bankrollCtx.bankroll.balance.toFixed(2)} ${bankrollCtx.bankroll.currency}) est passée SOUS votre seuil de ${notificationsCtx.notificationPrefs.bankrollThresholdValue} ${bankrollCtx.bankroll.currency} !`
              : `Your bankroll balance (${bankrollCtx.bankroll.balance.toFixed(2)} ${bankrollCtx.bankroll.currency}) has dropped BELOW your custom threshold level of ${notificationsCtx.notificationPrefs.bankrollThresholdValue} ${bankrollCtx.bankroll.currency}!`,
            'bankroll_alert'
          );
          sessionStorage.setItem('last_bankroll_alert_time', now.toString());
        }
      }
    }
  }, [bankrollCtx.bankroll.balance, notificationsCtx.notificationPrefs.bankrollThreshold, notificationsCtx.notificationPrefs.bankrollThresholdValue]);

  // Orchestrate: followBet
  const followBet = async (analysisId: string, stakeAmount: number, notes?: string, psychologicalTags?: string[]) => {
    const analysis = analysesCtx.analyses.find(a => a.id === analysisId);
    if (!analysis) {
      toastCtx.addToast(isFr ? "Analyse introuvable" : "Analysis not found", 'error');
      return { success: false, error: 'Analysis not found' };
    }

    const res = await betsCtx.followBet(analysis, bankrollCtx.bankroll.balance, stakeAmount, bankrollCtx.bankroll.currency, notes, psychologicalTags);
    if (res.success) {
      bankrollCtx.applyBetStake(stakeAmount);
      const stakePercent = bankrollCtx.bankroll.balance > 0 ? (stakeAmount / bankrollCtx.bankroll.balance) * 100 : 0;
      setTimeout(() => {
        if (stakePercent > 5) {
          toastCtx.addToast(
            isFr
              ? `⚠️ Mise de ${stakePercent.toFixed(1)}% ! Le money management Spartan recommande 1 à 3%.`
              : `⚠️ ${stakePercent.toFixed(1)}% stake! Spartan money management recommends 1 to 3%.`,
            'info'
          );
        } else {
          toastCtx.addToast(
            isFr
              ? `Pari suivi ✓ (${stakeAmount}${bankrollCtx.bankroll.currency})`
              : `Pick followed ✓ (${stakeAmount}${bankrollCtx.bankroll.currency})`,
            'success'
          );
        }
      }, 100);
    } else {
      toastCtx.addToast(res.error || 'Error', 'error');
    }
    return res;
  };

  // Orchestrate: addCustomBet
  const addCustomBet = async (bet: {
    homeTeam: string;
    awayTeam: string;
    prediction: string;
    odds: number;
    stakeAmount: number;
    status: 'pending' | 'won' | 'lost';
    notes?: string;
    psychologicalTags?: string[];
    sport?: SportType;
  }) => {
    const res = await betsCtx.addCustomBet({ ...bet, sport: bet.sport ?? 'football' }, bankrollCtx.bankroll.balance, bankrollCtx.bankroll.currency);

    if (res.success) {
      if (bet.status === 'pending' || bet.status === 'lost') {
        bankrollCtx.applyBetStake(bet.stakeAmount);
      } else if (bet.status === 'won') {
        bankrollCtx.applyBetStake(bet.stakeAmount);
        bankrollCtx.applyBetWin(bet.stakeAmount, bet.odds);
      }

      const stakePercent = bankrollCtx.bankroll.balance > 0 ? (bet.stakeAmount / bankrollCtx.bankroll.balance) * 100 : 0;
      setTimeout(() => {
        if (stakePercent > 5) {
          toastCtx.addToast(
            isFr
              ? `⚠️ Pari personnalisé à ${stakePercent.toFixed(1)}% ! Trop risqué pour la discipline Spartan.`
              : `⚠️ Custom pick at ${stakePercent.toFixed(1)}%! High-risk profile warning.`,
            'info'
          );
        } else {
          toastCtx.addToast(
            isFr
              ? `Pari personnalisé ✓ Enregistré (${bet.stakeAmount}${bankrollCtx.bankroll.currency})`
              : `Custom pick ✓ Registered (${bet.stakeAmount}${bankrollCtx.bankroll.currency})`,
            'success'
          );
        }
      }, 100);
    } else {
      toastCtx.addToast(res.error || 'Error', 'error');
    }
    return res;
  };

  // Orchestrate: resolvePendingBets
  const resolvePendingBets = async (resolutions: BetResolution[]) => {
    const res = await betsCtx.resolvePendingBets(resolutions);

    if (res.updates.length > 0) {
      if (res.totalReturns > 0) {
        bankrollCtx.adjustBankrollBalance(bankrollCtx.bankroll.balance + res.totalReturns);
      }

      toastCtx.addToast(
        isFr
          ? `Résultats traités : ${res.wonCount} Gagnés, ${res.lostCount} Perdus !`
          : `Processed outcomes: ${res.wonCount} Won, ${res.lostCount} Lost!`,
        'success'
      );

      if (notificationsCtx.notificationPrefs.betOutcomes) {
        res.updates.forEach(update => {
          const bet = betsCtx.followedBets.find(b => b.id === update.betId);
          if (bet) {
            const matchTitle = `${bet.homeTeam} vs ${bet.awayTeam}`;
            const profit = (update.stake * (update.odds - 1)).toFixed(2);
            const isWin = update.outcome === 'won';

            const messageStr = isWin
              ? (isFr
                  ? `Pari réussi ! "${bet.prediction}" est validé. Gains de +${profit} ${bankrollCtx.bankroll.currency}.`
                  : `Success! Pick on "${bet.prediction}" is graded WON. Added profit: +${profit} ${bankrollCtx.bankroll.currency}.`)
              : (isFr
                  ? `Pari perdu. "${bet.prediction}" n'est pas validé. Perte de -${update.stake} ${bankrollCtx.bankroll.currency}.`
                  : `Lost pick. Pick on "${bet.prediction}" is graded LOST. Drawdown of -${update.stake} ${bankrollCtx.bankroll.currency}.`);

            notificationsCtx.addSystemNotification(
              isWin
                ? (isFr ? `🏆 Pari Gagné ! [${matchTitle}]` : `🏆 Wager Won! [${matchTitle}]`)
                : (isFr ? `❌ Pari Perdu [${matchTitle}]` : `❌ Wager Lost [${matchTitle}]`),
              messageStr,
              'bet_outcome',
              update.betId,
              update.outcome
            );
          }
        });
      }
    } else {
      toastCtx.addToast(
        isFr
          ? "Aucun de vos paris suivis n'est en suspens."
          : "None of your followed bets are currently in pending state.",
        'info'
      );
    }
  };

  const resetBankroll = () => {
    bankrollCtx.resetBankroll();
    betsCtx.resetBets();
  };

  const disciplineScore = useMemo(
    () => betsCtx.computeDisciplineScore(uiCtx.completedLessonsCount),
    [betsCtx, uiCtx.completedLessonsCount]
  );

  return (
    <AppContext.Provider value={{
      // User Profile
      user: userCtx.user,
      setLanguage: userCtx.setLanguage,
      setTheme: userCtx.setTheme,
      togglePremium: userCtx.togglePremium,
      completeOnboarding: userCtx.completeOnboarding,

      // Bankroll State
      bankroll: bankrollCtx.bankroll,
      activateBankroll: bankrollCtx.activateBankroll,
      adjustBankrollBalance: bankrollCtx.adjustBankrollBalance,
      resetBankroll,
      updateMonthlyGoal: bankrollCtx.updateMonthlyGoal,

      // Analyses State
      analyses: analysesCtx.analyses,
      setAnalyses: () => {}, // No-op, maintained for backward compatibility if any

      // Followed Bets State
      followedBets: betsCtx.followedBets,
      followBet,
      addCustomBet,
      isBetFollowed: betsCtx.isBetFollowed,
      updateBetNotesAndTags: betsCtx.updateBetNotesAndTags,

      // School Lessons
      lessons: uiCtx.lessons,
      toggleLessonCompleted: uiCtx.toggleLessonCompleted,

      // Gamified Discipline Score
      disciplineScore,

      // UI State / Toasts
      toasts: toastCtx.toasts,
      addToast: toastCtx.addToast,
      removeToast: toastCtx.removeToast,
      activeTab: uiCtx.activeTab,
      setActiveTab: uiCtx.setActiveTab,
      selectedAnalysis: analysesCtx.selectedAnalysis,
      setSelectedAnalysis: analysesCtx.setSelectedAnalysis,
      showFollowModal: uiCtx.showFollowModal,
      setShowFollowModal: uiCtx.setShowFollowModal,
      showQuickAdd: uiCtx.showQuickAdd,
      setShowQuickAdd: uiCtx.setShowQuickAdd,

      // Notification states
      notifications: notificationsCtx.notifications,
      notificationPrefs: notificationsCtx.notificationPrefs,
      updateNotificationPrefs: notificationsCtx.updateNotificationPrefs,
      addSystemNotification: notificationsCtx.addSystemNotification,
      markNotificationAsRead: notificationsCtx.markNotificationAsRead,
      markAllNotificationsAsRead: notificationsCtx.markAllNotificationsAsRead,
      clearNotifications: notificationsCtx.clearNotifications,
      resolvePendingBets,
      requestDesktopNotifications: notificationsCtx.requestDesktopNotifications,

      // Onboarding states
      isOnboardingActive: userCtx.isOnboardingActive,
      onboardingStep: userCtx.onboardingStep,
      setOnboardingActive: userCtx.setOnboardingActive,
      setOnboardingStep: userCtx.setOnboardingStep
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Layered Provider wrapping component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastContextWrapper>
          {children}
        </ToastContextWrapper>
      </ToastProvider>
    </AuthProvider>
  );
};

// Helper to inject toast into contexts that need it before Orchestrator
const ToastContextWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  return (
    <UserProvider onToast={addToast}>
      <UserContextWrapper>
        {children}
      </UserContextWrapper>
    </UserProvider>
  );
};

const UserContextWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const { user } = useUser();
  return (
    <BankrollProvider>
      <BetsProvider>
        <AnalysesProvider>
          <NotificationsProvider onToast={addToast} language={user.language}>
            <UIProvider onToast={addToast} language={user.language}>
              <Orchestrator>
                {children}
              </Orchestrator>
            </UIProvider>
          </NotificationsProvider>
        </AnalysesProvider>
      </BetsProvider>
    </BankrollProvider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
