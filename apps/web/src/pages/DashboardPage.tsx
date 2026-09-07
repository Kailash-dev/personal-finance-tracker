import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { dataProvider } from '../services/dataProvider';
import { OverviewCard } from '../components/dashboard/OverviewCard';
import { IncomeExpenseChart } from '../components/dashboard/IncomeExpenseChart';
import { CategoryDonutChart } from '../components/dashboard/CategoryDonutChart';
import { GoalProgressWidget } from '../components/dashboard/GoalProgressWidget';
import { HealthScoreWidget } from '../components/dashboard/HealthScoreWidget';
import { CreditCardWidget } from '../components/dashboard/CreditCardWidget';
import { SeptemberTrackerWidget } from '../components/dashboard/SeptemberTrackerWidget';
import { QuickExpenseLoggerBar } from '../components/dashboard/QuickExpenseLoggerBar';
import { formatINR } from '@personal-finance/shared';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Landmark,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { selectedMonth, refreshTrigger, setIsQuickModalOpen, openQuickModalWithPreset } = useFinance();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await dataProvider.getDashboardData(selectedMonth);
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [selectedMonth, refreshTrigger]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { currentMonth, categoryBreakdown, monthlyTrend, goalProjections, healthScore, creditCards, recentTransactions } = data;

  return (
    <div className="space-y-6">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete overview of your income, expenses, savings & goals in INR
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/import"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors border border-slate-200 dark:border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-500" />
            <span>Import Statement</span>
          </Link>
          <button
            onClick={() => openQuickModalWithPreset()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Spend / Income</span>
          </button>
        </div>
      </div>

      {/* Quick Expense Logger Strip */}
      <QuickExpenseLoggerBar />

      {/* Kailash's September Cash Flow & Debt Tracker */}
      <SeptemberTrackerWidget />

      {/* Finance Mentor Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-brand-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h4 className="font-extrabold text-sm flex items-center gap-1.5">
              <span>Finance Mentor Advice Active</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider font-bold">
                Smart Indian Rules
              </span>
            </h4>
            <p className="text-xs text-indigo-100 mt-0.5">
              Plan custom category budgets for rent & groceries, track daily UPI leaks, and ask financial guidance.
            </p>
          </div>
        </div>

        <Link
          to="/mentor"
          className="px-4 py-2 rounded-xl bg-white text-brand-700 hover:bg-indigo-50 font-extrabold text-xs shadow-sm transition-all self-start sm:self-auto shrink-0 flex items-center gap-1.5"
        >
          <span>Open Finance Mentor</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Row 1: Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <OverviewCard
          title="Total Income"
          amount={currentMonth.income}
          subtitle="All credits this month"
          icon={<TrendingUp className="w-4 h-4" />}
          colorScheme="emerald"
        />
        <OverviewCard
          title="Total Expenses"
          amount={currentMonth.expenses}
          subtitle="Spent (excl. transfers)"
          icon={<TrendingDown className="w-4 h-4" />}
          colorScheme="rose"
        />
        <OverviewCard
          title="Total Saved"
          amount={currentMonth.saved}
          subtitle={`Savings Rate: ${currentMonth.savingsRate}%`}
          icon={<PiggyBank className="w-4 h-4" />}
          colorScheme="indigo"
        />
        <OverviewCard
          title="Bank Balance"
          amount={currentMonth.bankBalance}
          subtitle="Liquid salary & savings"
          icon={<Landmark className="w-4 h-4" />}
          colorScheme="sky"
        />
      </div>

      {/* Row 2: Secondary Debt & Budget Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <OverviewCard
          title="Total EMI"
          amount={currentMonth.totalEmi}
          subtitle="Monthly Loan commitments"
          icon={<CreditCard className="w-4 h-4" />}
          colorScheme="amber"
        />
        <OverviewCard
          title="Total Debt"
          amount={currentMonth.totalDebt}
          subtitle="Outstanding Principal"
          icon={<Receipt className="w-4 h-4" />}
          colorScheme="purple"
        />
        <OverviewCard
          title="Budget Remaining"
          amount={currentMonth.budgetRemaining}
          subtitle={`Limit: ${formatINR(currentMonth.budgetLimit)}`}
          icon={<Percent className="w-4 h-4" />}
          colorScheme="emerald"
        />
      </div>

      {/* Row 3: Income vs Expense Chart & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IncomeExpenseChart data={monthlyTrend} />
        </div>
        <div>
          <CategoryDonutChart categories={categoryBreakdown} />
        </div>
      </div>

      {/* Row 4: Health Score, Goals & Credit Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthScoreWidget healthScore={healthScore} />
        <GoalProgressWidget projections={goalProjections} />
        <CreditCardWidget cards={creditCards} />
      </div>

      {/* Row 5: Recent Transactions Table Preview */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Recent Transactions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest activity in this period</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            View All Transactions →
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Transactions Recorded for {data.month}</p>
              <p className="text-xs text-slate-400 mt-0.5">Start logging your September expenses or import your bank PDF statement to calculate your total spend automatically.</p>
            </div>
            <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setIsQuickModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Log Spend / Expense</span>
              </button>
              <Link
                to="/import"
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-brand-500" />
                <span>Import Statement</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">Description</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Method</th>
                  <th className="pb-2.5">Account</th>
                  <th className="pb-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {recentTransactions.map((tx: any) => {
                  const isIncome = tx.type === 'INCOME';
                  const isTransfer = tx.type === 'TRANSFER';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {tx.merchantName || tx.description}
                        </p>
                        {tx.notes && <p className="text-[10px] text-slate-400 line-clamp-1">{tx.notes}</p>}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                          <span>{tx.category?.icon || '📦'}</span>
                          <span>{tx.category?.name || 'Other'}</span>
                        </span>
                      </td>
                      <td className="py-3 text-slate-500 whitespace-nowrap">
                        <span className="text-[11px]">{tx.paymentMethod}</span>
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                        {tx.account?.name || 'Primary A/c'}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap">
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
