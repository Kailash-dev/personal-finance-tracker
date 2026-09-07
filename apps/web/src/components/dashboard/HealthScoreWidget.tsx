import React from 'react';
import { FinancialHealthScore } from '@personal-finance/types';
import { ShieldCheck, Info } from 'lucide-react';

interface HealthScoreWidgetProps {
  healthScore: FinancialHealthScore;
}

export const HealthScoreWidget: React.FC<HealthScoreWidgetProps> = ({ healthScore }) => {
  const getRatingBadge = (rating: FinancialHealthScore['rating']) => {
    switch (rating) {
      case 'EXCELLENT':
        return { label: 'Excellent', color: 'bg-emerald-500 text-white' };
      case 'GOOD':
        return { label: 'Good', color: 'bg-emerald-600 text-white' };
      case 'FAIR':
        return { label: 'Fair', color: 'bg-amber-500 text-white' };
      case 'NEEDS_ATTENTION':
        return { label: 'Needs Attention', color: 'bg-orange-500 text-white' };
      case 'CRITICAL':
        return { label: 'Critical', color: 'bg-rose-500 text-white' };
    }
  };

  const badge = getRatingBadge(healthScore.rating);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Financial Health Score</span>
          </h3>
          <p className="text-[11px] text-slate-400">Informational wellness score</p>
        </div>
        <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Main Score & Meter */}
      <div className="flex items-center gap-4 mb-4 p-3 rounded-2xl bg-gradient-to-r from-brand-50/50 to-purple-50/50 dark:from-slate-800/40 dark:to-slate-800/20 border border-brand-500/10">
        <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          {healthScore.totalScore}
          <span className="text-sm text-slate-400 font-normal"> / 100</span>
        </div>
        <div className="flex-1">
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-brand-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${healthScore.totalScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Factor Bars */}
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <span className="text-[10px] text-slate-400 font-medium">Savings Rate</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">{healthScore.details.savingsRate}%</p>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <span className="text-[10px] text-slate-400 font-medium">EMI Burden (DTI)</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">{healthScore.details.debtToIncomeRatio}%</p>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <span className="text-[10px] text-slate-400 font-medium">Emergency Fund</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">{healthScore.details.emergencyMonthsCovered} mo covered</p>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
          <span className="text-[10px] text-slate-400 font-medium">Budget Adherence</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">{healthScore.details.budgetAdherencePct.toFixed(0)}%</p>
        </div>
      </div>

      {/* Top Insight */}
      {healthScore.insights.length > 0 && (
        <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-brand-500 shrink-0 mt-0.5" />
          <p className="line-clamp-2">{healthScore.insights[0]}</p>
        </div>
      )}
    </div>
  );
};
