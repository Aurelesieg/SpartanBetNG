import React from 'react';
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

const MainLayout: React.FC = () => {
  const { activeTab, user } = useApp();

  // Switch between views depending on active navigation tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'analyses':
        return <AnalysisDetail />;
      case 'performance':
        return <PerformanceTracker />;
      case 'school':
        return <SpartanSchool />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <Dashboard />;
    }
  };

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
          {renderTabContent()}
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
