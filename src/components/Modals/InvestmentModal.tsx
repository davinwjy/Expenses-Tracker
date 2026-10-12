import React, { useState, useEffect } from 'react';
import { X, Check, TrendingUp, RotateCcw, AlertCircle, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { InvestmentCategory } from '../../types';
import { formatIdr, formatUsd } from '../../lib/formatters';

const INVESTMENT_CATEGORIES: { id: InvestmentCategory; label: string; currency: 'IDR' | 'USD'; example: string }[] = [
  { id: 'Saham', label: 'Saham (ID Stocks)', currency: 'IDR', example: 'e.g. BBCA, BBRI, ASII' },
  { id: 'RDPU', label: 'RDPU (Money Market)', currency: 'IDR', example: 'e.g. Sucorinvest Stable Fund' },
  { id: 'ETF USA', label: 'ETF USA (S&P 500)', currency: 'USD', example: 'e.g. VOO, QQQ, SCHD, SPY' },
  { id: 'Bitcoin', label: 'Bitcoin (BTC)', currency: 'USD', example: 'e.g. Cold storage, Indodax' },
  { id: 'USD', label: 'USD Holdings', currency: 'USD', example: 'e.g. Wise USD balance, Deposit' },
];

export const InvestmentModal: React.FC = () => {
  const {
    isAddInvestmentOpen,
    setIsAddInvestmentOpen,
    editingInvestment,
    setEditingInvestment,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    usdIdrRate,
  } = useFinance();

  const [category, setCategory] = useState<InvestmentCategory>('Saham');
  const [name, setName] = useState('');
  const [amountInvested, setAmountInvested] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [units, setUnits] = useState('');
  const [platform, setPlatform] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selectedCategoryMeta = INVESTMENT_CATEGORIES.find((c) => c.id === category)!;
  const isUsd = selectedCategoryMeta.currency === 'USD';

  useEffect(() => {
    if (isAddInvestmentOpen) {
      if (editingInvestment) {
        setCategory(editingInvestment.category);
        setName(editingInvestment.name);
        setAmountInvested(editingInvestment.amountInvested.toString());
        setCurrentValue(editingInvestment.currentValue.toString());
        setUnits(editingInvestment.units !== undefined ? editingInvestment.units.toString() : '');
        setPlatform(editingInvestment.platform || '');
        setNotes(editingInvestment.notes || '');
      } else {
        resetFields();
      }
      setError('');
      setConfirmDelete(false);
    }
  }, [isAddInvestmentOpen, editingInvestment]);

  const resetFields = () => {
    setCategory('Saham');
    setName('');
    setAmountInvested('');
    setCurrentValue('');
    setUnits('');
    setPlatform('');
    setNotes('');
    setError('');
  };

  const handleClose = () => {
    resetFields();
    setEditingInvestment(null);
    setIsAddInvestmentOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter an investment name or ticker');
      return;
    }

    const parsedInvested = Number(amountInvested);
    if (isNaN(parsedInvested) || parsedInvested < 0) {
      setError('Please enter a valid invested amount');
      return;
    }

    const parsedCurrent = currentValue !== '' ? Number(currentValue) : parsedInvested;
    if (isNaN(parsedCurrent) || parsedCurrent < 0) {
      setError('Please enter a valid current value');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingInvestment) {
        await updateInvestment(editingInvestment.id, {
          name: name.trim(),
          category,
          amountInvested: parsedInvested,
          currentValue: parsedCurrent,
          units: units ? Number(units) : undefined,
          platform: platform.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        await addInvestment({
          name: name.trim(),
          category,
          amountInvested: parsedInvested,
          currentValue: parsedCurrent,
          units: units ? Number(units) : undefined,
          platform: platform.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }

      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save investment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingInvestment) return;
    setIsSubmitting(true);
    try {
      await deleteInvestment(editingInvestment.id);
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete investment');
      setIsSubmitting(false);
    }
  };

  const invNumber = Number(amountInvested) || 0;
  const curNumber = currentValue !== '' ? Number(currentValue) : invNumber;
  const pnl = curNumber - invNumber;
  const pnlPercent = invNumber > 0 ? (pnl / invNumber) * 100 : 0;

  if (!isAddInvestmentOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] z-10 overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in sm:zoom-in-95">
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-700/80" />
        </div>

        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base leading-tight">
                {editingInvestment ? 'Edit Investment' : 'Add Investment Asset'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Track USD, Bitcoin, Saham, RDPU, and US ETFs
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
        <form id="investment-modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Selector (Scrollable horizontally on mobile, clean grid on desktop) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Investment Category <span className="text-rose-400">*</span>
            </label>
            <div className="flex overflow-x-auto pb-1 sm:pb-0 sm:grid sm:grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs no-scrollbar">
              {INVESTMENT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2 px-3 rounded-lg font-semibold text-center whitespace-nowrap transition-all cursor-pointer shrink-0 sm:shrink ${
                    category === cat.id
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span>{cat.id}</span>
                  <span className="block text-[10px] opacity-75 font-mono">({cat.currency})</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Denomination: <strong className="text-emerald-400">{selectedCategoryMeta.currency}</strong> &bull; {selectedCategoryMeta.example}
            </p>
          </div>

          {/* Asset Name / Ticker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Asset Name or Ticker <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={selectedCategoryMeta.example}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-600 focus:outline-none"
              required
              autoFocus
            />
          </div>

          {/* Amount Invested & Current Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Invested Principal ({isUsd ? 'USD' : 'IDR'}) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {isUsd ? '$' : 'Rp'}
                </span>
                <input
                  type="number"
                  step={isUsd ? '0.01' : '1000'}
                  value={amountInvested}
                  onChange={(e) => setAmountInvested(e.target.value)}
                  placeholder={isUsd ? '100.00' : '1,000,000'}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-base sm:text-sm font-bold text-white placeholder-slate-600 focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Current Market Value ({isUsd ? 'USD' : 'IDR'})
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {isUsd ? '$' : 'Rp'}
                </span>
                <input
                  type="number"
                  step={isUsd ? '0.01' : '1000'}
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder={amountInvested || (isUsd ? '100.00' : '1,000,000')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-3 py-2.5 text-base sm:text-sm font-bold text-white placeholder-slate-600 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Live PnL Preview */}
          {invNumber > 0 && (
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between text-xs gap-2">
              <div>
                <span className="text-slate-400">Unrealized PnL: </span>
                <span className={`font-bold font-mono ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {pnl >= 0 ? '+' : ''}
                  {isUsd ? formatUsd(pnl) : formatIdr(pnl)} ({pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                </span>
              </div>
              {isUsd && (
                <div className="text-slate-400 text-[11px]">
                  IDR Value: <strong className="text-white font-mono">{formatIdr(curNumber * usdIdrRate)}</strong>
                </div>
              )}
            </div>
          )}

          {/* Units & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Quantity / Units (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder={category === 'Bitcoin' ? 'e.g. 0.015 BTC' : 'e.g. 10 shares / lots'}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Platform / App (Optional)
              </label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="e.g. GoTrade, Bibit, Ajaib, Indodax"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. DCA monthly, long term hold..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-600 focus:outline-none"
            />
          </div>
        </form>

        {/* Sticky Docked Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-2">
          {editingInvestment ? (
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
              form="investment-modal-form"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Saving...' : editingInvestment ? 'Update' : 'Add Investment'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
