import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet,
  Eye,
  EyeOff,
  Plus,
  ArrowRightLeft,
  TrendingUp,
  Receipt,
  LogOut,
  User as UserIcon,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatIdr } from '../lib/formatters';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    activeTab,
    setActiveTab,
    isPrivacyMode,
    togglePrivacyMode,
    usdIdrRate,
    updateRate,
    refreshData,
    isLoading,
    setIsAddExpenseOpen,
    setIsTransferOpen,
    setTransferInitialMode,
    setIsAddInvestmentOpen,
    setIsAddAccountOpen,
    setEditingTransaction,
    setEditingInvestment,
    setEditingAccount,
  } = useFinance();

  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [newRateInput, setNewRateInput] = useState(usdIdrRate.toString());
  const [rateUpdatedToast, setRateUpdatedToast] = useState(false);

  const newMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
        setIsEditingRate(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveRate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(newRateInput);
    if (!isNaN(parsed) && parsed > 0) {
      await updateRate(parsed);
      setRateUpdatedToast(true);
      setTimeout(() => {
        setRateUpdatedToast(false);
        setIsEditingRate(false);
      }, 1500);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'investments', label: 'Portfolio' },
    { id: 'stats', label: 'Analytics' },
  ] as const;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Logo */}
          <div className="flex items-center gap-7">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/15 group-hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              </div>
              <span className="font-bold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                WealthTrack
              </span>
            </button>

            {/* Desktop Clean Navigation Tabs */}
            <nav className="hidden md:flex items-center p-1 bg-slate-900/80 rounded-xl border border-slate-800/80">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Privacy Toggle + Unified '+ New' Action + Profile Menu */}
          <div className="flex items-center gap-2">
            {/* Minimal Privacy Shield Button */}
            <button
              onClick={togglePrivacyMode}
              title={isPrivacyMode ? 'Privacy Mode Active: Nominals hidden' : 'Hide nominals in public'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isPrivacyMode
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {isPrivacyMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Hidden</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Privacy</span>
                </>
              )}
            </button>

            {/* Clean '+ New' Dropdown Menu (Replaces the 3 cluttered colorful buttons!) */}
            <div className="relative" ref={newMenuRef}>
              <button
                onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">New</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isNewMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isNewMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 p-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Quick Action
                  </div>

                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setEditingTransaction(null);
                      setIsAddExpenseOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <span>Record Expense</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setTransferInitialMode('bank_to_investment');
                      setIsTransferOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span>Bank &rarr; Investment</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setTransferInitialMode('account_to_account');
                      setIsTransferOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </div>
                    <span>Move Bank to Cash</span>
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setEditingInvestment(null);
                      setIsAddInvestmentOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span>Add Investment Asset</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsNewMenuOpen(false);
                      setEditingAccount(null);
                      setIsAddAccountOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Add Bank / Cash Account</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile & Secondary Settings Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xs font-bold text-slate-200">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-1">
                  {/* User info */}
                  <div className="px-2.5 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-white truncate">{user?.name || 'Account'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>

                  {/* Currency Rate Controller */}
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 my-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span>USD / IDR Rate:</span>
                      <span className="font-semibold text-emerald-400 font-mono">
                        {formatIdr(usdIdrRate).replace('Rp ', '')}
                      </span>
                    </div>

                    {!isEditingRate ? (
                      <button
                        onClick={() => {
                          setNewRateInput(usdIdrRate.toString());
                          setIsEditingRate(true);
                        }}
                        className="w-full text-center py-1 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800/60 rounded cursor-pointer"
                      >
                        Adjust Rate
                      </button>
                    ) : (
                      <form onSubmit={handleSaveRate} className="space-y-1.5 pt-0.5">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">Rp</span>
                          <input
                            type="number"
                            value={newRateInput}
                            onChange={(e) => setNewRateInput(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 pl-6 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                            autoFocus
                          />
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsEditingRate(false)}
                            className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-bold text-[10px] rounded"
                          >
                            {rateUpdatedToast ? 'Saved!' : 'Save'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Sync action */}
                  <button
                    onClick={() => {
                      refreshData();
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
                      <span>Sync Data</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Auto</span>
                  </button>

                  <div className="border-t border-slate-800 my-1" />

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
