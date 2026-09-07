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
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { categories, accounts, refreshTrigger, triggerRefresh, openQuickModalWithPreset } = useFinance();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const loadTxns = async () => {
      const res = await dataProvider.getTransactions({
        search,
        categoryId: selectedCategory || undefined,
        accountId: selectedAccount || undefined,
        type: selectedType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setTransactions(res);
    };
    loadTxns();
  }, [search, selectedCategory, selectedAccount, selectedType, startDate, endDate, refreshTrigger]);

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
    link.setAttribute('download', `rupeetrack_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Transactions & Expenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, and log all your bank, cash, Rent, Groceries, and UPI transactions
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

      {/* Filter Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by merchant, UPI, reference..."
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
              <option value="INCOME">Income</option>
              <option value="TRANSFER">Transfer</option>
              <option value="DEBT_PAYMENT">Debt EMI</option>
              <option value="INVESTMENT">Investment</option>
            </select>
          </div>
        </div>

        {/* Date Filter & Clear */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>

          {(search || selectedCategory || selectedAccount || selectedType || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('');
                setSelectedAccount('');
                setSelectedType('');
                setStartDate('');
                setEndDate('');
              }}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No transactions found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or add a new transaction</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isTransfer = tx.type === 'TRANSFER';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {tx.merchantName || tx.description}
                        </p>
                        {tx.referenceNumber && (
                          <p className="text-[10px] font-mono text-slate-400 truncate">Ref: {tx.referenceNumber}</p>
                        )}
                        {tx.notes && <p className="text-[10px] text-slate-400 truncate">{tx.notes}</p>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                          <span>{tx.category?.icon || '📦'}</span>
                          <span>{tx.category?.name || 'Uncategorized'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <span className="text-[11px] font-mono">{tx.paymentMethod}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {tx.account?.name || 'Primary A/c'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : isTransfer
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold inline-flex items-center gap-0.5 ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isTransfer
                              ? 'text-slate-600 dark:text-slate-400'
                              : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {isIncome ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {formatINR(Math.abs(tx.amount))}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
