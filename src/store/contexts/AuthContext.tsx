import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('[SpartanBet] getSession error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, password: string, name: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });
      return { error: error?.message ?? null };
    } catch (err: any) {
      console.error('[SpartanBet] signUp error:', err);
      return {
        error: 'Connection failed. Check your internet and try again.'
      };
    }
  };

  const signIn = async (
    email: string, password: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error: error?.message ?? null };
    } catch (err: any) {
      console.error('[SpartanBet] signIn error:', err);
      return {
        error: 'Connection failed. Check your internet and try again.'
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      isLoading,
      signUp,
      signIn,
      signOut,
      isAuthenticated: session !== null
    }}>
      {isLoading ? (
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0099FF]/20 border border-[#0099FF]/40 flex items-center justify-center">
            <span className="text-[#0099FF] font-black text-xl">S</span>
          </div>
          <div className="text-[#0099FF] font-mono text-xs tracking-widest animate-pulse uppercase">
            Spartan Bet — Chargement...
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
