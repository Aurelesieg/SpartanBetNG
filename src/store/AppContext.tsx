import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MatchAnalysis, FollowedBet, Bankroll, UserProfile, SchoolLesson, AppNotification, NotificationPrefs } from '../types';
import { INITIAL_ANALYSES, INITIAL_LESSONS, MOCK_HISTORY_BETS } from '../data/mockData';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

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

  // Analyses State (Today's opportunities)
  analyses: MatchAnalysis[];
  setAnalyses: React.Dispatch<React.SetStateAction<MatchAnalysis[]>>;
  
  // Followed Bets State
  followedBets: FollowedBet[];
  followBet: (analysisId: string, stakeAmount: number, notes?: string, psychologicalTags?: string[]) => { success: boolean; error?: string };
  addCustomBet: (bet: {
    homeTeam: string;
    awayTeam: string;
    prediction: string;
    odds: number;
    stakeAmount: number;
    status: 'pending' | 'won' | 'lost';
    notes?: string;
    psychologicalTags?: string[];
  }) => { success: boolean; error?: string };
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

  // Notification states
  notifications: AppNotification[];
  notificationPrefs: NotificationPrefs;
  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void;
  addSystemNotification: (title: string, message: string, type?: 'bet_outcome' | 'bankroll_alert' | 'system', betId?: string, outcome?: 'won' | 'lost') => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  resolvePendingBets: () => void;
  requestDesktopNotifications: () => Promise<boolean>;

  // Onboarding states
  isOnboardingActive: boolean;
  onboardingStep: number;
  setOnboardingActive: (active: boolean) => void;
  setOnboardingStep: (step: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Core Local Storage Key Names
  const L_USER = 'spartanbet_user';
  const L_BANKROLL = 'spartanbet_bankroll';
  const L_BETS = 'spartanbet_bets';
  const L_LESSONS = 'spartanbet_lessons';

  // 1. User state
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(L_USER);
    if (saved) return JSON.parse(saved);
    return { name: 'Aurele', role: 'free', theme: 'dark', language: 'fr' };
  });

  // 2. Bankroll state
  const [bankroll, setBankroll] = useState<Bankroll>(() => {
    const saved = localStorage.getItem(L_BANKROLL);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.monthlyGoalPercent === undefined) {
        parsed.monthlyGoalPercent = 15;
      }
      return parsed;
    }
    return { balance: 2000, initialBalance: 2000, currency: '€', isActive: true, monthlyGoalPercent: 15 };
  });

  // 3. Followed Bets state (starts with some nice prefilled archive history for robust charts)
  const [followedBets, setFollowedBets] = useState<FollowedBet[]>(() => {
    const saved = localStorage.getItem(L_BETS);
    if (saved) return JSON.parse(saved);
    // Prefill some bets for visual charts immediately
    return MOCK_HISTORY_BETS.map(b => ({
      id: b.id,
      analysisId: b.id === 'h4' ? '1' : 'old_' + b.id,
      homeTeam: b.homeTeam,
      awayTeam: b.awayTeam,
      prediction: b.prediction,
      odds: b.odds,
      stakeAmount: b.stakeAmount,
      stakePercent: b.stakePercent,
      timestamp: b.timestamp,
      status: b.status as 'won' | 'lost' | 'pending',
      notes: b.notes,
      psychologicalTags: b.psychologicalTags
    }));
  });

  // 4. Lessons state
  const [lessons, setLessons] = useState<SchoolLesson[]>(() => {
    const saved = localStorage.getItem(L_LESSONS);
    if (saved) return JSON.parse(saved);
    return INITIAL_LESSONS;
  });

  // 5. Active Analyses (simulated live state)
  const [analyses, setAnalyses] = useState<MatchAnalysis[]>(INITIAL_ANALYSES);

  // 6. Toasts state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // 7. Navigation & Modal Layout UI States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analyses' | 'performance' | 'school' | 'profile'>('dashboard');
  const [selectedAnalysis, setSelectedAnalysis] = useState<MatchAnalysis | null>(null);
  const [showFollowModal, setShowFollowModal] = useState<boolean>(false);

  // 8. Notifications states
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('spartanbet_notifications');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'init_welcome',
        title: '🛡️ Bienvenue chez Spartanbet !',
        message: 'Votre espace d’investissement sportif est prêt. Suivez notre tutoriel interactif pour débuter armé de discipline.',
        timestamp: '08:00',
        type: 'system',
        isRead: false
      }
    ];
  });

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(() => {
    const saved = localStorage.getItem('spartanbet_notification_prefs');
    if (saved) return JSON.parse(saved);
    return {
      betOutcomes: true,
      bankrollThreshold: true,
      bankrollThresholdValue: 1200,
      browserPush: false
    };
  });

  // 9. Onboarding states
  const [isOnboardingActive, setOnboardingActive] = useState<boolean>(() => {
    return !user.hasCompletedOnboarding;
  });
  const [onboardingStep, setOnboardingStep] = useState<number>(0);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(L_USER, JSON.stringify(user));
    // Apply layout theme body class
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(user.theme);
  }, [user]);

  useEffect(() => {
    localStorage.setItem(L_BANKROLL, JSON.stringify(bankroll));
  }, [bankroll]);

  useEffect(() => {
    localStorage.setItem(L_BETS, JSON.stringify(followedBets));
  }, [followedBets]);

  useEffect(() => {
    localStorage.setItem(L_LESSONS, JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('spartanbet_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('spartanbet_notification_prefs', JSON.stringify(notificationPrefs));
  }, [notificationPrefs]);

  // Gamified Discipline Score Formula
  // Calculate average stake % (ideally <= 3% gets full points, > 5% loses points)
  // Number of completed school lessons (each complete gives +10 points)
  // Following recommendations: matching available mock analyses
  const disciplineScore = React.useMemo(() => {
    let baseScore = 75;

    // School completion contribution (up to +20 points)
    const completedCount = lessons.filter(l => l.isCompleted).length;
    baseScore += completedCount * 6;

    // Bet sizes analysis (deduct for higher stake bets)
    if (followedBets.length > 0) {
      let dangerousBets = 0;
      let modelBets = 0;
      
      followedBets.forEach(bet => {
        // Safe stake is <= 3% of bankroll
        if (bet.stakePercent > 5) {
          dangerousBets += 1;
        } else if (bet.stakePercent <= 3) {
          modelBets += 1;
        }
      });

      baseScore += modelBets * 3;
      baseScore -= dangerousBets * 10;
    }

    return Math.min(Math.max(baseScore, 10), 100);
  }, [lessons, followedBets]);

  // Toast notifications helpers
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Actions
  const setLanguage = (language: 'fr' | 'en') => {
    setUser(prev => ({ ...prev, language }));
    addToast(language === 'fr' ? 'Langue changée en Français' : 'Language changed to English', 'info');
  };

  const setTheme = (theme: 'dark' | 'light') => {
    setUser(prev => ({ ...prev, theme }));
    addToast(
      theme === 'dark' 
        ? (user.language === 'fr' ? 'Thème Sombre activé' : 'Dark Mode activated')
        : (user.language === 'fr' ? 'Thème Clair activé' : 'Light Mode activated'),
      'info'
    );
  };

  const togglePremium = () => {
    setUser(prev => {
      const nextRole = prev.role === 'premium' ? 'free' : 'premium';
      setTimeout(() => {
        addToast(
          nextRole === 'premium'
            ? (user.language === 'fr' ? 'Profil premium activé ! Accès débloqué.' : 'Premium activated! Ultimate access granted.')
            : (user.language === 'fr' ? 'Profil repassé en version Standard.' : 'Returned to standard profile.'),
          'success'
        );
      }, 50);
      return { ...prev, role: nextRole };
    });
  };

  const activateBankroll = (initial: number, currency: string) => {
    setBankroll({
      balance: initial,
      initialBalance: initial,
      currency,
      isActive: true,
      monthlyGoalPercent: 15
    });
    addToast(user.language === 'fr' ? 'Bankroll initialisée avec succès !' : 'Bankroll initialized successfully!', 'success');
  };

  const adjustBankrollBalance = (newBalance: number) => {
    setBankroll(prev => ({ ...prev, balance: newBalance }));
    addToast(user.language === 'fr' ? 'Solde de la bankroll mis à jour.' : 'Bankroll balance updated.', 'info');
  };

  const resetBankroll = () => {
    const defaultAmount = 1500;
    setBankroll({
      balance: defaultAmount,
      initialBalance: defaultAmount,
      currency: '€',
      isActive: true,
      monthlyGoalPercent: 15
    });
    setFollowedBets([]);
    // Reset lessons
    setLessons(INITIAL_LESSONS);
    addToast(user.language === 'fr' ? 'Bankroll de démonstration réinitialisée.' : 'Demo bankroll reset complete.', 'info');
  };

  const updateMonthlyGoal = (percent: number) => {
    setBankroll(prev => ({ ...prev, monthlyGoalPercent: percent }));
    addToast(
      user.language === 'fr' 
        ? `Objectif de croissance mensuel défini à ${percent}% !` 
        : `Monthly growth goal updated to ${percent}%!`, 
      'success'
    );
  };

  const isBetFollowed = (analysisId: string) => {
    return followedBets.some(b => b.analysisId === analysisId);
  };

  // J'ai suivi (Follow Bet Action Flow)
  const followBet = (analysisId: string, stakeAmount: number, notes?: string, psychologicalTags?: string[]): { success: boolean; error?: string } => {
    const match = analyses.find(a => a.id === analysisId);
    if (!match) {
      return { success: false, error: user.language === 'fr' ? 'Analyse introuvable.' : 'Analysis not found.' };
    }

    if (isBetFollowed(analysisId)) {
      return { success: false, error: user.language === 'fr' ? 'Pari déjà suivi' : 'Bet already followed' };
    }

    if (!bankroll.isActive) {
      return { success: false, error: user.language === 'fr' ? 'Bankroll inactive.' : 'Bankroll inoperative.' };
    }

    if (bankroll.balance < stakeAmount) {
      return { success: false, error: user.language === 'fr' ? 'Solde inférieur à la mise.' : 'Insufficient funds.' };
    }

    // Calculate percentage of current bankroll
    const stakePercent = Number(((stakeAmount / bankroll.balance) * 100).toFixed(1));

    // Dedicate bet
    const newBet: FollowedBet = {
      id: Math.random().toString(36).substring(2, 9),
      analysisId,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      prediction: match.prediction,
      odds: match.odds,
      stakeAmount,
      stakePercent,
      timestamp: user.language === 'fr' ? 'À l’instant' : 'Just now',
      status: 'pending',
      notes,
      psychologicalTags
    };

    // Update state synchronously representation of React Query invalidation
    setFollowedBets(prev => [newBet, ...prev]);
    setBankroll(prev => ({ ...prev, balance: Number((prev.balance - stakeAmount).toFixed(2)) }));

    // Simulated gamified feedback on toast based on stake size
    setTimeout(() => {
      if (stakePercent > 5) {
        addToast(
          user.language === 'fr' 
            ? `⚠️ Pari suivi à ${stakePercent}% ! Trop risqué pour la discipline Spartan.`
            : `⚠️ Followed at ${stakePercent}%! High-risk profile warning.`,
          'info'
        );
      } else {
        addToast(
          user.language === 'fr'
            ? `Suivi ✓ Pari enregistré (${stakeAmount}${bankroll.currency})`
            : `Followed ✓ Bet registered (${stakeAmount}${bankroll.currency})`,
          'success'
        );
      }
    }, 100);

    return { success: true };
  };

  const addCustomBet = (bet: {
    homeTeam: string;
    awayTeam: string;
    prediction: string;
    odds: number;
    stakeAmount: number;
    status: 'pending' | 'won' | 'lost';
    notes?: string;
    psychologicalTags?: string[];
  }): { success: boolean; error?: string } => {
    if (!bankroll.isActive) {
      return { success: false, error: user.language === 'fr' ? 'Bankroll inactive.' : 'Bankroll inoperative.' };
    }

    const { homeTeam, awayTeam, prediction, odds, stakeAmount, status, notes, psychologicalTags } = bet;

    if (!homeTeam.trim() || !awayTeam.trim() || !prediction.trim()) {
      return { success: false, error: user.language === 'fr' ? 'Veuillez remplir tous les champs.' : 'All text fields are required.' };
    }

    if (odds <= 1) {
      return { success: false, error: user.language === 'fr' ? 'La cote doit être supérieure à 1.' : 'Odds must be greater than 1.' };
    }

    if (stakeAmount <= 0) {
      return { success: false, error: user.language === 'fr' ? 'La mise doit être supérieure à 0.' : 'Stake must be positive.' };
    }

    if (bankroll.balance < stakeAmount) {
      return { success: false, error: user.language === 'fr' ? 'Solde de la bankroll insuffisant.' : 'Insufficient bankroll funds.' };
    }

    const stakePercent = Number(((stakeAmount / bankroll.balance) * 100).toFixed(1));

    const newBet: FollowedBet = {
      id: Math.random().toString(36).substring(2, 9),
      analysisId: 'custom_' + Math.random().toString(36).substring(2, 6),
      homeTeam: homeTeam.trim(),
      awayTeam: awayTeam.trim(),
      prediction: prediction.trim(),
      odds,
      stakeAmount,
      stakePercent,
      timestamp: user.language === 'fr' ? '15 Juin, À l’instant' : 'June 15, Just now',
      status,
      notes,
      psychologicalTags
    };

    setFollowedBets(prev => [newBet, ...prev]);

    if (status === 'pending' || status === 'lost') {
      setBankroll(prev => ({ ...prev, balance: Number((prev.balance - stakeAmount).toFixed(2)) }));
    } else if (status === 'won') {
      const netProfit = stakeAmount * (odds - 1);
      setBankroll(prev => ({ ...prev, balance: Number((prev.balance + netProfit).toFixed(2)) }));
    }

    setTimeout(() => {
      if (stakePercent > 5) {
        addToast(
          user.language === 'fr' 
            ? `⚠️ Pari personnalisé à ${stakePercent}% ! Trop risqué pour la discipline Spartan.`
            : `⚠️ Custom pick at ${stakePercent}%! High-risk profile warning.`,
          'info'
        );
      } else {
        addToast(
          user.language === 'fr'
            ? `Pari personnalisé ✓ Enregistré (${stakeAmount}${bankroll.currency})`
            : `Custom pick ✓ Registered (${stakeAmount}${bankroll.currency})`,
          'success'
        );
      }
    }, 100);

    return { success: true };
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
    addToast(
      user.language === 'fr' 
        ? "Note et tags d'état d'esprit enregistrés !" 
        : "Qualitative note & psychological state tags successfully saved!",
      'success'
    );
  };

  const toggleLessonCompleted = (lessonId: string) => {
    setLessons(prev => {
      const target = prev.find(l => l.id === lessonId);
      const isFinishing = target ? !target.isCompleted : false;
      
      setTimeout(() => {
        if (isFinishing) {
          addToast(
            user.language === 'fr' 
              ? `🔥 Leçon sur la discipline apprise (+6 Discipline)`
              : `🔥 Discipline lesson learned (+6 Discipline)`,
            'success'
          );
        }
      }, 50);

      return prev.map(l => l.id === lessonId ? { ...l, isCompleted: !l.isCompleted } : l);
    });
  };

  // Onboarding action
  const completeOnboarding = () => {
    setUser(prev => ({ ...prev, hasCompletedOnboarding: true }));
    setOnboardingActive(false);
    addToast(
      user.language === 'fr' 
        ? '🛡️ Onboarding terminé ! Découvrez l’application.' 
        : '🛡️ Onboarding complete! Navigate around the premium app.',
      'success'
    );
  };

  // Notification actions
  const updateNotificationPrefs = (prefs: Partial<NotificationPrefs>) => {
    setNotificationPrefs(prev => ({ ...prev, ...prefs }));
  };

  const addSystemNotification = (
    title: string, 
    message: string, 
    type: 'bet_outcome' | 'bankroll_alert' | 'system' = 'system',
    betId?: string,
    outcome?: 'won' | 'lost'
  ) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      isRead: false,
      betId,
      outcome
    };

    setNotifications(prev => [newNotif, ...prev]);

    // HTML5 native browser push notification trigger if preference enabled and allowed
    if (notificationPrefs.browserPush && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          tag: 'spartanbet_push'
        });
      } catch (e) {
        console.error('Desktop notification trigger failed', e);
      }
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast(user.language === 'fr' ? 'Toutes les notifications lues' : 'All notifications read', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    addToast(user.language === 'fr' ? 'Notifications effacées' : 'Notifications cleared', 'info');
  };

  // Real-time automatic Bankroll threshold monitor
  useEffect(() => {
    if (notificationPrefs.bankrollThreshold) {
      if (bankroll.balance < notificationPrefs.bankrollThresholdValue) {
        const lastAlertTime = sessionStorage.getItem('last_bankroll_alert_time');
        const now = Date.now();
        // Warn at most once per 30 seconds to prevent alert flooding
        if (!lastAlertTime || (now - Number(lastAlertTime) > 30000)) {
          addSystemNotification(
            user.language === 'fr' ? '⚠️ Alerte Seuil de Bankroll' : '⚠️ Bankroll Threshold Alert',
            user.language === 'fr'
              ? `Votre balance (${bankroll.balance.toFixed(2)} ${bankroll.currency}) est passée SOUS votre seuil de ${notificationPrefs.bankrollThresholdValue} ${bankroll.currency} !`
              : `Your bankroll balance (${bankroll.balance.toFixed(2)} ${bankroll.currency}) has dropped BELOW your custom threshold level of ${notificationPrefs.bankrollThresholdValue} ${bankroll.currency}!`,
            'bankroll_alert'
          );
          sessionStorage.setItem('last_bankroll_alert_time', now.toString());
        }
      }
    }
  }, [bankroll.balance, notificationPrefs.bankrollThreshold, notificationPrefs.bankrollThresholdValue]);

  // Outcomes simulator checker
  const resolvePendingBets = () => {
    let changed = false;
    let wonCount = 0;
    let lostCount = 0;
    let totalReturns = 0;

    const updatedBets = followedBets.map(bet => {
      // Resolve any pending bets
      if (bet.status === 'pending') {
        changed = true;
        // 60% probability of win for elite value picks
        const isWin = Math.random() < 0.6;
        const outcome = isWin ? 'won' : 'lost';

        if (isWin) {
          wonCount++;
          totalReturns += bet.stakeAmount * bet.odds;
        } else {
          lostCount++;
        }

        // Notify outcomes
        if (notificationPrefs.betOutcomes) {
          const matchTitle = `${bet.homeTeam} vs ${bet.awayTeam}`;
          const profit = (bet.stakeAmount * (bet.odds - 1)).toFixed(2);
          const messageStr = isWin
            ? (user.language === 'fr'
                ? `Pari réussi ! "${bet.prediction}" est validé. Gains de +${profit} ${bankroll.currency}.`
                : `Success! Pick on "${bet.prediction}" is graded WON. Added profit: +${profit} ${bankroll.currency}.`)
            : (user.language === 'fr'
                ? `Pari perdu. "${bet.prediction}" n'est pas validé. Perte de -${bet.stakeAmount} ${bankroll.currency}.`
                : `Lost pick. Pick on "${bet.prediction}" is graded LOST. Drawdown of -${bet.stakeAmount} ${bankroll.currency}.`);

          addSystemNotification(
            isWin
              ? (user.language === 'fr' ? `🏆 Pari Gagné ! [${matchTitle}]` : `🏆 Wager Won! [${matchTitle}]`)
              : (user.language === 'fr' ? `❌ Pari Perdu [${matchTitle}]` : `❌ Wager Lost [${matchTitle}]`),
            messageStr,
            'bet_outcome',
            bet.id,
            outcome
          );
        }

        return { ...bet, status: outcome };
      }
      return bet;
    });

    if (changed) {
      setFollowedBets(updatedBets);
      if (totalReturns > 0) {
        setBankroll(prev => ({ ...prev, balance: Number((prev.balance + totalReturns).toFixed(2)) }));
      }
      addToast(
        user.language === 'fr'
          ? `Résultats traités : ${wonCount} Gagnés, ${lostCount} Perdus !`
          : `Processed outcomes: ${wonCount} Won, ${lostCount} Lost!`,
        'success'
      );
    } else {
      addToast(
        user.language === 'fr'
          ? "Aucun de vos paris suivis n'est en suspens."
          : "None of your followed bets are currently in pending state.",
        'info'
      );
    }
  };

  const requestDesktopNotifications = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      addToast(
        user.language === 'fr' 
          ? "Votre navigateur actuel ne supporte pas les notifications système." 
          : "Your browser does not support standard web notification interfaces.", 
        'error'
      );
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        addToast(
          user.language === 'fr' ? "Notifications système autorisées !" : "System desktop notifications allowed!", 
          'success'
        );
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <AppContext.Provider value={{
      user, setLanguage, setTheme, togglePremium, completeOnboarding,
      bankroll, activateBankroll, adjustBankrollBalance, resetBankroll, updateMonthlyGoal,
      analyses, setAnalyses,
      followedBets, followBet, addCustomBet, isBetFollowed, updateBetNotesAndTags,
      lessons, toggleLessonCompleted,
      disciplineScore,
      toasts, addToast, removeToast,
      activeTab, setActiveTab,
      selectedAnalysis, setSelectedAnalysis,
      showFollowModal, setShowFollowModal,

      // Custom notifications
      notifications,
      notificationPrefs,
      updateNotificationPrefs,
      addSystemNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearNotifications,
      resolvePendingBets,
      requestDesktopNotifications,

      // Tutorial states
      isOnboardingActive,
      onboardingStep,
      setOnboardingActive,
      setOnboardingStep
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
