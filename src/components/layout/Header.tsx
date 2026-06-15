import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Shield, Coins, Sparkles, Languages, Sun, Moon, Bell, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const { 
    user, bankroll, togglePremium, setLanguage, setTheme,
    notifications, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications,
    setActiveTab, addCustomBet, showQuickAdd, setShowQuickAdd
  } = useApp();

  const isFr = user.language === 'fr';
  const [isOpen, setIsOpen] = useState(false);

  // Quick Add Bet Modal State
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [prediction, setPrediction] = useState('');
  const [odds, setOdds] = useState('1.80');
  const [stakeAmount, setStakeAmount] = useState('50');
  const [status, setStatus] = useState<'pending' | 'won' | 'lost'>('pending');
  const [notesInput, setNotesInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedOdds = parseFloat(odds);
    const parsedStake = parseFloat(stakeAmount);

    if (isNaN(parsedOdds) || parsedOdds <= 1) {
      setErrorMsg(isFr ? 'La cote doit être supérieure à 1.0.' : 'Odds must be decimal value greater than 1.0.');
      return;
    }

    if (isNaN(parsedStake) || parsedStake <= 0) {
      setErrorMsg(isFr ? 'La mise doit être supérieure à 0.' : 'Stake must be a positive number.');
      return;
    }

    if (bankroll.balance < parsedStake) {
      setErrorMsg(isFr 
        ? `Solde insuffisant. Votre balance est de ${bankroll.balance} ${bankroll.currency}` 
        : `Insufficient funds. Your active balance is ${bankroll.balance} ${bankroll.currency}`
      );
      return;
    }

    const res = await addCustomBet({
      homeTeam,
      awayTeam,
      prediction,
      odds: parsedOdds,
      stakeAmount: parsedStake,
      status,
      notes: notesInput,
      psychologicalTags: selectedTags
    });

    if (res.success) {
      // Reset state form fields and close modal
      setHomeTeam('');
      setAwayTeam('');
      setPrediction('');
      setOdds('1.80');
      setStakeAmount('50');
      setStatus('pending');
      setNotesInput('');
      setSelectedTags([]);
      setErrorMsg('');
      setShowQuickAdd(false);
    } else if (res.error) {
      setErrorMsg(res.error);
    }
  };

  return (
    <header className={`sticky top-0 z-40 px-4 py-4 sm:px-6 transition-all duration-200 ${
      user.theme === 'dark'
        ? 'bg-[#0F0F11] border-b border-white/5 text-white'
        : 'bg-white border-b border-stone-200 text-stone-900'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 text-white font-black shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <span className="italic font-bold text-lg">S</span>
            {user.role === 'premium' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-orange-500 font-bold">
                Alpha 1.0
              </span>
              <span className={`h-1 w-1 rounded-full ${user.theme === 'dark' ? 'bg-neutral-700' : 'bg-neutral-300'}`}></span>
              <span className={`font-mono text-[10px] uppercase tracking-wider ${user.theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                {user.role === 'premium' ? 'Premium Profile' : 'Standard'}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tighter text-white flex items-center gap-1.5 font-sans uppercase italic">
              <span className={user.theme === 'dark' ? 'text-white' : 'text-stone-900'}>SPARTAN</span>
              <span className="text-orange-500">BET</span>
            </h1>
          </div>
        </div>

        {/* Global Stats / Quick view */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          
          {/* Quick Bankroll Balance */}
          {bankroll.isActive && (
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border ${
              user.theme === 'dark'
                ? 'bg-white/5 border-white/5 hover:bg-white/10'
                : 'bg-stone-100 border-stone-200 hover:bg-stone-200/80'
            }`}>
              <Coins className="w-4 h-4 text-orange-500" />
              <div className="text-right">
                <span className={`block text-[9px] uppercase tracking-wider font-bold ${
                  user.theme === 'dark' ? 'text-neutral-500' : 'text-stone-500'
                }`}>
                  {isFr ? 'SOLDE' : 'BALANCE'}
                </span>
                <span className={`font-mono text-xs font-bold leading-none ${
                  user.theme === 'dark' ? 'text-neutral-100' : 'text-stone-900'
                }`}>
                  {bankroll.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {bankroll.currency}
                </span>
              </div>
            </div>
          )}

          {/* Quick Add Bet Trigger Button */}
          {bankroll.isActive && (
            <button
              id="quick-add-bet-btn"
              onClick={() => setShowQuickAdd(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded bg-orange-600/10 border border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-600/20 text-orange-400 transition-all cursor-pointer uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] focus:outline-none"
              title={isFr ? 'Ajouter rapidement un pari' : 'Quickly record custom bet ticket'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">
                {isFr ? 'PARI RAPIDE' : 'QUICK BET'}
              </span>
              <span className="inline xs:hidden">
                +
              </span>
            </button>
          )}

          {/* Premium Quick Toggle */}
          <button
            id="premium-toggle-btn"
            onClick={togglePremium}
            className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded transition-all duration-200 cursor-pointer uppercase tracking-wider ${
              user.role === 'premium'
                ? 'bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                : (user.theme === 'dark'
                    ? 'bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200')
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">
              {user.role === 'premium' 
                ? (isFr ? 'PRO PREMIUM' : 'PRO ACTIVE') 
                : (isFr ? 'GO PREMIUM' : 'UPGRADE')}
            </span>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center border focus:outline-none ${
                user.theme === 'dark'
                  ? 'bg-white/5 border-white/5 hover:bg-white/10 text-neutral-300 animate-none'
                  : 'bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-700 animate-none'
              }`}
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-black text-white font-mono animate-pulse">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setIsOpen(false)} 
                />
                
                <div className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border p-4 shadow-xl z-50 transition-all font-sans ${
                  user.theme === 'dark'
                    ? 'bg-[#131115] border-white/10 text-white shadow-[0_15px_30px_rgba(0,0,0,0.6)]'
                    : 'bg-white border-stone-200 text-stone-900 shadow-[0_15px_30px_rgba(0,0,0,0.1)]'
                }`}>
                  <div className="flex items-center justify-between border-b pb-3 mb-3 border-white/5">
                    <div className="flex items-center gap-1.5 flex-1 select-none">
                      <Bell className="w-4 h-4 text-orange-500" />
                      <h4 className="font-bold text-xs tracking-tight uppercase italic">{isFr ? 'Dernières Alertes' : 'Recent Alerts'}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          markAllNotificationsAsRead();
                        }}
                        className="text-[10px] text-orange-500 font-bold uppercase tracking-wider hover:underline cursor-pointer"
                        title={isFr ? 'Marquer tout comme lu' : 'Mark all as read'}
                      >
                        {isFr ? 'Tout lu' : 'All Read'}
                      </button>
                      <span className="text-neutral-700 text-xs text-opacity-40 select-none">|</span>
                      <button
                        onClick={() => {
                          clearNotifications();
                        }}
                        className="text-[10px] text-red-500 font-bold uppercase tracking-wider hover:underline cursor-pointer"
                        title={isFr ? 'Tout effacer' : 'Clear all'}
                      >
                        {isFr ? 'Effacer' : 'Clear'}
                      </button>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1 select-none">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-xs text-neutral-500 font-medium">
                          {isFr ? 'Aucune notification reçue' : 'Your slate is currently empty'}
                        </p>
                      </div>
                    ) : (
                      notifications.map(notif => {
                        let iconNode = <span className="p-1 rounded bg-orange-650/10 text-orange-400 text-xs select-none">🔔</span>;
                        if (notif.type === 'bet_outcome') {
                          iconNode = notif.outcome === 'won' ? (
                            <span className="p-1 rounded bg-emerald-950 text-emerald-400 text-xs font-bold leading-none select-none">🏆</span>
                          ) : (
                            <span className="p-1 rounded bg-rose-950 text-rose-400 text-xs font-bold leading-none select-none">❌</span>
                          );
                        } else if (notif.type === 'bankroll_alert') {
                          iconNode = <span className="p-1 rounded bg-amber-950 text-amber-500 text-xs font-bold leading-none select-none">⚠️</span>;
                        }

                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.type === 'bankroll_alert') {
                                setActiveTab('profile');
                                setIsOpen(false);
                              } else if (notif.type === 'bet_outcome') {
                                setActiveTab('performance');
                                setIsOpen(false);
                              }
                            }}
                            className={`p-3 rounded-xl border text-left transition-all relative flex gap-3 cursor-pointer ${
                              notif.isRead 
                                ? (user.theme === 'dark' ? 'bg-[#0A0A0B]/40 border-white/5 opacity-65' : 'bg-stone-50 border-stone-100 opacity-65')
                                : (user.theme === 'dark' ? 'bg-[#18181C] border-orange-500/10 hover:border-orange-500/20' : 'bg-orange-50/40 border-orange-200 hover:border-orange-300')
                            }`}
                          >
                            <div className="self-start shrink-0">{iconNode}</div>
                            <div className="space-y-1 flex-1">
                              <h5 className={`text-xs font-bold leading-snug ${
                                notif.isRead 
                                  ? (user.theme === 'dark' ? 'text-neutral-400' : 'text-stone-600')
                                  : (user.theme === 'dark' ? 'text-white' : 'text-stone-900')
                              }`}>
                                {notif.title}
                              </h5>
                              <p className="text-[10px] text-neutral-400 leading-relaxed font-sans">
                                {notif.message}
                              </p>
                              <span className="block text-[8px] font-mono font-bold text-neutral-500 text-right">
                                {notif.timestamp}
                              </span>
                            </div>
                            {!notif.isRead && (
                              <span className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-orange-500" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Controls Bar for Lang / Theme */}
          <div className={`flex items-center gap-1 border-l pl-2 sm:pl-4 ${
            user.theme === 'dark' ? 'border-white/5' : 'border-stone-200'
          }`}>
            
            {/* Lang Toggle */}
            <button
              onClick={() => setLanguage(user.language === 'fr' ? 'en' : 'fr')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                user.theme === 'dark'
                  ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title={isFr ? 'Switch to English' : 'Passer au Français'}
              id="lang-toggle-btn"
            >
              <Languages className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(user.theme === 'dark' ? 'light' : 'dark')}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                user.theme === 'dark'
                  ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
              }`}
              title={isFr ? 'Changer de thème' : 'Change theme'}
              id="theme-toggle-btn"
            >
              {user.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-orange-500" />
              ) : (
                <Moon className="w-4 h-4 text-stone-500" />
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Quick Add Bet Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQuickAdd(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl z-10 overflow-hidden font-sans ${
                user.theme === 'dark'
                  ? 'bg-[#131115] border-white/10 text-white'
                  : 'bg-white border-stone-200 text-stone-900 shadow-xl'
              }`}
            >
              {/* modal header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-orange-500/10 text-orange-500">
                    <Plus className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-white uppercase italic">
                      {isFr ? 'Saisie de Pari Rapide' : 'Quick Bet Ticket Entry'}
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      {isFr ? 'Enregistrez instantanément un pronostic' : 'Instantly log any customized ticket'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQuickAdd(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleQuickAddSubmit} className="space-y-4">
                
                {/* Teams / Event */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                      {isFr ? 'Équipe Domicile' : 'Home Team'}
                    </label>
                    <input
                      type="text"
                      value={homeTeam}
                      onChange={e => { setHomeTeam(e.target.value); setErrorMsg(''); }}
                      placeholder="e.g. Real Madrid"
                      className={`w-full text-xs px-3 py-2 rounded-lg border transition-all ${
                        user.theme === 'dark'
                          ? 'bg-[#0A0A0B] border-white/5 text-white focus:border-orange-500/50 focus:outline-none'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500 focus:outline-none'
                      }`}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                      {isFr ? 'Équipe Extérieur' : 'Away Team'}
                    </label>
                    <input
                      type="text"
                      value={awayTeam}
                      onChange={e => { setAwayTeam(e.target.value); setErrorMsg(''); }}
                      placeholder="e.g. Man City"
                      className={`w-full text-xs px-3 py-2 rounded-lg border transition-all ${
                        user.theme === 'dark'
                          ? 'bg-[#0A0A0B] border-white/5 text-white focus:border-orange-500/50 focus:outline-none'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500 focus:outline-none'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Prediction */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                    {isFr ? 'Pronostic / Pari' : 'Prediction Match Market'}
                  </label>
                  <input
                    type="text"
                    value={prediction}
                    onChange={e => { setPrediction(e.target.value); setErrorMsg(''); }}
                    placeholder={isFr ? 'Match nul ou Victoire, Moins de 2.5 buts...' : 'e.g. Draw or away win, Over 2.5 goals'}
                    className={`w-full text-xs px-3 py-2 rounded-lg border transition-all ${
                      user.theme === 'dark'
                        ? 'bg-[#0A0A0B] border-white/5 text-white focus:border-orange-500/50 focus:outline-none'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500 focus:outline-none'
                    }`}
                    required
                  />
                </div>

                {/* Odds & Stake */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                      {isFr ? 'Cote' : 'Odds Decimals'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={odds}
                      onChange={e => { setOdds(e.target.value); setErrorMsg(''); }}
                      placeholder="1.85"
                      className={`w-full text-xs px-3 py-2 rounded-lg border transition-all font-mono ${
                        user.theme === 'dark'
                          ? 'bg-[#0A0A0B] border-white/5 text-white focus:border-orange-500/50 focus:outline-none'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500 focus:outline-none'
                      }`}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                        {isFr ? 'Mise' : 'Stake Amount'} ({bankroll.currency})
                      </label>
                      {Number(stakeAmount) > 0 && bankroll.balance > 0 && (
                        <span className={`text-[8px] font-mono font-bold ${
                          (Number(stakeAmount) / bankroll.balance) * 100 > 5 ? 'text-orange-500 font-black' : 'text-neutral-500'
                        }`}>
                          {((Number(stakeAmount) / bankroll.balance) * 100).toFixed(1)}% {isFr ? 'capital' : 'bankroll'}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={stakeAmount}
                      onChange={e => { setStakeAmount(e.target.value); setErrorMsg(''); }}
                      placeholder="50"
                      className={`w-full text-xs px-3 py-2 rounded-lg border transition-all font-mono ${
                        user.theme === 'dark'
                          ? 'bg-[#0A0A0B] border-white/5 text-white focus:border-orange-500/50 focus:outline-none'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500 focus:outline-none'
                      }`}
                      required
                    />
                  </div>
                </div>

                {/* Outcome Status Picker */}
                <div className="space-y-1 pb-1">
                  <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                    {isFr ? 'Statut initial du pari' : 'Initial Settlement Status'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('pending')}
                      className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold font-mono uppercase tracking-wider transition-all select-none cursor-pointer ${
                        status === 'pending'
                          ? 'bg-amber-600/15 border-amber-500 text-amber-500 font-extrabold'
                          : 'bg-[#0A0A0B] border-white/5 text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      ⏳ {isFr ? 'En cours' : 'Pending'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('won')}
                      className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold font-mono uppercase tracking-wider transition-all select-none cursor-pointer ${
                        status === 'won'
                          ? 'bg-emerald-600/15 border-emerald-500 text-emerald-400 font-extrabold'
                          : 'bg-[#0A0A0B] border-white/5 text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      🏆 {isFr ? 'Gagné' : 'Won'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('lost')}
                      className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold font-mono uppercase tracking-wider transition-all select-none cursor-pointer ${
                        status === 'lost'
                          ? 'bg-rose-600/15 border-rose-500 text-rose-500 font-extrabold'
                          : 'bg-[#0A0A0B] border-white/5 text-neutral-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      ❌ {isFr ? 'Perdu' : 'Lost'}
                    </button>
                  </div>
                </div>

                {/* Notes Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                    {isFr ? 'Notes de discipline / Analyse qualitative' : 'Betting Notes & Qualitative Reasons'}
                  </label>
                  <textarea
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    placeholder={isFr ? 'Raison stratégique, forme des joueurs, fatigue...' : 'e.g., Strategic reason, form of players, fatigue...'}
                    rows={2}
                    className={`w-full text-xs px-3 py-2 rounded-lg border transition-all resize-none ${
                      user.theme === 'dark'
                        ? 'bg-[#0A0A0B] border-white/5 text-white focus:border-orange-500/50 focus:outline-none'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500 focus:outline-none'
                    }`}
                  />
                </div>

                {/* Psychological Tags */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                    {isFr ? "État d'esprit psychologique" : 'Psychological State Tags'}
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {[
                      { id: 'calculated', label: isFr ? 'Calculé 📐' : 'Calculated 📐' },
                      { id: 'disciplined', label: isFr ? 'Discipliné 🛡️' : 'Disciplined 🛡️' },
                      { id: 'confident', label: isFr ? 'Confiant 💪' : 'Confident 💪' },
                      { id: 'fomo', label: 'FOMO 📈' },
                      { id: 'impulsive', label: isFr ? 'Impulsif ⚡' : 'Impulsive ⚡' },
                      { id: 'tilt', label: 'Tilt 😡' },
                      { id: 'bored', label: isFr ? 'Ennui 💤' : 'Bored 💤' },
                    ].map(tagConfig => {
                      const isSelected = selectedTags.includes(tagConfig.id);
                      return (
                        <button
                          key={tagConfig.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTags(prev => prev.filter(t => t !== tagConfig.id));
                            } else {
                              setSelectedTags(prev => [...prev, tagConfig.id]);
                            }
                          }}
                          className={`px-2 py-1 rounded-md text-[9px] font-mono font-bold transition-all border cursor-pointer select-none ${
                            isSelected
                              ? 'bg-orange-500/15 border-orange-500 text-orange-400 font-extrabold'
                              : 'bg-[#0A0A0B] border-white/5 text-neutral-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {tagConfig.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error Feedbacks */}
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[10px] text-rose-500 font-bold bg-rose-500/10 rounded-lg p-2 text-center"
                  >
                    ⚠️ {errorMsg}
                  </motion.p>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAdd(false)}
                    className="py-2.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:text-white text-neutral-400 text-xs font-bold uppercase tracking-wider font-mono transition-all cursor-pointer"
                  >
                    {isFr ? 'Annuler' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 rounded-lg bg-orange-650 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider font-mono transition-all cursor-pointer shadow-[0_4px_12px_rgba(249,115,22,0.3)] hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isFr ? 'Confirmer' : 'Confirm Bet'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </header>
  );
};
