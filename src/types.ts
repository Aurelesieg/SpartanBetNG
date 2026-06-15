export type SportType = 'football' | 'basketball' | 'tennis';

export interface MatchAnalysis {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: SportType;
  league: string;
  startTime: string;
  prediction: string;
  odds: number;
  confidence: number; // e.g., 85 for 85%
  category: 'Value Bet' | 'Sélection Safe' | 'Fun Combo' | 'Spéciale';
  analysisText: string;
  detailedAnalysis: string[];
  isPremium: boolean;
  status: 'pending' | 'won' | 'lost';
  liveScore?: string;
  liveMinute?: number;
}

export interface FollowedBet {
  id: string;
  analysisId: string;
  homeTeam: string;
  awayTeam: string;
  sport: SportType;
  prediction: string;
  odds: number;
  stakeAmount: number; // e.g. 50 (EUR) or based on currency
  stakePercent: number; // calculated % of current bankroll
  timestamp: string;
  status: 'pending' | 'won' | 'lost';
  notes?: string;
  psychologicalTags?: string[];
}

export interface Bankroll {
  balance: number;
  initialBalance: number;
  currency: string;
  isActive: boolean;
  monthlyGoalPercent?: number;
}

export interface UserProfile {
  name: string;
  role: 'free' | 'premium';
  theme: 'dark' | 'light';
  language: 'fr' | 'en';
  hasCompletedOnboarding?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'bet_outcome' | 'bankroll_alert' | 'system';
  isRead: boolean;
  betId?: string;
  outcome?: 'won' | 'lost';
}

export interface NotificationPrefs {
  betOutcomes: boolean;
  bankrollThreshold: boolean;
  bankrollThresholdValue: number;
  browserPush: boolean;
}

export interface SchoolLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: 'Débutant' | 'Intermédiaire' | 'Mental' | 'Gestion';
  content: string[];
  isCompleted: boolean;
}
