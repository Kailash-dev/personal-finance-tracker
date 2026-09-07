import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  FileSpreadsheet,
  PieChart,
  Landmark,
  CreditCard,
  Target,
  FileBarChart,
  Settings,
  Sparkles,
  Bot,
  Compass,
} from 'lucide-react';
import { clsx } from 'clsx';

export const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/debts', label: 'Debt & Loan Tracker', icon: CreditCard, badge: 'DEBTS' },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/mentor', label: 'Finance Mentor', icon: Sparkles, badge: 'AI' },
  { to: '/import', label: 'Import Statement', icon: FileSpreadsheet, badge: 'PDF' },
  { to: '/budgets', label: 'Monthly Budgets', icon: PieChart },
  { to: '/accounts', label: 'Accounts & Cards', icon: Landmark },
  { to: '/goals', label: 'Financial Goals', icon: Target },
  { to: '/reports', label: 'Reports & Insights', icon: FileBarChart },
  { to: '/settings', label: 'Settings & Export', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 shrink-0 min-h-[calc(100vh-61px)]">
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-sm shadow-brand-500/5'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={clsx(
                        'w-4 h-4 transition-transform group-hover:scale-110',
                        isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Pro tip / Indian Context helper widget */}
      <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-br from-brand-500/5 to-purple-500/5 border border-brand-500/10 dark:border-brand-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Indian Smart Rules</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Transfers across accounts & Credit card bill payments do not inflate your expenses.
        </p>
      </div>
    </aside>
  );
};
