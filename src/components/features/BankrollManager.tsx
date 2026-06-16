import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  PiggyBank, ArrowDownLeft, ArrowUpRight, ShieldCheck, RefreshCw, 
  Trash2, CreditCard, Key, AlertCircle, Coins, Plus, Minus, Settings, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LedgerTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'adjustment';
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

export const BankrollManager: React.FC = () => {
  const { user, bankroll, adjustBankrollBalance, addToast, followedBets } = useApp();
  const isFr = user.language === 'fr';

  // State for transaction ledger
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(() => {
    const saved = localStorage.getItem('spartanbet_bankroll_ledger_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }

    // Seed data corresponding to the initial mock experience
    const initialSeed: LedgerTransaction[] = [
      {
        id: 'tx_seed_1',
        type: 'deposit',
        amount: 1200,
        balanceAfter: 1200,
        description: isFr ? 'Ouverture de Bankroll Spartan' : 'Spartan Bankroll Launch Depot',
        timestamp: '01 Juin, 10:00'
      },
      {
        id: 'tx_seed_2',
        type: 'deposit',
        amount: 500,
        balanceAfter: 1700,
        description: isFr ? 'Réévaluation & Dépôt tactique' : 'Tactical Booster Deposit',
        timestamp: '06 Juin, 15:30'
      },
      {
        id: 'tx_seed_3',
        type: 'withdrawal',
        amount: 250,
        balanceAfter: 1450,
        description: isFr ? 'Retrait discipliné de bénéfices' : 'Disciplined Profit Withdrawal',
        timestamp: '11 Juin, 18:45'
      }
    ];
    return initialSeed;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('spartanbet_bankroll_ledger_v2', JSON.stringify(transactions));
  }, [transactions]);

  // Form states
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdrawal' | 'adjustment'>('deposit');
  const [amountInput, setAmountInput] = useState('200');
  const [descInput, setDescInput] = useState('');
  const [balanceInput, setBalanceInput] = useState(bankroll.balance.toString());

  // Responsible gambling warning indicators based on amount sizes
  const parsedAmountVal = parseFloat(amountInput) || 0;
  const isLargeAmount = parsedAmountVal >= (bankroll.initialBalance * 0.5) || (bankroll.currency !== '₦' && parsedAmountVal >= 500) || (bankroll.currency === '₦' && parsedAmountVal >= 50000);

  const parsedAdjustVal = parseFloat(balanceInput) || 0;
  const isLargeAdjust = Math.abs(parsedAdjustVal - bankroll.balance) >= (bankroll.initialBalance * 0.5) || (bankroll.currency !== '₦' && Math.abs(parsedAdjustVal - bankroll.balance) >= 500) || (bankroll.currency === '₦' && Math.abs(parsedAdjustVal - bankroll.balance) >= 50000);

  // Keep direct balance sync when global changes occur
  useEffect(() => {
    setBalanceInput(bankroll.balance.toString());
  }, [bankroll.balance]);

  // Handle deposit or withdrawal log
  const handleLogTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amountInput);

    if (isNaN(amountVal) || amountVal <= 0) {
      addToast(
        isFr ? 'Veuillez entrer un montant positif.' : 'Please enter a positive numeric value.',
        'error'
      );
      return;
    }

    if (activeTab === 'withdrawal' && bankroll.balance < amountVal) {
      addToast(
        isFr 
          ? `Solde insuffisant pour ce retrait de ${amountVal} ${bankroll.currency}.` 
          : `Insufficient funds for this withdrawal of ${amountVal} ${bankroll.currency}.`,
        'error'
      );
      return;
    }

    const calculatedNewBalance = activeTab === 'deposit' 
      ? Number((bankroll.balance + amountVal).toFixed(2))
      : Number((bankroll.balance - amountVal).toFixed(2));

    const defaultDesc = activeTab === 'deposit'
      ? (isFr ? 'Dépôt manuel' : 'Manual Deposit')
      : (isFr ? 'Retrait manuel' : 'Manual Withdrawal');

    const newTx: LedgerTransaction = {
      id: Math.random().toString(36).substring(2, 9),
      type: activeTab,
      amount: amountVal,
      balanceAfter: calculatedNewBalance,
      description: descInput.trim() || defaultDesc,
      timestamp: new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Update Transaction Ledger State
    setTransactions(prev => [newTx, ...prev]);
    
    // Propagate to global App context state
    adjustBankrollBalance(calculatedNewBalance);

    // Toast feedback
    addToast(
      isFr 
        ? `Mouvement enregistré : ${activeTab === 'deposit' ? '+' : '-'}${amountVal} ${bankroll.currency}`
        : `Transaction logged: ${activeTab === 'deposit' ? '+' : '-'}${amountVal} ${bankroll.currency}`,
      'success'
    );

    // Reset inputs
    setAmountInput('100');
    setDescInput('');
  };

  // Direct balance set adjustment
  const handleDirectAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBalance = parseFloat(balanceInput);

    if (isNaN(targetBalance) || targetBalance < 0) {
      addToast(
        isFr ? 'Balance cible invalide.' : 'Invalid target balance value.',
        'error'
      );
      return;
    }

    const currentBalance = bankroll.balance;
    const diff = targetBalance - currentBalance;

    if (Math.abs(diff) < 0.01) {
      addToast(
        isFr ? 'Aucun changement de solde.' : 'No change detected in target balance.',
        'info'
      );
      return;
    }

    const newTx: LedgerTransaction = {
      id: Math.random().toString(36).substring(2, 9),
      type: 'adjustment',
      amount: Math.abs(diff),
      balanceAfter: Number(targetBalance.toFixed(2)),
      description: descInput.trim() || (isFr ? 'Ajustement de solde manuel' : 'Direct Balance Adjustment'),
      timestamp: new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setTransactions(prev => [newTx, ...prev]);
    adjustBankrollBalance(Number(targetBalance.toFixed(2)));

    addToast(
      isFr 
        ? `Solde ajusté à ${targetBalance} ${bankroll.currency}`
        : `Balance directly adjusted to ${targetBalance} ${bankroll.currency}`,
      'success'
    );

    // Clear description
    setDescInput('');
  };

  // Erase Transaction Ledger History
  const handleClearLedger = () => {
    if (window.confirm(isFr ? 'Voulez-vous réinitialiser tout l’historique des transactions ?' : 'Do you want to reset all transaction history?')) {
      setTransactions([]);
      addToast(isFr ? 'Historique réinitialisé.' : 'Ledger simplified.', 'info');
    }
  };

  // Delete transaction safely
  const handleDeleteTx = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    if (window.confirm(isFr ? 'Supprimer cette transaction ?' : 'Delete this ledger entry?')) {
      const remaining = transactions.filter(t => t.id !== id);
      setTransactions(remaining);

      // Rollback the balance adjustment if desired
      let rollbackBalance = bankroll.balance;
      if (target.type === 'deposit') {
        rollbackBalance = Number((rollbackBalance - target.amount).toFixed(2));
      } else if (target.type === 'withdrawal') {
        rollbackBalance = Number((rollbackBalance + target.amount).toFixed(2));
      }

      adjustBankrollBalance(rollbackBalance);
      addToast(isFr ? 'Transaction effacée.' : 'Wiped item successfully.', 'info');
    }
  };

  // Construct complete chronological data points for equity plotting (bets + deposits/withdrawals/adjustments)
  // Let's build a timeline of events
  const buildEquityPoints = () => {
    interface Point {
      label: string;
      value: number;
    }
    const points: Point[] = [];
    
    // Start with initial balance
    let currentBalanceAccumulator = bankroll.initialBalance;
    points.push({ label: 'Initial', value: currentBalanceAccumulator });

    // Combine manual transaction logs and followed bets chronologically
    // To keep simple and direct without parsing complicated dates, we sort by chronological index structure.
    const allEvents: { type: string; amount: number; desc: string; isBet?: boolean }[] = [];

    // Let's add manual transactions reversed (oldest first)
    const reversedManual = [...transactions].reverse();
    reversedManual.forEach(t => {
      // Exclude seed transactions from raw addition if we already start from initialBalance
      if (!t.id.includes('seed')) {
        allEvents.push({ 
          type: t.type, 
          amount: t.type === 'withdrawal' ? -t.amount : t.amount,
          desc: t.description 
        });
      }
    });

    // Add graded bets
    const reversedBets = [...followedBets].reverse();
    reversedBets.forEach((bet) => {
      if (bet.status === 'won') {
        const winProfit = bet.stakeAmount * (bet.odds - 1);
        allEvents.push({ type: 'deposit', amount: winProfit, desc: `${bet.homeTeam} - ${bet.awayTeam}`, isBet: true });
      } else if (bet.status === 'lost') {
        allEvents.push({ type: 'withdrawal', amount: -bet.stakeAmount, desc: `${bet.homeTeam} - ${bet.awayTeam}`, isBet: true });
      }
    });

    // Run accumulator
    allEvents.forEach((ev, index) => {
      currentBalanceAccumulator += ev.amount;
      points.push({ 
        label: ev.isBet ? `Bet #${index + 1}` : ev.desc.substring(0, 15), 
        value: Number(currentBalanceAccumulator.toFixed(1)) 
      });
    });

    // Safeguard
    if (points.length === 1) {
      points.push({ label: isFr ? 'Actuel' : 'Current', value: bankroll.balance });
    }

    return points;
  };

  const equityData = buildEquityPoints();

  // SVG Chart Layout Metrics
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 30;
  const paddingY = 20;

  const minVal = Math.min(...equityData.map(p => p.value)) * 0.95;
  const maxVal = Math.max(...equityData.map(p => p.value)) * 1.05;
  const valRange = maxVal - minVal || 1;

  const linePointsString = equityData.map((val, idx) => {
    const x = paddingX + (idx * (chartWidth - paddingX * 2) / (equityData.length - 1 || 1));
    const y = chartHeight - paddingY - ((val.value - minVal) * (chartHeight - paddingY * 2) / valRange);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-[#131316] border border-white/5 rounded-3xl p-5 md:p-6 space-y-6">
      
      {/* Tool Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#007ACC]/10 text-[#0099FF]">
            <PiggyBank className="w-5 h-5 text-[#0099FF]" />
          </span>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight uppercase italic flex items-center gap-1.5">
              💼 {isFr ? 'Module de Gestion de Capital' : 'Equity & Capital Management Ledger'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isFr ? 'Sécurisez votre trésor spartiate – Enregistrez dépôts et retraits' : 'Track your true cash-flow, deposit records & raw net equity'}
            </p>
          </div>
        </div>

        {/* Action Toggle buttons */}
        <div className="flex items-center gap-1.5 bg-[#0A0A0B] border border-white/5 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'deposit' 
                ? 'bg-[#007ACC] text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ➕ {isFr ? 'Dépôt' : 'Deposit'}
          </button>
          <button
            onClick={() => setActiveTab('withdrawal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'withdrawal' 
                ? 'bg-[#007ACC] text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ➖ {isFr ? 'Retrait' : 'Withdrawal'}
          </button>
          <button
            onClick={() => setActiveTab('adjustment')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
              activeTab === 'adjustment' 
                ? 'bg-[#007ACC] text-white shadow'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            ⚙️ {isFr ? 'Solde' : 'Set Balance'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Interactive Tool Panel (5 cols) */}
        <div className="lg:col-span-5 bg-[#0A0A0B] border border-white/5 rounded-2xl p-5 space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[9px] font-mono font-bold text-[#0099FF] uppercase tracking-widest block">
              {isFr ? 'ENREGISTRER UN FLUX' : 'POST ENTRY TO GENERAL LEDGER'}
            </span>
            <h4 className="text-xs font-bold text-white uppercase italic mt-0.5">
              {activeTab === 'deposit' && (isFr ? '💵 Ajouter des Fonds (Dépôt)' : '💵 Add Capital Funds')}
              {activeTab === 'withdrawal' && (isFr ? '📉 Retirer de l’Argent (Retrait)' : '📉 Withdraw Capital Funds')}
              {activeTab === 'adjustment' && (isFr ? '⚙️ Ajuster le Solde Actuel' : '⚙️ Adjust Actual Ledger Balance')}
            </h4>
          </div>

          {activeTab !== 'adjustment' ? (
            <form onSubmit={handleLogTransaction} className="space-y-4">
              {/* Cash input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                  {isFr ? 'Montant de la Transaction' : 'Transaction Cash Value'} ({bankroll.currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-neutral-400 font-mono text-xs font-bold">
                    {bankroll.currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    className="w-full text-sm font-bold pl-8 pr-4 py-2 bg-[#131115] border border-white/10 rounded-xl text-white focus:border-[#0099FF] focus:outline-none focus:ring-1 focus:ring-[#0099FF] transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                  {isFr ? 'Libellé / Note de Discipline' : 'Reference / Description Label'}
                </label>
                <input
                  type="text"
                  placeholder={
                    activeTab === 'deposit'
                      ? (isFr ? 'e.g. Injection de capital, Virement de paie...' : 'e.g. Direct bank wire, capital backup...')
                      : (isFr ? 'e.g. Encaissement de profits, Retrait hebdomadaire...' : 'e.g. Safe secure-cashout, payment reward...')
                  }
                  value={descInput}
                  onChange={e => setDescInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#131115] border border-white/10 rounded-xl text-white focus:border-[#0099FF] focus:outline-none transition-all placeholder:text-neutral-600"
                  maxLength={50}
                />
              </div>

              <AnimatePresence>
                {isLargeAmount && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[10px] leading-relaxed text-amber-500 font-mono space-y-1 block"
                  >
                    <span>⚠️ <strong>{isFr ? 'Jeu Responsable :' : 'Responsible Gaming Tip:'}</strong></span>
                    <p className="m-0 text-stone-300">
                      {isFr 
                        ? 'Cette transaction est substantielle. Des mouvements de fonds élevés faussent vos analyses de discipline et accroissent la pression psychologique. Allouez vos fonds de manière raisonnable.'
                        : 'This transaction is substantial. Excessive ledger updates skew personal discipline metrics. Keep allocations limited and wager only spare, dispensable funds.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'deposit'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)]'
                    : 'bg-[#007ACC] hover:bg-[#0099FF] text-white shadow-[0_4px_12px_rgba(0,153,255,0.2)]'
                }`}
              >
                {activeTab === 'deposit' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                {isFr ? 'Valider le mouvement' : 'Record Ledger Flow'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleDirectAdjust} className="space-y-4">
              {/* Balance set input */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                    {isFr ? 'Nouveau Solde Total Actuel' : 'Target Net Ledger Balance'} ({bankroll.currency})
                  </label>
                  <span className="text-[9px] font-mono text-neutral-500">
                    {isFr ? 'Actuel :' : 'Current :'} {bankroll.balance} {bankroll.currency}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-neutral-400 font-mono text-xs font-bold">
                    {bankroll.currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={balanceInput}
                    onChange={e => setBalanceInput(e.target.value)}
                    className="w-full text-sm pl-8 pr-4 py-2 bg-[#131115] border border-white/10 rounded-xl text-white focus:border-[#0099FF] focus:outline-none focus:ring-1 focus:ring-[#0099FF] transition-all font-mono font-bold"
                    required
                  />
                </div>
              </div>

              {/* Justification note */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                  {isFr ? 'Justification / Description note' : 'Note of adjustment'}
                </label>
                <input
                  type="text"
                  placeholder={isFr ? 'e.g. Synchronisation du capital de départ' : 'e.g. Syncing live exchange balance'}
                  value={descInput}
                  onChange={e => setDescInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-[#131115] border border-white/10 rounded-xl text-white focus:border-[#0099FF] focus:outline-none transition-all placeholder:text-neutral-600"
                  maxLength={50}
                />
              </div>

              <AnimatePresence>
                {isLargeAdjust && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -5 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -5 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[10px] leading-relaxed text-amber-500 font-mono space-y-1 block"
                  >
                    <span>⚠️ <strong>{isFr ? 'Jeu Responsable :' : 'Responsible Gaming Tip:'}</strong></span>
                    <p className="m-0 text-stone-300">
                      {isFr 
                        ? 'Cette modification directe est substantielle. Ajuster artificiellement les balances fausse l’historique de vos rendements réels de paris et réduit le recul objectif nécessaire.'
                        : 'This direct overwrite represents a substantial margin offset. Overwriting raw figures distorts tracking accuracy and bypasses performance tracking parameters.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#007ACC] hover:bg-[#0099FF] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(0,153,255,0.2)]"
              >
                <Settings className="w-4 h-4" />
                {isFr ? 'Forcer la balance' : 'Force balance rewrite'}
              </button>
            </form>
          )}

          {/* Quick Informational Guard */}
          <div className="bg-[#131115] border border-white/5 rounded-xl p-3 flex gap-2.5">
            <Coins className="w-4 h-4 text-[#0099FF] shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-neutral-500 font-mono">
              🛡️ {isFr 
                ? 'Les ajustements manuels mettent à jour instantanément la balance globale affichée sur l’ensemble de SpartanBet.' 
                : 'Directly adjustments automatically update header & dashboard metrics globally.'}
            </p>
          </div>
        </div>

        {/* Right Equity Progression Curves (7 cols) */}
        <div className="lg:col-span-7 bg-[#0A0A0B] border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono font-black text-[#0099FF] uppercase tracking-widest block">
                  {isFr ? 'COURBE D’ÉQUITÉ TOTALE' : 'TOTAL CAPITAL EQUITY TIMELINE'}
                </span>
                <h4 className="text-xs font-bold text-white uppercase italic mt-0.5">
                  📈 {isFr ? 'Évolution Totale Capitalisées' : 'True Compound Asset Progression'}
                </h4>
              </div>
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wide bg-[#131115] px-2.5 py-1 rounded border border-white/5 font-bold">
                {isFr ? 'Dépôts + Profits Sports' : 'Deposits / Outlays Included'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 font-sans">
              {isFr 
                ? 'Courbe combinant l’effet de vos dépôts/retraits et les gains/pertes cumulés de vos paris.' 
                : 'Combines compound stakes with deposits & outflows chronologically.'}
            </p>
          </div>

          {/* SVG Progression Rendering */}
          <div className="w-full bg-[#131115] rounded-xl border border-white/5 p-3 relative">
            <svg 
              viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
              className="w-full h-auto overflow-visible"
            >
              {/* Guidelines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#27272a" strokeDasharray="3,3" />
              <line x1={paddingX} y1={chartHeight/2} x2={chartWidth - paddingX} y2={chartHeight/2} stroke="#27272a" strokeDasharray="3,3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#27272a" strokeDasharray="3,3" />

              {/* SVG Polyline with dynamic points */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={linePointsString}
              />

              {/* Shading area below path */}
              <path
                d={`M ${paddingX},${chartHeight - paddingY} L ${linePointsString} L ${chartWidth - paddingX},${chartHeight - paddingY} Z`}
                fill="url(#equity-grade)"
                opacity="0.08"
              />

              {/* Gradient config */}
              <defs>
                <linearGradient id="equity-grade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Data hover circles */}
              {equityData.map((pt, idx) => {
                const x = paddingX + (idx * (chartWidth - paddingX * 2) / (equityData.length - 1 || 1));
                const y = chartHeight - paddingY - ((pt.value - minVal) * (chartHeight - paddingY * 2) / valRange);

                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="3"
                      fill="#10b981"
                      stroke="#0D0D0F"
                      strokeWidth="1"
                    />
                    {/* Tiny tooltip indicator */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                      <rect 
                        x={x - 45} 
                        y={y - 25} 
                        width="90" 
                        height="18" 
                        rx="4" 
                        fill="#0A0A0B" 
                        stroke="#10b981" 
                        strokeWidth="0.75" 
                      />
                      <text 
                        x={x} 
                        y={y - 13} 
                        textAnchor="middle" 
                        fill="#fff" 
                        fontSize="8px" 
                        fontWeight="bold" 
                        className="font-mono"
                      >
                        {pt.value} {bankroll.currency}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* Scale indicator footer */}
            <div className="flex justify-between text-[9px] text-neutral-500 font-mono mt-1 px-1">
              <span>{equityData[0].label} ({equityData[0].value.toFixed(0)} {bankroll.currency})</span>
              <span>{isFr ? 'Moyenne est : ' : 'Mid level :'} {((maxVal + minVal)/2).toFixed(0)} {bankroll.currency}</span>
              <span>{isFr ? 'Sommet actuel' : 'Current balance'} ({bankroll.balance.toFixed(0)} {bankroll.currency})</span>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500 pt-2 border-t border-white/5">
            <span>{isFr ? 'Points de fluctuation d’actifs :' : 'Compound timeline data points :'} <strong className="text-white">{equityData.length}</strong></span>
            <button
              onClick={handleClearLedger}
              className="text-[9px] text-rose-500 hover:text-rose-450 hover:underline cursor-pointer flex items-center gap-1 uppercase"
            >
              <Trash2 className="w-3 h-3" />
              {isFr ? 'Effacer tout' : 'Reset Timeline'}
            </button>
          </div>
        </div>

      </div>

      {/* Transaction Log Feed Table */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
            📂 {isFr ? 'Registre des Mouvements de Capital' : 'Fund Movement Records ledger'}
          </h4>
          <span className="text-[10px] font-mono text-neutral-500 bg-[#0A0A0B] border border-white/5 px-2 py-0.5 rounded-lg select-none">
            {transactions.length} entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs bg-[#0A0A0B] rounded-2xl border border-white/5 overflow-hidden">
            <thead className="bg-[#131115] border-b border-white/5 text-[9px] uppercase font-bold text-neutral-500 font-mono">
              <tr>
                <th className="px-4 py-3 text-left">{isFr ? 'DATE & HEURE' : 'DATE & TIMESTAMP'}</th>
                <th className="px-4 py-3">{isFr ? 'LIBELLÉ / ACTION' : 'REFERENCE'}</th>
                <th className="px-4 py-3 text-center">{isFr ? 'TYPE' : 'TYPE'}</th>
                <th className="px-4 py-3 text-right">{isFr ? 'MONTANT' : 'AMOUNT'}</th>
                <th className="px-4 py-3 text-right">{isFr ? 'SOLDE APRES' : 'REMAINING WATERMARK'}</th>
                <th className="px-4 py-3 text-center">{isFr ? 'SUPPR' : 'ACTION'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.01] transition-colors leading-normal text-stone-300">
                    <td className="px-4 py-3 font-mono text-[10px] text-neutral-500 whitespace-nowrap">
                      {tx.timestamp}
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-200 truncate max-w-[180px]">
                      {tx.description}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className={`inline-block text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        tx.type === 'deposit' 
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                          : tx.type === 'withdrawal'
                            ? 'bg-[#001A33]/40 text-[#33AAFF] border border-[#002B52]/30'
                            : 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                      }`}>
                        {tx.type === 'deposit' && (isFr ? 'Dépôt' : 'Deposit')}
                        {tx.type === 'withdrawal' && (isFr ? 'Retrait' : 'Withdrawal')}
                        {tx.type === 'adjustment' && (isFr ? 'Ajust.' : 'Adjust.')}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${
                      tx.type === 'deposit' ? 'text-emerald-400' : tx.type === 'withdrawal' ? 'text-[#0099FF]' : 'text-blue-450'
                    }`}>
                      {tx.type === 'deposit' ? '+' : tx.type === 'withdrawal' ? '-' : ''}
                      {tx.amount.toLocaleString()} {bankroll.currency}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-neutral-400">
                      {tx.balanceAfter.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {bankroll.currency}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteTx(tx.id)}
                        className="text-neutral-500 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-500/10 cursor-pointer"
                        title={isFr ? 'Annuler ce mouvement' : 'Rollback this operation'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 font-mono text-neutral-500 text-xs">
                    {isFr ? 'Le registre est vierge. Enregistrez un mouvement ci-dessus.' : 'The ledger history ledger is clear.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
