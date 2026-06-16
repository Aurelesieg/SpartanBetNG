import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { 
  Calculator, TrendingUp, Info, Percent, Sparkles, Coins, DollarSign, RefreshCw, Flame, ArrowRight, ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

export const RoiCalculator: React.FC = () => {
  const { user, bankroll } = useApp();
  const isFr = user.language === 'fr';

  // Input states
  const [stake, setStake] = useState<string>('100');
  const [odds, setOdds] = useState<string>('1.95');
  const [winProb, setWinProb] = useState<string>('55'); // Estimated probability

  // Interactive Calculations
  const parsedStake = parseFloat(stake) || 0;
  const parsedOdds = parseFloat(odds) || 1.0;
  const parsedWinProb = parseFloat(winProb) || 0;

  // Potential returns
  const potentialPayout = parsedStake * parsedOdds;
  const potentialProfit = Math.max(0, potentialPayout - parsedStake);
  
  // Single Bet Yield % = (profit / stake) * 100 which is exactly (odds - 1) * 100
  const singleBetYield = parsedStake > 0 ? (potentialProfit / parsedStake) * 100 : 0;

  // Implied probability of the odds = (1 / odds) * 100
  const impliedProb = parsedOdds > 1 ? (1 / parsedOdds) * 100 : 0;

  // Expected Value (EV) % = (Probability * Net Profit) - (Loss Probability * Stake)
  // EV in currency = (Prob * Profit) - ((1 - Prob) * Stake)
  // EV % = ((Prob * Odds) - 1) * 100
  const probDecimal = parsedWinProb / 100;
  const expectedValueCurrency = (probDecimal * potentialProfit) - ((1 - probDecimal) * parsedStake);
  const expectedValuePercent = ((probDecimal * parsedOdds) - 1) * 100;

  // Kelly Criterion suggestion: fraction f* = (p * b - q) / b
  // where b = net odds (odds - 1), p = win probability, q = loss probability
  // f* = (p * (odds - 1) - (1-p)) / (odds - 1)
  const bMultiplier = parsedOdds - 1;
  const kellyFraction = bMultiplier > 0 
    ? ((probDecimal * bMultiplier) - (1 - probDecimal)) / bMultiplier
    : 0;
  
  const kellyPercent = Math.max(0, kellyFraction * 100);
  const safeFractionalKelly = kellyPercent * 0.25; // 1/4 Kelly is standard conservative industry standard

  const suggestedStakeCurrency = bankroll.isActive 
    ? (bankroll.balance * (safeFractionalKelly / 100))
    : 0;

  // Compounding Rollover projection simulation: 3 success roll-overs
  const getRolloverPath = () => {
    let current = parsedStake;
    const path = [current];
    for (let i = 0; i < 3; i++) {
      current = current * parsedOdds;
      path.push(Number(current.toFixed(0)));
    }
    return path;
  };

  const rolloverValues = getRolloverPath();

  return (
    <div className="bg-[#131316] border border-white/5 rounded-3xl p-5 md:p-6 space-y-5 relative">
      {/* Tiny top glow */}
      <div className="absolute top-0 right-1/4 w-32 h-1 bg-gradient-to-r from-transparent via-[#0099FF]/25 to-transparent pointer-events-none" />

      {/* Section title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-[#007ACC]/10 text-[#0099FF]">
            <Calculator className="w-5 h-5 text-[#0099FF]" />
          </span>
          <div>
            <h3 className="font-bold text-white text-sm tracking-tight uppercase italic flex items-center gap-1.5">
              📐 {isFr ? 'Simulateur de Rendement (ROI)' : 'ROI & Betting Efficiency Calculator'}
            </h3>
            <p className="text-xs text-neutral-400">
              {isFr ? 'Calculez la rentabilité, l’espérance attendue (EV) et l’indice Kelly optimal' : 'Calculate theoretical profits, implied edge, Expected Value, and Kelly stake fractions'}
            </p>
          </div>
        </div>
        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest bg-[#0A0A0B] border border-white/5 px-2.5 py-1 rounded font-bold">
          {isFr ? 'OUTIL DE DISCIPLINE' : 'DISCIPLINE TOOL'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Parameters (4 cols) */}
        <div className="lg:col-span-4 bg-[#0A0A0B] border border-white/5 rounded-2xl p-4.5 space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[9px] font-mono font-bold text-[#0099FF] uppercase tracking-widest block">
              {isFr ? 'COEFFICIENTS PARI' : 'TICKET COMPOSITION VALUES'}
            </span>
            <h4 className="text-xs font-bold text-white uppercase italic mt-0.5">
              ⚙️ {isFr ? 'Paramètres Clés' : 'Key Input Vectors'}
            </h4>
          </div>

          <div className="space-y-3.5">
            {/* Stake Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                {isFr ? 'Mise à Investir' : 'Capital Stake Wager'} ({bankroll.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-neutral-500 font-mono text-xs font-bold">
                  {bankroll.currency}
                </span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="w-full text-xs font-bold pl-8 pr-3.5 py-2.5 bg-[#131115] border border-white/10 rounded-xl text-white focus:border-[#0099FF] focus:outline-none focus:ring-1 focus:ring-[#0099FF] transition-all font-mono"
                  required
                />
              </div>
            </div>

            {/* Odds Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                {isFr ? 'Cote Décimale' : 'Decimal Match Odds'}
              </label>
              <input
                type="number"
                step="0.01"
                min="1.01"
                value={odds}
                onChange={(e) => setOdds(e.target.value)}
                className="w-full text-xs font-bold px-3.5 py-2.5 bg-[#131115] border border-white/10 rounded-xl text-white focus:border-[#0099FF] focus:outline-none focus:ring-1 focus:ring-[#0099FF] transition-all font-mono"
                required
              />
            </div>

            {/* Estimated Probability Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                  {isFr ? 'Probabilité Estimée' : 'Assessed Win Probability'} (%)
                </label>
                <span className="text-[9px] font-mono text-neutral-500">
                  {isFr ? 'Bookmaker :' : 'Implied :'} {impliedProb.toFixed(0)}%
                </span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={winProb}
                  onChange={(e) => setWinProb(e.target.value)}
                  className="w-full accent-[#0099FF] h-1 bg-[#131115] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[8px] font-mono text-neutral-600">5% (Hard)</span>
                  <span className="text-xs font-black font-mono text-[#0099FF] bg-[#007ACC]/10 px-2 py-0.5 rounded">
                    {winProb}%
                  </span>
                  <span className="text-[8px] font-mono text-neutral-600">95% (Lock)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profitability Outcomes (4 cols) */}
        <div className="lg:col-span-4 bg-[#0A0A0B] border border-white/5 rounded-2xl p-4.5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[9px] font-mono font-bold text-[#0099FF] uppercase tracking-widest block">
              {isFr ? 'POTENTIEL EN RETOUR' : 'CALCULATED RETURN MATRIX'}
            </span>
            <h4 className="text-xs font-bold text-white uppercase italic mt-0.5">
              📊 {isFr ? 'Gains & Rentabilité' : 'Payout & Single Yield'}
            </h4>
          </div>

          <div className="space-y-3.5 py-2">
            {/* Net Profit Row */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-neutral-400 font-medium">
                {isFr ? 'Profit Net Potentiel' : 'Potential Net Profit'}
              </span>
              <span className="font-mono text-sm font-black text-emerald-400">
                +{potentialProfit.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {bankroll.currency}
              </span>
            </div>

            {/* Total Payout Row */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-neutral-400 font-medium">
                {isFr ? 'Retour Brut (Payout)' : 'Gross Return Payout'}
              </span>
              <span className="font-mono text-xs font-bold text-neutral-200">
                {potentialPayout.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {bankroll.currency}
              </span>
            </div>

            {/* Single Bet ROI % */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <div className="text-left">
                <span className="text-xs text-neutral-400 font-medium block">
                  {isFr ? 'Rendement du Pari' : 'Yield on Bet (ROI)'}
                </span>
                <span className="text-[8px] text-neutral-500 uppercase font-mono block">
                  {isFr ? 'Par rapport à la mise' : 'Based on wager fraction'}
                </span>
              </div>
              <span className="font-mono text-sm font-black text-[#0099FF]">
                +{singleBetYield.toFixed(0)}%
              </span>
            </div>

            {/* Implied Probability margin */}
            <div className="flex justify-between items-center pb-1">
              <div className="text-left">
                <span className="text-xs text-neutral-400 font-medium block">
                  {isFr ? 'Indice de Risque Recommandé' : 'Wager Risk Weight'}
                </span>
                <span className="text-[8px] text-neutral-500 uppercase font-mono block">
                  {isFr ? 'Basé sur les cotes' : 'Derived from decimals'}
                </span>
              </div>
              <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                parsedOdds < 1.5 
                  ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                  : parsedOdds <= 2.2
                    ? 'bg-amber-955/40 text-amber-500 border border-amber-900/30'
                    : 'bg-rose-955/40 text-rose-500 border border-rose-900/30'
              }`}>
                {parsedOdds < 1.5 && (isFr ? '🛡️ Conservateur' : '🛡️ Conservative')}
                {parsedOdds >= 1.5 && parsedOdds <= 2.2 && (isFr ? '⚡ Modéré' : '⚡ Moderate')}
                {parsedOdds > 2.2 && (isFr ? '🔥 Spéculatif' : '🔥 Speculative')}
              </span>
            </div>
          </div>

          <div className="bg-[#131115] border border-white/5 rounded-xl p-2.5 text-[10px] text-neutral-500 leading-normal font-mono">
            💡 {isFr 
              ? 'Le rendement unitaire est lié uniquement à la cote. Gagner régulièrement exige avant tout des pronostics à valeur positive.'
              : 'Bet ROI is static per ticket. Winning long-term requires placing bets with positive Expected Value.'}
          </div>
        </div>

        {/* Betting Efficiency & Portfolio Sizing (4 cols) */}
        <div className="lg:col-span-4 bg-[#0A0A0B] border border-white/5 rounded-2xl p-4.5 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[9px] font-mono font-bold text-[#0099FF] uppercase tracking-widest block">
              {isFr ? 'EFFICACITÉ & GESTION DU RISQUE' : 'MATHEMATICAL SYSTEM EDGES'}
            </span>
            <h4 className="text-xs font-bold text-white uppercase italic mt-0.5">
              🛡️ {isFr ? 'Kelly & Value Expected' : 'Kelly Criterion & EV Analysis'}
            </h4>
          </div>

          <div className="space-y-3 px-1 py-1">
            {/* Expected Value % */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <div className="text-left">
                <span className="text-xs text-neutral-400 font-medium block">
                  {isFr ? "Option d'Espérance (EV)" : 'Expected Value (EV)'}
                </span>
                <span className="text-[8px] text-neutral-500 uppercase font-mono block">
                  {isFr ? 'Rendement moyen projeté' : 'Average projected yield per wager'}
                </span>
              </div>
              <div className="text-right">
                <span className={`font-mono text-xs font-black block ${expectedValuePercent >= 0 ? 'text-emerald-450 text-emerald-400' : 'text-rose-400'}`}>
                  {expectedValuePercent >= 0 ? '+' : ''}{expectedValuePercent.toFixed(1)}% {expectedValuePercent >= 0 ? '🏆' : '⚠️'}
                </span>
                <span className={`font-mono text-[9px] block ${expectedValuePercent >= 0 ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  ({expectedValueCurrency >= 0 ? '+' : ''}{expectedValueCurrency.toFixed(1)} {bankroll.currency})
                </span>
              </div>
            </div>

            {/* Kelly sizing suggestions */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <div className="text-left">
                <span className="text-xs text-neutral-400 font-medium block">
                  {isFr ? 'Mise Kelly Frfractionnaire' : 'Fractional Kelly Sizing'}
                </span>
                <span className="text-[8px] text-neutral-500 uppercase font-mono block">
                  {isFr ? 'Modèle 1/4 Kelly conservateur' : 'Conservative Quarter-Kelly suggested allocation'}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold text-neutral-100 block">
                  {safeFractionalKelly > 0 ? `${safeFractionalKelly.toFixed(1)}%` : '0% (Avoid)'}
                </span>
                {safeFractionalKelly > 0 && bankroll.isActive && (
                  <span className="text-[9px] text-neutral-400 block font-bold text-[#33AAFF]">
                    ~ {suggestedStakeCurrency.toFixed(0)} {bankroll.currency}
                  </span>
                )}
              </div>
            </div>

            {/* Edge verification status */}
            <div className="flex justify-between items-center pt-0.5">
              <div className="text-left">
                <span className="text-xs text-neutral-400 font-medium block">
                  {isFr ? 'Espérance de Profit' : 'Edge Verification'}
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold uppercase ${
                expectedValuePercent > 0 ? 'text-emerald-400' : 'text-neutral-500'
              }`}>
                {expectedValuePercent > 0 
                  ? (isFr ? '✅ VALUE BET DÉTECTÉ' : '✅ VALUE DETECTED') 
                  : (isFr ? '❌ VALEUR INSUFFISANTE' : '❌ NO VALUE DETECTED')}
              </span>
            </div>
          </div>

          <div className="bg-[#131115] border border-white/5 rounded-xl p-2.5 text-[10px] text-neutral-500 leading-normal font-mono">
            🛡️ {isFr 
              ? 'Le modèle un quart de Kelly est la formule la plus sûre de la finance de marché pour faire croître un capital de manière stable.'
              : 'Quarter-Kelly sizing is respected across hedge funds & quants worldwide to avoid drawdowns while growing liquid cash.'}
          </div>
        </div>

      </div>

      {/* 4. Mini Compounding Rollover Interactive Path Simulator */}
      <div className="bg-[#0A0A0B] border border-white/5 rounded-2xl p-4.5 space-y-4">
        <div>
          <span className="text-[9px] font-mono font-bold text-[#0099FF] uppercase tracking-widest block">
            {isFr ? 'SIMULATION DE SÉRIES DE PREVISIONS (COMPOUND)' : 'MULTIPLE STEP COMPOUND PROGRESSION'}
          </span>
          <h4 className="text-xs font-bold text-white uppercase italic mt-0.5 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#0099FF]" />
            🔥 {isFr ? 'Simulateur de Montante / Rollover' : 'Rollover Strategy Sandbox'}
          </h4>
          <p className="text-[11px] text-neutral-400 mt-1 font-sans">
            {isFr 
              ? 'Voyez l’effet d’accumulation si vous décidez de réinvestir la mise et le profit dans une série consécutive de trois gains réussis.'
              : 'Simulates the rollover pathway if you choose to reinvest both stake and profits into subsequent steps.'}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {rolloverValues.map((val, step) => (
            <div key={step} className="bg-[#131115] border border-white/5 rounded-xl p-3 flex flex-col justify-between items-center relative overflow-hidden">
              {step > 0 && (
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0099FF]/20 to-transparent" />
              )}
              <span className="text-[8px] font-mono font-bold text-neutral-500 uppercase">
                {step === 0 ? (isFr ? 'DEPART / ACCUEIL' : 'INITIAL STAKE') : `STEP ${step}`}
              </span>
              <strong className="text-sm font-mono font-black text-stone-200 mt-1.5">
                {val.toLocaleString()} {bankroll.currency}
              </strong>
              {step > 0 && (
                <span className="text-[8px] font-mono bg-emerald-950/40 text-emerald-400 px-1 font-bold rounded mt-1 border border-emerald-900/20">
                  +{((val / parsedStake - 1) * 100).toFixed(0)}% ROI
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
