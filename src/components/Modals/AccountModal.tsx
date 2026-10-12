import React, { useState, useEffect } from 'react';
import { X, Check, CreditCard, RotateCcw, AlertCircle, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { AccountType } from '../../types';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#64748b', // slate
];

export const AccountModal: React.FC = () => {
  const {
    isAddAccountOpen,
    setIsAddAccountOpen,
    editingAccount,
    setEditingAccount,
    addAccount,
    updateAccount,
    deleteAccount,
  } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isAddAccountOpen) {
      if (editingAccount) {
        setName(editingAccount.name);
        setType(editingAccount.type);
        setBalance(editingAccount.balance.toString());
        setAccountNumber(editingAccount.accountNumber || '');
        setColor(editingAccount.color || '#3b82f6');
      } else {
        resetFields();
      }
      setError('');
      setConfirmDelete(false);
    }
  }, [isAddAccountOpen, editingAccount]);

  const resetFields = () => {
    setName('');
    setType('bank');
    setBalance('0');
    setAccountNumber('');
    setColor('#3b82f6');
    setError('');
  };

  const handleClose = () => {
    resetFields();
    setEditingAccount(null);
    setIsAddAccountOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter an account name');
      return;
    }

    const parsedBalance = Number(balance);
    if (isNaN(parsedBalance)) {
      setError('Please enter a valid numeric balance');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, {
          name: name.trim(),
          type,
          balance: parsedBalance,
          accountNumber: accountNumber.trim() || undefined,
          color,
        });
      } else {
        await addAccount({
          name: name.trim(),
          type,
          balance: parsedBalance,
          accountNumber: accountNumber.trim() || undefined,
          color,
        });
      }

      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingAccount) return;
    setIsSubmitting(true);
    try {
      await deleteAccount(editingAccount.id);
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete account');
      setIsSubmitting(false);
    }
  };

  if (!isAddAccountOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10 overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-700/80" />
        </div>

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base leading-tight">
                {editingAccount ? 'Edit Account' : 'Add Bank or Cash'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {editingAccount ? 'Update account info or balance' : 'Custom Bank, E-Wallet or Physical Cash'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={resetFields}
              title="Reset fields"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form id="account-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Type Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Account Type
            </label>
            <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setType('bank')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  type === 'bank' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bank
              </button>
              <button
                type="button"
                onClick={() => setType('cash')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  type === 'cash' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cash
              </button>
              <button
                type="button"
                onClick={() => setType('ewallet')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  type === 'ewallet' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                E-Wallet
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Account Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BCA, Mandiri, Cash Dompet, GoPay..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-600 focus:outline-none"
              required
              autoFocus
            />
          </div>

          {/* Balance (IDR) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Current Balance (IDR) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                step="1000"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl pl-11 pr-4 py-2.5 text-base font-bold text-white placeholder-slate-600 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Account Number (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Account Number / Note (Optional)
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 521098231 or •••• 4821"
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-600 focus:outline-none"
            />
          </div>

          {/* Color Tag */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Card Accent Color
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer ${
                    color === c ? 'scale-110 border-white' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </form>

        {/* Sticky Docked Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-2">
          {editingAccount ? (
            confirmDelete ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-3 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl cursor-pointer transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="account-modal-form"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving...' : editingAccount ? 'Update' : 'Add Account'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
