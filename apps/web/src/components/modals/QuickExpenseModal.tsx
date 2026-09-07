import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { dataProvider } from '../../services/dataProvider';
import { QUICK_CATEGORY_CHIPS, QUICK_INCOME_CHIPS, QuickExpenseChip, formatINR } from '@personal-finance/shared';
import {
  X,
  Check,
  Zap,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Tag,
  Layers,
  Calendar,
  CreditCard,
  Building2,
  FileText,
} from 'lucide-react';

export const QuickExpenseModal: React.FC = () => {
  const {
    isQuickModalOpen,
    setIsQuickModalOpen,
    quickModalPreset,
    accounts,
    categories,
    selectedMonth,
    triggerRefresh,
  } = useFinance();

  const [mode, setMode] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [activeGroup, setActiveGroup] = useState<'all' | 'essentials' | 'bills' | 'lifestyle' | 'financial'>('all');
  const [selectedChipId, setSelectedChipId] = useState<string>('cat_housing:sub_rent');

  // Hierarchical category selection state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat_housing');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('sub_rent');
  const [useCustomCategory, setUseCustomCategory] = useState<boolean>(false);

  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'NET_BANKING' | 'AUTO_DEBIT'>('UPI');
  
  // Default date to today's date formatted as YYYY-MM-DD
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with preset when opened
  useEffect(() => {
    if (isQuickModalOpen) {
      if (quickModalPreset) {
        if (quickModalPreset.mode) setMode(quickModalPreset.mode);
        if (quickModalPreset.amount) setAmount(quickModalPreset.amount.toString());
        if (quickModalPreset.description) setDescription(quickModalPreset.description);

        if (quickModalPreset.categoryId) {
          setSelectedCategoryId(quickModalPreset.categoryId);
          if (quickModalPreset.subcategoryId) {
            setSelectedSubcategoryId(quickModalPreset.subcategoryId);
            setSelectedChipId(`${quickModalPreset.categoryId}:${quickModalPreset.subcategoryId}`);
          } else {
            setSelectedChipId(quickModalPreset.categoryId);
          }
        }
      } else {
        // Default clean state
        if (mode === 'EXPENSE') {
          const defaultChip = QUICK_CATEGORY_CHIPS[0];
          setSelectedChipId(defaultChip.id);
          setDescription(defaultChip.defaultDesc || defaultChip.name);
          const [cat, sub] = defaultChip.id.includes(':') ? defaultChip.id.split(':') : [defaultChip.id, ''];
          setSelectedCategoryId(cat);
          setSelectedSubcategoryId(sub);
        }
      }
    }
  }, [isQuickModalOpen, quickModalPreset]);

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

  // Handle Mode Switch
  const handleModeSwitch = (newMode: 'EXPENSE' | 'INCOME' | 'TRANSFER') => {
    setMode(newMode);
    if (newMode === 'EXPENSE') {
      const defaultChip = QUICK_CATEGORY_CHIPS[0];
      setSelectedChipId(defaultChip.id);
      setDescription(defaultChip.defaultDesc || defaultChip.name);
      const [c, s] = defaultChip.id.split(':');
      setSelectedCategoryId(c);
      setSelectedSubcategoryId(s || '');
    } else if (newMode === 'INCOME') {
      const defaultChip = QUICK_INCOME_CHIPS[0];
      setSelectedChipId(defaultChip.id);
      setDescription(defaultChip.defaultDesc || defaultChip.name);
      const [c, s] = defaultChip.id.split(':');
      setSelectedCategoryId(c);
      setSelectedSubcategoryId(s || '');
    } else {
      setDescription('Self Account Transfer');
    }
  };

  const handleChipSelect = (chip: QuickExpenseChip) => {
    setSelectedChipId(chip.id);
    setDescription(chip.defaultDesc || chip.name);
    setUseCustomCategory(false);
    const [catId, subId] = chip.id.includes(':') ? chip.id.split(':') : [chip.id, ''];
    setSelectedCategoryId(catId);
    setSelectedSubcategoryId(subId || '');
  };

  const handleCategoryDropdownChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat && cat.subcategories && cat.subcategories.length > 0) {
      setSelectedSubcategoryId(cat.subcategories[0].id);
      setSelectedChipId(`${catId}:${cat.subcategories[0].id}`);
      setDescription(`${cat.name} - ${cat.subcategories[0].name}`);
    } else {
      setSelectedSubcategoryId('');
      setSelectedChipId(catId);
      setDescription(cat ? cat.name : '');
    }
  };

  const handleSubcategoryDropdownChange = (subId: string) => {
    setSelectedSubcategoryId(subId);
    setSelectedChipId(`${selectedCategoryId}:${subId}`);
    const cat = categories.find((c) => c.id === selectedCategoryId);
    const sub = cat?.subcategories?.find((s) => s.id === subId);
    if (sub) {
      setDescription(sub.name);
    }
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addValue).toString());
  };

  const filteredChips = QUICK_CATEGORY_CHIPS.filter((chip) => {
    if (activeGroup === 'all') return true;
    return chip.group === activeGroup;
  });

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const finalCat = mode === 'TRANSFER' ? 'cat_transfer' : selectedCategoryId || 'cat_housing';
      const finalSub = mode === 'TRANSFER' ? 'sub_acc_transfer' : selectedSubcategoryId || undefined;
      const finalAmount = mode === 'INCOME' ? numAmount : -numAmount;
      const finalType =
        mode === 'TRANSFER'
          ? 'TRANSFER'
          : mode === 'INCOME'
          ? 'INCOME'
          : finalCat === 'cat_financial' && finalSub?.includes('emi')
          ? 'DEBT_PAYMENT'
          : 'EXPENSE';

      await dataProvider.createTransaction({
        accountId: selectedAccountId || (accounts[0]?.id ?? 'acc_primary'),
        toAccountId: mode === 'TRANSFER' ? toAccountId : undefined,
        categoryId: finalCat,
        subcategoryId: finalSub,
        date,
        description: description || (mode === 'TRANSFER' ? 'Account Transfer' : 'Expense'),
        amount: finalAmount,
        type: finalType,
        paymentMethod,
        notes: notes || undefined,
      });

      // Reset and close
      setAmount('');
      setDescription('');
      setNotes('');
      setIsQuickModalOpen(false);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isQuickModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsQuickModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-150 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                mode === 'INCOME'
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : mode === 'TRANSFER'
                  ? 'bg-purple-500/10 text-purple-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {mode === 'INCOME' ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : mode === 'TRANSFER' ? (
                <ArrowRightLeft className="w-5 h-5" />
              ) : (
                <Zap className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                {mode === 'INCOME'
                  ? 'Log Monthly Income'
                  : mode === 'TRANSFER'
                  ? 'Account Transfer'
                  : 'Log Spend & Living Expenses'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Log Rent, Groceries, Milk, Bills, Maid, Fuel & more in 1-click
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQuickModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-5 sm:px-6 pt-4">
          <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => handleModeSwitch('EXPENSE')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'EXPENSE'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Expense / Spend</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('INCOME')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'INCOME'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Income / Salary</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('TRANSFER')}
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Big Amount Input with Indian Formatter Preview & Quick Buttons */}
          <div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 sm:py-3.5 text-2xl sm:text-3xl font-extrabold tracking-tight rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 ${
                  mode === 'INCOME'
                    ? 'focus:ring-emerald-500'
                    : mode === 'TRANSFER'
                    ? 'focus:ring-purple-500'
                    : 'focus:ring-brand-500'
                }`}
                required
              />
            </div>

            {/* Quick Amount Adders */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[500, 1000, 2000, 5000, 10000, 15000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAddAmount(val)}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
                  >
                    +₹{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
                {amount && (
                  <button
                    type="button"
                    onClick={() => setAmount('')}
                    className="px-2 py-1 text-[10px] font-bold rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              {amount && parseFloat(amount) > 0 && (
                <p
                  className={`text-xs font-bold px-1 ${
                    mode === 'INCOME'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-brand-600 dark:text-brand-400'
                  }`}
                >
                  {mode === 'INCOME' ? '+ ' : '- '}
                  {formatINR(parseFloat(amount))}
                </p>
              )}
            </div>
          </div>

          {/* Category Chips Selection for Expense */}
          {mode === 'EXPENSE' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-500" />
                  <span>Choose Category Preset</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomCategory(!useCustomCategory)}
                  className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  {useCustomCategory ? '← Use Quick Presets' : '🔍 All 40+ Subcategories'}
                </button>
              </div>

              {!useCustomCategory ? (
                <>
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                    {[
                      { id: 'all', label: '⚡ All' },
                      { id: 'essentials', label: '🏠 Essentials (Rent/Grocery/Milk)' },
                      { id: 'bills', label: '⚡ Bills & Utilities' },
                      { id: 'lifestyle', label: '🛍 Lifestyle & Food' },
                      { id: 'financial', label: '💳 EMIs & VC' },
                    ].map((grp) => (
                      <button
                        key={grp.id}
                        type="button"
                        onClick={() => setActiveGroup(grp.id as any)}
                        className={`px-2.5 py-1 rounded-full whitespace-nowrap font-semibold transition-all ${
                          activeGroup === grp.id
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {grp.label}
                      </button>
                    ))}
                  </div>

                  {/* Chips Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1">
                    {filteredChips.map((chip) => {
                      const isSelected = selectedChipId === chip.id;
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => handleChipSelect(chip)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold shadow-sm scale-105'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-xl mb-0.5">{chip.icon}</span>
                          <span className="truncate w-full text-center text-[11px]">{chip.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Full Category & Subcategory Selectors */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Main Category
                    </label>
                    <select
                      value={selectedCategoryId}
                      onChange={(e) => handleCategoryDropdownChange(e.target.value)}
                      className="w-full text-xs font-medium p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Subcategory
                    </label>
                    <select
                      value={selectedSubcategoryId}
                      onChange={(e) => handleSubcategoryDropdownChange(e.target.value)}
                      className="w-full text-xs font-medium p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      {(selectedCategoryObj?.subcategories || []).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.icon} {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Income Category Chips */}
          {mode === 'INCOME' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Income Source
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {QUICK_INCOME_CHIPS.map((chip) => {
                  const isSelected = selectedChipId === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleChipSelect(chip as any)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-lg">{chip.icon}</span>
                      <span className="truncate">{chip.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transfer Account Selectors */}
          {mode === 'TRANSFER' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  From Account (Debited)
                </label>
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
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  To Account (Credited)
                </label>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full text-xs font-medium p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  {accounts.length === 0 ? (
                    <option value="acc_cash">Cash in Hand / ATM</option>
                  ) : (
                    accounts
                      .filter((a) => a.id !== selectedAccountId)
                      .map((a) => (
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
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Description / Merchant
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  mode === 'INCOME' ? 'e.g. September Salary' : 'e.g. Monthly House Rent'
                }
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Date
              </label>
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
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Paid From Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                >
                  <option value="UPI">📱 UPI (GPay/PhonePe/Paytm)</option>
                  <option value="CREDIT_CARD">💳 Credit Card</option>
                  <option value="DEBIT_CARD">💳 Debit Card</option>
                  <option value="CASH">💵 Cash</option>
                  <option value="NET_BANKING">💻 Net Banking</option>
                  <option value="AUTO_DEBIT">🔄 Auto Debit / NACH</option>
                </select>
              </div>
            </div>
          )}

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Landlord UPI ref, Blinkit order ID, 2L buffalo milk"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !amount}
              className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                mode === 'INCOME'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25'
                  : mode === 'TRANSFER'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25'
                  : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-brand-500/25'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                Save {mode === 'INCOME' ? 'Income' : mode === 'TRANSFER' ? 'Transfer' : 'Expense'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
