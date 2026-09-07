import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { dataProvider } from '../services/dataProvider';
import {
  calculateRecommendedBudget,
  generateMentorshipAdvice,
  askFinanceMentor,
  BudgetProfileType,
  RecommendedBudgetPlan,
  MentorshipReport,
  formatINR,
} from '@personal-finance/shared';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Bot,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Send,
  Zap,
  Flame,
  Check,
  Building2,
  ShoppingBag,
  PiggyBank,
  Wallet,
  Compass,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MentorPage: React.FC = () => {
  const { user, selectedMonth, refreshTrigger, triggerRefresh } = useFinance();
  const navigate = useNavigate();

  // State
  const [incomeInput, setIncomeInput] = useState<string>(() => user?.monthlyIncome?.toString() || '50000');
  const [selectedProfile, setSelectedProfile] = useState<BudgetProfileType>('BALANCED_50_30_20');
  const [budgetPlan, setBudgetPlan] = useState<RecommendedBudgetPlan | null>(null);
  const [report, setReport] = useState<MentorshipReport | null>(null);
  const [appliedNotice, setAppliedNotice] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<
    Array<{
      sender: 'user' | 'mentor';
      text: string;
      recommendations?: string[];
      calculatedNumbers?: Record<string, string>;
      suggestedAction?: string;
    }>
  >([
    {
      sender: 'mentor',
      text: `Namaste ${user?.name || ''}! I am your Indian Personal Finance Mentor 🇮🇳. Tell me your monthly income (like ₹50,000) or ask me anything about rent limits, grocery budgeting, mutual fund SIPs, or cutting down Swiggy expenses.`,
      recommendations: [
        'Explore your customized category budget breakdown below.',
        'Check for detected spending leaks like micro-UPI payments.',
        'Apply the recommended budget to this month with 1 click.',
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Load calculations
  useEffect(() => {
    const income = parseFloat(incomeInput) || 50000;
    const plan = calculateRecommendedBudget(income, selectedProfile);
    setBudgetPlan(plan);

    const loadContextData = async () => {
      try {
        const [txns, debts, goals, accounts] = await Promise.all([
          dataProvider.getTransactions({
            startDate: `${selectedMonth}-01`,
            endDate: `${selectedMonth}-31`,
          }),
          dataProvider.getDebts(),
          dataProvider.getGoals(),
          dataProvider.getAccounts(),
        ]);

        const totalExpenses = txns
          .filter((t) => t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const liquidBalance = accounts
          .filter((a) => a.type === 'SAVINGS' || a.type === 'SALARY')
          .reduce((sum, a) => sum + a.currentBalance, 0);

        const rep = generateMentorshipAdvice({
          income,
          monthlyExpenses: totalExpenses,
          transactions: txns,
          debts,
          goals,
          bankBalance: liquidBalance,
        });

        setReport(rep);
      } catch (err) {
        console.error('Failed to load mentorship context:', err);
      }
    };

    loadContextData();
  }, [incomeInput, selectedProfile, selectedMonth, refreshTrigger]);

  const handleApplyBudget = async () => {
    if (!budgetPlan) return;
    const items = budgetPlan.categories.map((c) => ({
      categoryId: c.categoryId,
      amount: c.recommendedAmount,
    }));

    await dataProvider.saveBudget(selectedMonth, budgetPlan.totalAllocated, items);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setAppliedNotice(true);
    triggerRefresh();
    setTimeout(() => setAppliedNotice(false), 3000);
  };

  const handleSendChat = (customQuery?: string) => {
    const q = customQuery || chatInput;
    if (!q.trim()) return;

    const userMsg = { sender: 'user' as const, text: q };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAsking(true);

    setTimeout(() => {
      const response = askFinanceMentor(q, {
        income: parseFloat(incomeInput) || 50000,
        monthlyExpenses: report ? report.income - (report.income * report.effectiveSavingsRate) / 100 : 35000,
        transactions: [],
        debts: [],
        goals: [],
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'mentor',
          text: response.answer,
          recommendations: response.recommendations,
          calculatedNumbers: response.calculatedNumbers,
          suggestedAction: response.suggestedAction,
        },
      ]);
      setIsAsking(false);
    }, 400);
  };

  const quickIncomePresets = [30000, 50000, 75000, 100000, 150000, 250000];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-[11px]">
              <Sparkles className="w-3 h-3" />
              <span>AI Financial Advisor</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">INR Indian Context</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Personal Finance Mentor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Intelligent income allocation, money leak detection, and personalized Indian wealth guidance
          </p>
        </div>

        {report && (
          <div
            className={`px-4 py-2 rounded-2xl border font-bold text-xs flex items-center gap-2 self-start sm:self-auto ${
              report.overallVerdict === 'EXCELLENT'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : report.overallVerdict === 'GOOD'
                ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border-brand-500/30'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-500/30'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Health Status: {report.headline}</span>
          </div>
        )}
      </div>

      {/* Section 1: Interactive Income & Profile Simulator */}
      <div className="glass-card p-6 space-y-6 border-brand-500/20 bg-gradient-to-br from-white via-indigo-50/20 to-white dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Compass className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <span>Income-Based Smart Budget Planner</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set your monthly take-home salary and select your lifestyle profile to calculate ideal allocations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyBudget}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all"
            >
              {appliedNotice ? <Check className="w-4 h-4 text-emerald-300" /> : <Zap className="w-4 h-4" />}
              <span>{appliedNotice ? 'Applied to This Month! 🎉' : 'Apply to Monthly Budget'}</span>
            </button>
          </div>
        </div>

        {/* Income Selector */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Monthly In-Hand Income:
            </label>
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
              <input
                type="number"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full pl-8 pr-3 py-2 text-sm font-extrabold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {quickIncomePresets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setIncomeInput(amt.toString())}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    incomeInput === amt.toString()
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  ₹{amt >= 100000 ? `${amt / 100000}L` : `${amt / 1000}k`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Choose Lifestyle Strategy:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {[
              { id: 'BALANCED_50_30_20', label: 'Balanced 50/30/20', icon: '⚖️' },
              { id: 'TIER_1_METRO', label: 'Tier-1 Metro Living', icon: '🏙️' },
              { id: 'TIER_2_CITY', label: 'Tier-2/3 City Economy', icon: '🏡' },
              { id: 'AGGRESSIVE_SAVER', label: 'Aggressive Wealth (40%)', icon: '🚀' },
              { id: 'DEBT_PAYOFF', label: 'Debt Payoff Mode', icon: '💳' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedProfile(p.id as BudgetProfileType)}
                className={`p-3 rounded-2xl text-left border transition-all text-xs font-semibold ${
                  selectedProfile === p.id
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 border-brand-500 shadow-md shadow-brand-500/10'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-lg block mb-1">{p.icon}</span>
                <span className="font-bold">{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Needs vs Wants vs Savings Summary */}
        {budgetPlan && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  Essential Needs ({budgetPlan.needsPercentage}%)
                </span>
                <p className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100 mt-0.5">
                  {formatINR(budgetPlan.needsTotal)}
                </p>
                <span className="text-xs text-slate-500">Rent, Groceries, Milk, Bills, Fuel</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                  Wants & Lifestyle ({budgetPlan.wantsPercentage}%)
                </span>
                <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-100 mt-0.5">
                  {formatINR(budgetPlan.wantsTotal)}
                </p>
                <span className="text-xs text-slate-500">Dining, Swiggy, Shopping, OTT</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  Savings & SIP ({budgetPlan.savingsPercentage}%)
                </span>
                <p className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-0.5">
                  {formatINR(budgetPlan.savingsTotal)}
                </p>
                <span className="text-xs text-slate-500">Mutual Funds, Emergency Fund, Goals</span>
              </div>
            </div>

            {/* Category Allocations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {budgetPlan.categories.map((cat) => (
                <div
                  key={cat.categoryId}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{cat.categoryName}</h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            cat.type === 'NEEDS'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : cat.type === 'SAVINGS'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {cat.percentage}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{cat.guidance}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm block">
                      {formatINR(cat.recommendedAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatINR(cat.minAmount)}–{formatINR(cat.maxAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Spending Leaks & Anomaly Diagnostic */}
      {report && report.leaks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>Detected Spending Leaks ({report.leaks.length})</span>
            </h3>
            <span className="text-xs text-slate-400">Total leak impact: {formatINR(report.leaks.reduce((s, l) => s + l.monthlyImpact, 0))}/mo</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.leaks.map((leak) => (
              <div
                key={leak.id}
                className="glass-card p-5 border-rose-500/30 bg-gradient-to-br from-white via-rose-50/10 to-white dark:from-slate-900 dark:via-rose-950/10 dark:to-slate-900 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{leak.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{leak.title}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                        {leak.severity} Severity Leak
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm block">
                      -{formatINR(leak.monthlyImpact)}/mo
                    </span>
                    <span className="text-[10px] text-slate-400">({formatINR(leak.annualImpact)}/yr)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{leak.description}</p>

                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Mentor Fix:
                  </span>
                  <p className="text-slate-500 dark:text-slate-400">{leak.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Monthly 5-Step Action Checklist */}
      {report && (
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Your Action Roadmap For This Month</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              5 high-impact, prioritized steps tailored to optimize your exact financial numbers
            </p>
          </div>

          <div className="space-y-3">
            {report.actionChecklist.map((act) => (
              <div
                key={act.step}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    {act.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{act.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{act.actionText}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    +{formatINR(act.impactRupees)}/mo
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      act.priority === 'HIGH'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    }`}
                  >
                    {act.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Interactive Mentor AI Advisor Console */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Ask Your Finance Mentor</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get immediate answers, rupee calculations, and debt vs SIP trade-off analyses
            </p>
          </div>
        </div>

        {/* Quick prompt buttons */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs text-slate-400 font-semibold mr-1">Try asking:</span>
          {[
            `How should I budget my ${formatINR(parseFloat(incomeInput) || 50000)} salary?`,
            'How much should I spend on Rent and Groceries?',
            'How can I cut down on food delivery & Swiggy?',
            'Should I prepay my loans or invest in Mutual Funds?',
            'How do I build a ₹1,00,000 Emergency Fund?',
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendChat(prompt)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium transition-colors border border-slate-200 dark:border-slate-700"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Messages Stream */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 pt-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl text-xs space-y-2.5 ${
                m.sender === 'user'
                  ? 'bg-brand-600 text-white ml-auto max-w-lg shadow-md shadow-brand-500/10'
                  : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 mr-auto max-w-2xl text-slate-800 dark:text-slate-200'
              }`}
            >
              <p className="font-medium leading-relaxed">{m.text}</p>

              {m.calculatedNumbers && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                  {Object.entries(m.calculatedNumbers).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-[10px] text-slate-400 block">{k}</span>
                      <span className="font-extrabold text-brand-600 dark:text-brand-400 text-xs">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {m.recommendations && m.recommendations.length > 0 && (
                <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300 pt-1">
                  {m.recommendations.map((rec, i) => (
                    <li key={i} className="leading-relaxed">
                      {rec}
                    </li>
                  ))}
                </ul>
              )}

              {m.suggestedAction && (
                <div className="pt-1 text-[11px] font-bold text-brand-600 dark:text-brand-400">
                  💡 {m.suggestedAction}
                </div>
              )}
            </div>
          ))}

          {isAsking && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 mr-auto max-w-sm text-xs text-slate-400 animate-pulse flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500 animate-spin" />
              <span>Analyzing financial rules & calculating...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChat();
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            placeholder="Ask your finance mentor anything (e.g. How to save ₹15,000 from 50k salary?)"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!chatInput.trim() || isAsking}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
