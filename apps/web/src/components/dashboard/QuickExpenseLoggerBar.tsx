import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import {
  Home,
  ShoppingCart,
  Milk,
  Zap,
  Wifi,
  Flame,
  Fuel,
  UtensilsCrossed,
  ShoppingBag,
  HeartPulse,
  Bike,
  Coins,
  CreditCard,
  HandCoins,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickExpenseLoggerBar: React.FC = () => {
  const { openQuickModalWithPreset } = useFinance();
  const navigate = useNavigate();

  const presets = [
    {
      id: 'rent',
      label: 'House Rent',
      icon: '🏠',
      categoryId: 'cat_housing',
      subcategoryId: 'sub_rent',
      desc: 'Monthly House Rent',
      color: 'hover:border-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    },
    {
      id: 'groceries',
      label: 'Groceries',
      icon: '🛒',
      categoryId: 'cat_food',
      subcategoryId: 'sub_groceries',
      desc: 'Groceries (D-Mart / Blinkit)',
      color: 'hover:border-amber-500 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    },
    {
      id: 'milk',
      label: 'Daily Milk',
      icon: '🥛',
      categoryId: 'cat_food',
      subcategoryId: 'sub_milk',
      desc: 'Daily Milk (Amul / Country Delight)',
      color: 'hover:border-sky-500 hover:bg-sky-50/60 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-300',
    },
    {
      id: 'vegetables',
      label: 'Vegetables & Sabzi',
      icon: '🥦',
      categoryId: 'cat_food',
      subcategoryId: 'sub_vegetables',
      desc: 'Vegetables & Fruits Mandi',
      color: 'hover:border-emerald-500 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'maid',
      label: 'Maid / Cook Salary',
      icon: '🧹',
      categoryId: 'cat_utilities',
      subcategoryId: 'sub_maid',
      desc: 'Maid & Cook Monthly Salary',
      color: 'hover:border-teal-500 hover:bg-teal-50/60 dark:hover:bg-teal-950/40 text-teal-700 dark:text-teal-300',
    },
    {
      id: 'electricity',
      label: 'Electricity Bill',
      icon: '⚡',
      categoryId: 'cat_utilities',
      subcategoryId: 'sub_electricity',
      desc: 'Electricity Power Bill',
      color: 'hover:border-yellow-500 hover:bg-yellow-50/60 dark:hover:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300',
    },
    {
      id: 'wifi',
      label: 'Wi-Fi & Broadband',
      icon: '📶',
      categoryId: 'cat_utilities',
      subcategoryId: 'sub_wifi',
      desc: 'Wi-Fi Broadband Recharge',
      color: 'hover:border-cyan-500 hover:bg-cyan-50/60 dark:hover:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300',
    },
    {
      id: 'fuel',
      label: 'Fuel / Petrol',
      icon: '⛽',
      categoryId: 'cat_transport',
      subcategoryId: 'sub_petrol',
      desc: 'Petrol / Diesel Fuel',
      color: 'hover:border-rose-500 hover:bg-rose-50/60 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300',
    },
    {
      id: 'swiggy',
      label: 'Swiggy / Zomato',
      icon: '🛵',
      categoryId: 'cat_food',
      subcategoryId: 'sub_delivery',
      desc: 'Food Delivery (Swiggy/Zomato)',
      color: 'hover:border-orange-500 hover:bg-orange-50/60 dark:hover:bg-orange-950/40 text-orange-700 dark:text-orange-300',
    },
    {
      id: 'medicines',
      label: 'Medicines & Health',
      icon: '💊',
      categoryId: 'cat_healthcare',
      subcategoryId: 'sub_medicines',
      desc: 'Medicines (Apollo / 1mg)',
      color: 'hover:border-red-500 hover:bg-red-50/60 dark:hover:bg-red-950/40 text-red-700 dark:text-red-300',
    },
    {
      id: 'vc',
      label: 'VC 1 / VC 2 Chit Fund',
      icon: '🪙',
      categoryId: 'cat_financial',
      subcategoryId: 'sub_bank_charges',
      desc: 'Chit Fund (VC 1 / VC 2 Installment)',
      color: 'hover:border-purple-500 hover:bg-purple-50/60 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300',
    },
    {
      id: 'bike',
      label: 'Bike EMI',
      icon: '🏍',
      categoryId: 'cat_financial',
      subcategoryId: 'sub_emi_bike',
      desc: 'Bike Loan Monthly EMI',
      color: 'hover:border-blue-500 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 text-blue-700 dark:text-blue-300',
    },
    {
      id: 'card',
      label: 'Credit Card Min Due',
      icon: '💳',
      categoryId: 'cat_financial',
      subcategoryId: 'sub_cc_payment',
      desc: 'Credit Card Bill / Min Due',
      color: 'hover:border-pink-500 hover:bg-pink-50/60 dark:hover:bg-pink-950/40 text-pink-700 dark:text-pink-300',
    },
  ];

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">⚡</span>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              Quick Living Expenses Logger
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tap any regular monthly outgoing or daily spend to log instantly
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/debts')}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>Manage Fixed Outgoings</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() =>
              openQuickModalWithPreset({
                categoryId: p.categoryId,
                subcategoryId: p.subcategoryId,
                description: p.desc,
                mode: 'EXPENSE',
              })
            }
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 ${p.color}`}
          >
            <span className="text-sm">{p.icon}</span>
            <span>+ {p.label}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => openQuickModalWithPreset()}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 text-brand-700 dark:text-brand-300 border border-brand-500/20 shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Custom Expense</span>
        </button>
      </div>
    </div>
  );
};
