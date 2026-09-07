import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dataProvider } from '../services/dataProvider';
import { Debt, DebtType } from '@personal-finance/types';
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
  const { user, refreshTrigger, triggerRefresh } = useFinance();
  const { user: authUser } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtToPay, setSelectedDebtToPay] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [lender, setLender] = useState('');
  const [type, setType] = useState<DebtType>('CHIT_FUND_VC');
  const [originalAmount, setOriginalAmount] = useState('');
  const [outstandingAmount, setOutstandingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('0');
  const [monthlyEmi, setMonthlyEmi] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const loadDebts = async () => {
      const d = await dataProvider.getDebts();
      setDebts(d);
    };
    loadDebts();
  }, [refreshTrigger]);

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

  const income = user?.monthlyIncome || authUser?.monthlyIncome || 0;
  const summary = calculateDebtSummary(debts, income);
  const freeCashflow = Math.max(0, income - summary.totalMonthlyEmi);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Monthly Outgoings, Debts & EMIs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track Chit Funds (VC 1, VC 2), Bike EMIs, SBI/RBL Card Minimum Dues, Personal Borrowings & Loans
          </p>
        </div>

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
      </div>

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

      {/* Add Outgoing / Loan Modal */}
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
              {/* Type selector */}
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

              {/* Name & Lender */}
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

              {/* Monthly EMI & Due Day */}
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

              {/* Total Original / Outstanding & Interest */}
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

      {/* Log Payment Modal */}
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
    </div>
  );
};
