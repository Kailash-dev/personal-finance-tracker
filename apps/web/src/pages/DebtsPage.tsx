import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dataProvider } from '../services/dataProvider';
import { Debt, DebtType, Borrowing, BorrowingType, IncomeStream, IncomeStreamType, CibilProfile } from '@personal-finance/types';
import { formatINR, calculateDebtSummary, calculateIncomeSummary, calculateEmiDetails } from '@personal-finance/shared';
import { format, parseISO } from 'date-fns';
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
  Sparkles,
  Home,
  ShoppingCart,
  Milk,
  Zap,
  Fuel,
  Heart,
  Briefcase,
  Laptop,
  Target,
  RefreshCw,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Activity,
  Layers,
  Award,
} from 'lucide-react';

import { SeptemberTrackerWidget } from '../components/dashboard/SeptemberTrackerWidget';

const DEBT_TYPE_CONFIG: Record<
  DebtType,
  { label: string; icon: any; color: string; badgeBg: string }
> = {
  RENT_HOUSING: {
    label: 'Rent & Maintenance',
    icon: Home,
    color: 'text-indigo-500',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
  },
  GROCERIES_FOOD: {
    label: 'Groceries & Staples',
    icon: ShoppingCart,
    color: 'text-amber-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-500/20',
  },
  MILK_DAIRY: {
    label: 'Daily Milk & Dairy',
    icon: Milk,
    color: 'text-sky-500',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-500/20',
  },
  UTILITIES_BILLS: {
    label: 'Electricity & Bills',
    icon: Zap,
    color: 'text-yellow-500',
    badgeBg: 'bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-500/20',
  },
  MAID_COOK: {
    label: 'Maid & Cook Salary',
    icon: Users,
    color: 'text-teal-500',
    badgeBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-500/20',
  },
  FUEL_TRANSPORT: {
    label: 'Fuel & Petrol',
    icon: Fuel,
    color: 'text-pink-500',
    badgeBg: 'bg-pink-50 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 border-pink-500/20',
  },
  FAMILY_PERSONAL: {
    label: 'Family & Personal',
    icon: Heart,
    color: 'text-rose-500',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-500/20',
  },
  CHIT_FUND_VC: {
    label: 'Chit Fund / VC',
    icon: Coins,
    color: 'text-amber-600',
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
    label: 'Personal Hand Loan',
    icon: HandCoins,
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
  },
  HOME_LOAN: {
    label: 'Home Loan / Mortgage',
    icon: Building,
    color: 'text-indigo-600',
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
    color: 'text-teal-600',
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

  // 3 Pure Debt Tabs:
  // 1. ALL_DEBTS (Personal Loans, Bike EMIs, Mobile Finance, Credit Cards, Chit Funds, Hand Loans)
  // 2. HAND_BORROWINGS (Current month short-term borrowings & 1-click carry-forward/rollover)
  // 3. CIBIL_SCORE (CIBIL score improvement, Credit Utilization <30%, Axis NOC tracker, Auto-debit safety)
  const [activeTab, setActiveTab] = useState<'ALL_DEBTS' | 'HAND_BORROWINGS' | 'CIBIL_SCORE'>('ALL_DEBTS');
  const [debtFilter, setDebtFilter] = useState<'ALL' | 'LOANS' | 'VEHICLE_EMIS' | 'CARDS' | 'CHITS' | 'HAND_LOANS'>('ALL');

  // Debts / Outgoings State
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtToPay, setSelectedDebtToPay] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Form states for Outgoing/Debt
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [type, setType] = useState<DebtType>('PERSONAL_LOAN');
  const [originalAmount, setOriginalAmount] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [totalTenureMonths, setTotalTenureMonths] = useState('');
  const [emisPaid, setEmisPaid] = useState('');
  const [dueDay, setDueDay] = useState('10');
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

  // Income Streams State
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([]);
  const [isAddIncomeStreamOpen, setIsAddIncomeStreamOpen] = useState(false);
  const [streamName, setStreamName] = useState('');
  const [streamType, setStreamType] = useState<IncomeStreamType>('FREELANCE');
  const [streamAmount, setStreamAmount] = useState('');
  const [streamDay, setStreamDay] = useState('15');
  const [streamClient, setStreamClient] = useState('');

  // CIBIL Profile State
  const [cibilProfile, setCibilProfile] = useState<CibilProfile | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      const [d, b, streams, cibil] = await Promise.all([
        dataProvider.getDebts(),
        dataProvider.getBorrowings(selectedMonth),
        dataProvider.getIncomeStreams(),
        dataProvider.getCibilAnalysis(),
      ]);
      setDebts(d);
      setBorrowings(b);
      setIncomeStreams(streams);
      setCibilProfile(cibil);
    };
    loadAll();
  }, [refreshTrigger, selectedMonth]);

  const openPresetModal = (
    presetType: DebtType,
    defaultName: string,
    defaultLender: string,
    defaultAmount?: string,
    tenure?: number,
    paid?: number
  ) => {
    setType(presetType);
    setName(defaultName);
    setLender(defaultLender);
    const emiVal = defaultAmount || '';
    setMonthlyEmi(emiVal);
    const tenureVal = tenure || 12;
    const paidVal = paid || 0;
    setTotalTenureMonths(tenureVal.toString());
    setEmisPaid(paidVal.toString());
    const origCalc = defaultAmount ? parseFloat(defaultAmount) * tenureVal : 0;
    const remCalc = defaultAmount ? parseFloat(defaultAmount) * (tenureVal - paidVal) : 0;
    setOriginalAmount(origCalc ? origCalc.toString() : '');
    setOutstandingAmount(remCalc ? remCalc.toString() : '');
    setInterestRate(
      presetType === 'CHIT_FUND_VC' ||
      presetType === 'PERSONAL_BORROWING' ||
      presetType === 'RENT_HOUSING' ||
      presetType === 'GROCERIES_FOOD' ||
      presetType === 'MILK_DAIRY' ||
      presetType === 'UTILITIES_BILLS' ||
      presetType === 'MAID_COOK' ||
      presetType === 'FUEL_TRANSPORT' ||
      presetType === 'FAMILY_PERSONAL'
        ? '0'
        : '9.5'
    );
    setDueDay('10');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lender || !monthlyEmi) return;

    try {
      const emiNum = parseFloat(monthlyEmi);
      const tenureNum = parseInt(totalTenureMonths, 10) || Math.max(1, Math.round((parseFloat(originalAmount) || emiNum * 12) / emiNum));
      const paidNum = parseInt(emisPaid, 10) || 0;
      const remNum = Math.max(0, tenureNum - paidNum);
      const orig = parseFloat(originalAmount) || emiNum * tenureNum;
      const out = parseFloat(outstandingAmount) || emiNum * remNum;

      await dataProvider.createDebt({
        userId: authUser?.id || user?.id || 'user_1',
        name,
        lender,
        type,
        originalAmount: orig,
        outstandingAmount: out,
        interestRate: parseFloat(interestRate) || 0,
        monthlyEmi: emiNum,
        totalTenureMonths: tenureNum,
        emisPaid: paidNum,
        emisRemaining: remNum,
        startDate: new Date().toISOString().split('T')[0],
        dueDay: parseInt(dueDay, 10) || 10,
        notes,
      });

      setIsAddModalOpen(false);
      setName('');
      setLender('');
      setOriginalAmount('');
      setOutstandingAmount('');
      setMonthlyEmi('');
      setTotalTenureMonths('');
      setEmisPaid('');
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDebt = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this debt commitment?')) {
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

  // 1-Click Rollover / Carry Forward Borrowing
  const handleRolloverBorrowing = async (b: Borrowing, targetMonth: string) => {
    try {
      await dataProvider.rolloverBorrowing(b.id, targetMonth);
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Income Stream Handlers
  const handleAddIncomeStream = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(streamAmount);
    if (!streamName || !num || num <= 0) return;

    try {
      await dataProvider.createIncomeStream({
        userId: authUser?.id || user?.id || 'user_1',
        name: streamName,
        type: streamType,
        expectedAmount: num,
        expectedDay: parseInt(streamDay, 10) || 10,
        isGuaranteed: streamType === 'SALARY_JOB',
        clientOrEmployer: streamClient || 'Direct Client',
        status: 'EXPECTED',
      });

      setIsAddIncomeStreamOpen(false);
      setStreamName('');
      setStreamAmount('');
      setStreamClient('');
      triggerRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteIncomeStream = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this income stream?')) {
      await dataProvider.deleteIncomeStream(id);
      triggerRefresh();
    }
  };

  // Calculations
  const baseSalary = user?.monthlyIncome || authUser?.monthlyIncome || 50000;
  const incomeSummary = calculateIncomeSummary(incomeStreams, baseSalary);
  const totalEarning = incomeSummary.totalInflow;

  // Split Debts into Pure Debts vs Living Commitments
  const pureDebts = debts.filter((d) =>
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
  );

  const livingCommitments = debts.filter((d) =>
    [
      'RENT_HOUSING',
      'GROCERIES_FOOD',
      'MILK_DAIRY',
      'UTILITIES_BILLS',
      'MAID_COOK',
      'FUEL_TRANSPORT',
      'FAMILY_PERSONAL',
    ].includes(d.type)
  );

  const pureDebtSummary = calculateDebtSummary(pureDebts, totalEarning);
  const totalSummary = calculateDebtSummary(debts, totalEarning);
  const freeCashflow = Math.max(0, totalEarning - totalSummary.totalMonthlyEmi);

  // Borrowing Metrics
  const borrowedList = borrowings.filter((b) => b.type === 'BORROWED');
  const lentList = borrowings.filter((b) => b.type === 'LENT');

  const totalPendingBorrowed = borrowedList
    .filter((b) => b.status !== 'SETTLED')
    .reduce((sum, b) => sum + (b.amount - b.amountSettled), 0);

  const totalPendingLent = lentList
    .filter((b) => b.status !== 'SETTLED')
    .reduce((sum, b) => sum + (b.amount - b.amountSettled), 0);

  // Filtered Pure Debts for Display
  const filteredPureDebts = pureDebts.filter((d) => {
    if (debtFilter === 'LOANS') return d.type === 'PERSONAL_LOAN' || d.type === 'HOME_LOAN' || d.type === 'EDUCATION_LOAN';
    if (debtFilter === 'VEHICLE_EMIS') return d.type === 'BIKE_LOAN' || d.type === 'CAR_LOAN';
    if (debtFilter === 'CARDS') return d.type === 'CREDIT_CARD_MIN_PAYMENT';
    if (debtFilter === 'CHITS') return d.type === 'CHIT_FUND_VC';
    if (debtFilter === 'HAND_LOANS') return d.type === 'PERSONAL_BORROWING';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            ⚡ Pure Debt, Loan & EMI Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track active loans, monthly EMIs, credit cards, chit funds, and amount paid already
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'ALL_DEBTS' && (
            <button
              onClick={() => {
                setType('PERSONAL_LOAN');
                setName('');
                setLender('');
                setMonthlyEmi('');
                setOriginalAmount('');
                setOutstandingAmount('');
                setTotalTenureMonths('12');
                setEmisPaid('0');
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all self-start"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log / Add New Debt</span>
            </button>
          )}

          {activeTab === 'HAND_BORROWINGS' && (
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

      {/* 3 Pure Debt Feature Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
        <button
          type="button"
          onClick={() => setActiveTab('ALL_DEBTS')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ALL_DEBTS'
              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>⚡ All Debts & EMIs ({pureDebts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HAND_BORROWINGS')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'HAND_BORROWINGS'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <HandCoins className="w-4 h-4" />
          <span>🤝 Hand Loans & Borrowings ({borrowings.filter((b) => b.status !== 'SETTLED').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CIBIL_SCORE')}
          className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CIBIL_SCORE'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>🛡️ CIBIL 750+ & Payoff Strategy</span>
        </button>
      </div>

      {/* =========================================================
          TAB 1: ALL DEBTS, LOANS, EMIS & CHITS (LOG & TRACK)
         ========================================================= */}
      {activeTab === 'ALL_DEBTS' && (
        <div className="space-y-6 animate-in fade-in-50 duration-150">
          {/* Fast Debt Logger Strip */}
          <div className="glass-card p-5 border-2 border-brand-500/30 bg-gradient-to-br from-white via-indigo-50/20 to-brand-50/25 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-brand-500/20">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    ⚡ Fast Debt & Loan Logger
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Log bank personal loans, bike EMIs, mobile finance, credit cards, chit schemes, or fintech borrowings
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold uppercase tracking-wider self-start sm:self-auto">
                Real-Time Calibration
              </span>
            </div>

            {/* 1-Click Fast Presets Bar */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                1-Click Quick Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                <button
                  type="button"
                  onClick={() => openPresetModal('PERSONAL_LOAN', 'Ram Fincorp Small Borrowing', 'Ram Fincorp', '16650')}
                  className="flex items-center gap-1.5 p-2 rounded-xl border border-orange-500/30 bg-orange-50/60 dark:bg-orange-950/30 hover:bg-orange-100/60 text-xs font-semibold text-orange-900 dark:text-orange-200 transition-colors"
                >
                  <Landmark className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">+ Ram Fincorp</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPresetModal('BIKE_LOAN', 'Bike Loan Monthly EMI', 'Hero Fincorp / HDFC', '6250')}
                  className="flex items-center gap-1.5 p-2 rounded-xl border border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100/60 text-xs font-semibold text-rose-900 dark:text-rose-200 transition-colors"
                >
                  <Bike className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">+ Bike EMI</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPresetModal('PERSONAL_LOAN', 'Bajaj Finserv Mobile EMI', 'Bajaj Finance', '3800')}
                  className="flex items-center gap-1.5 p-2 rounded-xl border border-blue-500/30 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100/60 text-xs font-semibold text-blue-900 dark:text-blue-200 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="truncate">+ Mobile EMI</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPresetModal('CHIT_FUND_VC', 'Chit Fund (VC 2) EMI', 'Chit Committee', '4500')}
                  className="flex items-center gap-1.5 p-2 rounded-xl border border-amber-600/30 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100/60 text-xs font-semibold text-amber-900 dark:text-amber-200 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">+ Chit VC 2</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPresetModal('CREDIT_CARD_MIN_PAYMENT', 'SBI Credit Card Minimum Due', 'SBI Cards', '12108')}
                  className="flex items-center gap-1.5 p-2 rounded-xl border border-purple-500/30 bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100/60 text-xs font-semibold text-purple-900 dark:text-purple-200 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  <span className="truncate">+ SBI Card Min</span>
                </button>

                <button
                  type="button"
                  onClick={() => openPresetModal('CREDIT_CARD_MIN_PAYMENT', 'Axis CC Final Settlement', 'Axis Bank', '1400')}
                  className="flex items-center gap-1.5 p-2 rounded-xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100/60 text-xs font-semibold text-emerald-900 dark:text-emerald-200 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">+ Axis Settlement</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pure Debt Summary Metrics - 5 Key Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Total Outstanding */}
            <div className="glass-card p-4 border-amber-500/20 bg-gradient-to-br from-amber-50/10 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Total Outstanding
                </span>
                <TrendingDown className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {formatINR(pureDebtSummary.totalOutstanding)}
              </p>
              <span className="text-[11px] text-slate-400">Total remaining principal balance</span>
            </div>

            {/* Total Monthly EMIs */}
            <div className="glass-card p-4 border-rose-500/20 bg-gradient-to-br from-rose-50/10 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Monthly EMI Outflow
                </span>
                <Calendar className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatINR(pureDebtSummary.totalMonthlyEmi)}
              </p>
              <span className="text-[11px] text-slate-400">Across {pureDebts.length} active commitments</span>
            </div>

            {/* Total Remaining EMIs Count */}
            <div className="glass-card p-4 border-indigo-500/20 bg-gradient-to-br from-indigo-50/10 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Remaining EMIs Count
                </span>
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {pureDebtSummary.totalRemainingEmis} EMIs Left
              </p>
              <span className="text-[11px] text-slate-400">Total installments remaining to pay</span>
            </div>

            {/* Total Paid Off */}
            <div className="glass-card p-4 border-emerald-500/20 bg-gradient-to-br from-emerald-50/10 to-transparent">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Total Repaid So Far
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(pureDebtSummary.totalPaid)}
              </p>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                {pureDebtSummary.overallProgressPercentage.toFixed(0)}% Paid of {formatINR(pureDebtSummary.totalOriginal)}
              </span>
            </div>

            {/* Expected Debt-Free Date */}
            <div className="glass-card p-4 border-purple-500/20 bg-gradient-to-br from-purple-50/10 to-transparent sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Target Debt-Free Date
                </span>
                <Award className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {pureDebtSummary.projectedDebtFreeDate ? format(parseISO(pureDebtSummary.projectedDebtFreeDate), 'MMM yyyy') : 'Oct 2027'}
              </p>
              <span className="text-[11px] text-slate-400">
                {pureDebtSummary.maxRemainingMonths} months to complete freedom!
              </span>
            </div>
          </div>

          {/* Category Filter Chips & Sort Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDebtFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  debtFilter === 'ALL'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                All Debts ({pureDebts.length})
              </button>
              <button
                type="button"
                onClick={() => setDebtFilter('LOANS')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  debtFilter === 'LOANS'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                🏦 Bank & FinTech Loans
              </button>
              <button
                type="button"
                onClick={() => setDebtFilter('VEHICLE_EMIS')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  debtFilter === 'VEHICLE_EMIS'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                🏍️ Bike & Consumer EMIs
              </button>
              <button
                type="button"
                onClick={() => setDebtFilter('CARDS')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  debtFilter === 'CARDS'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                💳 Cards & Settlements
              </button>
              <button
                type="button"
                onClick={() => setDebtFilter('CHITS')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  debtFilter === 'CHITS'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                🪙 Chit Funds / VC
              </button>
              <button
                type="button"
                onClick={() => setDebtFilter('HAND_LOANS')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  debtFilter === 'HAND_LOANS'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                🤝 Hand Borrowings
              </button>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Sorted by Chronological Timeline
            </span>
          </div>

          {/* Debts Cards Grid */}
          {filteredPureDebts.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto text-2xl">
                💳
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  No Debts Logged in this Category
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Use the <strong>Fast Debt Logger</strong> or click <strong>"+ Log / Add New Debt"</strong> above to add any loan, EMI, or credit balance.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPureDebts
                .slice()
                .sort((a, b) => {
                  const getRank = (d: Debt) => {
                    if (d.id === 'debt_ram_fincorp') return 9.0;
                    if (d.id === 'debt_bike_emi') return 10.1;
                    if (d.id === 'debt_vc2_10th') return 10.2;
                    if (d.id === 'debt_bajaj_mobile') return 12.0;
                    if (d.id === 'debt_axis_settlement') return 15.1;
                    if (d.id === 'debt_vc2_25th') return 25.0;
                    if (d.id === 'debt_sbi_card') return 28.0;
                    if (d.id === 'debt_travel_emi') return 32.0;
                    if (d.id === 'debt_personal_loan_3m') return 35.0;
                    return d.dueDay || 50;
                  };
                  return getRank(a) - getRank(b);
                })
                .map((debt) => {
                  const config = DEBT_TYPE_CONFIG[debt.type] || DEBT_TYPE_CONFIG.OTHER_OUTGOING;
                  const Icon = config.icon;
                  const emi = calculateEmiDetails(debt);

                  return (
                    <div
                      key={debt.id}
                      className="glass-card p-5 space-y-3.5 hover:shadow-xl transition-all flex flex-col justify-between border border-slate-200 dark:border-slate-800 relative overflow-hidden group"
                    >
                      {/* Top Accent Stripe based on urgency */}
                      <div
                        className={`absolute top-0 inset-x-0 h-1 ${
                          emi.remainingEmis === 1
                            ? 'bg-amber-500'
                            : emi.remainingEmis === 0
                            ? 'bg-emerald-500'
                            : 'bg-brand-500'
                        }`}
                      />

                      <div>
                        {/* Top Bar */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              <Icon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug truncate">
                                {debt.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                {debt.lender}
                                {debt.interestRate > 0 && <span> • {debt.interestRate}% p.a.</span>}
                              </p>
                            </div>
                          </div>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${config.badgeBg}`}>
                            {config.label}
                          </span>
                        </div>

                        {/* Remaining EMIs Highlight Badge */}
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm ${
                              emi.remainingEmis === 1
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-400/40'
                                : emi.remainingEmis === 0
                                ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-400/40'
                                : 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {emi.remainingEmis === 1
                              ? `🔥 FINAL EMI LEFT (${emi.paidEmis} of ${emi.totalEmis} Paid)`
                              : emi.remainingEmis === 0
                              ? `✓ FULLY SETTLED & PAID`
                              : `⏳ ${emi.remainingEmis} EMIs Left (${emi.paidEmis} of ${emi.totalEmis} Paid)`}
                          </span>

                          <span className="text-[11px] font-bold text-slate-400">
                            {emi.progressPercentage.toFixed(0)}% Paid
                          </span>
                        </div>

                        {/* Monthly EMI Amount Box */}
                        <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">Monthly Installment:</span>
                          <span className="text-base font-black text-brand-600 dark:text-brand-400">
                            {formatINR(debt.monthlyEmi)}/mo
                          </span>
                        </div>

                        {/* 3-Column Totals Breakdown (Original Total | Paid So Far | Remaining Due) */}
                        <div className="grid grid-cols-3 gap-2 mt-2.5 p-2.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 text-center border border-slate-200/40 dark:border-slate-700/40">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Loan</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                              {formatINR(debt.originalAmount)}
                            </span>
                            <span className="block text-[9px] text-slate-400 font-semibold">{emi.totalEmis} EMIs</span>
                          </div>

                          <div className="border-x border-slate-200 dark:border-slate-700/60 px-1">
                            <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Paid Total</span>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              {formatINR(emi.paidAmount)}
                            </span>
                            <span className="block text-[9px] text-emerald-600/80 font-semibold">{emi.paidEmis} Paid</span>
                          </div>

                          <div>
                            <span className="block text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">Remaining</span>
                            <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                              {formatINR(debt.outstandingAmount)}
                            </span>
                            <span className="block text-[9px] text-rose-600/80 font-semibold">{emi.remainingEmis} Left</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar with completion date */}
                      <div className="space-y-1 pt-1">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(5, emi.progressPercentage))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span>Progress: {emi.progressPercentage.toFixed(0)}%</span>
                          <span>
                            {emi.projectedPayoffDate
                              ? `Payoff: ${format(parseISO(emi.projectedPayoffDate), 'MMM yyyy')}`
                              : 'Settled'}
                          </span>
                        </div>
                      </div>

                      {/* Bottom details & Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                          <Calendar className="w-3.5 h-3.5" />
                          {debt.id === 'debt_travel_emi'
                            ? 'Due on 2nd Oct (Final EMI)'
                            : debt.id === 'debt_personal_loan_3m'
                            ? 'Sept EMI Paid (Next: 7th Oct)'
                            : `Due on ${debt.dueDay}th of month`}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenPayModal(debt)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/20 transition-colors flex items-center gap-1"
                            title="Log this month payment"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Log EMI Paid</span>
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
          TAB 2: CURRENT MONTH SHORT-TERM BORROWINGS & CARRY-FORWARD (उधार & Rollover)
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

          {/* Carry-Forward / Rollover Info Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs">
            <RefreshCw className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 dark:text-amber-200">
                Multi-Month Carry-Forward & Rollover Engine
              </h4>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                Have a hand loan you took during relocation (e.g. ₹10,000 borrowed 4th Sept) that is deferred to next month?
                Use the <strong>"Carry Forward to Oct 2026"</strong> button on any active borrowing to move the cash obligation to the next month's budget without losing history!
              </p>
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
                  No Short-Term Borrowings (उधार) Added
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Keep track of quick hand loans borrowed from friends, colleagues, or relatives, as well as money you lent to others.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={async () => {
                    await dataProvider.seedKailashFinanceData();
                    triggerRefresh();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Load Kailash's Hand Loans & Borrowings</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {borrowings
                .slice()
                .sort((a, b) => {
                  const getBRank = (item: Borrowing) => {
                    if (item.status === 'SETTLED') return 100;
                    if (item.carryForwardMonth && item.carryForwardMonth > '2026-09') return 50;
                    if (item.dueDate?.includes('-10')) return 10;
                    return 20;
                  };
                  return getBRank(a) - getBRank(b);
                })
                .map((b) => {
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
                          {b.carryForwardMonth && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-500/20">
                              <RefreshCw className="w-3 h-3" />
                              Carried Forward to {b.carryForwardMonth} (Rollover #{b.rolloverCount || 1})
                            </span>
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

                    {/* Footer Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Borrowed: {b.borrowDate}</span>
                        {b.dueDate && <span className="font-semibold text-amber-600 ml-1">• Due: {b.dueDate}</span>}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {!isSettled && (
                          <>
                            <button
                              onClick={() => handleRolloverBorrowing(b, '2026-10')}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-800 dark:text-amber-200 font-bold text-[11px] border border-amber-500/20 transition-colors flex items-center gap-1"
                              title="Rollover this borrowing to October 2026"
                            >
                              <RefreshCw className="w-3 h-3 text-amber-600" />
                              <span>Carry to Oct</span>
                            </button>

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
                          </>
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

      {/* =========================================================
          TAB 3: CIBIL SCORE IMPROVEMENT & REPAIR CENTER
         ========================================================= */}
      {activeTab === 'CIBIL_SCORE' && (
        <div className="space-y-6 animate-in fade-in-50 duration-150">
          {/* CIBIL Score Header & Speedometer Gauge */}
          <div className="glass-card p-6 border-purple-500/25 bg-gradient-to-br from-white via-purple-50/20 to-white dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Score Meter */}
              <div className="text-center lg:text-left space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center justify-center lg:justify-start gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Estimated Bureau Health Score
                </span>
                <div className="flex items-baseline justify-center lg:justify-start gap-2">
                  <span className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                    {cibilProfile?.estimatedScore || 685}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/ 900</span>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-500/20">
                    {cibilProfile?.cibilStatus || 'FAIR'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Target: <strong className="text-emerald-600">750+ (Prime Credit Bracket)</strong> • Gap:{' '}
                  <strong className="text-purple-600">+{Math.max(0, 750 - (cibilProfile?.estimatedScore || 685))} pts required</strong>
                </p>
              </div>

              {/* Credit Card Utilization Ratio (CUR) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Credit Card Utilization (CUR)</span>
                  <span className="text-rose-600 dark:text-rose-400">{cibilProfile?.creditUtilizationRatio || 76}% (High)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 rounded-full"
                    style={{ width: `${Math.min(100, cibilProfile?.creditUtilizationRatio || 76)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>Utilized: {formatINR(cibilProfile?.totalCreditUtilized || 38000)}</span>
                  <span>Limit: {formatINR(cibilProfile?.totalCreditLimit || 50000)}</span>
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  💡 Golden Rule: Keep CUR &lt;30% (below ₹15,000) for rapid +40 score boost!
                </p>
              </div>

              {/* Key Milestones */}
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">On-Time Repayment Streak</span>
                  <span className="font-extrabold text-emerald-600">4 Months Clean ✓</span>
                </div>
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Settled Loan Closures</span>
                  <span className="font-extrabold text-indigo-600">1 (Axis Bank CC)</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">NACH Bounce Risk Radar</span>
                  <span className="font-extrabold text-emerald-600">0% Risk (9th-10th Covered)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span>Expert CIBIL Repair & Improvement Playbook</span>
              </h3>
              <span className="text-[11px] text-purple-600 font-semibold">Live Personalized Rules</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cibilProfile?.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>{rec}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Axis Settlement & NOC Tracker */}
          <div className="glass-card p-6 space-y-4 border-indigo-500/20 bg-gradient-to-br from-white via-indigo-50/15 to-white dark:from-slate-900 dark:via-indigo-950/15 dark:to-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    Axis Bank Credit Card Settlement & NDC Status
                  </h3>
                  <p className="text-[11px] text-slate-400">Total Settlement: ₹4,200 (3 installments of ₹1,400)</p>
                </div>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                Final Step in Sept 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Installment 1 of 3</span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1">₹1,400</p>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Cleared
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Installment 2 of 3</span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1">₹1,400</p>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Cleared
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20">
                <span className="text-[10px] font-bold text-amber-600 uppercase">Installment 3 of 3 (Final)</span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mt-1">₹1,400</p>
                <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5" /> Due in September
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
              <span className="font-bold text-slate-900 dark:text-slate-100">📌 Post-Payment Action Required:</span>
              <p>
                Once the 3rd installment of ₹1,400 is paid this month, email Axis Bank Collections asking for the official <strong>No Dues Certificate (NDC)</strong> and verify after 45 days that the status on CIBIL is updated to <strong>"Closed"</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: MULTI-STREAM INCOME HUB (JOB + FREELANCE + SIDE GIGS)
         ========================================================= */}
      {/* Modal 1: Add Pure Debt / Loan / EMI Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Log / Add Debt, Loan or EMI Commitment
                </h3>
                <p className="text-[11px] text-slate-400">Bike Loan, Chit Fund VC 2, Bajaj EMI, Cards, Personal Loans</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Debt / Loan Type</label>
                <select
                  value={type}
                  onChange={(e) => {
                    const newType = e.target.value as DebtType;
                    setType(newType);
                    if (newType === 'BIKE_LOAN' && !name) setName('Bike Loan Monthly EMI');
                    if (newType === 'CHIT_FUND_VC' && !name) setName('Chit Fund (VC 2)');
                    if (newType === 'CREDIT_CARD_MIN_PAYMENT' && !name) setName('Credit Card EMI / Due');
                    if (newType === 'PERSONAL_LOAN' && !name) setName('Personal Loan EMI');
                    if (newType === 'PERSONAL_BORROWING' && !name) setName('Small Borrowing / Hand Loan');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                >
                  <option value="PERSONAL_LOAN">💼 Personal Loan (Bank / NBFC / FinTech)</option>
                  <option value="BIKE_LOAN">🏍️ Bike / Two-Wheeler Loan EMI</option>
                  <option value="CHIT_FUND_VC">🪙 Chit Fund / VC (VC 1, VC 2, Committee)</option>
                  <option value="CREDIT_CARD_MIN_PAYMENT">💳 Credit Card EMI / Minimum Due (SBI/Axis/HDFC)</option>
                  <option value="PERSONAL_BORROWING">🤝 Small Borrowing / Hand Loan / Ram Fincorp</option>
                  <option value="CAR_LOAN">🚗 Car Loan EMI</option>
                  <option value="HOME_LOAN">🏠 Home Loan / Mortgage EMI</option>
                  <option value="EDUCATION_LOAN">🎓 Education Loan</option>
                  <option value="OTHER_OUTGOING">🔄 Other Fixed Loan Commitment</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expense / Commitment Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. House Rent / DMart / VC 1 / Bike EMI"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid To / Vendor / Lender
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Landlord / DMart / SBI / Committee"
                    value={lender}
                    onChange={(e) => setLender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Planned Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 12000"
                    value={monthlyEmi}
                    onChange={(e) => setMonthlyEmi(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Day of Month (1-31)
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
                <div>
                  <label className="block font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                    Total Tenure (Total EMIs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 24 (Months)"
                    value={totalTenureMonths}
                    onChange={(e) => setTotalTenureMonths(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                    EMIs Already Paid
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 10 (Paid)"
                    value={emisPaid}
                    onChange={(e) => setEmisPaid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Description</label>
                <input
                  type="text"
                  placeholder="e.g. 2BHK flat rent / Monthly grocery allowance / 20-month chit"
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
                  <span>Save Monthly Outgoing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Log Payment Modal for Outgoing */}
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
                💡 This will record an expense transaction for this month and automatically update your cash flow and account balance for <strong>{selectedDebtToPay.name}</strong> ({formatINR(parseFloat(payAmount) || 0)}).
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
                  placeholder="e.g. Relocation borrowing / Rent emergency / Cash shortage"
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

      {/* Modal 5: Add Income Stream (Freelance / Side Gig / Consulting) */}
      {isAddIncomeStreamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddIncomeStreamOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  Add Income Stream / Side Gig
                </h3>
                <p className="text-[11px] text-slate-400">Freelance, Consulting, Side Projects, Business</p>
              </div>
              <button onClick={() => setIsAddIncomeStreamOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddIncomeStream} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Income Stream Type</label>
                <select
                  value={streamType}
                  onChange={(e) => setStreamType(e.target.value as IncomeStreamType)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="FREELANCE">💻 Freelance Software / Design / Content Gig</option>
                  <option value="CONSULTING">📊 Consulting & Advisory Retainer</option>
                  <option value="BUSINESS">🏢 Side Business / Trading</option>
                  <option value="RENTAL">🏠 Rental Income</option>
                  <option value="DIVIDEND">📈 Stock Dividends / Investments</option>
                  <option value="OTHER">✨ Other Income</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stream / Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React Web App Gig / UI Consulting"
                    value={streamName}
                    onChange={(e) => setStreamName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Client / Source</label>
                  <input
                    type="text"
                    placeholder="e.g. Upwork / US Client / Local Agency"
                    value={streamClient}
                    onChange={(e) => setStreamClient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15000"
                    value={streamAmount}
                    onChange={(e) => setStreamAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-sm text-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Pay Day of Month
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={streamDay}
                    onChange={(e) => setStreamDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Income Stream</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
