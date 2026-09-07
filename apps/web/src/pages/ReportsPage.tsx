import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { dataProvider } from '../services/dataProvider';
import { formatINR } from '@personal-finance/shared';
import {
  FileBarChart,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Scale,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Download,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { selectedMonth, refreshTrigger } = useFinance();
  const [reportData, setReportData] = useState<any>(null);
  const [reconData, setReconData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Compute previous month
  const currYear = parseInt(selectedMonth.split('-')[0], 10);
  const currMon = parseInt(selectedMonth.split('-')[1], 10);
  const prevDate = new Date(currYear, currMon - 2, 1);
  const previousMonth = prevDate.toISOString().slice(0, 7);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const [rep, rec] = await Promise.all([
          dataProvider.getMonthlyReport(selectedMonth, previousMonth),
          dataProvider.getReconciliation(selectedMonth),
        ]);
        setReportData(rep);
        setReconData(rec);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReport();
  }, [selectedMonth, refreshTrigger]);

  if (loading || !reportData) {
    return <div className="p-8 text-center text-slate-400">Loading financial reports...</div>;
  }

  const { current, previous, expenseDeltaPct, topCategories, insights } = reportData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          Monthly Financial Report & Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Month-over-month comparisons, data-driven spending insights, and bank balance reconciliation
        </p>
      </div>

      {/* MoM Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Income Card */}
        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Monthly Income</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(current.income)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Previous: {formatINR(previous.income)}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {current.income >= previous.income ? 'Stable / Up' : 'Decreased'}
            </span>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Monthly Expenses</span>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {formatINR(current.expenses)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Previous: {formatINR(previous.expenses)}</span>
            <span
              className={`font-semibold ${
                expenseDeltaPct > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {expenseDeltaPct > 0 ? `+${expenseDeltaPct}%` : `${expenseDeltaPct}%`}
            </span>
          </div>
        </div>

        {/* Savings Card */}
        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Monthly Savings</span>
          <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">
            {formatINR(current.savings)}
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>Savings Rate: {current.savingsRate.toFixed(1)}%</span>
            <span>Prev: {previous.savingsRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Row 2: Smart Data-Driven Insights Banner */}
      <div className="glass-card p-5 border-brand-500/20 bg-gradient-to-br from-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:to-indigo-950/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-brand-500" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Data-Driven Financial Insights
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.length === 0 ? (
            <p className="text-xs text-slate-400">No unusual variances detected for this period.</p>
          ) : (
            insights.map((insight: string, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed"
              >
                {insight}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Row 3: Top Spending Categories & Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories */}
        <div className="glass-card p-5">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-4">
            Top Spending Categories
          </h3>
          <div className="space-y-3">
            {topCategories.slice(0, 5).map((cat: any, idx: number) => (
              <div key={cat.categoryId} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.categoryName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatINR(cat.amount)}</span>
                  <span className="text-slate-400 ml-1 text-[10px]">({cat.percentage.toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Account Reconciliation Tool */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-500" />
                <span>Monthly Reconciliation</span>
              </h3>
              <p className="text-[11px] text-slate-400">Verifies mathematical consistency</p>
            </div>
            {reconData && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  reconData.isReconciled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {reconData.isReconciled ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                <span>{reconData.isReconciled ? 'Reconciled' : 'Discrepancy'}</span>
              </span>
            )}
          </div>

          {reconData && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Opening Balance:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatINR(reconData.openingBalance)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>+ Total Income:</span>
                <span className="font-bold">{formatINR(reconData.totalIncome)}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>- Total Expenses:</span>
                <span className="font-bold">-{formatINR(reconData.totalExpenses)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
                <span>= Expected Closing:</span>
                <span>{formatINR(reconData.expectedClosingBalance)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold">
                <span>Actual Closing Balance:</span>
                <span>{formatINR(reconData.actualClosingBalance)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Net Difference:</span>
                <span className={reconData.difference === 0 ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                  {formatINR(reconData.difference)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
