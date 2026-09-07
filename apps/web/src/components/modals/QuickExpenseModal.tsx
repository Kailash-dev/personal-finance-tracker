import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { dataProvider } from '../../services/dataProvider';
import { QUICK_CATEGORY_CHIPS, PAYMENT_METHODS, formatINR } from '@personal-finance/shared';
import { X, Check, Zap, ArrowRightLeft } from 'lucide-react';

export const QuickExpenseModal: React.FC = () => {
  const { isQuickModalOpen, setIsQuickModalOpen, accounts, triggerRefresh } = useFinance();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedChip, setSelectedChip] = useState(QUICK_CATEGORY_CHIPS[0]);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || 'acc_hdfc_salary');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'NET_BANKING'>('UPI');
  const [isTransfer, setIsTransfer] = useState(false);
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuickModalOpen) return null;

  const handleChipSelect = (chip: typeof QUICK_CATEGORY_CHIPS[0]) => {
    setSelectedChip(chip);
    if (!description || QUICK_CATEGORY_CHIPS.some((c) => c.name === description)) {
      setDescription(chip.name);
    }
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

      await dataProvider.createTransaction({
        accountId: selectedAccountId,
        toAccountId: isTransfer ? toAccountId : undefined,
        categoryId: isTransfer ? 'cat_transfer' : catId,
        subcategoryId: isTransfer ? 'sub_acc_transfer' : subId,
        date,
        description: description || (isTransfer ? 'Account Transfer' : selectedChip.name),
        amount: isTransfer ? -numAmount : -numAmount,
        type: isTransfer ? 'TRANSFER' : (catId === 'cat_financial' && subId?.includes('emi') ? 'DEBT_PAYMENT' : 'EXPENSE'),
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
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Quick Expense</h3>
              <p className="text-[11px] text-slate-400">Log an expense in under 10 seconds</p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                className="w-full pl-10 pr-4 py-3.5 text-3xl font-extrabold tracking-tight rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                required
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1.5 px-2">
                {formatINR(parseFloat(amount))}
              </p>
            )}
          </div>

          {/* Transfer toggle */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-500">Is this a Self Transfer?</span>
            <button
              type="button"
              onClick={() => setIsTransfer(!isTransfer)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                isTransfer
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{isTransfer ? 'Transfer Mode' : 'Regular Expense'}</span>
            </button>
          </div>

          {!isTransfer ? (
            /* Quick Category Chips (<10s Fast Entry) */
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                Quick Category
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {QUICK_CATEGORY_CHIPS.map((chip) => {
                  const isSelected = selectedChip.id === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleChipSelect(chip)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-bold shadow-sm scale-105'
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
          ) : (
            /* Transfer Account Selectors */
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">From Account</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full text-xs font-medium p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatINR(a.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">To Account</label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full text-xs font-medium p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  {accounts.filter((a) => a.id !== selectedAccountId).map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatINR(a.currentBalance)})
                    </option>
                  ))}
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
                placeholder="e.g. Lunch at Cafe"
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
          {!isTransfer && (
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
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatINR(a.currentBalance)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Transaction</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
