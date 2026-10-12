import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Filter,
  Search,
  Calendar,
  Trash2,
  Edit2,
  ArrowDownRight,
  TrendingUp,
  ArrowRightLeft,
  X,
  CreditCard,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatIdr, formatUsd, formatMasked, formatDate, CATEGORY_COLORS } from '../lib/formatters';
import { Transaction } from '../types';

export const ExpensesView: React.FC = () => {
  const {
    transactions,
    accounts,
    investments,
    isPrivacyMode,
    setIsAddExpenseOpen,
    setEditingTransaction,
    deleteTransaction,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCat = tx.category.toLowerCase().includes(q);
      const matchNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
      if (!matchCat && !matchNotes) return false;
    }

    // Account filter
    if (selectedAccountFilter !== 'all') {
      if (tx.accountId !== selectedAccountFilter && tx.toAccountId !== selectedAccountFilter) {
        return false;
      }
    }

    // Type filter
    if (selectedTypeFilter !== 'all') {
      if (tx.type !== selectedTypeFilter) return false;
    }

    return true;
  });

  // Calculate totals for filtered list
  const totalFilteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setDeletingId(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header & Main CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Expenses & Transactions</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold">
              {filteredTransactions.length}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Track daily living expenses with Bank and Cash funding sources
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsAddExpenseOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Filter and Summary Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        {/* Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or notes..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div>
            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
            >
              <option value="all">All Accounts (Banks & Cash)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none"
            >
              <option value="all">All Transaction Types</option>
              <option value="expense">Expenses Only (-)</option>
              <option value="income">Incomes Only (+)</option>
              <option value="transfer">Bank &harr; Cash Transfers</option>
              <option value="bank_to_investment">Bank &rarr; Investments</option>
            </select>
          </div>
        </div>

        {/* Filtered Summary Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400">Total Filtered Expenses:</span>
            <span className="font-bold text-rose-400 font-mono text-sm">
              {formatMasked(totalFilteredExpense, 'IDR', isPrivacyMode)}
            </span>
          </div>

          {totalFilteredIncome > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Total Inflows:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">
                {formatMasked(totalFilteredIncome, 'IDR', isPrivacyMode)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">No transactions found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search filters or record a new expense.
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const sourceAcc = accounts.find((a) => a.id === tx.accountId);
            const destAcc = accounts.find((a) => a.id === tx.toAccountId);
            const targetInv = investments.find((i) => i.id === tx.toInvestmentId);
            const catColor = CATEGORY_COLORS[tx.category] || '#94a3b8';

            return (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all gap-3"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'expense'
                        ? 'bg-rose-500/15 text-rose-400'
                        : tx.type === 'income'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : tx.type === 'bank_to_investment'
                        ? 'bg-indigo-500/15 text-indigo-400'
                        : 'bg-blue-500/15 text-blue-400'
                    }`}
                  >
                    {tx.type === 'expense' && <Receipt className="w-5 h-5" />}
                    {tx.type === 'income' && <ArrowDownRight className="w-5 h-5" />}
                    {tx.type === 'bank_to_investment' && <TrendingUp className="w-5 h-5" />}
                    {tx.type === 'transfer' && <ArrowRightLeft className="w-5 h-5" />}
                  </div>

                  {/* Details */}
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm sm:text-base">
                        {tx.type === 'bank_to_investment'
                          ? `Funded ${targetInv?.name || 'Investment'}`
                          : tx.type === 'transfer'
                          ? `Moved to ${destAcc?.name || 'Cash'}`
                          : tx.category}
                      </span>
                      {tx.type === 'expense' && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-slate-950"
                          style={{ backgroundColor: catColor }}
                        >
                          {tx.category}
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.2 rounded font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                        {tx.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        {sourceAcc?.name || 'Account'}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(tx.date)}
                      </span>
                      {tx.notes && (
                        <>
                          <span>&bull;</span>
                          <span className="italic text-slate-300">"{tx.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-base sm:text-lg font-black font-mono ${
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
                      <p className="text-xs text-slate-400 font-mono">
                        +{formatUsd(tx.amountUsd)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {tx.type === 'expense' && (
                      <button
                        onClick={() => {
                          setEditingTransaction(tx);
                          setIsAddExpenseOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {deletingId === tx.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-1.5 py-1 text-slate-400 text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(tx.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
