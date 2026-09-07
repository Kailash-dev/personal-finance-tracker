import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dataProvider } from '../services/dataProvider';
import { Goal, GoalCategory } from '@personal-finance/types';
import { formatINR, calculateGoalProjection, calculateEmergencyFundTarget } from '@personal-finance/shared';
import confetti from 'canvas-confetti';
import {
  Target,
  ShieldCheck,
  Plus,
  X,
  Check,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Calendar,
  PiggyBank,
  CheckCircle2,
} from 'lucide-react';

export const GoalsPage: React.FC = () => {
  const { refreshTrigger, triggerRefresh } = useFinance();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  // Emergency Fund Calculator state
  const [essentialExpense, setEssentialExpense] = useState('');
  const [targetMonths, setTargetMonths] = useState<3 | 6 | 9 | 12>(6);
  const [emergencySavings, setEmergencySavings] = useState('');

  // New Goal Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GoalCategory>('VEHICLE_CAR');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState('');

  useEffect(() => {
    const loadGoals = async () => {
      const g = await dataProvider.getGoals();
      setGoals(g);
    };
    loadGoals();
  }, [refreshTrigger]);

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoalId || !contributionAmount) return;

    const amt = parseFloat(contributionAmount);
    if (isNaN(amt) || amt <= 0) return;

    await dataProvider.addGoalContribution(contributeGoalId, amt);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    setContributeGoalId(null);
    setContributionAmount('');
    triggerRefresh();
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount) return;

    await dataProvider.createGoal({
      userId: user?.id || 'user_1',
      name,
      category,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      targetDate,
      monthlyContribution: parseFloat(monthlyContribution) || 0,
      isCompleted: false,
    });

    setIsAddGoalOpen(false);
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    triggerRefresh();
  };

  const emergencyFundResult = calculateEmergencyFundTarget(
    parseFloat(essentialExpense) || 45000,
    targetMonths,
    parseFloat(emergencySavings) || 120000
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Financial Goals & Projections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Goal achievement projections, required monthly savings, ₹1L bank balance target, and emergency cushions
          </p>
        </div>

        <button
          onClick={() => setIsAddGoalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Emergency Fund Dynamic Calculator */}
      <div className="glass-card p-6 border-brand-500/20 bg-gradient-to-br from-white via-indigo-50/15 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            🛡️
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Emergency Cushion Calculator
            </h3>
            <p className="text-xs text-slate-500">Based on essential living expenses multiplier</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Essential Monthly Expenses
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={essentialExpense}
                onChange={(e) => setEssentialExpense(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Target Horizon
            </label>
            <div className="flex items-center gap-1">
              {[3, 6, 9, 12].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTargetMonths(m as any)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                    targetMonths === m
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {m}M
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Current Emergency Savings
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
              <input
                type="number"
                value={emergencySavings}
                onChange={(e) => setEmergencySavings(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Calculator Output */}
        <div className="mt-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Target Cushion Required</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {formatINR(emergencyFundResult.targetAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Covers {emergencyFundResult.monthsCovered} months of essential needs ({emergencyFundResult.progressPct.toFixed(0)}% funded)
            </p>
          </div>

          <div className="text-right sm:text-right w-full sm:w-auto">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Shortfall</span>
            <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatINR(emergencyFundResult.shortfall)}
            </p>
          </div>
        </div>
      </div>

      {/* Goals Grid with Achievement Projections */}
      {goals.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto text-2xl">
            🎯
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">No Financial Goals Created Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Create your financial milestones — like buying a Car, Superbike, House, building a ₹1,00,000 Emergency Fund, or vacation savings with dynamic month-by-month projections.
            </p>
          </div>
          <button
            onClick={() => setIsAddGoalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const projection = calculateGoalProjection(goal);
            const isComplete = projection.status === 'COMPLETED';
            const isOnTrack = projection.status === 'ON_TRACK' || projection.status === 'AHEAD';

            return (
              <div key={goal.id} className="glass-card p-5 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{goal.name}</h4>
                      {goal.targetDate && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-brand-500" /> Target Date: {goal.targetDate}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        isComplete
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : isOnTrack
                          ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {isComplete ? <CheckCircle2 className="w-3 h-3" /> : isOnTrack ? <TrendingUp className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      <span>{isComplete ? 'Goal Achieved!' : isOnTrack ? 'On Track' : 'Behind Target'}</span>
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5 my-3">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ${
                          isComplete ? 'bg-emerald-500' : isOnTrack ? 'bg-brand-500' : 'bg-amber-500'
                        }"
                        style={{ width: `${Math.min(100, projection.progressPercentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span>Saved: {formatINR(projection.currentAmount)}</span>
                      <span>Target: {formatINR(projection.targetAmount)} ({projection.progressPercentage.toFixed(0)}%)</span>
                    </div>
                  </div>

                  {/* Calculation breakdown */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Remaining Amount:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatINR(projection.remainingAmount)}</span>
                    </div>
                    {projection.requiredMonthlySaving && (
                      <div className="flex justify-between text-slate-500">
                        <span>Required Monthly Saving:</span>
                        <span className="font-bold text-brand-600 dark:text-brand-400">
                          {formatINR(projection.requiredMonthlySaving)}/mo
                        </span>
                      </div>
                    )}
                    {projection.currentMonthlyContribution && (
                      <div className="flex justify-between text-slate-500">
                        <span>Your Monthly Contribution:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {formatINR(projection.currentMonthlyContribution)}/mo
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
                      {projection.statusMessage}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-2">
                  <button
                    onClick={() => setContributeGoalId(goal.id)}
                    className="w-full py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 text-brand-700 dark:text-brand-300 font-bold text-xs border border-brand-500/20 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Contribution</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Contribution Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setContributeGoalId(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-3">Add Goal Contribution</h3>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  autoFocus
                  required
                  placeholder="e.g. 15000"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md"
              >
                Confirm Contribution 🎉
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddGoalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Create Financial Goal</h3>
              <button onClick={() => setIsAddGoalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buy Superbike (Kawasaki Ninja)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 400000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Saved (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Planned Monthly Save (₹)</label>
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
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
                  <span>Create Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
