import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { dataProvider } from '../services/dataProvider';
import { Budget } from '@personal-finance/types';
import { formatINR, calculateRecommendedBudget } from '@personal-finance/shared';
import {
  PieChart,
  AlertTriangle,
  CheckCircle,
  Save,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

export const BudgetsPage: React.FC = () => {
  const { user, selectedMonth, categories, refreshTrigger, triggerRefresh } = useFinance();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [spentMap, setSpentMap] = useState<Record<string, number>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [budgetLimits, setBudgetLimits] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadBudgetData = async () => {
      const b = await dataProvider.getBudget(selectedMonth);
      const txns = await dataProvider.getTransactions({
        startDate: `${selectedMonth}-01`,
        endDate: `${selectedMonth}-31`,
      });

      const sMap: Record<string, number> = {};
      for (const t of txns) {
        if (t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT') {
          sMap[t.categoryId] = (sMap[t.categoryId] || 0) + Math.abs(t.amount);
        }
      }
      setSpentMap(sMap);
      setBudget(b);

      const limits: Record<string, number> = {};
      if (b) {
        b.items.forEach((item) => {
          limits[item.categoryId] = item.amount;
        });
      }
      setBudgetLimits(limits);
    };
    loadBudgetData();
  }, [selectedMonth, refreshTrigger]);

  const handleApplyMentorPlan = () => {
    const income = user?.monthlyIncome || 50000;
    const plan = calculateRecommendedBudget(income, 'BALANCED_50_30_20');
    const newLimits: Record<string, number> = {};
    plan.categories.forEach((c) => {
      newLimits[c.categoryId] = c.recommendedAmount;
    });
    setBudgetLimits(newLimits);
    setIsEditing(true);
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleSaveBudget = async () => {
    setIsSaving(true);
    try {
      const items = Object.entries(budgetLimits)
        .filter(([_, amt]) => amt > 0)
        .map(([categoryId, amount]) => ({ categoryId, amount }));

      const totalAmount = items.reduce((sum, i) => sum + i.amount, 0);
      await dataProvider.saveBudget(selectedMonth, totalAmount, items);
      setIsEditing(false);
      triggerRefresh();
    } catch (err) {
      console.error('Failed to save budget:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const totalBudgetAllocated = Object.values(budgetLimits).reduce((sum, v) => sum + (v || 0), 0);
  const totalSpent = Object.values(spentMap).reduce((sum, v) => sum + v, 0);
  const totalRemaining = Math.max(0, totalBudgetAllocated - totalSpent);
  const overallUtilization = totalBudgetAllocated > 0 ? (totalSpent / totalBudgetAllocated) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Monthly Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set and track spending limits by category with real-time utilization warnings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplyMentorPlan}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 text-brand-700 dark:text-brand-300 font-bold text-xs border border-brand-500/20 shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Auto-Plan with Mentor</span>
          </button>

          {isEditing ? (
            <button
              onClick={handleSaveBudget}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Budget</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700"
            >
              <span>Edit Budgets</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Budget Limit</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {formatINR(totalBudgetAllocated)}
          </p>
          <span className="text-xs text-slate-500">Allocated for {selectedMonth}</span>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-rose-500 uppercase">Total Spent</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {formatINR(totalSpent)}
          </p>
          <span className="text-xs text-slate-500">{overallUtilization.toFixed(0)}% utilized</span>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-emerald-500 uppercase">Remaining Safe Spend</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(totalRemaining)}
          </p>
          <span className="text-xs text-slate-500">Left for this month</span>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories
          .filter((c) => c.id !== 'cat_income' && c.id !== 'cat_transfer')
          .map((cat) => {
            const limit = budgetLimits[cat.id] || 0;
            const spent = spentMap[cat.id] || 0;
            const utilization = limit > 0 ? (spent / limit) * 100 : 0;
            const remaining = Math.max(0, limit - spent);

            const isExceeded = utilization >= 100;
            const isWarning = utilization >= 80 && utilization < 100;

            return (
              <div key={cat.id} className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{cat.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {isExceeded
                          ? `🚨 Exceeded by ${formatINR(spent - limit)}`
                          : isWarning
                          ? `⚠ 80%+ used (${formatINR(remaining)} left)`
                          : `✓ On track (${formatINR(remaining)} left)`}
                      </p>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={limit || ''}
                        onChange={(e) =>
                          setBudgetLimits({ ...budgetLimits, [cat.id]: parseFloat(e.target.value) || 0 })
                        }
                        placeholder="Limit"
                        className="w-24 px-2 py-1 text-xs font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-right"
                      />
                    </div>
                  ) : (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isExceeded
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : isWarning
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {utilization.toFixed(0)}% Used
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, utilization)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span>Spent: {formatINR(spent)}</span>
                  <span>Budget: {formatINR(limit)}</span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
