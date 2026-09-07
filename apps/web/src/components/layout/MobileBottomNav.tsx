import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  Plus,
  Target,
  Menu,
  X,
  FileSpreadsheet,
  PieChart,
  Landmark,
  CreditCard,
  FileBarChart,
  Settings,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useFinance } from '../../context/FinanceContext';

export const MobileBottomNav: React.FC = () => {
  const { setIsQuickModalOpen } = useFinance();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <>
      {/* More Drawer for secondary links on mobile */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMoreOpen(false)} />
          <div className="fixed bottom-16 inset-x-0 bg-white dark:bg-slate-900 rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">More Features</span>
              <button onClick={() => setIsMoreOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <NavLink
                to="/import"
                onClick={() => setIsMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                <span>Import PDF</span>
              </NavLink>
              <NavLink
                to="/budgets"
                onClick={() => setIsMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <PieChart className="w-5 h-5 text-emerald-500" />
                <span>Budgets</span>
              </NavLink>
              <NavLink
                to="/accounts"
                onClick={() => setIsMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <Landmark className="w-5 h-5 text-amber-500" />
                <span>Accounts</span>
              </NavLink>
              <NavLink
                to="/debts"
                onClick={() => setIsMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <CreditCard className="w-5 h-5 text-rose-500" />
                <span>Debts & EMI</span>
              </NavLink>
              <NavLink
                to="/reports"
                onClick={() => setIsMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <FileBarChart className="w-5 h-5 text-purple-500" />
                <span>Reports</span>
              </NavLink>
              <NavLink
                to="/settings"
                onClick={() => setIsMoreOpen(false)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <Settings className="w-5 h-5 text-slate-500" />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Nav */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        <NavLink
          to="/"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors',
              isActive ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-500'
            )
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors',
              isActive ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-500'
            )
          }
        >
          <ReceiptText className="w-5 h-5" />
          <span>Txns</span>
        </NavLink>

        {/* Center Floating Plus Button (<10s fast expense) */}
        <button
          onClick={() => setIsQuickModalOpen(true)}
          className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Add Expense Fast"
        >
          <Plus className="w-6 h-6" />
        </button>

        <NavLink
          to="/goals"
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors',
              isActive ? 'text-brand-600 dark:text-brand-400 font-semibold' : 'text-slate-500'
            )
          }
        >
          <Target className="w-5 h-5" />
          <span>Goals</span>
        </NavLink>

        <button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          className={clsx(
            'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors',
            isMoreOpen ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'
          )}
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>
    </>
  );
};
