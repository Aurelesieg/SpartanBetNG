import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../../types';
import { supabase } from '../../services/supabase';
import { useAuth } from './AuthContext';

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
  const { user: authUser } = useAuth();
  const userId = authUser?.id;

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(L_USER);
    if (saved) return JSON.parse(saved);
    return { name: 'Spartan', role: 'free', theme: 'dark', language: 'fr' };
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
    if (!userId) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[SpartanBet] fetch profile error:', error.message);
        return;
      }

      if (data) {
        const loadedUser: UserProfile = {
          name: data.name,
          role: data.role,
          language: data.language,
          theme: data.theme,
          hasCompletedOnboarding: data.has_completed_onboarding
        };
        setUser(loadedUser);
        setOnboardingActive(!loadedUser.hasCompletedOnboarding);
      }
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(L_USER, JSON.stringify(user));
    if (user.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  const setLanguage = async (lang: 'fr' | 'en') => {
    setUser(prev => ({ ...prev, language: lang }));
    if (userId) {
      await supabase.from('profiles').update({ language: lang }).eq('id', userId);
    }
  };

  const setTheme = async (theme: 'dark' | 'light') => {
    setUser(prev => ({ ...prev, theme }));
    if (userId) {
      await supabase.from('profiles').update({ theme }).eq('id', userId);
    }
  };

  const togglePremium = async () => {
    const newRole = user.role === 'free' ? 'premium' : 'free';
    setUser(prev => ({ ...prev, role: newRole }));
    onToast(
      user.language === 'fr'
        ? `Status Premium ${newRole === 'premium' ? 'Activé 💎' : 'Désactivé'}`
        : `Premium Status ${newRole === 'premium' ? 'Activated 💎' : 'Deactivated'}`,
      'success'
    );
    if (userId) {
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    }
  };

  const completeOnboarding = async () => {
    setUser(prev => ({ ...prev, hasCompletedOnboarding: true }));
    setOnboardingActive(false);
    onToast(
      user.language === 'fr'
        ? '🛡️ Onboarding terminé ! Découvrez l’application.'
        : '🛡️ Onboarding complete! Navigate around the premium app.',
      'success'
    );
    if (userId) {
      await supabase.from('profiles').update({ has_completed_onboarding: true }).eq('id', userId);
    }
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
