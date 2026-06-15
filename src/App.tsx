import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './components/features/Dashboard';
import { AnalysisDetail } from './components/features/AnalysisDetail';
import { PerformanceTracker } from './components/features/PerformanceTracker';
import { SpartanSchool } from './components/features/SpartanSchool';
import { ProfileSettings } from './components/features/ProfileSettings';
import { ToastContainer } from './components/ui/ToastContainer';
import { OnboardingTutorial } from './components/features/OnboardingTutorial';

export const ROUTES = {
  dashboard: '/',
  analyses: '/analyses',
  performance: '/performance',
  school: '/school',
  profile: '/profile',
} as const;

type ActiveTab = 'dashboard' | 'analyses' | 'performance' | 'school' | 'profile';

const MainLayout: React.FC = () => {
  const { user, setActiveTab, activeTab } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const map: Record<string, ActiveTab> = {
      '/': 'dashboard',
      '/analyses': 'analyses',
      '/performance': 'performance',
      '/school': 'school',
      '/profile': 'profile',
    };
    const tab = map[location.pathname] ?? 'dashboard';
    setActiveTab(tab);
  }, [location.pathname, setActiveTab]);

  useEffect(() => {
    if (ROUTES[activeTab] && location.pathname !== ROUTES[activeTab]) {
      navigate(ROUTES[activeTab]);
    }
  }, [activeTab, navigate, location.pathname]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      user.theme === 'dark' 
        ? 'bg-[#0A0A0B] text-white' 
        : 'bg-stone-50 text-stone-900'
    }`}>
      {/* 1. Global Header Info */}
      <Header />

      {/* 2. Responsive Content Container (Sidebar + Page views) */}
      <div className="flex-1 flex max-w-8xl w-full mx-auto pb-16 md:pb-0">
        
        {/* Navigation Sidebar/BottomNav */}
        <Navbar />

        {/* Dynamic page viewport */}
        <main className="flex-1 px-4 py-6 sm:px-6 md:px-8 overflow-y-auto max-w-full">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analyses" element={<AnalysisDetail />} />
          <Route path="/performance" element={<PerformanceTracker />} />
          <Route path="/school" element={<SpartanSchool />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
        </main>
      </div>

      {/* Onboarding walkthrough overlays */}
      <OnboardingTutorial />

      {/* 3. Non-intrusive notification banner manager */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
