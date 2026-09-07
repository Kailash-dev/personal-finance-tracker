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
  Wallet,
  Landmark,
  HandCoins,
  ArrowDownLeft,
  ArrowUpRight,
  Layers,
  FileCheck,
} from 'lucide-react';

export const SeptemberTrackerWidget: React.FC = () => {
  const { selectedMonth, setSelectedMonth, triggerRefresh, openQuickModalWithPreset } = useFinance();
  const [isResetting, setIsResetting] = useState(false);

  // Determine current month mode
  const isAugust = selectedMonth === '2026-08';
  const isSeptember = selectedMonth === '2026-09' || (!isAugust && !selectedMonth.includes('2026-08'));

  // Live Bank Balances
  const currentBankBalance = 4713.39; // Actual Kotak Mahindra Bank statement closing balance
  const expectedSalary = 50000.0; // Salary from VCRAFT INNOVATIONS on 10th Sept
  const totalAvailableWithSalary = currentBankBalance + expectedSalary; // ₹54,713.39

  const handleResetData = async () => {
    if (window.confirm('Re-sync Kailash’s Financial Master Plan with all exact debts, borrowings, and statement entries?')) {
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
      description: isAugust ? 'August 2026 Salary Credit' : 'September 2026 Salary Credit (VCRAFT INNOVATIONS)',
      amount: 50000,
      mode: 'INCOME',
    });
  };

  return (
    <div className="glass-card p-5 space-y-5 border-2 border-brand-500/20 shadow-xl bg-gradient-to-br from-white via-indigo-50/20 to-brand-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg">
                {isAugust
                  ? 'August 2026 Kotak Bank Account & Statement Radar'
                  : 'Safe Bank Balance & September Repayments Command Center'}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold uppercase tracking-wider">
                {isAugust ? 'Aug Statement Verified' : 'Live Calibrated'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Kotak Mahindra Bank (A/c •••• 4803) • Gayari Kailash Pyarelal • Period: 06/08/2026 to 06/09/2026
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Month Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setSelectedMonth('2026-08')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                isAugust
                  ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Aug 2026
            </button>
            <button
              onClick={() => setSelectedMonth('2026-09')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                isSeptember
                  ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sept 2026
            </button>
          </div>

          <button
            type="button"
            onClick={handleQuickLogSalary}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Log ₹50k</span>
          </button>
          <button
            type="button"
            onClick={handleResetData}
            disabled={isResetting}
            title="Re-sync all statement numbers"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* =========================================================
          AUGUST 2026 VIEW (HISTORICAL STATEMENT AUDIT)
         ========================================================= */}
      {isAugust && (
        <div className="space-y-4 animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> Aug Total Inflows
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ₹89,615
              </p>
              <span className="text-[10px] text-slate-400">Salary + Cashfree + Transfers</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" /> Aug Total Outflows
              </span>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                ₹85,417
              </p>
              <span className="text-[10px] text-slate-400">Rent deposit, CRED, EMIs</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> Kotak Closing Bal
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                ₹4,713.39
              </p>
              <span className="text-[10px] text-slate-400">Verified as on 06/09/2026</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Statement Txns
              </span>
              <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                124 Txns
              </p>
              <span className="text-[10px] text-slate-400">100% Parsed & Categorized</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs">
            <span className="font-bold text-brand-400 uppercase tracking-wider block">
              📌 August Major Financial Events Logged:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              <p>• <strong>09/08:</strong> VCRAFT Salary Credit <strong>+₹50,000</strong></p>
              <p>• <strong>09/08:</strong> CRED Card Payment <strong>-₹11,677</strong></p>
              <p>• <strong>10/08:</strong> Rajani Kumar Repayment <strong>-₹5,000</strong></p>
              <p>• <strong>10/08:</strong> Bike Loan EMI (PhonePe) <strong>-₹6,203</strong></p>
              <p>• <strong>11/08:</strong> Axis CC Settlement (Inst 2) <strong>-₹1,405</strong></p>
              <p>• <strong>16/08 & 26/08:</strong> Flat Rent Deposits <strong>-₹15,000</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          SEPTEMBER 2026 VIEW (LIVE REPAYMENTS & SAFE BANK RADAR)
         ========================================================= */}
      {isSeptember && (
        <div className="space-y-5 animate-in fade-in-50 duration-150">
          {/* Primary Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-brand-600" /> Current Bank Balance
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {formatINR(currentBankBalance)}
              </p>
              <span className="text-[10px] text-slate-400">Kotak Statement (06/09)</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> + Expected Salary
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(expectedSalary)}
              </p>
              <span className="text-[10px] text-slate-400">Hits account 10th Sept</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5 text-rose-500" /> Money To Return (Sept)
              </span>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatINR(79308)}
              </p>
              <span className="text-[10px] text-slate-400">EMIs + Hand Loans + Cards</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/70 shadow-sm">
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> Carried to Oct
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {formatINR(10000)}
              </p>
              <span className="text-[10px] text-slate-400">Relocation Hand Loan (Deferred)</span>
            </div>
          </div>

          {/* Live Bank Balance Milestone Radar */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Live Safe Bank Balance Radar (Step-by-Step Milestones)
              </span>
              <span className="text-[11px] text-slate-300">
                Total Inflow Available: <strong>{formatINR(totalAvailableWithSalary)}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Milestone 1: 9th - 10th Salary Day */}
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-amber-300">1. Salary Day Outflows (9th–10th)</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">Priority #1</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  • Ram Fincorp: <strong>₹16,650</strong> (9th)<br />
                  • Bike EMI: <strong>₹6,250</strong> (10th)<br />
                  • Chit VC 2: <strong>₹4,500</strong> (10th)<br />
                  • Rajni Ji Hand Loan: <strong>₹5,000</strong> (10th)<br />
                  • Personal Borrowing: <strong>₹5,000</strong> (10th)<br />
                  • House Broker Fee: <strong>₹4,100</strong> (10th)<br />
                  • Wife & Household: <strong>₹7,000</strong> (10th)
                </p>
                <div className="pt-1.5 border-t border-slate-700 flex justify-between font-bold">
                  <span className="text-slate-400">Total Outflow:</span>
                  <span className="text-rose-400">-₹48,500</span>
                </div>
                <div className="flex justify-between font-extrabold text-emerald-400 bg-emerald-950/50 p-1.5 rounded">
                  <span>Bank Balance Left (10th):</span>
                  <span>+₹6,213.39</span>
                </div>
              </div>

              {/* Milestone 2: 11th - 20th Mid-Month */}
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-indigo-300">2. Mid-Month & Closures (11th–20th)</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">Closures</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  • Bajaj Mobile EMI: <strong>₹3,800</strong> (12th)<br />
                  • Axis CC Settlement: <strong>₹1,400</strong> (15th - CLOSED!)<br />
                  • DMart Groceries: <strong>₹4,000</strong> (15th)
                </p>
                <div className="pt-1.5 border-t border-slate-700 flex justify-between font-bold">
                  <span className="text-slate-400">Mid-Month Outflow:</span>
                  <span className="text-rose-400">-₹9,200</span>
                </div>
                <div className="flex justify-between font-extrabold text-amber-300 bg-amber-950/50 p-1.5 rounded">
                  <span>Position after 15th:</span>
                  <span>-₹2,986.61 (Tight Gap)</span>
                </div>
              </div>

              {/* Milestone 3: 25th - 28th End-Month */}
              <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-purple-300">3. End-Month Commitments (25th–28th)</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">Final Leg</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  • Chit VC 2 (25th): <strong>₹9,500</strong><br />
                  • SBI Card Min Due: <strong>₹12,108</strong> (28th)<br />
                  • Travel Loan EMI: <strong>₹2,500</strong> (Ends 2nd Oct!)
                </p>
                <div className="pt-1.5 border-t border-slate-700 flex justify-between font-bold">
                  <span className="text-slate-400">End-Month Outflow:</span>
                  <span className="text-rose-400">-₹24,108</span>
                </div>
                <div className="p-2 rounded bg-indigo-950/60 border border-indigo-500/30 text-[11px] text-indigo-200">
                  💡 <strong>Bridge Solution:</strong> Adding ₹15,000–₹20,000 in freelance/side gig keeps your bank balance fully positive (+₹3,500 surplus)!
                </div>
              </div>
            </div>
          </div>

          {/* Money You Need To Return This Month Checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <HandCoins className="w-4 h-4 text-emerald-600" />
              <span>Complete Summary of Money You Need to Return / Pay in September</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-900 dark:text-rose-200 block">Ram Fincorp Loan</span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400">Due 9th Sept (Pre-Salary)</span>
                </div>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">₹16,650</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-900 dark:text-rose-200 block">Rajni Ji Personal Borrowing</span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400">Due 10th Sept (Salary Day)</span>
                </div>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">₹5,000</span>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-500/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-900 dark:text-rose-200 block">Friend / Personal Hand Loan</span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400">Due 10th Sept (Salary Day)</span>
                </div>
                <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">₹5,000</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">House Broker Fee</span>
                  <span className="text-[10px] text-slate-500">Shifted 4th Sept • Due 10th</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">₹4,100</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Bike Loan EMI</span>
                  <span className="text-[10px] text-slate-500">Auto-Debit on 10th Sept</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">₹6,250</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Chit Fund (VC 2) 10th Installment</span>
                  <span className="text-[10px] text-slate-500">Due 10th Sept</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">₹4,500</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block">Axis CC Settlement (Final 3 of 3)</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Due 15th Sept • Card CLOSES!</span>
                </div>
                <span className="font-extrabold text-emerald-600 text-sm">₹1,400</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 block">Chit Fund (VC 2) 25th Installment</span>
                  <span className="text-[10px] text-slate-500">Due 25th Sept</span>
                </div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">₹9,500</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-500/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-900 dark:text-purple-200 block">SBI Credit Card Minimum Due</span>
                  <span className="text-[10px] text-purple-600 font-semibold">Due 28th Sept</span>
                </div>
                <span className="font-extrabold text-purple-600 text-sm">₹12,108</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-500/25 flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-900 dark:text-amber-200 block">Relocation Hand Loan (Deferred)</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">Carried Forward to October 2026</span>
                </div>
                <span className="font-extrabold text-amber-700 dark:text-amber-300 text-sm">₹10,000 (Oct)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
