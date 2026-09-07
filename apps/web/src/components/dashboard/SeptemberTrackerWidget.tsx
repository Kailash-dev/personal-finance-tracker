import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { dataProvider } from '../../services/dataProvider';
import { formatINR } from '@personal-finance/shared';
import {
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus,
} from 'lucide-react';

export const SeptemberTrackerWidget: React.FC = () => {
  const { selectedMonth, triggerRefresh, openQuickModalWithPreset } = useFinance();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (window.confirm('Re-sync Kailash’s September Financial Master Plan with all exact debts, borrowings, and EMIs?')) {
      setIsResetting(true);
      try {
        await dataProvider.seedKailashFinanceData();
        triggerRefresh();
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleQuickLogSalary = () => {
    openQuickModalWithPreset({
      categoryId: 'cat_income',
      subcategoryId: 'sub_salary',
      description: 'September 2026 Salary Credit',
      amount: 50000,
      mode: 'INCOME',
    });
  };

  return (
    <div className="glass-card p-5 space-y-4 border-2 border-brand-500/20 shadow-xl bg-gradient-to-br from-white via-indigo-50/20 to-brand-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                Kailash’s September 2026 Cash Flow & Debt Recovery Tracker
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase tracking-wider">
                Live Plan
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ₹50,000 Salary on 10th Sept • Relocated on 4th Sept • 3 Debt Closures in sight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickLogSalary}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log ₹50k Salary</span>
          </button>
          <button
            type="button"
            onClick={handleResetData}
            disabled={isResetting}
            title="Re-sync all September numbers"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            💼 Expected Salary
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">₹50,000</p>
          <span className="text-[10px] text-slate-400">Hits account 10th Sept</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
            💳 Total Outgoings
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">₹79,808</p>
          <span className="text-[10px] text-slate-400">Excl. ₹7k paid today</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            🎉 Ending Soon
          </span>
          <p className="text-xl font-extrabold text-brand-600 dark:text-brand-400 mt-0.5">3 Debts</p>
          <span className="text-[10px] text-slate-400">Axis, Travel, Personal Loan</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            🏠 September Rent
          </span>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">₹0.00</p>
          <span className="text-[10px] text-slate-400">Zero rent this month!</span>
        </div>
      </div>

      {/* September Cash Flow Action Checklist */}
      <div className="space-y-2 pt-1">
        <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-brand-500" />
          <span>September Step-by-Step Payment Timeline</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Phase 1: 7th - 9th Sept */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Phase 1: Pre-Salary (7th–9th Sept)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Action Now
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Personal Loan EMI (2 of 3)</span>
                </span>
                <span className="font-bold">₹7,000 (PAID Today)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-500/20 text-rose-800 dark:text-rose-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>9th: Ram Fincorp</span>
                </span>
                <span className="font-bold">₹16,650</span>
              </div>
            </div>
          </div>

          {/* Phase 2: 10th Sept Salary Day */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Phase 2: Salary Day (10th Sept)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                +₹50k Credit
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                <span>🏍 Bike Loan EMI:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹6,250</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                <span>🪙 Chit Fund (VC 2):</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹4,500</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                <span>🏢 Broker Fee (Shifted 4th):</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹4,100</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                <span>🤝 Friend Borrowing + Rajni Ji:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹5k + ₹5k</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                <span>🛒 Groceries + 👨‍👩‍👧 Wife:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹4k + ₹7k</span>
              </div>
            </div>
          </div>

          {/* Phase 3: Mid & Late Sept Closures */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Phase 3: Mid/Late Sept & Closures
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                Debt Closures
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 text-emerald-700 dark:text-emerald-400 font-bold">
                <span>🎯 Axis CC Settlement (Final):</span>
                <span>₹1,400 (Card CLOSED!)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                <span>📱 Bajaj Mobile EMI:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹3,800</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                <span>🪙 25th: VC 2 Installment:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹9,500</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">
                <span>💳 28th: SBI Card Min Due:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">₹12,108</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-700 dark:text-emerald-400 font-bold">
                <span>🎯 2nd Oct: Travel Loan:</span>
                <span>₹2,500 (Last EMI!)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
