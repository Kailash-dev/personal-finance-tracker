import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { dataProvider } from '../../services/dataProvider';
import { QUICK_CATEGORY_CHIPS, QUICK_INCOME_CHIPS, formatINR } from '@personal-finance/shared';
import { X, Check, Zap, ArrowRightLeft, TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export const QuickExpenseModal: React.FC = () => {
  const { isQuickModalOpen, setIsQuickModalOpen, accounts, selectedMonth, triggerRefresh } = useFinance();

  const [mode, setMode] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedChip, setSelectedChip] = useState(QUICK_CATEGORY_CHIPS[0]);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'NET_BANKING'>('UPI');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  
  // Default date to today's date formatted as YYYY-MM-DD
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accounts.length > 0) {
      if (!selectedAccountId || !accounts.some((a) => a.id === selectedAccountId)) {
        setSelectedAccountId(accounts[0].id);
      }
      if (!toAccountId && accounts.length > 1) {
        setToAccountId(accounts[1].id);
      }
    }
  }, [accounts]);

  // When switching mode, set default chip
  useEffect(() => {
    if (mode === 'EXPENSE') {
      setSelectedChip(QUICK_CATEGORY_CHIPS[0]);
      setDescription(QUICK_CATEGORY_CHIPS[0].name);
    } else if (mode === 'INCOME') {
      setSelectedChip(QUICK_INCOME_CHIPS[0]);
      setDescription(QUICK_INCOME_CHIPS[0].name);
    } else {
      setDescription('Account Transfer');
    }
  }, [mode]);

  if (!isQuickModalOpen) return null;

  const handleChipSelect = (chip: any) => {
    setSelectedChip(chip);
    setDescription(chip.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const [catId, subId] = selectedChip.id.includes(':')
        ? selectedChip.id.split(':')
        : [selectedChip.id, undefined];

      const finalAmount = mode === 'INCOME' ? numAmount : -numAmount;
      const finalType = mode === 'TRANSFER' ? 'TRANSFER' : mode === 'INCOME' ? 'INCOME' : (catId === 'cat_financial' && subId?.includes('emi') ? 'DEBT_PAYMENT' : 'EXPENSE');
      const finalCat = mode === 'TRANSFER' ? 'cat_transfer' : mode === 'INCOME' ? (catId || 'cat_income') : (catId || 'cat_misc');
      const finalSub = mode === 'TRANSFER' ? 'sub_acc_transfer' : subId;

      await dataProvider.createTransaction({
        accountId: selectedAccountId || (accounts[0]?.id ?? 'acc_primary'),
        toAccountId: mode === 'TRANSFER' ? toAccountId : undefined,
        categoryId: finalCat,
        subcategoryId: finalSub,
        date,
        description: description || (mode === 'TRANSFER' ? 'Account Transfer' : selectedChip.name),
        amount: finalAmount,
        type: finalType,
        paymentMethod,
      });

      // Reset and close
      setAmount('');
      setDescription('');
      setIsQuickModalOpen(false);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsQuickModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              mode === 'INCOME' 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : mode === 'TRANSFER' 
                ? 'bg-purple-500/10 text-purple-500' 
                : 'bg-rose-500/10 text-rose-500'
            }`}>
              {mode === 'INCOME' ? <ArrowDownLeft className="w-4 h-4" /> : mode === 'TRANSFER' ? <ArrowRightLeft className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {mode === 'INCOME' ? 'Log Income / Salary' : mode === 'TRANSFER' ? 'Self Account Transfer' : 'Log Expense / Spend'}
              </h3>
              <p className="text-[11px] text-slate-400">Record transaction for your monthly tracking</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setMode('EXPENSE')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'EXPENSE'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('INCOME')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'INCOME'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('TRANSFER')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'TRANSFER'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Big Amount Input with Indian Formatter Preview */}
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-10 pr-4 py-3.5 text-3xl font-extrabold tracking-tight rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${
                  mode === 'INCOME' ? 'focus:ring-emerald-500' : mode === 'TRANSFER' ? 'focus:ring-purple-500' : 'focus:ring-brand-500'
                }`}
                required
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
              <p className={`text-xs font-semibold mt-1.5 px-2 ${
                mode === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-600 dark:text-brand-400'
              }`}>
                {mode === 'INCOME' ? '+ ' : '- '}
                {formatINR(parseFloat(amount))}
              </p>
            )}
          </div>

          {/* Category Chips Selection */}
          {mode !== 'TRANSFER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                {mode === 'INCOME' ? 'Income Category' : 'Quick Category'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(mode === 'INCOME' ? QUICK_INCOME_CHIPS : QUICK_CATEGORY_CHIPS).map((chip) => {
                  const isSelected = selectedChip.id === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleChipSelect(chip)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? mode === 'INCOME'
                            ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm scale-105'
                            : 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-bold shadow-sm scale-105'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-lg mb-0.5">{chip.icon}</span>
                      <span className="truncate w-full text-center text-[11px]">{chip.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transfer Account Selectors */}
          {mode === 'TRANSFER' && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">From Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full text-xs font-medium p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  {accounts.length === 0 ? (
                    <option value="acc_primary">Primary Bank Account (₹0.00)</option>
                  ) : (
                    accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatINR(a.currentBalance)})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">To Account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full text-xs font-medium p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  {accounts.length === 0 ? (
                    <option value="acc_cash">Cash in Hand / ATM</option>
                  ) : (
                    accounts.filter((a) => a.id !== selectedAccountId).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatINR(a.currentBalance)})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Description & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={mode === 'INCOME' ? 'e.g. September Salary' : 'e.g. D-Mart Grocery'}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Account & Payment Method */}
          {mode !== 'TRANSFER' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="UPI">📱 UPI (GPay/PhonePe/Paytm)</option>
                  <option value="CREDIT_CARD">💳 Credit Card</option>
                  <option value="DEBIT_CARD">💳 Debit Card</option>
                  <option value="CASH">💵 Cash</option>
                  <option value="NET_BANKING">💻 Net Banking</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {accounts.length === 0 ? (
                    <option value="acc_primary">Primary Bank Account</option>
                  ) : (
                    accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatINR(a.currentBalance)})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className={`w-full py-3 rounded-2xl text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                mode === 'INCOME'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25'
                  : mode === 'TRANSFER'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25'
                  : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-brand-500/25'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Save {mode === 'INCOME' ? 'Income' : mode === 'TRANSFER' ? 'Transfer' : 'Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
