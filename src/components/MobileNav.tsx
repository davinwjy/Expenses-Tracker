import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  WalletCards,
  PieChart,
  Plus,
  ArrowRightLeft,
  TrendingUp,
  X,
  Building2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const MobileNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAddExpenseOpen,
    setIsTransferOpen,
    setTransferInitialMode,
    setIsAddInvestmentOpen,
    setIsAddAccountOpen,
    setEditingTransaction,
    setEditingInvestment,
    setEditingAccount,
  } = useFinance();

  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      {isQuickMenuOpen && (
        <div
          onClick={() => setIsQuickMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Streamlined Quick Action Sheet */}
      {isQuickMenuOpen && (
        <div className="fixed bottom-20 inset-x-4 z-50 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-2 animate-in slide-in-from-bottom-5 max-w-sm mx-auto">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-white tracking-wide">Quick Action</span>
            <button
              onClick={() => setIsQuickMenuOpen(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                setEditingTransaction(null);
                setIsAddExpenseOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Record Expense</p>
                <p className="text-[11px] text-slate-400">Deduct from Bank or Cash</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                setTransferInitialMode('bank_to_investment');
                setIsTransferOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Bank to Investment</p>
                <p className="text-[11px] text-slate-400">Directly fund stocks, crypto, USD</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                setTransferInitialMode('account_to_account');
                setIsTransferOpen(true);
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Move Bank to Cash</p>
                <p className="text-[11px] text-slate-400">Inter-account fund transfer</p>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                setEditingInvestment(null);
                setIsAddInvestmentOpen(true);
              }}
              className="py-2 px-3 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold text-center"
            >
              + Investment
            </button>
            <button
              onClick={() => {
                setIsQuickMenuOpen(false);
                setEditingAccount(null);
                setIsAddAccountOpen(true);
              }}
              className="py-2 px-3 rounded-lg bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold text-center"
            >
              + Bank / Cash
            </button>
          </div>
        </div>
      )}

      {/* Sleek Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-3 py-1.5">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Home */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span className="text-[10px] font-medium mt-1">Home</span>
          </button>

          {/* Expenses */}
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'expenses' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4.5 h-4.5" />
            <span className="text-[10px] font-medium mt-1">Expenses</span>
          </button>

          {/* Clean Center Action Button */}
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="flex items-center justify-center w-10 h-10 -mt-3 rounded-full bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
            aria-label="New Action"
          >
            <Plus className={`w-5 h-5 stroke-[2.5] transition-transform duration-150 ${isQuickMenuOpen ? 'rotate-45' : ''}`} />
          </button>

          {/* Accounts */}
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'accounts' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <WalletCards className="w-4.5 h-4.5" />
            <span className="text-[10px] font-medium mt-1">Accounts</span>
          </button>

          {/* Portfolio */}
          <button
            onClick={() => setActiveTab('investments')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'investments' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-4.5 h-4.5" />
            <span className="text-[10px] font-medium mt-1">Portfolio</span>
          </button>
        </div>
      </div>
    </>
  );
};
