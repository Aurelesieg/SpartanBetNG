import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  User, Settings, Coins, ShieldAlert, Sparkles, 
  Trash2, RefreshCw, Languages, Sun, Moon, CheckCircle, XCircle,
  Bell, Flame, AlertCircle, ToggleLeft, ToggleRight, Laptop, HelpCircle, ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../store/contexts/AuthContext';

export const ProfileSettings: React.FC = () => {
  const { signOut } = useAuth();
  const { 
    user, bankroll, setLanguage, setTheme, togglePremium, 
    activateBankroll, adjustBankrollBalance, resetBankroll,
    notificationPrefs, updateNotificationPrefs, resolvePendingBets,
    requestDesktopNotifications, addSystemNotification, followedBets
  } = useApp();

  const isFr = user.language === 'fr';
  const [resolutions, setResolutions] = useState<Record<string, 'won' | 'lost'>>({});

  const pendingBets = followedBets.filter(b => b.status === 'pending');

  // Local state form variables
  const [initAmount, setInitAmount] = useState<number>(bankroll.initialBalance);
  const [currBalance, setCurrBalance] = useState<number>(bankroll.balance);
  const [currencyCode, setCurrencyCode] = useState<string>(bankroll.currency);

  const handleUpdateBankrollSetup = () => {
    activateBankroll(initAmount, currencyCode);
  };

  const handleUpdateBalanceValue = () => {
    adjustBankrollBalance(currBalance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20 max-w-4xl mx-auto"
    >
      
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-bold uppercase italic text-white font-sans tracking-tight">
          {isFr ? 'Configuration Globale' : 'System Configuration'}
        </h2>
        <p className="text-xs text-neutral-400 mt-1 font-mono">
          {isFr 
            ? 'Paramétrage des thèmes, de la devise locale et ajustement direct des coffres.'
            : 'Configure local systems, active currency settings and balance ledgers.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card Left: User Preferences */}
        <div className="bg-[#131316] border border-white/5 rounded-2xl p-5 md:p-6 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans border-b border-white/5 pb-3">
            <User className="w-4 h-4 text-orange-500" />
            {isFr ? 'Préférences Profil' : 'Profile Properties'}
          </h3>

          {/* Theme selection */}
          <div className="space-y-2">
            <label className="block text-xs text-neutral-500 font-bold uppercase tracking-wider font-mono">
              {isFr ? 'Thème visuel :' : 'Visual Theme:'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="theme-btn-dark"
                onClick={() => setTheme('dark')}
                className={`py-3 px-4 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  user.theme === 'dark'
                    ? 'bg-[#0A0A0B] text-orange-500 border-orange-500/50 shadow'
                    : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>{isFr ? 'Foncé (Défaut)' : 'Dark (Default)'}</span>
              </button>
              <button
                id="theme-btn-light"
                onClick={() => setTheme('light')}
                className={`py-3 px-4 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  user.theme === 'light'
                    ? 'bg-[#0A0A0B] text-orange-550 border-orange-500/50 shadow'
                    : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>{isFr ? 'Clair' : 'Light'}</span>
              </button>
            </div>

            <div className="pt-6">
              <button
                onClick={signOut}
                className="w-full py-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-wider hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                {isFr ? 'Se déconnecter' : 'Sign Out'}
              </button>
            </div>
          </div>

          {/* Language selection */}
          <div className="space-y-2">
            <label className="block text-xs text-neutral-500 font-bold uppercase tracking-wider font-mono">
              {isFr ? 'Langue de l’interface :' : 'System Language:'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="lang-btn-fr"
                onClick={() => setLanguage('fr')}
                className={`py-3 px-4 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  user.language === 'fr'
                    ? 'bg-[#0A0A0B] text-orange-500 border-orange-500/50'
                    : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700'
                }`}
              >
                <span>🇲🇳 Français</span>
              </button>
              <button
                id="lang-btn-en"
                onClick={() => setLanguage('en')}
                className={`py-3 px-4 rounded text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                  user.language === 'en'
                    ? 'bg-[#0A0A0B] text-orange-500 border-orange-500/50'
                    : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700'
                }`}
              >
                <span>🇺🇸 English</span>
              </button>
            </div>
          </div>

          {/* Account status upgrade */}
          <div className="bg-[#0A0A0B] p-4 rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-white uppercase font-mono tracking-tight animate-pulse">VIP Spartan Pro</span>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                user.role === 'premium' ? 'bg-orange-500/20 text-orange-400' : 'bg-[#131316] border border-white/5 text-neutral-400'
              }`}>
                {user.role === 'premium' ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
              {isFr 
                ? 'L’abonnement Premium déploie instantanément la totalité des analyses et value bets du logiciel.' 
                : 'Premium members capture locked system selections instantly and activate live stats models.'}
            </p>
            <button
              onClick={togglePremium}
              className={`w-full py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer items-center justify-center gap-1.5 flex ${
                user.role === 'premium'
                  ? 'bg-stone-900 text-stone-300 border border-stone-800 hover:bg-stone-850'
                  : 'bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.25)]'
              }`}
            >
              {user.role === 'premium' 
                ? (isFr ? 'Désactiver le mode Premium' : 'Return to Free Status') 
                : (isFr ? 'Passer en Premium (Gratuit)' : 'Unlock Premium Access Now')}
            </button>
          </div>
        </div>

        {/* Card Right: Bankroll parameters */}
        <div className="bg-[#131316] border border-white/5 rounded-2xl p-5 md:p-6 space-y-6">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans border-b border-white/5 pb-3">
            <Coins className="w-4 h-4 text-orange-500" />
            {isFr ? 'Ajustement Capital Bankroll' : 'Bankroll Configuration'}
          </h3>

          {/* Initial ledger set form */}
          <div className="space-y-3 bg-[#0A0A0B] p-4 border border-white/5 rounded-xl space-y-4">
            <span className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider leading-none">
              {isFr ? 'RECONFIGURER LE CAPITAL INITIAL' : 'REINITIALIZE CAPITAL'}
            </span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1">{isFr ? 'Somme initiale' : 'Starting funds'}</label>
                <input
                  type="number"
                  value={initAmount}
                  onChange={(e) => setInitAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="bg-[#0A0A0B] border border-white/5 rounded-lg p-2.5 w-full text-xs font-mono text-white text-center font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 font-mono mb-1">{isFr ? 'Symbole Devise' : 'Currency unit'}</label>
                <select
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  className="bg-[#0A0A0B] border border-white/5 rounded-lg p-2.5 w-full text-xs font-mono text-white text-center font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value="₦">NGN (₦)</option>
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="CFA">XOF (CFA)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleUpdateBankrollSetup}
              className="w-full bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-200 text-xs font-medium py-2 rounded transition-all cursor-pointer uppercase tracking-wider font-mono"
            >
              {isFr ? 'Définir Nouveau Capital' : 'Save Initial Capital'}
            </button>
          </div>

          {/* Direct balance override */}
          <div className="space-y-3 bg-[#0A0A0B] p-4 border border-white/5 rounded-xl space-y-4">
            <span className="block text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider leading-none">
              {isFr ? 'FAIRE UN AJUSTEMENT DE SOLDE' : 'OVERRIDE BALANCE DIRECTLY'}
            </span>
            <div>
              <label className="block text-[10px] text-neutral-400 font-mono mb-1">{isFr ? 'Solde actuel disponible' : 'Direct liquid pool adjustment'}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={currBalance}
                  onChange={(e) => setCurrBalance(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="bg-[#0A0A0B] border border-white/5 rounded-lg p-2.5 flex-1 text-xs font-mono text-white text-center font-bold"
                />
                <button
                  onClick={handleUpdateBalanceValue}
                  className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold uppercase tracking-wider rounded px-4 transition-all cursor-pointer"
                >
                  {isFr ? 'Ajuster' : 'Apply'}
                </button>
              </div>
            </div>
          </div>

          {/* Hard reset simulation */}
          <div className="pt-2">
            <button
              onClick={resetBankroll}
              className="w-full bg-rose-950/30 hover:bg-rose-950/50 border border-rose-900 text-rose-450 text-rose-300 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              <span>{isFr ? 'Réinitialiser la Démo complète' : 'Hard Reset Sandbox Demo'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. Dedicated Notification Hub & Simulator */}
      <div className="bg-[#131316] border border-white/5 rounded-2xl p-5 md:p-6 space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center justify-between font-sans border-b border-white/5 pb-3">
          <span className="flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-orange-500" />
            {isFr ? 'Spartan Notification Hub' : 'Notification Control Panel'}
          </span>
          <span className="text-[10px] font-mono text-neutral-500">
            {isFr ? 'ALERTE TEMPS RÉEL' : 'REAL-TIME PUSH TELEMETRY'}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Notification settings Preferences */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest font-mono">
              {isFr ? 'Préférences d\'alerte :' : 'Alert settings:'}
            </h4>

            {/* Preference: Bet Outcome Alerts */}
            <div className="flex items-center justify-between p-3 bg-[#0A0A0B] border border-white/5 rounded-xl">
              <div>
                <span className="block text-xs font-bold text-white">
                  {isFr ? 'Résultats des paris suivis' : 'Followed Pick Results'}
                </span>
                <span className="block text-[10px] text-neutral-500">
                  {isFr ? 'Recevoir une alerte immédiate quand le score final est disponible' : 'Notify immediately once game score is finalized'}
                </span>
              </div>
              <button
                id="toggle-outcome-notifications"
                onClick={() => updateNotificationPrefs({ betOutcomes: !notificationPrefs.betOutcomes })}
                className="text-orange-500 hover:scale-105 transition-all focus:outline-none cursor-pointer"
              >
                {notificationPrefs.betOutcomes ? (
                  <ToggleRight className="w-9 h-9" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Preference: Bankroll Threshold Alert */}
            <div className="flex items-center justify-between p-3 bg-[#0A0A0B] border border-white/5 rounded-xl">
              <div>
                <span className="block text-xs font-bold text-white">
                  {isFr ? 'Alerte de seuil de capital' : 'Bankroll Drop Alerts'}
                </span>
                <span className="block text-[10px] text-neutral-500">
                  {isFr ? 'Déclencher si votre balance descend sous la limite définie' : 'Trigger alert when liquid balance drops under customized mark'}
                </span>
              </div>
              <button
                id="toggle-threshold-notifications"
                onClick={() => updateNotificationPrefs({ bankrollThreshold: !notificationPrefs.bankrollThreshold })}
                className="text-orange-500 hover:scale-105 transition-all focus:outline-none cursor-pointer"
              >
                {notificationPrefs.bankrollThreshold ? (
                  <ToggleRight className="w-9 h-9" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Custom threshold input */}
            {notificationPrefs.bankrollThreshold && (
              <div className="p-3 bg-[#0A0A0B] border border-white/5 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-[11px] font-mono">
                  <span className="text-neutral-400">{isFr ? 'SEUIL LIMITE D\'ALERTE' : 'ALERT LIMIT THRESHOLD'}</span>
                  <span className="text-orange-500 font-bold">{notificationPrefs.bankrollThresholdValue} {bankroll.currency}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max={Math.max(5000, bankroll.initialBalance)}
                  step="50"
                  value={notificationPrefs.bankrollThresholdValue}
                  onChange={(e) => updateNotificationPrefs({ bankrollThresholdValue: parseInt(e.target.value) })}
                  className="w-full accent-orange-500 cursor-pointer h-1 bg-stone-850 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[9px] text-neutral-600 font-mono">
                  <span>100 {bankroll.currency}</span>
                  <span>{Math.max(5000, bankroll.initialBalance)} {bankroll.currency}</span>
                </div>
              </div>
            )}

            {/* Browser standard push notifications */}
            <div className="flex items-center justify-between p-3 bg-[#0A0A0B] border border-white/5 rounded-xl">
              <div>
                <span className="block text-xs font-bold text-white flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-neutral-400" />
                  {isFr ? 'Notifications système de bureau' : 'Desktop Browser Notifications'}
                </span>
                <span className="block text-[10px] text-neutral-500">
                  {isFr ? 'Autoriser le navigateur à envoyer des bannières system push' : 'Request native OS notifications permission'}
                </span>
              </div>
              <button
                id="request-desktop-notifs"
                onClick={async () => {
                  const allowed = await requestDesktopNotifications();
                  updateNotificationPrefs({ browserPush: allowed });
                }}
                className={`text-xs px-3 py-1.5 rounded font-bold font-mono transition-all cursor-pointer ${
                  notificationPrefs.browserPush 
                    ? 'bg-[#0E1E15] text-emerald-400 border border-emerald-900/60' 
                    : 'bg-stone-900 text-stone-300 border border-stone-800 hover:bg-stone-850'
                }`}
              >
                {notificationPrefs.browserPush ? (isFr ? 'ACTIF ✓' : 'ACTIVE ✓') : (isFr ? 'ACTIVER' : 'ENABLE')}
              </button>
            </div>
          </div>

          {/* Simulated Playground Container */}
          <div className="space-y-4 bg-[#0A0A0B] p-4 rounded-xl border border-white/5">
            <div>
              <h4 className="text-xs font-bold text-orange-500 uppercase tracking-widest font-mono flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {isFr ? 'Simulations d\'Action & Diagnostics' : 'Sandbox Playgrounds'}
              </h4>
              <p className="text-[10px] text-neutral-500 leading-relaxed font-sans mt-0.5">
                {isFr 
                  ? 'Entraînez le comportement des alertes en simulant manuellement des faits réels.' 
                  : 'Test the push alerts in real-time by spawning simulated outcome evaluations or capital drawdowns.'}
              </p>
            </div>

            <div className="space-y-3 pt-3">
              {/* Admin UI: Manual Bet Resolution */}
              <div className="w-full p-3 bg-[#131316] border border-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="block text-xs font-bold text-white">
                    {isFr ? '⚡ Résolution des Paris Suspendus' : '⚡ Pending Bets Resolution'}
                  </span>
                  <span className="bg-orange-500/10 text-orange-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                    {pendingBets.length} {isFr ? 'en attente' : 'pending'}
                  </span>
                </div>

                {pendingBets.length > 0 ? (
                  <div className="space-y-3">
                    {pendingBets.map(bet => (
                      <div key={bet.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded bg-[#0A0A0B] border border-white/5 gap-2">
                        <div>
                          <p className="text-[10px] font-bold text-white font-mono">{bet.homeTeam} vs {bet.awayTeam}</p>
                          <p className="text-[9px] text-neutral-400">{bet.prediction} @ {bet.odds.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setResolutions(prev => ({ ...prev, [bet.id]: 'won' }))}
                            className={`px-2 py-1 rounded text-[9px] font-bold font-mono transition-colors border flex items-center gap-1 cursor-pointer ${
                              resolutions[bet.id] === 'won'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                                : 'bg-transparent text-neutral-500 border-white/10 hover:border-emerald-500/50 hover:text-emerald-400'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" /> {isFr ? 'Gagné' : 'Won'}
                          </button>
                          <button
                            onClick={() => setResolutions(prev => ({ ...prev, [bet.id]: 'lost' }))}
                            className={`px-2 py-1 rounded text-[9px] font-bold font-mono transition-colors border flex items-center gap-1 cursor-pointer ${
                              resolutions[bet.id] === 'lost'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                                : 'bg-transparent text-neutral-500 border-white/10 hover:border-rose-500/50 hover:text-rose-400'
                            }`}
                          >
                            <XCircle className="w-3 h-3" /> {isFr ? 'Perdu' : 'Lost'}
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const resArray = Object.entries(resolutions).map(([betId, outcome]) => ({ betId, outcome }));
                        if (resArray.length > 0) {
                          resolvePendingBets(resArray);
                          setResolutions({});
                        }
                      }}
                      disabled={Object.keys(resolutions).length === 0}
                      className="w-full mt-2 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {isFr ? 'Confirmer les Résultats' : 'Confirm Results'}
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] text-neutral-500 italic text-center py-2">
                    {isFr ? 'Aucun pari en attente.' : 'No pending bets to resolve.'}
                  </p>
                )}
              </div>

              {/* Trigger: Simulate Threshold Crash */}
              <button
                onClick={() => {
                  const targetCrash = notificationPrefs.bankrollThresholdValue - 50;
                  adjustBankrollBalance(targetCrash);
                  addSystemNotification(
                    isFr ? '📉 Seuil Critique Déclenché' : '📉 Critical Threshold Triggered',
                    isFr 
                      ? `Le capital disponible a été abaissé à ${targetCrash} ₦ pour tester la notification de seuil.`
                      : `Liquid cash was lowered to ${targetCrash} ₦ in order to prompt threshold alarms.`,
                    'system'
                  );
                }}
                className="w-full flex items-center justify-between p-3 bg-[#131316] hover:bg-stone-900 border border-white/5 rounded-lg text-left transition-all cursor-pointer group"
              >
                <div>
                  <span className="block text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                    {isFr ? '📉 Forcer Seuil Alerte Capital' : '📉 Force Balance Under Threshold'}
                  </span>
                  <span className="block text-[10px] text-neutral-400">
                    {isFr 
                      ? 'Force le capital sous le seuil pour tester l\'alerte automatique'
                      : 'Deplete balance under limit to test the instant automated warning'}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
};
