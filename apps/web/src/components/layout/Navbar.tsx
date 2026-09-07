import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sun,
  Moon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { format, parseISO, addMonths, subMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const {
    user,
    selectedMonth,
    setSelectedMonth,
    theme,
    toggleTheme,
    setIsQuickModalOpen,
  } = useFinance();

  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const dateObj = parseISO(`${selectedMonth}-01`);
  const formattedMonth = format(dateObj, 'MMMM yyyy');

  const handlePrevMonth = () => {
    const prev = subMonths(dateObj, 1);
    setSelectedMonth(format(prev, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const next = addMonths(dateObj, 1);
    setSelectedMonth(format(next, 'yyyy-MM'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Brand logo & mobile indicator */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-brand-500/20">
          ₹
        </div>
        <div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:to-purple-400 bg-clip-text text-transparent">
            RupeeTrack
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            India 🇮🇳
          </span>
        </div>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner border border-slate-200/50 dark:border-slate-700/50">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5 px-3 py-1 font-semibold text-sm text-slate-800 dark:text-slate-200">
          <Calendar className="w-3.5 h-3.5 text-brand-500" />
          <span>{formattedMonth}</span>
        </div>
        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Expense Button (<10s Fast Entry) */}
        <button
          onClick={() => setIsQuickModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-medium text-sm shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* User Profile Menu with Logout */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-xs">
              {user?.name ? user.name[0].toUpperCase() : 'K'}
            </div>
            <div className="hidden md:block text-left leading-none pr-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.name || 'Kailash'}</p>
              <p className="text-[10px] text-slate-400">{user?.email || 'Personal'}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
