import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatINR, INDIAN_BANKS } from '@personal-finance/shared';
import { BankName } from '@personal-finance/types';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Landmark,
  Target,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Base Financial Profile
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthlyIncome?.toString() || '120000');
  const [currentBankBalance, setCurrentBankBalance] = useState('82300');
  const [monthlyRent, setMonthlyRent] = useState('20000');
  const [monthlyEmi, setMonthlyEmi] = useState('18500');
  const [emergencyFund, setEmergencyFund] = useState('270000');

  // Step 2: Primary Account
  const [bankName, setBankName] = useState<BankName>('HDFC');

  // Step 3: Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    'goal_bank_balance',
    'goal_emergency_fund',
    'goal_car',
    'goal_bike',
  ]);

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    await completeOnboarding({
      monthlyIncome: parseFloat(monthlyIncome) || 120000,
      currentBankBalance: parseFloat(currentBankBalance) || 82300,
      monthlyRent: parseFloat(monthlyRent) || 20000,
      monthlyEmi: parseFloat(monthlyEmi) || 18500,
      emergencyFundTarget: parseFloat(emergencyFund) || 270000,
      bankName,
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950">
      <div className="w-full max-w-xl glass-card p-6 sm:p-8 shadow-2xl border-slate-200/80 dark:border-slate-800 space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-extrabold text-xl items-center justify-center shadow-md">
            ₹
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome to Personal Finance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Let's set up your personal financial baseline (Step {step} of 3)
          </p>

          {/* Stepper bar */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s ? 'w-8 bg-brand-600' : step > s ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Base Financials */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">1. Your Monthly Numbers</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monthly In-Hand Income (₹)
                </label>
                <input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Bank Balance (₹)
                  </label>
                  <input
                    type="number"
                    value={currentBankBalance}
                    onChange={(e) => setCurrentBankBalance(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Fund Cushion (₹)
                  </label>
                  <input
                    type="number"
                    value={emergencyFund}
                    onChange={(e) => setEmergencyFund(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Rent / Housing (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Loans / EMI (₹)
                  </label>
                  <input
                    type="number"
                    value={monthlyEmi}
                    onChange={(e) => setMonthlyEmi(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 mt-4"
            >
              <span>Continue to Accounts</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Primary Bank Account */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">2. Add Your Primary Salary Account</h3>
            <p className="text-slate-500">Select the bank where your monthly income is credited:</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {INDIAN_BANKS.map((b) => {
                const isSelected = bankName === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBankName(b.id)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60 font-bold text-brand-700 dark:text-brand-300 shadow-sm scale-105'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-xl">{b.icon}</span>
                    <span className="text-[11px] truncate w-full text-center">{b.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md shadow-brand-500/25 flex items-center justify-center gap-2"
              >
                <span>Continue to Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Financial Goals */}
        {step === 3 && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">3. Choose Your Initial Financial Goals</h3>
            <p className="text-slate-500">Pick the milestones you want RupeeTrack to project for you:</p>

            <div className="space-y-2.5">
              {[
                { id: 'goal_bank_balance', name: 'Keep ₹1,00,000 in Bank', desc: 'Maintain liquid buffer in salary account', icon: '🏦' },
                { id: 'goal_emergency_fund', name: '6-Month Emergency Cushion', desc: 'Safety fund for unexpected events', icon: '🛡️' },
                { id: 'goal_car', name: 'Car Purchase Goal (₹8,00,000)', desc: 'Down payment and accessory fund', icon: '🚗' },
                { id: 'goal_bike', name: 'Superbike / Bike Purchase (₹4,00,000)', desc: 'Weekend touring machine & riding gear', icon: '🏍️' },
                { id: 'goal_house', name: 'House Down Payment (₹20,00,000)', desc: 'Long-term home down payment fund', icon: '🏡' },
              ].map((g) => {
                const isSelected = selectedGoals.includes(g.id);
                return (
                  <div
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/60'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{g.icon}</span>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{g.name}</p>
                        <p className="text-[10px] text-slate-400">{g.desc}</p>
                      </div>
                    </div>
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <span>Launch My Dashboard 🎉</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
