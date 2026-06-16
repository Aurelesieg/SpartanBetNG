import React from 'react';
import { useApp } from '../../store/AppContext';
import { LayoutDashboard, Target, TrendingUp, GraduationCap, User, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../App';

export const Navbar: React.FC = () => {
  const { setActiveTab, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isFr = user.language === 'fr';

  const navItems = [
    {
      id: 'dashboard' as const,
      labelFr: 'Dashboard',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'analyses' as const,
      labelFr: 'Analyses',
      labelEn: 'Analyses',
      icon: Target,
    },
    {
      id: 'performance' as const,
      labelFr: 'Rendement',
      labelEn: 'Performance',
      icon: TrendingUp,
    },
    {
      id: 'school' as const,
      labelFr: 'Discipline',
      labelEn: 'Spartan School',
      icon: GraduationCap,
    },
    {
      id: 'profile' as const,
      labelFr: 'Configuration',
      labelEn: 'Settings',
      icon: User,
    },
  ];

  return (
    <>
      {/* 1. Desktop Sidebar - Fixed Left */}
      <aside className={`hidden md:flex flex-col w-64 shrink-0 h-[calc(100vh-73px)] sticky top-[73px] px-4 py-8 justify-between border-r ${
        user.theme === 'dark'
          ? 'bg-[#0D0D0F] border-white/5 text-white'
          : 'bg-white border-stone-200 text-stone-900'
      }`}>
        <div className="space-y-6">
          <div className={`p-4 rounded-xl border ${
            user.theme === 'dark'
              ? 'bg-gradient-to-br from-[#007ACC]/20 to-transparent border-[#0099FF]/20'
              : 'bg-[#E5F4FF]/50 border-[#99DAFF]'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#0099FF]" />
              <span className="font-mono text-xs text-[#0099FF] font-bold uppercase tracking-wider">
                {isFr ? 'Mental Spartan' : 'Spartan Mental'}
              </span>
            </div>
            <p className={`text-[11px] italic font-mono leading-relaxed ${
              user.theme === 'dark' ? 'text-neutral-400' : 'text-stone-600'
            }`}>
              {isFr 
                ? '"La discipline fait la différence entre un parieur récréatif et un investisseur."' 
                : '"Discipline makes the difference between a recreational bettor and an investor."'}
            </p>
          </div>

          <nav className="flex flex-col gap-1.5" id="desktop-nav">
            {navItems.map(item => {
              const Icon = item.icon;
              const route = ROUTES[item.id as keyof typeof ROUTES];
              const isActive = location.pathname === route || (route === '/' && location.pathname === '');
              return (
                <button
                  key={item.id}
                  id={`nav-desktop-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(route);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded uppercase tracking-wider font-semibold text-xs transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#007ACC] text-white shadow-[0_4px_12px_rgba(0,153,255,0.25)] font-bold'
                      : (user.theme === 'dark'
                          ? 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent hover:border-stone-200')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{isFr ? item.labelFr : item.labelEn}</span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Brand Bottom Indicator */}
        <div className="text-center">
          <p className={`text-[10px] font-mono ${user.theme === 'dark' ? 'text-neutral-500' : 'text-stone-400'}`}>
            {isFr ? 'Spartanbet Pro v1.0' : 'Spartanbet Pro v1.0'}
          </p>
          <p className={`text-[9px] font-mono mt-0.5 ${user.theme === 'dark' ? 'text-neutral-600' : 'text-stone-500'}`}>
            {isFr ? 'La discipline gagne à la fin' : 'Discipline wins at the end'}
          </p>
        </div>
      </aside>

      {/* 2. Mobile BottomNav - Fixed Bottom */}
      <nav 
        id="mobile-bottom-nav" 
        className={`md:hidden fixed bottom-0 left-0 right-0 h-16 backdrop-blur-md z-40 flex items-center justify-around px-2 pb-safe-bottom border-t ${
          user.theme === 'dark'
            ? 'bg-[#0F0F11]/95 border-white/5 text-white'
            : 'bg-white/95 border-stone-200 text-stone-900'
        }`}
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const route = ROUTES[item.id as keyof typeof ROUTES];
          const isActive = location.pathname === route || (route === '/' && location.pathname === '');
          return (
            <button
              key={item.id}
              id={`nav-mobile-${item.id}`}
              onClick={() => {
                setActiveTab(item.id);
                navigate(route);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 relative cursor-pointer ${
                isActive 
                  ? 'text-[#0099FF] font-black'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-semibold tracking-tight uppercase">
                {isFr ? item.labelFr : item.labelEn}
              </span>
              {isActive && (
                <span className="absolute bottom-0 h-1 w-5 rounded-full bg-[#0099FF]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
