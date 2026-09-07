import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatINR } from '@personal-finance/shared';

interface CategoryDonutChartProps {
  categories: {
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    amount: number;
    percentage: number;
  }[];
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ categories }) => {
  const totalAmount = categories.reduce((sum, c) => sum + c.amount, 0);

  if (categories.length === 0) {
    return (
      <div className="glass-card p-5 h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl mb-2">
          📊
        </div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No expenses this month</p>
        <p className="text-xs text-slate-400 mt-1">Add transactions to view category distribution</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
            Expense by Category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total: {formatINR(totalAmount)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
        {/* Donut Pie */}
        <div className="w-48 h-48 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="amount"
              >
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 bg-slate-900/95 text-white rounded-xl shadow-lg border border-slate-800 text-xs">
                        <p className="font-bold flex items-center gap-1.5">
                          <span>{data.icon}</span>
                          <span>{data.name}</span>
                        </p>
                        <p className="text-slate-300 mt-1">
                          {formatINR(data.amount)} ({data.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] text-slate-400 font-medium">Spent</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {formatINR(totalAmount, { compact: true })}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-2 overflow-y-auto max-h-52 pr-1">
          {categories.slice(0, 6).map((c) => (
            <div key={c.categoryId} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: c.color || '#6366F1' }}
                />
                <span className="truncate text-slate-700 dark:text-slate-300">
                  {c.icon} {c.name}
                </span>
              </div>
              <div className="text-right shrink-0 pl-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">{formatINR(c.amount)}</span>
                <span className="text-[10px] text-slate-400 ml-1.5">({c.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
