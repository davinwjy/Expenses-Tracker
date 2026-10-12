import React from 'react';
import {
  CreditCard,
  Plus,
  ArrowRightLeft,
  TrendingUp,
  Edit2,
  Trash2,
  Wallet,
  Landmark,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatIdr, formatMasked } from '../lib/formatters';
import { Account } from '../types';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    isPrivacyMode,
    setIsAddAccountOpen,
    setEditingAccount,
    setIsTransferOpen,
    setTransferInitialMode,
  } = useFinance();

  const bankAccounts = accounts.filter((a) => a.type === 'bank');
  const cashAccounts = accounts.filter((a) => a.type === 'cash');
  const ewalletAccounts = accounts.filter((a) => a.type === 'ewallet');

  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalCashBalance = cashAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalEwalletBalance = ewalletAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalLiquid = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header & Main CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Bank & Cash Accounts</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {accounts.length} Accounts
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage personal banks, physical cash wallets, and transfer funds
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
            <span>Bank &rarr; Investment</span>
          </button>

          <button
            onClick={() => {
              setTransferInitialMode('account_to_account');
              setIsTransferOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Move to Cash</span>
          </button>

          <button
            onClick={() => {
              setEditingAccount(null);
              setIsAddAccountOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Bank / Cash</span>
          </button>
        </div>
      </div>

      {/* Overview Statistics by Account Group */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Liquid Capital</span>
          <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            {formatMasked(totalLiquid, 'IDR', isPrivacyMode)}
          </p>
          <span className="text-[11px] text-slate-500">Across all banks & cash</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-blue-400">
            <span className="font-semibold">Banks</span>
            <Landmark className="w-4 h-4" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-blue-300 font-mono mt-1">
            {formatMasked(totalBankBalance, 'IDR', isPrivacyMode)}
          </p>
          <span className="text-[11px] text-slate-500">{bankAccounts.length} account(s)</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-emerald-400">
            <span className="font-semibold">Physical Cash</span>
            <Coins className="w-4 h-4" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-300 font-mono mt-1">
            {formatMasked(totalCashBalance, 'IDR', isPrivacyMode)}
          </p>
          <span className="text-[11px] text-slate-500">{cashAccounts.length} wallet(s)</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-purple-400">
            <span className="font-semibold">E-Wallets</span>
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-purple-300 font-mono mt-1">
            {formatMasked(totalEwalletBalance, 'IDR', isPrivacyMode)}
          </p>
          <span className="text-[11px] text-slate-500">{ewalletAccounts.length} wallet(s)</span>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const accentColor = acc.color || '#3b82f6';

          return (
            <div
              key={acc.id}
              className="relative p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-slate-700 shadow-lg transition-all group overflow-hidden"
            >
              {/* Top Accent Stripe */}
              <div
                className="absolute top-0 inset-x-0 h-1.5"
                style={{ backgroundColor: accentColor }}
              />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
                  >
                    {acc.type === 'bank' && <Landmark className="w-5 h-5" />}
                    {acc.type === 'cash' && <Coins className="w-5 h-5" />}
                    {acc.type === 'ewallet' && <Wallet className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{acc.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {acc.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingAccount(acc);
                      setIsAddAccountOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit account"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Balance */}
              <div className="space-y-1 mb-5">
                <span className="text-xs text-slate-400 font-medium">Available Balance</span>
                <p className="text-2xl font-black text-white font-mono tracking-tight">
                  {formatMasked(acc.balance, 'IDR', isPrivacyMode)}
                </p>
                {acc.accountNumber && (
                  <p className="text-xs text-slate-500 font-mono">{acc.accountNumber}</p>
                )}
              </div>

              {/* Quick Card Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setTransferInitialMode('account_to_account');
                    setIsTransferOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
                  <span>Transfer</span>
                </button>

                <button
                  onClick={() => {
                    setTransferInitialMode('bank_to_investment');
                    setIsTransferOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Fund Invest</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
