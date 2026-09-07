import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { dataProvider } from '../services/dataProvider';
import { Transaction } from '@personal-finance/types';
import { formatINR } from '@personal-finance/shared';
import { QuickExpenseLoggerBar } from '../components/dashboard/QuickExpenseLoggerBar';
import { CategorySelectModal } from '../components/modals/CategorySelectModal';
import { EditTransactionModal } from '../components/modals/EditTransactionModal';
import { ManageCategoriesModal } from '../components/modals/ManageCategoriesModal';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
  X,
  Layers,
  CheckCircle2,
  Sparkles,
  Tag,
  CheckSquare,
  Square,
  ChevronDown,
  AlertCircle,
  Settings2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const TransactionsPage: React.FC = () => {
  const {
    categories,
    accounts,
    selectedMonth,
    setSelectedMonth,
    refreshTrigger,
    triggerRefresh,
    openQuickModalWithPreset,
  } = useFinance();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [filterMode, setFilterMode] = useState<'MONTH' | 'ALL'>('MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selection state for Batch Actions
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);

  // Modals state
  const [categoryModalTxns, setCategoryModalTxns] = useState<Transaction[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);

  // Auto-categorize toast notification state
  const [autoCatResult, setAutoCatResult] = useState<string | null>(null);

  // Formatted Month Label
  const monthLabel = (() => {
    try {
      return format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy');
    } catch {
      return selectedMonth;
    }
  })();

  const loadTxns = async () => {
    const activeStartDate = filterMode === 'MONTH' ? `${selectedMonth}-01` : startDate || undefined;
    const activeEndDate = filterMode === 'MONTH' ? `${selectedMonth}-31` : endDate || undefined;

    const res = await dataProvider.getTransactions({
      search,
      categoryId: selectedCategory === 'UNCATEGORIZED' ? undefined : selectedCategory || undefined,
      accountId: selectedAccount || undefined,
      type: selectedType || undefined,
      startDate: activeStartDate,
      endDate: activeEndDate,
    });

    let filtered = res;
    if (selectedCategory === 'UNCATEGORIZED') {
      filtered = res.filter((t) => !t.categoryId || t.categoryId === 'cat_misc' || t.categoryId === '');
    }

    setTransactions(filtered);
  };

  useEffect(() => {
    loadTxns();
  }, [
    search,
    selectedCategory,
    selectedAccount,
    selectedType,
    filterMode,
    selectedMonth,
    startDate,
    endDate,
    refreshTrigger,
  ]);

  // Clean selections when transactions change
  useEffect(() => {
    setSelectedTxIds((prev) => prev.filter((id) => transactions.some((t) => t.id === id)));
  }, [transactions]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? Account balance will be adjusted.')) {
      await dataProvider.deleteTransaction(id);
      triggerRefresh();
    }
  };

  const handleBatchDelete = async () => {
    if (selectedTxIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedTxIds.length} selected transactions?`)) {
      for (const id of selectedTxIds) {
        await dataProvider.deleteTransaction(id);
      }
      setSelectedTxIds([]);
      triggerRefresh();
    }
  };

  const handleOpenCategoryModal = (txns: Transaction[]) => {
    setCategoryModalTxns(txns);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsEditModalOpen(true);
  };

  const handleToggleSelectTx = (id: string) => {
    setSelectedTxIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedTxIds.length === transactions.length) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(transactions.map((t) => t.id));
    }
  };

  const handleSmartAutoCategorize = async (onlySelected: boolean = false) => {
    if (onlySelected && selectedTxIds.length > 0) {
      const selectedTxns = transactions.filter((t) => selectedTxIds.includes(t.id));
      const res = await dataProvider.autoCategorizeTransactions(false);
      setAutoCatResult(`Auto-categorized matching transactions!`);
    } else {
      const res = await dataProvider.autoCategorizeTransactions(false);
      setAutoCatResult(`✨ Smart Categorizer matched and updated ${res.updatedCount} transactions!`);
    }
    setTimeout(() => setAutoCatResult(null), 5000);
    triggerRefresh();
    loadTxns();
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Account', 'Type', 'Method', 'Amount', 'Ref Number', 'Notes'];
    const rows = transactions.map((t) => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.category?.name || '',
      t.account?.name || '',
      t.type,
      t.paymentMethod,
      t.amount,
      t.referenceNumber || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rupeetrack_transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Totals for filtered transactions
  const totalInflow = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalOutflow = transactions
    .filter((t) => t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const netCashFlow = totalInflow - totalOutflow;

  // Uncategorized count
  const uncategorizedCount = transactions.filter(
    (t) => !t.categoryId || t.categoryId === 'cat_misc' || t.categoryId === ''
  ).length;

  const selectedTxObjects = transactions.filter((t) => selectedTxIds.includes(t.id));
  const selectedSum = selectedTxObjects.reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Transactions & Expenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, categorize, and organize all bank, cash, EMI, rent, and UPI expenses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Smart Auto-Categorize Button */}
          <button
            onClick={() => handleSmartAutoCategorize(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-200 dark:border-purple-800 transition-all shadow-sm"
            title="Auto-detect categories for all transactions"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>✨ Smart Categorize</span>
          </button>

          {/* Manage Categories Button */}
          <button
            onClick={() => setIsManageCatsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => openQuickModalWithPreset()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Auto-categorize toast/banner */}
      {autoCatResult && (
        <div className="p-3.5 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs font-bold flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{autoCatResult}</span>
          </div>
          <button
            onClick={() => setAutoCatResult(null)}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Expense Logger Strip */}
      <QuickExpenseLoggerBar />

      {/* Filter Mode & Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
        {/* Month vs All Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterMode('MONTH')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'MONTH'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Showing: {monthLabel} ({transactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'ALL'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Time (157 Txns)</span>
          </button>
        </div>

        {/* Live Filter Totals */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-emerald-600 dark:text-emerald-400">
            +{formatINR(totalInflow)} In
          </span>
          <span className="text-rose-600 dark:text-rose-400">
            -{formatINR(totalOutflow)} Out
          </span>
          <span
            className={`px-2 py-0.5 rounded-md ${
              netCashFlow >= 0
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            Net: {netCashFlow >= 0 ? '+' : ''}
            {formatINR(netCashFlow)}
          </span>
        </div>
      </div>

      {/* Category Quick Filter Chips & Search Bar */}
      <div className="glass-card p-4 space-y-3">
        {/* Quick Category Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === ''
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>

          {/* Uncategorized / Misc Quick Triage Pill */}
          <button
            type="button"
            onClick={() => setSelectedCategory('UNCATEGORIZED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedCategory === 'UNCATEGORIZED'
                ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>⚠️ Uncategorized / Misc ({uncategorizedCount})</span>
          </button>

          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? '' : c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Search & Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by merchant, UPI, reference, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Types</option>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income / Salary</option>
              <option value="DEBT_PAYMENT">Debt / EMI / Card</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>

          {/* Quick Clear Filters */}
          <div className="flex items-center">
            {(search || selectedCategory || selectedAccount || selectedType || startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('');
                  setSelectedAccount('');
                  setSelectedType('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Custom Date Filters (if in ALL mode) */}
        {filterMode === 'ALL' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="glass-card overflow-hidden">
        {/* Table / List Header Bar with Select All */}
        <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-slate-500">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAll}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors flex items-center gap-1.5"
              title="Select / Deselect All"
            >
              {selectedTxIds.length > 0 && selectedTxIds.length === transactions.length ? (
                <CheckSquare className="w-4 h-4 text-brand-600" />
              ) : selectedTxIds.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-brand-500 opacity-70" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All ({transactions.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Tip: Tap category badge to re-classify</span>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-sm">
              No transactions found for {filterMode === 'MONTH' ? monthLabel : 'selected criteria'}
            </p>
            <p className="text-xs">
              Try switching month or selecting "All Time" to view your 157 Kotak statement transactions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const absAmount = Math.abs(tx.amount);
              const isSelected = selectedTxIds.includes(tx.id);

              const isMiscOrNone =
                !tx.categoryId || tx.categoryId === 'cat_misc' || tx.categoryId === '';

              return (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                    isSelected ? 'bg-brand-50/40 dark:bg-brand-950/30' : ''
                  }`}
                >
                  {/* Left info & Checkbox */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleSelectTx(tx.id)}
                      className="text-slate-400 hover:text-brand-600 transition-colors shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-brand-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    {/* Icon */}
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                          {tx.description}
                        </span>
                        {tx.source === 'CSV' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 hidden sm:inline-block">
                            Kotak Statement
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{tx.date}</span>

                        {/* Interactive Click-to-Categorize Chip */}
                        <button
                          type="button"
                          onClick={() => handleOpenCategoryModal([tx])}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                            isMiscOrNone
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 hover:ring-2 hover:ring-amber-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950 dark:hover:text-brand-300 hover:ring-1 hover:ring-brand-400'
                          }`}
                          title="Click to categorize or change category"
                        >
                          <span>{tx.category ? tx.category.icon : '📦'}</span>
                          <span>{tx.category ? tx.category.name : 'Categorize'}</span>
                          <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>

                        {tx.paymentMethod && <span>• {tx.paymentMethod}</span>}
                        {tx.balanceAfter !== undefined && (
                          <span className="font-semibold text-slate-500 hidden sm:inline">
                            • Bal: {formatINR(tx.balanceAfter)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right amount & action */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-3">
                    <div className="text-right">
                      <span
                        className={`text-xs sm:text-sm md:text-base font-extrabold ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatINR(absAmount)}
                      </span>
                    </div>

                    {/* Edit button */}
                    <button
                      onClick={() => handleOpenEditModal(tx)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-brand-600 transition-colors"
                      title="Edit Transaction Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-300 hover:text-rose-600 transition-colors"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Batch Actions Dock (When items are selected) */}
      {selectedTxIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 dark:bg-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex flex-wrap items-center gap-3 animate-slide-up">
          <div className="flex items-center gap-2 text-xs font-bold border-r border-slate-700 pr-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{selectedTxIds.length} Selected</span>
            <span className="text-slate-400 font-normal">({formatINR(selectedSum)})</span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenCategoryModal(selectedTxObjects)}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categorize Selected</span>
          </button>

          <button
            type="button"
            onClick={() => handleSmartAutoCategorize(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Classify</span>
          </button>

          <button
            type="button"
            onClick={handleBatchDelete}
            className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedTxIds([])}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors ml-1"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Select Modal */}
      <CategorySelectModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        transactionsToUpdate={categoryModalTxns}
        categories={categories}
        onSuccess={() => {
          triggerRefresh();
          loadTxns();
          setSelectedTxIds([]);
        }}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transaction={editingTransaction}
        accounts={accounts}
        categories={categories}
        onSuccess={() => {
          triggerRefresh();
          loadTxns();
        }}
      />

      {/* Manage Categories Modal */}
      <ManageCategoriesModal
        isOpen={isManageCatsOpen}
        onClose={() => setIsManageCatsOpen(false)}
        categories={categories}
        onSuccess={() => {
          triggerRefresh();
        }}
      />
    </div>
  );
};
