import React from 'react';
import { GoalProjectionResult, formatINR } from '@personal-finance/shared';
import { Target, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GoalProgressWidgetProps {
  projections: GoalProjectionResult[];
}

export const GoalProgressWidget: React.FC<GoalProgressWidgetProps> = ({ projections }) => {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-500" />
            <span>Financial Goals</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track target achievements</p>
        </div>
        <Link
          to="/goals"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {projections.slice(0, 4).map((goal) => {
          const isComplete = goal.status === 'COMPLETED';
          const isOnTrack = goal.status === 'ON_TRACK' || goal.status === 'AHEAD';

          return (
            <div
              key={goal.goalId}
              className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                  {goal.name}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isComplete
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : isOnTrack
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : isOnTrack ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  <span>
                    {isComplete
                      ? 'Done'
                      : isOnTrack
                      ? 'On Track'
                      : 'Needs Attention'}
                  </span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isComplete
                      ? 'bg-emerald-500'
                      : isOnTrack
                      ? 'bg-brand-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>
                  {formatINR(goal.currentAmount)} of {formatINR(goal.targetAmount)}
                </span>
                <span>{goal.progressPercentage.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
