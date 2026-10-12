import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  ArrowRightLeft,
  Edit2,
  Trash2,
  Building,
  Landmark,
  Coins,
  Globe,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Layers,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  formatIdr,
  formatUsd,
  formatMasked,
  INVESTMENT_CATEGORY_DETAILS,
} from '../lib/formatters';
import { Investment, InvestmentCategory } from '../types';

export const InvestmentsView: React.FC = () => {
  const {
    investments,
    isPrivacyMode,
    usdIdrRate,
    setIsAddInvestmentOpen,
    setEditingInvestment,
    setIsTransferOpen,
    setTransferInitialMode,
  } = useFinance();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const filteredInvestments = investments.filter((inv) => {
    if (activeCategoryFilter === 'all') return true;
    return inv.category === activeCategoryFilter;
  });

  // Calculate totals
  let totalInvestedIdr = 0;
  let totalValueIdr = 0;
  let totalValueUsd = 0;

  investments.forEach((inv) => {
    if (inv.currency === 'USD') {
      const valUsd = inv.currentValue || 0;
      totalValueUsd += valUsd;
      totalValueIdr += valUsd * usdIdrRate;
      totalInvestedIdr += (inv.amountInvested || 0) * usdIdrRate;
    } else {
      const valIdr = inv.currentValue || 0;
      totalValueIdr += valIdr;
      totalValueUsd += valIdr / usdIdrRate;
      totalInvestedIdr += inv.amountInvested || 0;
    }
  });

  const totalPnlIdr = totalValueIdr - totalInvestedIdr;
  const totalPnlPercent = totalInvestedIdr > 0 ? (totalPnlIdr / totalInvestedIdr) * 100 : 0;

  const categoryTabs = [
    { id: 'all', label: 'All Portfolio' },
    { id: 'Saham', label: 'Saham (IDR)' },
    { id: 'RDPU', label: 'RDPU (IDR)' },
    { id: 'ETF USA', label: 'ETF USA (USD)' },
    { id: 'Bitcoin', label: 'Bitcoin (USD)' },
    { id: 'USD', label: 'USD Cash' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header & Main CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Investment Portfolio</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {investments.length} Assets
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Track Saham, RDPU, Bitcoin, ETF USA and USD holdings in one place
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setTransferInitialMode('bank_to_investment');
              setIsTransferOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            <span>Fund from Bank</span>
          </button>

          <button
            onClick={() => {
              setEditingInvestment(null);
              setIsAddInvestmentOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Investment</span>
          </button>
        </div>
      </div>

      {/* Portfolio Total Summary Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total Portfolio Market Value
          </span>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
            {formatMasked(totalValueIdr, 'IDR', isPrivacyMode)}
          </p>
          <span className="text-xs text-slate-400 font-mono">
            &asymp; {formatMasked(totalValueUsd, 'USD', isPrivacyMode)}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Invested Principal (Cost Basis)
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-300 font-mono mt-1">
            {formatMasked(totalInvestedIdr, 'IDR', isPrivacyMode)}
          </p>
          <span className="text-xs text-slate-500">Cumulative capital deployed</span>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total Unrealized Return
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xl sm:text-2xl font-black font-mono flex items-center ${
                totalPnlIdr >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalPnlIdr >= 0 ? '+' : ''}
              {formatMasked(totalPnlIdr, 'IDR', isPrivacyMode)}
            </span>
          </div>
          <span
            className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full inline-block mt-0.5 ${
              totalPnlIdr >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            {totalPnlPercent >= 0 ? '+' : ''}
            {totalPnlPercent.toFixed(2)}% ROI
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar border-b border-slate-800">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategoryFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryFilter === tab.id
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Investment Asset Cards */}
      <div className="space-y-3">
        {filteredInvestments.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">No investments in this category</h3>
            <p className="text-xs text-slate-400 mt-1">
              Click &quot;Add Investment&quot; to track a new asset in USD, Bitcoin, Saham, RDPU, or US ETF.
            </p>
          </div>
        ) : (
          filteredInvestments.map((inv) => {
            const meta = INVESTMENT_CATEGORY_DETAILS[inv.category] || {
              label: inv.category,
              badgeColor: 'bg-slate-800 text-slate-300',
              iconBg: 'bg-slate-800 text-slate-300',
            };

            const isUsd = inv.currency === 'USD';
            const cost = inv.amountInvested || 0;
            const current = inv.currentValue || 0;
            const pnl = current - cost;
            const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
            const idrEquivalent = isUsd ? current * usdIdrRate : current;

            return (
              <div
                key={inv.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all gap-4"
              >
                {/* Left: Category Icon & Asset Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                    {inv.category === 'Saham' && <Building className="w-5 h-5" />}
                    {inv.category === 'RDPU' && <Landmark className="w-5 h-5" />}
                    {inv.category === 'Bitcoin' && <Coins className="w-5 h-5" />}
                    {inv.category === 'ETF USA' && <Globe className="w-5 h-5" />}
                    {inv.category === 'USD' && <DollarSign className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-white text-base sm:text-lg">{inv.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${meta.badgeColor}`}>
                        {inv.category}
                      </span>
                      {inv.platform && (
                        <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-medium">
                          {inv.platform}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      {inv.units && (
                        <>
                          <span className="font-mono text-slate-300">
                            {inv.units} {inv.category === 'Bitcoin' ? 'BTC' : 'units'}
                          </span>
                          <span>&bull;</span>
                        </>
                      )}
                      <span>Cost: </span>
                      <span className="font-mono text-slate-300">
                        {formatMasked(cost, inv.currency, isPrivacyMode)}
                      </span>
                      {inv.notes && (
                        <>
                          <span>&bull;</span>
                          <span className="italic text-slate-400 truncate max-w-xs">&ldquo;{inv.notes}&rdquo;</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Current Value & Returns & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 pl-14 md:pl-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <p className="text-base sm:text-xl font-black text-white font-mono">
                      {formatMasked(current, inv.currency, isPrivacyMode)}
                    </p>
                    {isUsd && (
                      <p className="text-xs text-slate-400 font-mono">
                        &asymp; {formatMasked(idrEquivalent, 'IDR', isPrivacyMode)}
                      </p>
                    )}
                    <div className="flex items-center md:justify-end gap-1 mt-0.5">
                      <span
                        className={`text-xs font-bold font-mono ${
                          pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pnl >= 0 ? '+' : ''}
                        {formatMasked(pnl, inv.currency, isPrivacyMode)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setTransferInitialMode('bank_to_investment');
                        setIsTransferOpen(true);
                      }}
                      title="Top up from Bank"
                      className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Top Up</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingInvestment(inv);
                        setIsAddInvestmentOpen(true);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit investment"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
