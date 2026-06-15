import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MatchAnalysis } from '../../types';
import { INITIAL_ANALYSES } from '../mockData';

interface AnalysesContextType {
  analyses: MatchAnalysis[];
  fetchStatus: 'idle' | 'loading' | 'success' | 'error';
  lastFetched: number | null;
  selectedAnalysis: MatchAnalysis | null;
  refreshAnalyses: () => Promise<void>;
  pushSpartanAnalysis: (analysis: MatchAnalysis) => void;
  removeSpartanAnalysis: (id: string) => void;
  clearSpartanAnalyses: () => void;
  setSelectedAnalysis: (match: MatchAnalysis | null) => void;
}

const AnalysesContext = createContext<AnalysesContextType | undefined>(undefined);

const L_SPARTAN_ANALYSES = 'spartanbet_spartan_analyses';

export const AnalysesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [spartanAnalyses, setSpartanAnalyses] = useState<MatchAnalysis[]>(() => {
    const saved = localStorage.getItem(L_SPARTAN_ANALYSES);
    if (saved) return JSON.parse(saved);
    return INITIAL_ANALYSES;
  });

  const [liveFixtures, setLiveFixtures] = useState<MatchAnalysis[]>([]);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<MatchAnalysis | null>(null);

  useEffect(() => {
    localStorage.setItem(L_SPARTAN_ANALYSES, JSON.stringify(spartanAnalyses));
  }, [spartanAnalyses]);

  const fetchLiveFixtures = useCallback(async () => {
    const apiKey = import.meta.env.VITE_API_FOOTBALL_KEY;
    if (!apiKey) {
      setFetchStatus('error');
      return;
    }

    try {
      setFetchStatus('loading');

      const today = new Date().toISOString().split('T')[0];
      const url = `https://v3.football.api-sports.io/fixtures?date=${today}&status=NS-1H-2H-HT`;

      const response = await fetch(url, {
        headers: {
          'x-apisports-key': apiKey,
        }
      });

      if (!response.ok) {
        throw new Error('API fetch failed');
      }

      const data = await response.json();

      if (data.response && Array.isArray(data.response)) {
        const fixtures: MatchAnalysis[] = data.response.slice(0, 20).map((fix: any) => ({
          id: `api-${fix.fixture.id}`,
          homeTeam: fix.teams.home.name,
          awayTeam: fix.teams.away.name,
          sport: 'football',
          league: fix.league.name,
          startTime: new Date(fix.fixture.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          prediction: '',
          odds: 0,
          confidence: 0,
          category: 'Fun Combo', // Default
          analysisText: '',
          detailedAnalysis: [],
          isPremium: false,
          status: 'pending',
          liveScore: fix.goals.home !== null ? `${fix.goals.home} - ${fix.goals.away}` : undefined,
          liveMinute: fix.fixture.status.elapsed || undefined
        }));

        setLiveFixtures(fixtures);
        setFetchStatus('success');
      } else {
        setLiveFixtures([]);
        setFetchStatus('success');
      }
    } catch (err) {
      console.error('Error fetching API-Football:', err);
      setFetchStatus('error');
    } finally {
      setLastFetched(Date.now());
    }
  }, []);

  useEffect(() => {
    fetchLiveFixtures();
    const interval = setInterval(fetchLiveFixtures, 5 * 60 * 1000); // 5 mins
    return () => clearInterval(interval);
  }, [fetchLiveFixtures]);

  const refreshAnalyses = async () => {
    await fetchLiveFixtures();
  };

  const pushSpartanAnalysis = (analysis: MatchAnalysis) => {
    setSpartanAnalyses(prev => [analysis, ...prev.filter(a => a.id !== analysis.id)]);
  };

  const removeSpartanAnalysis = (id: string) => {
    setSpartanAnalyses(prev => prev.filter(a => a.id !== id));
  };

  const clearSpartanAnalyses = () => {
    setSpartanAnalyses([]);
  };

  // Merge strategy: spartanAnalyses first, then liveFixtures deduplicated by id
  const analyses = [
    ...spartanAnalyses,
    ...liveFixtures.filter(lf => !spartanAnalyses.some(sa => sa.id === lf.id))
  ];

  return (
    <AnalysesContext.Provider value={{
      analyses,
      fetchStatus,
      lastFetched,
      selectedAnalysis,
      refreshAnalyses,
      pushSpartanAnalysis,
      removeSpartanAnalysis,
      clearSpartanAnalyses,
      setSelectedAnalysis
    }}>
      {children}
    </AnalysesContext.Provider>
  );
};

export const useAnalyses = () => {
  const context = useContext(AnalysesContext);
  if (!context) throw new Error('useAnalyses must be used within an AnalysesProvider');
  return context;
};
