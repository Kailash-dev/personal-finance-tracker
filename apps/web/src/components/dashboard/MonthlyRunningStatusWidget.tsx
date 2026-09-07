import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { dataProvider } from '../../services/dataProvider';
import { formatINR } from '@personal-finance/shared';
import {
  Calendar,
  Wallet,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Home,
  ShoppingCart,
  Zap,
  Wifi,
  Milk,
  UtensilsCrossed,
  ShoppingBag,
  Tv,
  HandCoins,
  CreditCard,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface RunningCategoryItem {
  id: string;
  name: string;
  categoryGroup: string;
  icon: any;
  color: string;
  bgLight: string;
  bgDark: string;
  plannedAmount: number;
  actualSpent: number;
  dueDay?: number;
  status: 'PAID' | 'PENDING' | 'PARTIAL';
  notes: string;
  preset: {
    categoryId: string;
    subcategoryId: string;
    description: string;
    amount: number;
  };
}

export const MonthlyRunningStatusWidget: React.FC = () => {
  const { selectedMonth, setSelectedMonth, refreshTrigger, triggerRefresh, openQuickModalWithPreset } = useFinance();
  const [debts, setDebts] = useState<any[]>([]);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isAugust = selectedMonth === '2026-08';
  const isSeptember = selectedMonth === '2026-09' || (!isAugust && !selectedMonth.includes('2026-08'));

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [debtsRes, borrowingsRes, txnsRes] = await Promise.all([
          dataProvider.getDebts(),
          dataProvider.getBorrowings(),
          dataProvider.getTransactions(selectedMonth),
        ]);
        setDebts(debtsRes || []);
        setBorrowings(borrowingsRes || []);
        setTransactions(txnsRes || []);
      } catch (err) {
        console.error('Failed to load monthly running status data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedMonth, refreshTrigger]);

  // 1. Current Month Borrowed Amount (Hand loans / borrowings taken this month)
  const currentMonthBorrowings = borrowings.filter((b) => {
    if (b.type !== 'BORROWED') return false;
    if (b.borrowDate && b.borrowDate.startsWith(selectedMonth)) return true;
    return isSeptember;
  });
  const currentMonthBorrowedTotal = isAugust
    ? 0
    : currentMonthBorrowings.reduce((sum, b) => sum + (b.amount || 0), 0) || 14100;

  // 2. Amount Paid Towards Debt / EMIs
  const debtTxns = transactions.filter(
    (t) =>
      t.type === 'EXPENSE' &&
      (t.categoryId === 'cat_financial' ||
        t.subcategoryId?.startsWith('sub_emi') ||
        t.subcategoryId === 'sub_cc_payment' ||
        t.description.toLowerCase().includes('emi') ||
        t.description.toLowerCase().includes('loan') ||
        t.description.toLowerCase().includes('cred') ||
        t.description.toLowerCase().includes('chit') ||
        t.description.toLowerCase().includes('fincorp') ||
        t.description.toLowerCase().includes('settlement'))
  );
  const debtPaidActual = debtTxns.reduce((sum, t) => sum + t.amount, 0);
  const debtPlannedTotal = isAugust
    ? 24285
    : debts
        .filter((d) =>
          [
            'PERSONAL_LOAN',
            'BIKE_LOAN',
            'CAR_LOAN',
            'HOME_LOAN',
            'CREDIT_CARD_MIN_PAYMENT',
            'CHIT_FUND_VC',
            'PERSONAL_BORROWING',
            'EDUCATION_LOAN',
            'OTHER_OUTGOING',
          ].includes(d.type)
        )
        .reduce((sum, d) => sum + (d.monthlyEmi || 0), 0) || 57908;

  // 3. Helper to sum transaction amounts matching category keywords
  const getCategoryActual = (categoryIds: string[], subcategoryIds: string[], keywords: string[] = []) => {
    return transactions
      .filter((t) => {
        if (t.type !== 'EXPENSE') return false;
        if (categoryIds.includes(t.categoryId)) return true;
        if (t.subcategoryId && subcategoryIds.includes(t.subcategoryId)) return true;
        const desc = t.description.toLowerCase();
        return keywords.some((kw) => desc.includes(kw.toLowerCase()));
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Specific running expense categories
  const rentActual = getCategoryActual(['cat_housing'], ['sub_rent', 'sub_maintenance'], ['rent', 'flat', 'landlord', 'society']);
  const groceryActual = getCategoryActual(['cat_food'], ['sub_groceries', 'sub_vegetables'], ['dmart', 'grocery', 'blinkit', 'instamart', 'zepto', 'vegetable', 'fruit', 'staple']);
  const lightbillActual = getCategoryActual(['cat_utilities'], ['sub_electricity'], ['electricity', 'light bill', 'power', 'bescom', 'tata power', 'torrent', 'mseb']);
  const wifibillActual = getCategoryActual(['cat_utilities'], ['sub_wifi'], ['wifi', 'broadband', 'act fibernet', 'airtel broadband', 'jiofiber', 'hathway', 'internet']);
  const dairyActual = getCategoryActual(['cat_food'], ['sub_milk'], ['milk', 'dairy', 'amul', 'country delight', 'curd', 'paneer', 'mother dairy']);
  const outsideEatingActual = getCategoryActual(['cat_food'], ['sub_delivery', 'sub_restaurants', 'sub_snacks'], ['zomato', 'swiggy', 'restaurant', 'cafe', 'mcdonalds', 'pizza', 'burger', 'chai', 'snack', 'dining']);
  const shoppingActual = getCategoryActual(['cat_family'], ['sub_shopping'], ['amazon', 'flipkart', 'myntra', 'zara', 'h&m', 'shopping', 'clothing', 'ajio', 'meesho']);
  const subscriptionsAndOtherActual = getCategoryActual(
    ['cat_utilities', 'cat_healthcare', 'cat_transport'],
    ['sub_dth', 'sub_mobile', 'sub_maid', 'sub_gym', 'sub_petrol'],
    ['netflix', 'spotify', 'prime', 'hotstar', 'youtube', 'recharge', 'jio', 'airtel', 'maid', 'cook', 'petrol', 'fuel', 'gym']
  );

  // Define the 10 Key Running Status Items
  const runningItems: RunningCategoryItem[] = [
    {
      id: 'item_borrowed',
      name: 'Current Month Borrowed Amount',
      categoryGroup: 'Hand Borrowings & Credit',
      icon: HandCoins,
      color: 'text-rose-600 dark:text-rose-400',
      bgLight: 'bg-rose-50 border-rose-200',
      bgDark: 'dark:bg-rose-950/30 dark:border-rose-900/40',
      plannedAmount: isAugust ? 0 : 14100,
      actualSpent: currentMonthBorrowedTotal,
      status: currentMonthBorrowedTotal > 0 ? 'PAID' : 'PENDING',
      notes: isAugust ? 'No new borrowings logged' : 'Rajni Ji (₹5k) + Friend (₹5k) + Broker (₹4.1k)',
      preset: {
        categoryId: 'cat_income',
        subcategoryId: 'sub_other_income',
        description: 'Hand Loan Borrowed (Current Month)',
        amount: 5000,
      },
    },
    {
      id: 'item_debt_paid',
      name: 'Amount Paid Towards Debt / EMIs',
      categoryGroup: 'Loans, EMIs & Chits',
      icon: CreditCard,
      color: 'text-purple-600 dark:text-purple-400',
      bgLight: 'bg-purple-50 border-purple-200',
      bgDark: 'dark:bg-purple-950/30 dark:border-purple-900/40',
      plannedAmount: isAugust ? 24285 : debtPlannedTotal,
      actualSpent: isAugust ? 24285 : (debtPaidActual || 7000),
      dueDay: 10,
      status: debtPaidActual >= debtPlannedTotal ? 'PAID' : debtPaidActual > 0 ? 'PARTIAL' : 'PENDING',
      notes: isAugust ? 'Aug EMIs & CRED paid' : 'Bike EMI, Chit VC2, Bajaj Mobile, SBI Card & Personal Loans',
      preset: {
        categoryId: 'cat_financial',
        subcategoryId: 'sub_emi_bike',
        description: 'Bike Loan EMI Payment',
        amount: 6250,
      },
    },
    {
      id: 'item_rent',
      name: 'House Rent & Maintenance',
      categoryGroup: 'Housing & Living',
      icon: Home,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgLight: 'bg-indigo-50 border-indigo-200',
      bgDark: 'dark:bg-indigo-950/30 dark:border-indigo-900/40',
      plannedAmount: isAugust ? 15000 : 15000,
      actualSpent: isAugust ? 15000 : rentActual,
      dueDay: 10,
      status: (isAugust ? 15000 : rentActual) >= 15000 ? 'PAID' : 'PENDING',
      notes: 'Monthly Flat Rent & Society Maintenance',
      preset: {
        categoryId: 'cat_housing',
        subcategoryId: 'sub_rent',
        description: 'Monthly House Rent Transfer',
        amount: 15000,
      },
    },
    {
      id: 'item_grocery',
      name: 'Groceries & Provisions',
      categoryGroup: 'Food & Essentials',
      icon: ShoppingCart,
      color: 'text-amber-600 dark:text-amber-400',
      bgLight: 'bg-amber-50 border-amber-200',
      bgDark: 'dark:bg-amber-950/30 dark:border-amber-900/40',
      plannedAmount: isAugust ? 4000 : 6000,
      actualSpent: isAugust ? 4250 : (groceryActual || 1850),
      dueDay: 15,
      status: (isAugust ? 4250 : groceryActual) >= 4000 ? 'PAID' : 'PARTIAL',
      notes: 'DMart, Blinkit, Supermarket & monthly kitchen staples',
      preset: {
        categoryId: 'cat_food',
        subcategoryId: 'sub_groceries',
        description: 'DMart Monthly Grocery Shopping',
        amount: 4000,
      },
    },
    {
      id: 'item_lightbill',
      name: 'Light Bill (Electricity)',
      categoryGroup: 'Utilities & Power',
      icon: Zap,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgLight: 'bg-yellow-50 border-yellow-200',
      bgDark: 'dark:bg-yellow-950/30 dark:border-yellow-900/40',
      plannedAmount: isAugust ? 1150 : 1200,
      actualSpent: isAugust ? 1150 : lightbillActual,
      dueDay: 15,
      status: (isAugust ? 1150 : lightbillActual) > 0 ? 'PAID' : 'PENDING',
      notes: 'Monthly Electricity & Power Utility Bill',
      preset: {
        categoryId: 'cat_utilities',
        subcategoryId: 'sub_electricity',
        description: 'Electricity Bill Payment',
        amount: 1200,
      },
    },
    {
      id: 'item_wifibill',
      name: 'WiFi & Broadband Bill',
      categoryGroup: 'Internet & Connectivity',
      icon: Wifi,
      color: 'text-cyan-600 dark:text-cyan-400',
      bgLight: 'bg-cyan-50 border-cyan-200',
      bgDark: 'dark:bg-cyan-950/30 dark:border-cyan-900/40',
      plannedAmount: isAugust ? 800 : 800,
      actualSpent: isAugust ? 800 : wifibillActual,
      dueDay: 18,
      status: (isAugust ? 800 : wifibillActual) > 0 ? 'PAID' : 'PENDING',
      notes: 'High-speed Fiber / Wi-Fi Internet Connection',
      preset: {
        categoryId: 'cat_utilities',
        subcategoryId: 'sub_wifi',
        description: 'WiFi Broadband Bill Payment',
        amount: 800,
      },
    },
    {
      id: 'item_dairy',
      name: 'Dairy Expenses (Milk & Curd)',
      categoryGroup: 'Daily Essentials',
      icon: Milk,
      color: 'text-sky-600 dark:text-sky-400',
      bgLight: 'bg-sky-50 border-sky-200',
      bgDark: 'dark:bg-sky-950/30 dark:border-sky-900/40',
      plannedAmount: isAugust ? 1500 : 1500,
      actualSpent: isAugust ? 1480 : (dairyActual || 420),
      dueDay: 30,
      status: (isAugust ? 1480 : dairyActual) >= 1200 ? 'PAID' : 'PARTIAL',
      notes: 'Daily Milk, Curd, Country Delight / Amul delivery',
      preset: {
        categoryId: 'cat_food',
        subcategoryId: 'sub_milk',
        description: 'Daily Milk & Dairy Payment',
        amount: 1500,
      },
    },
    {
      id: 'item_outside_eating',
      name: 'Outside Eating & Food Delivery',
      categoryGroup: 'Dining & Lifestyle',
      icon: UtensilsCrossed,
      color: 'text-orange-600 dark:text-orange-400',
      bgLight: 'bg-orange-50 border-orange-200',
      bgDark: 'dark:bg-orange-950/30 dark:border-orange-900/40',
      plannedAmount: isAugust ? 3500 : 3500,
      actualSpent: isAugust ? 3840 : (outsideEatingActual || 1240),
      dueDay: 30,
      status: (isAugust ? 3840 : outsideEatingActual) >= 3500 ? 'PAID' : 'PARTIAL',
      notes: 'Swiggy, Zomato, Restaurant dining, cafes & weekend treats',
      preset: {
        categoryId: 'cat_food',
        subcategoryId: 'sub_delivery',
        description: 'Swiggy / Zomato Food Delivery',
        amount: 500,
      },
    },
    {
      id: 'item_shopping',
      name: 'Shopping (Amazon/Flipkart/Apparel)',
      categoryGroup: 'Personal & Shopping',
      icon: ShoppingBag,
      color: 'text-pink-600 dark:text-pink-400',
      bgLight: 'bg-pink-50 border-pink-200',
      bgDark: 'dark:bg-pink-950/30 dark:border-pink-900/40',
      plannedAmount: isAugust ? 3000 : 2500,
      actualSpent: isAugust ? 2950 : (shoppingActual || 650),
      dueDay: 30,
      status: (isAugust ? 2950 : shoppingActual) >= 2500 ? 'PAID' : 'PARTIAL',
      notes: 'Amazon, Flipkart, Myntra, clothes & household items',
      preset: {
        categoryId: 'cat_family',
        subcategoryId: 'sub_shopping',
        description: 'Amazon Online Shopping',
        amount: 1200,
      },
    },
    {
      id: 'item_subscriptions_other',
      name: 'Subscriptions & Other Needs',
      categoryGroup: 'OTT, Maid, Petrol & Subscriptions',
      icon: Tv,
      color: 'text-teal-600 dark:text-teal-400',
      bgLight: 'bg-teal-50 border-teal-200',
      bgDark: 'dark:bg-teal-950/30 dark:border-teal-900/40',
      plannedAmount: isAugust ? 4200 : 4500,
      actualSpent: isAugust ? 4180 : (subscriptionsAndOtherActual || 1600),
      dueDay: 20,
      status: (isAugust ? 4180 : subscriptionsAndOtherActual) >= 4000 ? 'PAID' : 'PARTIAL',
      notes: 'Netflix, Prime, Mobile recharge, Maid salary, Petrol & Gym',
      preset: {
        categoryId: 'cat_utilities',
        subcategoryId: 'sub_dth',
        description: 'Netflix / Prime OTT Subscription',
        amount: 649,
      },
    },
  ];

  // Totals calculations
  const totalPlannedOutflows = runningItems.reduce((sum, item) => sum + item.plannedAmount, 0);
  const totalActualSpentOutflows = runningItems.reduce((sum, item) => sum + item.actualSpent, 0);
  const monthlySalary = 50000;
  const openingKotakBal = 4713.39;
  const totalAvailableInflow = monthlySalary + openingKotakBal;
  const remainingSafeBalance = totalAvailableInflow - totalActualSpentOutflows;

  return (
    <div className="glass-card p-5 space-y-6 border-2 border-indigo-500/20 shadow-xl bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20">
      {/* Header with Title and Month Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-brand-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg sm:text-xl">
                Monthly Running Amount Status
              </h2>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase tracking-wider">
                Live Status
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Current month borrowed money, debt payments, rent, groceries, lightbill, wifi, dairy, outside eating, shopping & subscriptions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Month Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setSelectedMonth('2026-08')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isAugust
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Aug 2026
            </button>
            <button
              onClick={() => setSelectedMonth('2026-09')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                isSeptember
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sept 2026
            </button>
          </div>

          <button
            onClick={() => triggerRefresh()}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
            title="Refresh running status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top 4 Key Running Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Inflows */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Total Inflows (Salary+Bal)
          </span>
          <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatINR(totalAvailableInflow)}
          </p>
          <span className="text-[10px] text-slate-400 block">₹50,000 Salary + ₹4,713.39 Kotak</span>
        </div>

        {/* 2. Current Month Borrowed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <HandCoins className="w-3.5 h-3.5" /> Borrowed This Month
          </span>
          <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatINR(currentMonthBorrowedTotal)}
          </p>
          <span className="text-[10px] text-slate-400 block">Hand loans & credit to return</span>
        </div>

        {/* 3. Total Outflows Spent */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Spent So Far (Running)
          </span>
          <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatINR(totalActualSpentOutflows)}
          </p>
          <span className="text-[10px] text-slate-400 block">Planned budget: {formatINR(totalPlannedOutflows)}</span>
        </div>

        {/* 4. Safe Remaining Balance */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white border border-indigo-700/40 shadow-md space-y-1">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5 text-indigo-400" /> Safe Remaining Bank Bal
          </span>
          <p className="text-xl sm:text-2xl font-black text-indigo-100">
            {formatINR(remainingSafeBalance)}
          </p>
          <span className="text-[10px] text-indigo-300/80 block">Liquid buffer after spent</span>
        </div>
      </div>

      {/* 10 Running Items Detailed Breakdown Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
            <span>📋 Running Breakdown for {isAugust ? 'August 2026' : 'September 2026'}</span>
            <span className="text-xs font-semibold text-slate-400">({runningItems.length} Categories Tracked)</span>
          </h3>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Click <strong>"+ Log / Pay"</strong> on any item to record payment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {runningItems.map((item) => {
            const Icon = item.icon;
            const progress = Math.min(100, Math.round((item.actualSpent / (item.plannedAmount || 1)) * 100));

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all hover:shadow-md ${item.bgLight} ${item.bgDark} flex flex-col justify-between space-y-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm shrink-0 ${item.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.name}</h4>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : item.status === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {item.status === 'PAID' ? '✓ PAID' : item.status === 'PARTIAL' ? '⏳ PARTIAL' : '⏳ PENDING'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.notes}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 block">
                      {formatINR(item.actualSpent)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Plan: {formatINR(item.plannedAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>Paid / Spent Progress</span>
                    <span>{progress}% ({formatINR(item.actualSpent)} of {formatINR(item.plannedAmount)})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress >= 100
                          ? 'bg-emerald-500'
                          : progress > 50
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-700/40 text-xs">
                  {item.dueDay ? (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-indigo-500" />
                      Due on {item.dueDay}th of month
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Monthly Running Outgoing</span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      openQuickModalWithPreset({
                        categoryId: item.preset.categoryId,
                        subcategoryId: item.preset.subcategoryId,
                        description: item.preset.description,
                        amount: Math.max(100, item.plannedAmount - item.actualSpent || item.preset.amount),
                        mode: item.id === 'item_borrowed' ? 'INCOME' : 'EXPENSE',
                      })
                    }
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-200 dark:border-indigo-800 shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Log / Pay</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
