import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dataProvider } from '../services/dataProvider';
import { Debt, DebtType } from '@personal-finance/types';
import { formatINR, calculateDebtSummary } from '@personal-finance/shared';
import {
  CreditCard,
  Percent,
  Calendar,
  Plus,
  X,
  Check,
  Building,
  TrendingDown,
  Info,
  ShieldCheck,
} from 'lucide-react';

export const DebtsPage: React.FC = () => {
  const { user, refreshTrigger, triggerRefresh } = useFinance();
  const { user: authUser } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [type, setType] = useState<DebtType>('CAR_LOAN');
  const [originalAmount, setOriginalAmount] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('8.5');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadDebts = async () => {
      const d = await dataProvider.getDebts();
      setDebts(d);
    };
    loadDebts();
  }, [refreshTrigger]);

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lender || !monthlyEmi) return;

    try {
      await dataProvider.createDebt({
        userId: authUser?.id || user?.id || 'user_1',
        name,
        lender,
        type,
        originalAmount: parseFloat(originalAmount) || 0,
        outstandingAmount: parseFloat(outstandingAmount) || parseFloat(originalAmount) || 0,
        interestRate: parseFloat(interestRate) || 0,
        monthlyEmi: parseFloat(monthlyEmi) || 0,
        startDate: new Date().toISOString().split('T')[0],
        dueDay: parseInt(dueDay, 10) || 5,
        notes,
      });

      setIsAddModalOpen(false);
      setName('');
      setLender('');
      setOriginalAmount('');
      setOutstandingAmount('');
      setMonthlyEmi('');
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const summary = calculateDebtSummary(debts, user?.monthlyIncome || authUser?.monthlyIncome || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Debts & Loans (EMIs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track car loans, bike loans, home mortgages, monthly EMIs, and Debt-to-Income (DTI) ratio
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Loan</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-rose-500 uppercase">Total Outstanding Debt</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {formatINR(summary.totalOutstanding)}
          </p>
          <span className="text-xs text-slate-500">Across {summary.debtsCount} active loan(s)</span>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-amber-500 uppercase">Total Monthly EMI</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {formatINR(summary.totalMonthlyEmi)}
          </p>
          <span className="text-xs text-slate-500">Auto-debited each month</span>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-brand-500 uppercase">Debt-To-Income (DTI)</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {summary.debtToIncomeRatio.toFixed(1)}%
          </p>
          <span className="text-xs text-slate-500">
            {summary.debtToIncomeRatio < 30 ? '✓ Healthy (<30%)' : '⚠ High (>30%)'}
          </span>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-emerald-500 uppercase">Est. Payoff Horizon</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            ~{summary.estimatedPayoffMonths} mos
          </p>
          <span className="text-xs text-slate-500">At current monthly EMI pace</span>
        </div>
      </div>

      {/* Debts Grid */}
      {debts.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
            🎉
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">No Active Loans or EMIs</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              You are currently debt-free! If you have vehicle loans, home loans, personal loans, or consumer EMIs, add them here to monitor your repayment horizon and DTI.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Loan / EMI</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {debts.map((debt) => {
            const paidAmount = Math.max(0, debt.originalAmount - debt.outstandingAmount);
            const progressPct = debt.originalAmount > 0 ? (paidAmount / debt.originalAmount) * 100 : 0;

            return (
              <div key={debt.id} className="glass-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{debt.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building className="w-3 h-3" /> {debt.lender} • {debt.interestRate}% p.a.
                    </p>
                  </div>
                  <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-500/20">
                    EMI: {formatINR(debt.monthlyEmi)}/mo
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                    <span>Paid: {formatINR(paidAmount)}</span>
                    <span>Outstanding: {formatINR(debt.outstandingAmount)}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, progressPct)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Calendar className="w-3 h-3" /> Auto-Debit on {debt.dueDay}th of month
                  </span>
                  <span>Original: {formatINR(debt.originalAmount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Loan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Add New Loan / Debt</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Loan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Car Loan (Hyundai Creta)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Lender / Bank</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank"
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Loan Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as DebtType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="CAR_LOAN">Car Loan</option>
                    <option value="BIKE_LOAN">Superbike / Bike Loan</option>
                    <option value="HOME_LOAN">Home Loan</option>
                    <option value="PERSONAL_LOAN">Personal Loan</option>
                    <option value="EDUCATION_LOAN">Education Loan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Original Loan (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 800000"
                    value={originalAmount}
                    onChange={(e) => setOriginalAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Outstanding (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 425000"
                    value={outstandingAmount}
                    onChange={(e) => setOutstandingAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly EMI (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 18500"
                    value={monthlyEmi}
                    onChange={(e) => setMonthlyEmi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Loan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
