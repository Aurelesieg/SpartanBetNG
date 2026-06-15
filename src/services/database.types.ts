export interface DbProfile {
  id: string;
  name: string;
  role: 'free' | 'premium';
  language: 'fr' | 'en';
  theme: 'dark' | 'light';
  has_completed_onboarding: boolean;
  premium_expires_at: string | null;
  created_at: string;
}

export interface DbAnalysis {
  id: string;
  home_team: string;
  away_team: string;
  sport: string;
  league: string;
  start_time: string;
  prediction: string;
  odds: number;
  confidence: number;
  category: string;
  analysis_text: string;
  detailed_analysis: string[];
  is_premium: boolean;
  status: 'pending' | 'won' | 'lost';
  live_score: string | null;
  live_minute: number | null;
  published_at: string;
  created_at: string;
}

export interface DbFollowedBet {
  id: string;
  user_id: string;
  analysis_id: string;
  home_team: string;
  away_team: string;
  prediction: string;
  odds: number;
  sport: string;
  stake_amount: number;
  stake_percent: number;
  status: 'pending' | 'won' | 'lost';
  notes: string | null;
  psychological_tags: string[];
  created_at: string;
}

export interface DbBankroll {
  id: string;
  user_id: string;
  balance: number;
  initial_balance: number;
  currency: string;
  is_active: boolean;
  monthly_goal_percent: number;
  updated_at: string;
}

export interface DbLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  completed_at: string | null;
}
