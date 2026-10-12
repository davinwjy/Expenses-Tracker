import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  Receipt,
  SlidersHorizontal,
  Shield,
  Layers,
  Building,
  Landmark,
  Coins,
  Globe,
  Wallet,
  Check,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatIdr, formatUsd, formatMasked, CATEGORY_COLORS } from '../lib/formatters';

export const StatsView: React.FC = () => {
  const {
    stats,
    accounts,
    investments,
    isPrivacyMode,
    togglePrivacyMode,
    usdIdrRate,
    updateRate,
  } = useFinance();

  const [rateInput, setRateInput] = useState(usdIdrRate.toString());
  const [rateSaved, setRateSaved] = useState(false);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(rateInput);
    if (!isNaN(val) && val > 0) {
      await updateRate(val);
      setRateSaved(true);
      setTimeout(() => setRateSaved(false), 2000);
    }
  };

  const netWorth = stats?.totalNetWorthIdr || 0;
  const liquidCash = stats?.totalLiquidCashIdr || 0;
  const totalInvestment = stats?.totalInvestmentValueIdr || 0;
  const expenseByCategory = stats?.expenseByCategory || {};
  const expenseByAccount = stats?.expenseByAccount || {};
  const monthlyExpenses = stats?.monthlyExpenses || 0;
  const categoryAllocations = stats?.categoryAllocations || {};

  // Asset allocation percentages
  const cashPercent = netWorth > 0 ? (liquidCash / netWorth) * 100 : 0;
  const sahamPercent = netWorth > 0 ? ((categoryAllocations['Saham']?.idrValue || 0) / netWorth) * 100 : 0;
  const rdpuPercent = netWorth > 0 ? ((categoryAllocations['RDPU']?.idrValue || 0) / netWorth) * 100 : 0;
  const btcPercent = netWorth > 0 ? ((categoryAllocations['Bitcoin']?.idrValue || 0) / netWorth) * 100 : 0;
  const etfPercent = netWorth > 0 ? ((categoryAllocations['ETF USA']?.idrValue || 0) / netWorth) * 100 : 0;
  const usdPercent = netWorth > 0 ? ((categoryAllocations['USD']?.idrValue || 0) / netWorth) * 100 : 0;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>Financial Statistics & Analytics</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          In-depth asset allocation, spending patterns, and exchange rate configuration
        </p>
      </div>

      {/* ASSET ALLOCATION BREAKDOWN */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Comprehensive Asset Allocation</span>
            </h3>
            <p className="text-xs text-slate-400">
              Distribution of your total net worth across liquid and investment classes
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-300">
            Total: {formatMasked(netWorth, 'IDR', isPrivacyMode)}
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-4 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
          <div style={{ width: `${cashPercent}%` }} className="bg-sky-500 h-full transition-all" title={`Cash & Banks: ${cashPercent.toFixed(1)}%`} />
          <div style={{ width: `${sahamPercent}%` }} className="bg-blue-600 h-full transition-all" title={`Saham: ${sahamPercent.toFixed(1)}%`} />
          <div style={{ width: `${rdpuPercent}%` }} className="bg-teal-500 h-full transition-all" title={`RDPU: ${rdpuPercent.toFixed(1)}%`} />
          <div style={{ width: `${btcPercent}%` }} className="bg-amber-500 h-full transition-all" title={`Bitcoin: ${btcPercent.toFixed(1)}%`} />
          <div style={{ width: `${etfPercent}%` }} className="bg-purple-500 h-full transition-all" title={`ETF USA: ${etfPercent.toFixed(1)}%`} />
          <div style={{ width: `${usdPercent}%` }} className="bg-emerald-500 h-full transition-all" title={`USD Cash: ${usdPercent.toFixed(1)}%`} />
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Cash & Banks</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {cashPercent.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {formatMasked(liquidCash, 'IDR', isPrivacyMode)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Saham (ID)</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {sahamPercent.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {formatMasked(categoryAllocations['Saham']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-teal-400 font-semibold mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>RDPU (Fund)</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {rdpuPercent.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {formatMasked(categoryAllocations['RDPU']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Bitcoin (Crypto)</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {btcPercent.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {formatMasked(categoryAllocations['Bitcoin']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>ETF USA</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {etfPercent.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {formatMasked(categoryAllocations['ETF USA']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>USD Cash</span>
            </div>
            <p className="text-sm font-bold text-white font-mono">
              {usdPercent.toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {formatMasked(categoryAllocations['USD']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: MONTHLY EXPENSE CATEGORIES & FUNDING SOURCE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Expense Categories</h3>
              <p className="text-xs text-slate-400">Current month spending distribution</p>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400">
              {formatMasked(monthlyExpenses, 'IDR', isPrivacyMode)}
            </span>
          </div>

          {Object.keys(expenseByCategory).length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No expenses recorded this month.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(expenseByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => {
                  const pct = monthlyExpenses > 0 ? (amount / monthlyExpenses) * 100 : 0;
                  const color = CATEGORY_COLORS[category] || '#94a3b8';

                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white">{category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono">{pct.toFixed(1)}%</span>
                          <span className="font-bold text-slate-200 font-mono">
                            {formatMasked(amount, 'IDR', isPrivacyMode)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Funding Source Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Funding Source Distribution</h3>
            <p className="text-xs text-slate-400">Which bank or cash is used most for expenses</p>
          </div>

          {Object.keys(expenseByAccount).length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No expenses recorded this month.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(expenseByAccount)
                .sort((a, b) => b[1].amount - a[1].amount)
                .map(([accId, item]) => {
                  const pct = monthlyExpenses > 0 ? (item.amount / monthlyExpenses) * 100 : 0;

                  return (
                    <div key={accId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-white">
                          {item.name} <span className="text-[10px] text-slate-500 uppercase">({item.type})</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono">{pct.toFixed(1)}%</span>
                          <span className="font-bold text-slate-200 font-mono">
                            {formatMasked(item.amount, 'IDR', isPrivacyMode)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* SYSTEM & EXCHANGE RATE SETTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* USD / IDR Exchange Rate */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>USD / IDR Exchange Rate Setting</span>
          </div>
          <p className="text-xs text-slate-400">
            Used to calculate net worth and convert US ETF, Bitcoin, and USD holdings into IDR equivalents.
          </p>

          <form onSubmit={handleUpdateRate} className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">1 USD = Rp</span>
              <input
                type="number"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-24 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {rateSaved && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              <span>{rateSaved ? 'Updated!' : 'Update Rate'}</span>
            </button>
          </form>
        </div>

        {/* Privacy & Safe Mode Toggle Card */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Public Privacy Shield</span>
          </div>
          <p className="text-xs text-slate-400">
            Instantly hide net worth and nominal balances on screen when entering expenses in public cafes, trains, or offices.
          </p>

          <div className="pt-1">
            <button
              onClick={togglePrivacyMode}
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isPrivacyMode
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <span>{isPrivacyMode ? 'Privacy Shield Is ACTIVE (Nominals Masked)' : 'Enable Privacy Shield (Mask Balances)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
