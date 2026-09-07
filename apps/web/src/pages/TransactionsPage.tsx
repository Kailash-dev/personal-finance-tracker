import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { dataProvider } from '../services/dataProvider';
import { Transaction } from '@personal-finance/types';
import { formatINR } from '@personal-finance/shared';
import { QuickExpenseLoggerBar } from '../components/dashboard/QuickExpenseLoggerBar';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
  X,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const TransactionsPage: React.FC = () => {
  const { categories, accounts, selectedMonth, setSelectedMonth, refreshTrigger, triggerRefresh, openQuickModalWithPreset } = useFinance();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [filterMode, setFilterMode] = useState<'MONTH' | 'ALL'>('MONTH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Formatted Month Label
  const monthLabel = (() => {
    try {
      return format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy');
    } catch {
      return selectedMonth;
    }
  })();

  useEffect(() => {
    const loadTxns = async () => {
      const activeStartDate = filterMode === 'MONTH' ? `${selectedMonth}-01` : startDate || undefined;
      const activeEndDate = filterMode === 'MONTH' ? `${selectedMonth}-31` : endDate || undefined;

      const res = await dataProvider.getTransactions({
        search,
        categoryId: selectedCategory || undefined,
        accountId: selectedAccount || undefined,
        type: selectedType || undefined,
        startDate: activeStartDate,
        endDate: activeEndDate,
      });
      setTransactions(res);
    };
    loadTxns();
  }, [search, selectedCategory, selectedAccount, selectedType, filterMode, selectedMonth, startDate, endDate, refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? Account balance will be adjusted.')) {
      await dataProvider.deleteTransaction(id);
      triggerRefresh();
    }
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
  const totalOutflow = transactions.filter((t) => t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT').reduce((s, t) => s + Math.abs(t.amount), 0);
  const netCashFlow = totalInflow - totalOutflow;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Transactions & Expenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and log all bank, cash, EMI, rent, and UPI transactions
          </p>
        </div>

        <div className="flex items-center gap-2">
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
          <span className={`px-2 py-0.5 rounded-md ${netCashFlow >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
            Net: {netCashFlow >= 0 ? '+' : ''}{formatINR(netCashFlow)}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
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
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-semibold text-sm">No transactions found for {filterMode === 'MONTH' ? monthLabel : 'selected criteria'}</p>
            <p className="text-xs">Try switching month or selecting "All Time" to view your 157 Kotak statement transactions.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              const absAmount = Math.abs(tx.amount);

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Left info */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                          {tx.description}
                        </span>
                        {tx.source === 'CSV' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                            Kotak Statement
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{tx.date}</span>
                        {tx.category && (
                          <span>• {tx.category.icon} {tx.category.name}</span>
                        )}
                        {tx.paymentMethod && <span>• {tx.paymentMethod}</span>}
                        {tx.balanceAfter !== undefined && (
                          <span className="font-semibold text-slate-500">
                            • Bal: {formatINR(tx.balanceAfter)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right amount & action */}
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="text-right">
                      <span
                        className={`text-sm sm:text-base font-extrabold ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatINR(absAmount)}
                      </span>
                    </div>

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
    </div>
  );
};
