import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../../types';

interface UserContextType {
  user: UserProfile;
  isOnboardingActive: boolean;
  onboardingStep: number;
  setLanguage: (lang: 'fr' | 'en') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  togglePremium: () => void;
  completeOnboarding: () => void;
  setOnboardingActive: (active: boolean) => void;
  setOnboardingStep: (step: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const L_USER = 'spartanbet_user';

export const UserProvider: React.FC<{ children: ReactNode; onToast: (msg: string, type?: 'success'|'error'|'info') => void }> = ({ children, onToast }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(L_USER);
    if (saved) return JSON.parse(saved);
    return { name: 'Aurele', role: 'free', theme: 'dark', language: 'fr' };
  });

  const [isOnboardingActive, setOnboardingActive] = useState(() => {
    const saved = localStorage.getItem(L_USER);
    if (saved) {
      const parsed = JSON.parse(saved);
      return !parsed.hasCompletedOnboarding;
    }
    return true;
  });

  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    localStorage.setItem(L_USER, JSON.stringify(user));
    if (user.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  const setLanguage = (lang: 'fr' | 'en') => {
    setUser(prev => ({ ...prev, language: lang }));
  };

  const setTheme = (theme: 'dark' | 'light') => {
    setUser(prev => ({ ...prev, theme }));
  };

  const togglePremium = () => {
    setUser(prev => {
      const newRole = prev.role === 'free' ? 'premium' : 'free';
      onToast(
        prev.language === 'fr'
          ? `Status Premium ${newRole === 'premium' ? 'Activé 💎' : 'Désactivé'}`
          : `Premium Status ${newRole === 'premium' ? 'Activated 💎' : 'Deactivated'}`,
        'success'
      );
      return { ...prev, role: newRole };
    });
  };

  const completeOnboarding = () => {
    setUser(prev => ({ ...prev, hasCompletedOnboarding: true }));
    setOnboardingActive(false);
    onToast(
      user.language === 'fr'
        ? '🛡️ Onboarding terminé ! Découvrez l’application.'
        : '🛡️ Onboarding complete! Navigate around the premium app.',
      'success'
    );
  };

  return (
    <UserContext.Provider value={{
      user,
      isOnboardingActive,
      onboardingStep,
      setLanguage,
      setTheme,
      togglePremium,
      completeOnboarding,
      setOnboardingActive,
      setOnboardingStep
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
