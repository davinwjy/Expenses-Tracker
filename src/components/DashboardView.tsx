import React from 'react';
import {
  Wallet,
  TrendingUp,
  Receipt,
  ArrowRightLeft,
  Eye,
  EyeOff,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Building,
  Landmark,
  Globe,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatIdr, formatUsd, formatMasked, formatDate } from '../lib/formatters';

export const DashboardView: React.FC = () => {
  const {
    stats,
    accounts,
    transactions,
    investments,
    isPrivacyMode,
    togglePrivacyMode,
    usdIdrRate,
    setActiveTab,
    setIsAddExpenseOpen,
    setIsTransferOpen,
    setTransferInitialMode,
    setIsAddInvestmentOpen,
    setIsAddAccountOpen,
    setEditingTransaction,
  } = useFinance();

  const netWorthIdr = stats?.totalNetWorthIdr || 0;
  const netWorthUsd = usdIdrRate > 0 ? netWorthIdr / usdIdrRate : 0;
  const liquidCashIdr = stats?.totalLiquidCashIdr || 0;
  const investmentValueIdr = stats?.totalInvestmentValueIdr || 0;
  const unrealizedPnlIdr = stats?.unrealizedPnlIdr || 0;
  const pnlPercent = stats?.unrealizedPnlPercentage || 0;

  const monthlyExpenses = stats?.monthlyExpenses || 0;
  const monthlyIncomes = stats?.monthlyIncomes || 0;
  const monthlyTransfersToInv = stats?.monthlyTransfersToInv || 0;

  const recentTransactions = transactions.slice(0, 6);

  // Group investments by category for quick overview
  const categoryAllocations = stats?.categoryAllocations || {};

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Privacy banner notice if active */}
      {isPrivacyMode && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Privacy Mode Active:</strong> Net worth and account balances are masked for public safety.
            </span>
          </div>
          <button
            onClick={togglePrivacyMode}
            className="text-amber-400 hover:text-white underline font-semibold text-xs cursor-pointer ml-3 shrink-0"
          >
            Reveal Balances
          </button>
        </div>
      )}

      {/* HERO NET WORTH CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-6 sm:p-7 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Net Worth
              </span>
              <button
                onClick={togglePrivacyMode}
                className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={isPrivacyMode ? 'Unmask nominal' : 'Hide nominal for public view'}
              >
                {isPrivacyMode ? (
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Big Net Worth Nominal */}
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                {formatMasked(netWorthIdr, 'IDR', isPrivacyMode)}
              </h2>
              {!isPrivacyMode && (
                <span className="text-xs sm:text-sm font-semibold text-slate-400 font-mono">
                  &asymp; {formatUsd(netWorthUsd)}
                </span>
              )}
            </div>

            {/* Clean Secondary Stat Summary */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <span className="text-slate-400">
                Liquid: <strong className="text-slate-200 font-mono">{formatMasked(liquidCashIdr, 'IDR', isPrivacyMode)}</strong>
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-slate-400">
                Invested: <strong className="text-slate-200 font-mono">{formatMasked(investmentValueIdr, 'IDR', isPrivacyMode)}</strong>
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className={`font-bold font-mono ${unrealizedPnlIdr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {unrealizedPnlIdr >= 0 ? '+' : ''}{pnlPercent.toFixed(1)}% ROI
              </span>
            </div>
          </div>

          {/* Clean Unified Action Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700/80 transition-all cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-rose-400" />
              <span>+ Expense</span>
            </button>

            <button
              onClick={() => {
                setTransferInitialMode('bank_to_investment');
                setIsTransferOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700/80 transition-all cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Fund Invest</span>
            </button>

            <button
              onClick={() => {
                setTransferInitialMode('account_to_account');
                setIsTransferOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700/80 transition-all cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Transfer</span>
            </button>
          </div>
        </div>
      </div>

      {/* MONTHLY SUMMARY METRICS (3 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Expenses this month */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-semibold uppercase tracking-wider">This Month Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
            {formatMasked(monthlyExpenses, 'IDR', isPrivacyMode)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Deducted from bank & cash wallets</p>
        </div>

        {/* Incomes this month */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-semibold uppercase tracking-wider">This Month Inflows</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            {formatMasked(monthlyIncomes, 'IDR', isPrivacyMode)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Salary, dividends & deposits</p>
        </div>

        {/* Invested this month */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-semibold uppercase tracking-wider">Invested This Month</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">
            {formatMasked(monthlyTransfersToInv, 'IDR', isPrivacyMode)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Transferred directly from banks</p>
        </div>
      </div>

      {/* PORTFOLIO ASSET BREAKDOWN (THE 5 REQUESTED CATEGORIES) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Investment Portfolio Breakdown</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                {investments.length} Assets
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              USD, Bitcoin, Saham, RDPU & ETF USA
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddInvestmentOpen(true)}
              className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Asset</span>
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Saham */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 font-bold text-blue-400">
                <Building className="w-4 h-4" />
                <span>Saham</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">IDR</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-white font-mono">
              {formatMasked(categoryAllocations['Saham']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {categoryAllocations['Saham']?.count || 0} holding(s)
            </p>
          </div>

          {/* RDPU */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 font-bold text-teal-400">
                <Landmark className="w-4 h-4" />
                <span>RDPU</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">IDR</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-white font-mono">
              {formatMasked(categoryAllocations['RDPU']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {categoryAllocations['RDPU']?.count || 0} holding(s)
            </p>
          </div>

          {/* Bitcoin */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Coins className="w-4 h-4" />
                <span>Bitcoin</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">USD</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-white font-mono">
              {formatMasked(categoryAllocations['Bitcoin']?.usdValue || 0, 'USD', isPrivacyMode)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              &asymp; {formatMasked(categoryAllocations['Bitcoin']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
          </div>

          {/* ETF USA */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 font-bold text-purple-400">
                <Globe className="w-4 h-4" />
                <span>ETF USA</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">USD</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-white font-mono">
              {formatMasked(categoryAllocations['ETF USA']?.usdValue || 0, 'USD', isPrivacyMode)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              &asymp; {formatMasked(categoryAllocations['ETF USA']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
          </div>

          {/* USD */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <Wallet className="w-4 h-4" />
                <span>USD Cash</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">USD</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-white font-mono">
              {formatMasked(categoryAllocations['USD']?.usdValue || 0, 'USD', isPrivacyMode)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              &asymp; {formatMasked(categoryAllocations['USD']?.idrValue || 0, 'IDR', isPrivacyMode)}
            </p>
          </div>
        </div>
      </div>

      {/* TWO COLUMNS: BANK/CASH ACCOUNTS & RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BANK & CASH ACCOUNTS */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Banks & Cash Wallets</h3>
              <p className="text-xs text-slate-400">
                Source of funds for daily expenses & investments
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddAccountOpen(true)}
                className="text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bank</span>
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                Manage
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-10 rounded-full"
                    style={{ backgroundColor: acc.color || '#3b82f6' }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{acc.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-slate-800 text-slate-400">
                        {acc.type}
                      </span>
                    </div>
                    {acc.accountNumber && (
                      <p className="text-xs text-slate-500 font-mono">{acc.accountNumber}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
                    {formatMasked(acc.balance, 'IDR', isPrivacyMode)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
            <span>Total Liquid IDR:</span>
            <span className="font-bold text-white font-mono text-sm">
              {formatMasked(liquidCashIdr, 'IDR', isPrivacyMode)}
            </span>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Recent Activity</h3>
              <p className="text-xs text-slate-400">Expenses, transfers & investment deposits</p>
            </div>
            <button
              onClick={() => setActiveTab('expenses')}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              View Full History
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent transactions recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((tx) => {
                const sourceAcc = accounts.find((a) => a.id === tx.accountId);
                const destAcc = accounts.find((a) => a.id === tx.toAccountId);
                const targetInv = investments.find((i) => i.id === tx.toInvestmentId);

                return (
                  <div
                    key={tx.id}
                    onClick={() => {
                      if (tx.type === 'expense' || tx.type === 'income') {
                        setEditingTransaction(tx);
                        setIsAddExpenseOpen(true);
                      }
                    }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'expense'
                            ? 'bg-rose-500/15 text-rose-400'
                            : tx.type === 'income'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : tx.type === 'bank_to_investment'
                            ? 'bg-indigo-500/15 text-indigo-400'
                            : 'bg-blue-500/15 text-blue-400'
                        }`}
                      >
                        {tx.type === 'expense' && <Receipt className="w-4 h-4" />}
                        {tx.type === 'income' && <ArrowDownRight className="w-4 h-4" />}
                        {tx.type === 'bank_to_investment' && <TrendingUp className="w-4 h-4" />}
                        {tx.type === 'transfer' && <ArrowRightLeft className="w-4 h-4" />}
                      </div>

                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-white">
                          {tx.type === 'bank_to_investment'
                            ? `Funded ${targetInv?.name || 'Investment'}`
                            : tx.type === 'transfer'
                            ? `Transfer to ${destAcc?.name || 'Cash'}`
                            : tx.category || 'General'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {sourceAcc?.name || 'Bank'} &bull; {formatDate(tx.date)}
                          {tx.notes ? ` &bull; ${tx.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs sm:text-sm font-bold font-mono ${
                          tx.type === 'expense'
                            ? 'text-rose-400'
                            : tx.type === 'income'
                            ? 'text-emerald-400'
                            : tx.type === 'bank_to_investment'
                            ? 'text-indigo-400'
                            : 'text-blue-400'
                        }`}
                      >
                        {tx.type === 'expense' ? '-' : tx.type === 'income' ? '+' : ''}
                        {formatMasked(tx.amount, 'IDR', isPrivacyMode)}
                      </span>
                      {tx.type === 'bank_to_investment' && tx.amountUsd && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          +{formatUsd(tx.amountUsd)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
