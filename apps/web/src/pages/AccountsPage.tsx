import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { dataProvider } from '../services/dataProvider';
import { formatINR, INDIAN_BANKS } from '@personal-finance/shared';
import { Account, AccountType, BankName } from '@personal-finance/types';
import {
  Landmark,
  CreditCard,
  Wallet,
  TrendingUp,
  Plus,
  Calendar,
  ShieldCheck,
  X,
  Check,
} from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const { accounts, triggerRefresh } = useFinance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<AccountType>('SAVINGS');
  const [newAccBank, setNewAccBank] = useState<BankName>('HDFC');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccLimit, setNewAccLimit] = useState('');
  const [newAccStatementDate, setNewAccStatementDate] = useState('15');
  const [newAccDueDate, setNewAccDueDate] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName) return;

    setIsSubmitting(true);
    try {
      const balance = parseFloat(newAccBalance) || 0;
      const limit = parseFloat(newAccLimit) || undefined;

      await dataProvider.createAccount({
        userId: 'user_demo_1',
        name: newAccName,
        type: newAccType,
        bank: newAccBank,
        accountNumberMasked: `${newAccBank} ****${Math.floor(1000 + Math.random() * 9000)}`,
        currentBalance: newAccType === 'CREDIT_CARD' ? -balance : balance,
        openingBalance: balance,
        currency: 'INR',
        creditLimit: limit,
        availableLimit: limit ? limit - balance : undefined,
        statementDate: parseInt(newAccStatementDate, 10) || undefined,
        dueDate: parseInt(newAccDueDate, 10) || undefined,
        isActive: true,
      });

      setIsAddModalOpen(false);
      setNewAccName('');
      setNewAccBalance('');
      setNewAccLimit('');
      triggerRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalBankBalance = accounts
    .filter((a) => a.type === 'SAVINGS' || a.type === 'SALARY' || a.type === 'CURRENT')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  const totalCreditOutstanding = accounts
    .filter((a) => a.type === 'CREDIT_CARD')
    .reduce((sum, a) => sum + Math.abs(a.currentBalance), 0);

  const totalInvestments = accounts
    .filter((a) => a.type === 'INVESTMENT')
    .reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Accounts & Credit Cards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track bank accounts, credit card limits & liabilities, cash in hand, and investment portfolios
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Liquid Bank Balance</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {formatINR(totalBankBalance)}
          </p>
          <span className="text-xs text-slate-500">Salary & Savings accounts</span>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-rose-500 uppercase">Credit Card Outstanding</span>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {formatINR(totalCreditOutstanding)}
          </p>
          <span className="text-xs text-slate-500">Total revolving liability</span>
        </div>

        <div className="glass-card p-5">
          <span className="text-xs font-semibold text-emerald-500 uppercase">Investments Portfolio</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(totalInvestments)}
          </p>
          <span className="text-xs text-slate-500">Mutual Funds & Stocks</span>
        </div>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isCreditCard = acc.type === 'CREDIT_CARD';
          const isInvestment = acc.type === 'INVESTMENT';
          const isCash = acc.type === 'CASH';

          return (
            <div
              key={acc.id}
              className={`glass-card p-5 flex flex-col justify-between space-y-4 ${
                isCreditCard
                  ? 'border-indigo-500/30 bg-gradient-to-br from-white/90 via-indigo-50/20 to-white/90 dark:from-slate-900/90 dark:via-indigo-950/20 dark:to-slate-900/90'
                  : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">
                      {isCreditCard ? '💳' : isInvestment ? '📈' : isCash ? '💵' : '🏦'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{acc.name}</h4>
                      <p className="text-[11px] font-mono text-slate-400">{acc.accountNumberMasked || acc.type}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                    {acc.type}
                  </span>
                </div>

                <div className="mt-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">
                    {isCreditCard ? 'Current Outstanding' : 'Current Balance'}
                  </span>
                  <p
                    className={`text-2xl font-extrabold tracking-tight ${
                      isCreditCard
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {formatINR(Math.abs(acc.currentBalance))}
                  </p>
                </div>
              </div>

              {isCreditCard && acc.creditLimit && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Credit Limit:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatINR(acc.creditLimit)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Available Limit:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatINR((acc.creditLimit || 0) + acc.currentBalance)}
                    </span>
                  </div>
                  {acc.dueDate && (
                    <div className="flex items-center justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Due Date:
                      </span>
                      <span>{acc.dueDate}th of month</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Add New Account</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Salary Account"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Account Type</label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="SALARY">Salary Account</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="CASH">Cash in Hand</option>
                    <option value="INVESTMENT">Investment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bank</label>
                  <select
                    value={newAccBank}
                    onChange={(e) => setNewAccBank(e.target.value as BankName)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    {INDIAN_BANKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {newAccType === 'CREDIT_CARD' ? 'Current Outstanding (₹)' : 'Current Balance (₹)'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {newAccType === 'CREDIT_CARD' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Credit Limit (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 200000"
                      value={newAccLimit}
                      onChange={(e) => setNewAccLimit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Bill Due Day</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newAccDueDate}
                      onChange={(e) => setNewAccDueDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
