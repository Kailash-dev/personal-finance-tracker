import React, { ReactNode } from 'react';
import { formatINR } from '@personal-finance/shared';

interface OverviewCardProps {
  title: string;
  amount: number | string;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositiveGood: boolean;
  };
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'purple';
  isCurrency?: boolean;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  amount,
  subtitle,
  icon,
  trend,
  colorScheme = 'indigo',
  isCurrency = true,
}) => {
  const colorMap = {
    indigo: 'text-brand-600 bg-brand-50 dark:bg-brand-950/60 dark:text-brand-400 border-brand-500/20',
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-500/20',
    amber: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 border-amber-500/20',
    rose: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 border-rose-500/20',
    sky: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-400 border-sky-500/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400 border-purple-500/20',
  };

  const formattedAmount = isCurrency && typeof amount === 'number' ? formatINR(amount) : amount;

  return (
    <div className="glass-card p-5 glass-card-hover flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${colorMap[colorScheme]}`}>
          {icon}
        </div>
      </div>

      <div>
        <h4 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
          {formattedAmount}
        </h4>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trend.value >= 0
                ? trend.isPositiveGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                : trend.isPositiveGood ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {trend.value >= 0 ? `+${trend.value}%` : `${trend.value}%`}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
