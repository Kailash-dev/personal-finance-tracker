import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dataProvider } from '../services/dataProvider';
import { Debt, DebtType, Borrowing, BorrowingType } from '@personal-finance/types';
import { formatINR, calculateDebtSummary } from '@personal-finance/shared';
import {
  CreditCard,
  Percent,
  Calendar,
  Plus,
  X,
  Check,
  Building,
  TrendingDown,
  TrendingUp,
  Info,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Wallet,
  AlertCircle,
  Coins,
  Bike,
  Car,
  Users,
  HandCoins,
  Clock,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  UserCheck,
  Sparkles,
} from 'lucide-react';

const DEBT_TYPE_CONFIG: Record<
  DebtType,
  { label: string; icon: any; color: string; badgeBg: string }
> = {
  CHIT_FUND_VC: {
    label: 'Chit Fund / VC',
    icon: Coins,
    color: 'text-amber-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-500/20',
  },
  BIKE_LOAN: {
    label: 'Bike / Two-Wheeler EMI',
    icon: Bike,
    color: 'text-rose-500',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-500/20',
  },
  CAR_LOAN: {
    label: 'Car Loan EMI',
    icon: Car,
    color: 'text-blue-500',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-500/20',
  },
  CREDIT_CARD_MIN_PAYMENT: {
    label: 'Credit Card Min Due',
    icon: CreditCard,
    color: 'text-purple-500',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-500/20',
  },
  PERSONAL_BORROWING: {
    label: 'Personal Borrowing / Hand Loan',
    icon: HandCoins,
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  HOME_LOAN: {
    label: 'Home Loan / Mortgage',
    icon: Building,
    color: 'text-indigo-500',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
  },
  PERSONAL_LOAN: {
    label: 'Bank Personal Loan',
    icon: Landmark,
    color: 'text-orange-500',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-500/20',
  },
  EDUCATION_LOAN: {
    label: 'Education Loan',
    icon: Users,
    color: 'text-teal-500',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-500/20',
  },
  FRIENDS_FAMILY: {
    label: 'Friends & Family',
    icon: HandCoins,
    color: 'text-cyan-500',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
  },
  OTHER_OUTGOING: {
    label: 'Other Fixed Outgoing',
    icon: Wallet,
    color: 'text-slate-500',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300/30',
  },
};

export const DebtsPage: React.FC = () => {
  const { user, selectedMonth, refreshTrigger, triggerRefresh } = useFinance();
  const { user: authUser } = useAuth();

  // Active section tab: 'OUTGOINGS' (VCs, EMIs, Loans) or 'HAND_BORROWINGS' (Current month short-term borrowings & lendings)
  const [activeTab, setActiveTab] = useState<'OUTGOINGS' | 'HAND_BORROWINGS'>('OUTGOINGS');

  // Debts State
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtToPay, setSelectedDebtToPay] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Form states for Debt
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [type, setType] = useState<DebtType>('CHIT_FUND_VC');
  const [originalAmount, setOriginalAmount] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [notes, setNotes] = useState('');

  // Short-Term Borrowings & Hand Loans State
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [isAddBorrowingOpen, setIsAddBorrowingOpen] = useState(false);
  const [isSettleBorrowingOpen, setIsSettleBorrowingOpen] = useState(false);
  const [selectedBorrowingToSettle, setSelectedBorrowingToSettle] = useState<Borrowing | null>(null);
  const [settleAmount, setSettleAmount] = useState('');

  // Form states for Borrowing
  const [borrowingType, setBorrowingType] = useState<BorrowingType>('BORROWED');
  const [personName, setPersonName] = useState('');
  const [bAmount, setBAmount] = useState('');
  const [borrowDate, setBorrowDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [recordCashFlow, setRecordCashFlow] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      const [d, b] = await Promise.all([
        dataProvider.getDebts(),
        dataProvider.getBorrowings(selectedMonth),
      ]);
      setDebts(d);
      setBorrowings(b);
    };
    loadAll();
  }, [refreshTrigger, selectedMonth]);

  const openPresetModal = (presetType: DebtType, defaultName: string, defaultLender: string) => {
    setType(presetType);
    setName(defaultName);
    setLender(defaultLender);
    setOriginalAmount('');
    setOutstandingAmount('');
    setMonthlyEmi('');
    setInterestRate(presetType === 'CHIT_FUND_VC' || presetType === 'PERSONAL_BORROWING' ? '0' : '9.5');
    setDueDay('5');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lender || !monthlyEmi) return;

    try {
      const orig = parseFloat(originalAmount) || parseFloat(outstandingAmount) || parseFloat(monthlyEmi) * 12;
      const out = parseFloat(outstandingAmount) || orig;

      await dataProvider.createDebt({
        userId: authUser?.id || user?.id || 'user_1',
        name,
        lender,
        type,
        originalAmount: orig,
        outstandingAmount: out,
        interestRate: parseFloat(interestRate) || 0,
        monthlyEmi: parseFloat(monthlyEmi) || 0,
        startDate: new Date().toISOString().split('T')[0],
        dueDay: parseInt(dueDay, 10) || 5,
        notes,
      });

      setIsAddModalOpen(false);
      setName('');
      setLender('');
      setOriginalAmount('');
      setOutstandingAmount('');
      setMonthlyEmi('');
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDebt = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this outgoing commitment?')) {
      await dataProvider.deleteDebt(id);
      triggerRefresh();
    }
  };

  const handleOpenPayModal = (debt: Debt) => {
    setSelectedDebtToPay(debt);
    setPayAmount(debt.monthlyEmi.toString());
    setIsPayModalOpen(true);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDebtToPay || !payAmount) return;

    try {
      await dataProvider.recordDebtPayment(selectedDebtToPay.id, parseFloat(payAmount));
      setIsPayModalOpen(false);
      setSelectedDebtToPay(null);
      setPayAmount('');
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Borrowing Handlers
  const handleAddBorrowing = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(bAmount);
    if (!personName || !numAmount || numAmount <= 0) return;

    try {
      await dataProvider.createBorrowing({
        userId: authUser?.id || user?.id || 'user_1',
        type: borrowingType,
        personName,
        amount: numAmount,
        borrowDate,
        dueDate: dueDate || undefined,
        purpose: purpose || undefined,
        recordCashFlow,
      });

      setIsAddBorrowingOpen(false);
      setPersonName('');
      setBAmount('');
      setPurpose('');
      setDueDate('');
      setRecordCashFlow(false);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBorrowing = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this borrowing record?')) {
      await dataProvider.deleteBorrowing(id);
      triggerRefresh();
    }
  };

  const handleOpenSettleBorrowing = (b: Borrowing) => {
    setSelectedBorrowingToSettle(b);
    setSettleAmount((b.amount - b.amountSettled).toString());
    setIsSettleBorrowingOpen(true);
  };

  const handleConfirmSettleBorrowing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowingToSettle || !settleAmount) return;

    try {
      await dataProvider.settleBorrowing(selectedBorrowingToSettle.id, parseFloat(settleAmount));
      setIsSettleBorrowingOpen(false);
      setSelectedBorrowingToSettle(null);
      setSettleAmount('');
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations
  const income = user?.monthlyIncome || authUser?.monthlyIncome || 0;
  const summary = calculateDebtSummary(debts, income);
  const freeCashflow = Math.max(0, income - summary.totalMonthlyEmi);

  // Borrowing Metrics
  const borrowedList = borrowings.filter((b) => b.type === 'BORROWED');
  const lentList = borrowings.filter((b) => b.type === 'LENT');

  const totalPendingBorrowed = borrowedList
    .filter((b) => b.status !== 'SETTLED')
    .reduce((sum, b) => sum + (b.amount - b.amountSettled), 0);

  const totalPendingLent = lentList
    .filter((b) => b.status !== 'SETTLED')
    .reduce((sum, b) => sum + (b.amount - b.amountSettled), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Outgoings, Debts & Hand Loans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track Chit Funds (VC 1, VC 2), Bike EMIs, Card Minimum Dues, and Current Month Short-Term Borrowings (उधार)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'OUTGOINGS' ? (
            <button
              onClick={() => {
                setType('CHIT_FUND_VC');
                setName('');
                setLender('');
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Add Outgoing / EMI</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setBorrowingType('BORROWED');
                setPersonName('');
                setBAmount('');
                setIsAddBorrowingOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 transition-all self-start"
            >
              <Plus className="w-4 h-4" />
              <span>+ Record Hand Loan / Borrowing</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Feature Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 max-w-xl">
        <button
          type="button"
          onClick={() => setActiveTab('OUTGOINGS')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'OUTGOINGS'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Monthly Outgoings & EMIs ({debts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HAND_BORROWINGS')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'HAND_BORROWINGS'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <HandCoins className="w-4 h-4" />
          <span>Current Month Borrowings (उधार) ({borrowings.filter((b) => b.status !== 'SETTLED').length})</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: MONTHLY OUTGOINGS & FIXED EMIS (VC 1, VC 2, BIKE EMI, CARDS)
         ========================================================= */}
      {activeTab === 'OUTGOINGS' && (
        <div className="space-y-6 animate-in fade-in-50 duration-150">
          {/* Quick Add Presets Bar */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                ⚡ Quick Add Outgoing Category Presets:
              </span>
              <span className="text-[11px] text-slate-400">Click to pre-fill</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <button
                onClick={() => openPresetModal('CHIT_FUND_VC', 'VC 1 (Monthly Chit)', 'Chit Organizer / Committee')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/60 text-xs font-semibold text-amber-900 dark:text-amber-200 transition-colors"
              >
                <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="truncate">+ VC / Chit Fund</span>
              </button>

              <button
                onClick={() => openPresetModal('BIKE_LOAN', 'Bike EMI (Royal Enfield / Duke)', 'HDFC / Bajaj Finserv')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100/60 text-xs font-semibold text-rose-900 dark:text-rose-200 transition-colors"
              >
                <Bike className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">+ Bike EMI</span>
              </button>

              <button
                onClick={() => openPresetModal('CREDIT_CARD_MIN_PAYMENT', 'SBI Card Minimum Due', 'SBI Cards')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-purple-500/30 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100/60 text-xs font-semibold text-purple-900 dark:text-purple-200 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="truncate">+ SBI Card Min</span>
              </button>

              <button
                onClick={() => openPresetModal('CREDIT_CARD_MIN_PAYMENT', 'RBL Card Minimum Due', 'RBL Bank')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-950/30 hover:bg-indigo-100/60 text-xs font-semibold text-indigo-900 dark:text-indigo-200 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="truncate">+ RBL Card Min</span>
              </button>

              <button
                onClick={() => openPresetModal('PERSONAL_BORROWING', 'Personal Borrowing / Hand Loan', 'Friend / Relative')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/60 text-xs font-semibold text-emerald-900 dark:text-emerald-200 transition-colors"
              >
                <HandCoins className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">+ Hand Loan</span>
              </button>

              <button
                onClick={() => openPresetModal('CAR_LOAN', 'Car Loan EMI', 'ICICI / SBI Bank')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100/60 text-xs font-semibold text-blue-900 dark:text-blue-200 transition-colors"
              >
                <Car className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="truncate">+ Car EMI</span>
              </button>
            </div>
          </div>

          {/* Summary Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                  Total Monthly Outgoings
                </span>
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {formatINR(summary.totalMonthlyEmi)}
              </p>
              <span className="text-xs text-slate-500">Committed across {debts.length} outgoing(s)</span>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
                  Total Outstanding Liability
                </span>
                <TrendingDown className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {formatINR(summary.totalOutstanding)}
              </p>
              <span className="text-xs text-slate-500">Total remaining principal</span>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
                  Commitment Ratio (DTI)
                </span>
                <Percent className="w-4 h-4 text-brand-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {summary.debtToIncomeRatio.toFixed(1)}%
              </p>
              <span className="text-xs text-slate-500">
                {summary.debtToIncomeRatio <= 30
                  ? '✓ Healthy (<30% of salary)'
                  : summary.debtToIncomeRatio <= 50
                  ? '⚠ Moderate (30-50%)'
                  : '🚨 Critical (>50% salary locked)'}
              </span>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                  Free Disposable Cashflow
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {formatINR(freeCashflow)}
              </p>
              <span className="text-xs text-slate-500">Remaining for rent, food & savings</span>
            </div>
          </div>

          {/* Debts & Outgoings List */}
          {debts.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl">
                📋
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  No Monthly Outgoings or EMIs Added Yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Add your monthly commitments like <strong>VC 1, VC 2, Bike EMI, SBI Card Min Due, RBL Card Min Due, and Hand Loans</strong>. RupeeTrack will organize your payment calendar and deduct them from your free cashflow.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => openPresetModal('CHIT_FUND_VC', 'VC 1 (Monthly Chit)', 'Chit Organizer / Committee')}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-500/25 transition-all"
                >
                  + Add VC 1 / Chit Fund
                </button>
                <button
                  onClick={() => openPresetModal('BIKE_LOAN', 'Bike EMI', 'Bank / Finance')}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-500/25 transition-all"
                >
                  + Add Bike EMI
                </button>
                <button
                  onClick={() => openPresetModal('CREDIT_CARD_MIN_PAYMENT', 'SBI Card Min Due', 'SBI Card')}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/25 transition-all"
                >
                  + Add Credit Card Due
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {debts
                .slice()
                .sort((a, b) => a.dueDay - b.dueDay)
                .map((debt) => {
                  const config = DEBT_TYPE_CONFIG[debt.type] || DEBT_TYPE_CONFIG.OTHER_OUTGOING;
                  const Icon = config.icon;
                  const paidAmount = Math.max(0, debt.originalAmount - debt.outstandingAmount);
                  const progressPct = debt.originalAmount > 0 ? (paidAmount / debt.originalAmount) * 100 : 0;

                  return (
                    <div key={debt.id} className="glass-card p-5 space-y-4 hover:shadow-lg transition-shadow">
                      {/* Top Bar */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <Icon className={`w-5 h-5 ${config.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{debt.name}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badgeBg}`}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building className="w-3 h-3" /> {debt.lender}
                              {debt.interestRate > 0 && <span>• {debt.interestRate}% p.a.</span>}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-extrabold text-brand-600 dark:text-brand-400">
                            {formatINR(debt.monthlyEmi)}/mo
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                          <span>Paid: {formatINR(paidAmount)}</span>
                          <span>Outstanding: {formatINR(debt.outstandingAmount)}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
                          />
                        </div>
                      </div>

                      {/* Bottom details & Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                          <Calendar className="w-3.5 h-3.5" /> Due on {debt.dueDay}th of every month
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenPayModal(debt)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/20 transition-colors flex items-center gap-1"
                            title="Log this month payment"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Log Paid</span>
                          </button>

                          <button
                            onClick={() => handleDeleteDebt(debt.id)}
                            className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete commitment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================
          TAB 2: CURRENT MONTH SHORT-TERM BORROWINGS & HAND LOANS (उधार)
         ========================================================= */}
      {activeTab === 'HAND_BORROWINGS' && (
        <div className="space-y-6 animate-in fade-in-50 duration-150">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 border-rose-500/20 bg-gradient-to-br from-white via-rose-50/15 to-white dark:from-slate-900 dark:via-rose-950/15 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Money I Borrowed (I Owe)
                </span>
                <ArrowDownLeft className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {formatINR(totalPendingBorrowed)}
              </p>
              <span className="text-xs text-slate-500">Pending repayment to friends/family</span>
            </div>

            <div className="glass-card p-5 border-emerald-500/20 bg-gradient-to-br from-white via-emerald-50/15 to-white dark:from-slate-900 dark:via-emerald-950/15 dark:to-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Money I Lent (Owed to Me)
                </span>
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(totalPendingLent)}
              </p>
              <span className="text-xs text-slate-500">To be collected back</span>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-500 uppercase tracking-wider">
                  Net Hand Balance
                </span>
                <ShieldCheck className="w-4 h-4 text-brand-500" />
              </div>
              <p className={`text-2xl font-extrabold mt-1 ${totalPendingLent >= totalPendingBorrowed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {totalPendingLent >= totalPendingBorrowed ? '+' : '-'}
                {formatINR(Math.abs(totalPendingLent - totalPendingBorrowed))}
              </p>
              <span className="text-xs text-slate-500">
                {totalPendingLent >= totalPendingBorrowed ? '✓ You are in surplus net' : '⚠ You have net pending payables'}
              </span>
            </div>
          </div>

          {/* Borrowings List */}
          {borrowings.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                🤝
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  No Current Month Short-Term Borrowings (उधार)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Keep track of quick hand loans borrowed from friends, colleagues, or relatives, as well as money you lent to others.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setBorrowingType('BORROWED');
                    setPersonName('');
                    setBAmount('');
                    setIsAddBorrowingOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-500/25 transition-all"
                >
                  + Money I Borrowed
                </button>
                <button
                  onClick={() => {
                    setBorrowingType('LENT');
                    setPersonName('');
                    setBAmount('');
                    setIsAddBorrowingOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/25 transition-all"
                >
                  + Money I Lent
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {borrowings.map((b) => {
                const isBorrowed = b.type === 'BORROWED';
                const isSettled = b.status === 'SETTLED';
                const pendingAmt = Math.max(0, b.amount - b.amountSettled);
                const progressPct = b.amount > 0 ? (b.amountSettled / b.amount) * 100 : 0;

                return (
                  <div
                    key={b.id}
                    className={`glass-card p-5 space-y-4 hover:shadow-lg transition-shadow border ${
                      isSettled
                        ? 'opacity-60 border-slate-200 dark:border-slate-800'
                        : isBorrowed
                        ? 'border-rose-500/30'
                        : 'border-emerald-500/30'
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            isBorrowed
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                          }`}
                        >
                          {isBorrowed ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{b.personName}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isSettled
                                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  : isBorrowed
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {isSettled ? 'SETTLED 🎉' : isBorrowed ? 'I BORROWED' : 'I LENT'}
                            </span>
                          </div>
                          {b.purpose && (
                            <p className="text-[11px] text-slate-400 mt-0.5">Purpose: {b.purpose}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-base font-extrabold ${
                            isBorrowed ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {formatINR(b.amount)}
                        </span>
                        {isSettled ? (
                          <span className="text-[10px] text-emerald-600 font-bold block">Paid in Full</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Pending: {formatINR(pendingAmt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                        <span>Settled: {formatINR(b.amountSettled)}</span>
                        <span>{progressPct.toFixed(0)}% Completed</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isSettled
                              ? 'bg-slate-400'
                              : isBorrowed
                              ? 'bg-rose-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Borrowed: {b.borrowDate}</span>
                        {b.dueDate && <span className="font-semibold text-amber-600 ml-1">• Due: {b.dueDate}</span>}
                      </span>

                      <div className="flex items-center gap-2">
                        {!isSettled && (
                          <button
                            onClick={() => handleOpenSettleBorrowing(b)}
                            className={`px-2.5 py-1 rounded-lg text-white font-bold text-[11px] shadow-sm transition-colors flex items-center gap-1 ${
                              isBorrowed
                                ? 'bg-rose-600 hover:bg-rose-700'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isBorrowed ? 'Repay' : 'Collect'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteBorrowing(b.id)}
                          className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Add Outgoing / Loan Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Add Monthly Outgoing / Loan Commitment
                </h3>
                <p className="text-[11px] text-slate-400">Add VC, Bike EMI, Card Minimum Due, Hand Loan or Bank EMI</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Outgoing Type</label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as DebtType;
                    setType(newType);
                    if (newType === 'CHIT_FUND_VC' && !name) setName('VC 1 (Monthly Chit)');
                    if (newType === 'BIKE_LOAN' && !name) setName('Bike EMI');
                    if (newType === 'CREDIT_CARD_MIN_PAYMENT' && !name) setName('SBI Card Min Due');
                    if (newType === 'PERSONAL_BORROWING' && !name) setName('Personal Hand Loan');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="CHIT_FUND_VC">🪙 VC / Chit Fund (VC 1, VC 2, Committee)</option>
                  <option value="BIKE_LOAN">🏍 Bike / Superbike Loan EMI</option>
                  <option value="CREDIT_CARD_MIN_PAYMENT">💳 Credit Card Minimum Due (SBI/RBL/HDFC)</option>
                  <option value="PERSONAL_BORROWING">🤝 Personal Borrowing / Hand Loan</option>
                  <option value="CAR_LOAN">🚗 Car Loan EMI</option>
                  <option value="HOME_LOAN">🏠 Home Loan / Mortgage EMI</option>
                  <option value="PERSONAL_LOAN">💼 Bank Personal Loan</option>
                  <option value="EDUCATION_LOAN">🎓 Education Loan</option>
                  <option value="OTHER_OUTGOING">🔄 Other Monthly Fixed Commitment</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Commitment Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VC 1 / Bike EMI / SBI Card"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lender / Person / Bank
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Committee Name / SBI / Friend Name"
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Payment / EMI (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={monthlyEmi}
                    onChange={(e) => setMonthlyEmi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Due Day (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total / Scheme Amount (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    value={originalAmount}
                    onChange={(e) => setOriginalAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Outstanding Remaining (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 60000"
                    value={outstandingAmount}
                    onChange={(e) => setOutstandingAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Interest % (0 for VC/Hand)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 20-month chit fund cycle, ending Dec 2026"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Outgoing Commitment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Log Payment Modal for Debt */}
      {isPayModalOpen && selectedDebtToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPayModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Record Monthly Payment
                </h3>
                <p className="text-[11px] text-slate-400">{selectedDebtToPay.name}</p>
              </div>
              <button onClick={() => setIsPayModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2.5 text-lg font-extrabold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-[11px]">
                💡 This will record an expense transaction for this month and reduce the remaining outstanding balance of <strong>{selectedDebtToPay.name}</strong> by {formatINR(parseFloat(payAmount) || 0)}.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Record Payment</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Current Month Short-Term Borrowing / Hand Loan */}
      {isAddBorrowingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddBorrowingOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Record Hand Loan / Borrowing (उधार)
                </h3>
                <p className="text-[11px] text-slate-400">Current month short-term money taken or given</p>
              </div>
              <button onClick={() => setIsAddBorrowingOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddBorrowing} className="space-y-4 text-xs">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setBorrowingType('BORROWED')}
                  className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    borrowingType === 'BORROWED'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Money I Borrowed</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBorrowingType('LENT')}
                  className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                    borrowingType === 'LENT'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Money I Lent</span>
                </button>
              </div>

              {/* Person & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {borrowingType === 'BORROWED' ? 'Borrowed From (Person Name)' : 'Lent To (Person Name)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul / Amit / Colleague"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5000"
                    value={bAmount}
                    onChange={(e) => setBAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-sm"
                  />
                </div>
              </div>

              {/* Date & Expected Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Date Borrowed/Lent</label>
                  <input
                    type="date"
                    required
                    value={borrowDate}
                    onChange={(e) => setBorrowDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Purpose / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Rent emergency / Movie ticket advance / Cash shortage"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Auto Record in Bank balance toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recordCashFlow"
                  checked={recordCashFlow}
                  onChange={(e) => setRecordCashFlow(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="recordCashFlow" className="text-[11px] text-slate-600 dark:text-slate-300 font-medium cursor-pointer">
                  Also record as an instant transaction in my account balance
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Hand Loan Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Settle Hand Loan / Repay Modal */}
      {isSettleBorrowingOpen && selectedBorrowingToSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSettleBorrowingOpen(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedBorrowingToSettle.type === 'BORROWED' ? 'Repay Hand Loan' : 'Collect Hand Loan'}
                </h3>
                <p className="text-[11px] text-slate-400">{selectedBorrowingToSettle.personName}</p>
              </div>
              <button onClick={() => setIsSettleBorrowingOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettleBorrowing} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Settlement Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  autoFocus
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full px-3 py-2.5 text-lg font-extrabold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-brand-600"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                💡 Remaining balance after this settlement:{' '}
                <strong>
                  {formatINR(Math.max(0, (selectedBorrowingToSettle.amount - selectedBorrowingToSettle.amountSettled) - (parseFloat(settleAmount) || 0)))}
                </strong>.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Settlement</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
