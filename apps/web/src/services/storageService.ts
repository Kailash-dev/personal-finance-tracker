import {
  User,
  Account,
  Transaction,
  Category,
  Budget,
  Goal,
  Debt,
  MerchantRule,
  RecurringTransaction,
  BankImport,
  Borrowing,
} from '@personal-finance/types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MERCHANT_RULES,
  categorizeTransaction,
  checkDuplicateTransaction,
  calculateFinancialHealthScore,
  calculateGoalProjection,
  calculateDebtSummary,
  calculateMonthlyReconciliation,
  formatINR,
} from '@personal-finance/shared';

const STORAGE_KEYS = {
  USER: 'rupeetrack_user',
  ACCOUNTS: 'rupeetrack_accounts',
  TRANSACTIONS: 'rupeetrack_transactions',
  CATEGORIES: 'rupeetrack_categories',
  BUDGETS: 'rupeetrack_budgets',
  GOALS: 'rupeetrack_goals',
  DEBTS: 'rupeetrack_debts',
  BORROWINGS: 'rupeetrack_borrowings',
  RECURRING: 'rupeetrack_recurring',
  RULES: 'rupeetrack_rules',
  IMPORTS: 'rupeetrack_imports',
  THEME: 'rupeetrack_theme',
};

class StorageService {
  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEBTS)) {
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BORROWINGS)) {
      localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECURRING)) {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RULES)) {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(DEFAULT_MERCHANT_RULES));
    }
  }

  // --- USER ---
  getUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw
      ? JSON.parse(raw)
      : {
          id: 'user_1',
          email: '',
          name: '',
          monthlyIncome: 0,
          currency: 'INR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
  }

  updateUser(user: Partial<User>): User {
    const current = this.getUser();
    const updated = { ...current, ...user, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    return updated;
  }

  // --- ACCOUNTS ---
  getAccounts(): Account[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return raw ? JSON.parse(raw) : [];
  }

  createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account {
    const accounts = this.getAccounts();
    const newAcc: Account = {
      ...account,
      id: `acc_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    accounts.push(newAcc);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    return newAcc;
  }

  updateAccount(id: string, updates: Partial<Account>): Account {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Account not found');
    accounts[idx] = { ...accounts[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    return accounts[idx];
  }

  // --- TRANSACTIONS ---
  getTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
    type?: string;
    search?: string;
  }): Transaction[] {
    let txns: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const accounts = this.getAccounts();
    const categories = this.getCategories();
    const accMap = new Map(accounts.map((a) => [a.id, a]));
    const catMap = new Map(categories.map((c) => [c.id, c]));

    txns = txns.map((t) => ({
      ...t,
      account: accMap.get(t.accountId),
      toAccount: t.toAccountId ? accMap.get(t.toAccountId) : undefined,
      category: catMap.get(t.categoryId),
    }));

    if (filters?.startDate) {
      txns = txns.filter((t) => t.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      txns = txns.filter((t) => t.date <= filters.endDate!);
    }
    if (filters?.categoryId) {
      txns = txns.filter((t) => t.categoryId === filters.categoryId);
    }
    if (filters?.accountId) {
      txns = txns.filter((t) => t.accountId === filters.accountId || t.toAccountId === filters.accountId);
    }
    if (filters?.type) {
      txns = txns.filter((t) => t.type === filters.type);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      txns = txns.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.merchantName?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.referenceNumber?.toLowerCase().includes(q)
      );
    }

    return txns.sort((a, b) => b.date.localeCompare(a.date));
  }

  createTransaction(txData: {
    accountId: string;
    toAccountId?: string;
    categoryId?: string;
    subcategoryId?: string;
    date: string;
    description: string;
    amount: number;
    type?: any;
    paymentMethod?: any;
    referenceNumber?: string;
    notes?: string;
  }): Transaction {
    const user = this.getUser();
    const rules = this.getRules();
    let finalCategoryId = txData.categoryId;
    let finalSubcategoryId = txData.subcategoryId;
    let finalType = txData.type;

    if (!finalCategoryId) {
      const catRes = categorizeTransaction(txData.description, txData.amount, rules as any);
      finalCategoryId = catRes.categoryId;
      finalSubcategoryId = catRes.subcategoryId;
      finalType = finalType || catRes.type;
    }

    // Ensure account exists
    let accounts = this.getAccounts();
    if (accounts.length === 0) {
      const defaultAcc = this.createAccount({
        userId: user.id,
        name: 'Primary Bank Account',
        type: 'SAVINGS',
        bank: 'HDFC',
        accountNumberMasked: '•••• 1234',
        currentBalance: 0,
        openingBalance: 0,
        currency: 'INR',
        isActive: true,
      });
      txData.accountId = defaultAcc.id;
      accounts = this.getAccounts();
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      accountId: txData.accountId || accounts[0]?.id || 'acc_primary',
      toAccountId: txData.toAccountId,
      categoryId: finalCategoryId || 'cat_misc',
      subcategoryId: finalSubcategoryId,
      date: txData.date,
      description: txData.description,
      amount: txData.amount,
      type: finalType || (txData.amount < 0 ? 'EXPENSE' : 'INCOME'),
      paymentMethod: txData.paymentMethod || 'UPI',
      source: 'MANUAL',
      referenceNumber: txData.referenceNumber,
      notes: txData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const txns = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    txns.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));

    // Update account balance
    const accIdx = accounts.findIndex((a) => a.id === newTx.accountId);
    if (accIdx !== -1) {
      accounts[accIdx].currentBalance += newTx.amount;
      if (accounts[accIdx].type === 'CREDIT_CARD' && accounts[accIdx].creditLimit) {
        accounts[accIdx].availableLimit = (accounts[accIdx].creditLimit || 0) + accounts[accIdx].currentBalance;
      }
    }

    if (txData.toAccountId && txData.type === 'TRANSFER') {
      const toIdx = accounts.findIndex((a) => a.id === txData.toAccountId);
      if (toIdx !== -1) {
        accounts[toIdx].currentBalance += Math.abs(txData.amount);
      }
    }

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    return newTx;
  }

  deleteTransaction(id: string): void {
    let txns: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const tx = txns.find((t) => t.id === id);
    if (!tx) return;

    txns = txns.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));

    // Revert account balance
    const accounts = this.getAccounts();
    const accIdx = accounts.findIndex((a) => a.id === tx.accountId);
    if (accIdx !== -1) {
      accounts[accIdx].currentBalance -= tx.amount;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }
  }

  // --- CATEGORIES & RULES ---
  getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  }

  getRules(): MerchantRule[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES);
    return raw ? JSON.parse(raw) : (DEFAULT_MERCHANT_RULES as any);
  }

  addCustomRule(rule: Omit<MerchantRule, 'id' | 'createdAt'>): MerchantRule {
    const rules = this.getRules();
    const newRule: MerchantRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    rules.unshift(newRule);
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    return newRule;
  }

  // --- BUDGETS ---
  getBudgets(): Budget[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return raw ? JSON.parse(raw) : [];
  }

  getBudgetForMonth(month: string): Budget | null {
    const budgets = this.getBudgets();
    let b = budgets.find((item) => item.month === month);
    if (!b && budgets.length > 0) {
      // Clone latest budget for this month
      const latest = budgets[budgets.length - 1];
      b = {
        id: `budget_${month}`,
        userId: latest.userId,
        month,
        totalAmount: latest.totalAmount,
        items: latest.items.map((i, idx) => ({ ...i, id: `bi_${month}_${idx}` })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      budgets.push(b);
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    }
    return b || null;
  }

  saveBudget(month: string, totalAmount: number, items: { categoryId: string; amount: number }[]): Budget {
    const budgets = this.getBudgets();
    const user = this.getUser();
    const existingIdx = budgets.findIndex((b) => b.month === month);

    const newBudget: Budget = {
      id: `budget_${month}`,
      userId: user.id,
      month,
      totalAmount,
      items: items.map((i, idx) => ({ id: `bi_${month}_${idx}`, budgetId: `budget_${month}`, categoryId: i.categoryId, amount: i.amount })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      budgets[existingIdx] = newBudget;
    } else {
      budgets.push(newBudget);
    }

    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return newBudget;
  }

  // --- GOALS ---
  getGoals(): Goal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    return raw ? JSON.parse(raw) : [];
  }

  createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal {
    const goals = this.getGoals();
    const newGoal: Goal = {
      ...goal,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return newGoal;
  }

  updateGoal(id: string, updates: Partial<Goal>): Goal {
    const goals = this.getGoals();
    const idx = goals.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error('Goal not found');
    goals[idx] = { ...goals[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return goals[idx];
  }

  addGoalContribution(goalId: string, amount: number, notes?: string): Goal {
    const goals = this.getGoals();
    const idx = goals.findIndex((g) => g.id === goalId);
    if (idx === -1) throw new Error('Goal not found');
    goals[idx].currentAmount += amount;
    if (goals[idx].currentAmount >= goals[idx].targetAmount) {
      goals[idx].isCompleted = true;
    }
    goals[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return goals[idx];
  }

  // --- DEBTS ---
  getDebts(): Debt[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return raw ? JSON.parse(raw) : [];
  }

  createDebt(debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>): Debt {
    const debts = this.getDebts();
    const newDebt: Debt = {
      ...debt,
      id: `debt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    debts.push(newDebt);
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    return newDebt;
  }

  updateDebt(id: string, updates: Partial<Debt>): Debt {
    const debts = this.getDebts();
    const idx = debts.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Debt not found');
    debts[idx] = { ...debts[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    return debts[idx];
  }

  deleteDebt(id: string): void {
    let debts = this.getDebts();
    debts = debts.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }

  recordDebtPayment(debtId: string, amount: number, accountId?: string, date?: string): void {
    const debts = this.getDebts();
    const d = debts.find((item) => item.id === debtId);
    if (!d) return;

    // Reduce outstanding amount
    d.outstandingAmount = Math.max(0, d.outstandingAmount - amount);
    d.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));

    // Log as transaction
    const finalDate = date || new Date().toISOString().split('T')[0];
    this.createTransaction({
      accountId: accountId || 'acc_primary',
      categoryId: 'cat_financial',
      subcategoryId: d.type.toLowerCase().includes('bike')
        ? 'sub_emi_bike'
        : d.type.toLowerCase().includes('car')
        ? 'sub_emi_car'
        : d.type.toLowerCase().includes('card')
        ? 'sub_cc_payment'
        : 'sub_emi_personal',
      date: finalDate,
      description: `Monthly Payment: ${d.name} (${d.lender})`,
      amount: -amount,
      type: 'DEBT_PAYMENT',
      paymentMethod: 'UPI',
    });
  }

  // --- SHORT-TERM BORROWINGS & HAND LOANS (उधार) ---
  getBorrowings(month?: string): Borrowing[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BORROWINGS);
    let list: Borrowing[] = raw ? JSON.parse(raw) : [];
    if (month) {
      list = list.filter((b) => b.borrowDate.startsWith(month) || (b.dueDate && b.dueDate.startsWith(month)) || b.status !== 'SETTLED');
    }
    return list.sort((a, b) => b.borrowDate.localeCompare(a.borrowDate));
  }

  createBorrowing(borrowing: Omit<Borrowing, 'id' | 'createdAt' | 'updatedAt' | 'amountSettled' | 'status'> & { recordCashFlow?: boolean; accountId?: string }): Borrowing {
    const list = this.getBorrowings();
    const newBorrowing: Borrowing = {
      ...borrowing,
      id: `bor_${Date.now()}`,
      amountSettled: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newBorrowing);
    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(list));

    // Optional: Log instant cashflow transaction
    if (borrowing.recordCashFlow) {
      this.createTransaction({
        accountId: borrowing.accountId || 'acc_primary',
        categoryId: 'cat_transfer',
        subcategoryId: 'sub_friend_transfer',
        date: borrowing.borrowDate,
        description: borrowing.type === 'BORROWED'
          ? `Hand Loan Received: ${borrowing.personName} (${borrowing.purpose || 'Borrowing'})`
          : `Hand Loan Given: ${borrowing.personName} (${borrowing.purpose || 'Lending'})`,
        amount: borrowing.type === 'BORROWED' ? borrowing.amount : -borrowing.amount,
        type: borrowing.type === 'BORROWED' ? 'INCOME' : 'EXPENSE',
        paymentMethod: 'UPI',
      });
    }

    return newBorrowing;
  }

  updateBorrowing(id: string, updates: Partial<Borrowing>): Borrowing {
    const list = this.getBorrowings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Borrowing record not found');
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(list));
    return list[idx];
  }

  deleteBorrowing(id: string): void {
    let list = this.getBorrowings();
    list = list.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(list));
  }

  settleBorrowing(id: string, settleAmount: number, accountId?: string, date?: string): Borrowing {
    const list = this.getBorrowings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Borrowing record not found');

    const b = list[idx];
    const newSettled = Math.min(b.amount, b.amountSettled + settleAmount);
    b.amountSettled = newSettled;
    b.status = newSettled >= b.amount ? 'SETTLED' : 'PARTIALLY_PAID';
    b.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(list));

    // Log settlement transaction
    const finalDate = date || new Date().toISOString().split('T')[0];
    this.createTransaction({
      accountId: accountId || 'acc_primary',
      categoryId: 'cat_transfer',
      subcategoryId: 'sub_friend_transfer',
      date: finalDate,
      description: b.type === 'BORROWED'
        ? `Repaid Hand Loan: ${b.personName}`
        : `Collected Hand Loan: ${b.personName}`,
      amount: b.type === 'BORROWED' ? -settleAmount : settleAmount,
      type: b.type === 'BORROWED' ? 'EXPENSE' : 'INCOME',
      paymentMethod: 'UPI',
    });

    return b;
  }

  // --- DASHBOARD DATA AGGREGATOR ---
  getDashboardData(targetMonth?: string) {
    const month = targetMonth || new Date().toISOString().slice(0, 7);
    const user = this.getUser();
    const accounts = this.getAccounts();
    const debts = this.getDebts();
    const goals = this.getGoals();
    const categories = this.getCategories();
    const budget = this.getBudgetForMonth(month);
    const transactions = this.getTransactions({
      startDate: `${month}-01`,
      endDate: `${month}-31`,
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categorySpendingMap = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.type === 'INCOME') {
        totalIncome += Math.abs(tx.amount);
      } else if (tx.type === 'EXPENSE' || tx.type === 'DEBT_PAYMENT') {
        const abs = Math.abs(tx.amount);
        totalExpenses += abs;
        categorySpendingMap.set(tx.categoryId, (categorySpendingMap.get(tx.categoryId) || 0) + abs);
      } else if (tx.type === 'REFUND') {
        totalExpenses -= Math.abs(tx.amount);
      }
    }

    const totalSaved = Math.max(0, totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;

    const totalBankBalance = accounts
      .filter((a) => a.type === 'SAVINGS' || a.type === 'SALARY' || a.type === 'CURRENT')
      .reduce((sum, a) => sum + a.currentBalance, 0);

    const creditCards = accounts
      .filter((a) => a.type === 'CREDIT_CARD')
      .map((c) => ({
        id: c.id,
        name: c.name,
        bank: c.bank,
        outstanding: Math.abs(c.currentBalance),
        limit: c.creditLimit || 0,
        available: (c.creditLimit || 0) + c.currentBalance,
        statementDate: c.statementDate,
        dueDate: c.dueDate,
      }));

    const debtSummary = calculateDebtSummary(debts, totalIncome || user.monthlyIncome || 0);

    const categoryNameMap = new Map(categories.map((c) => [c.id, { name: c.name, icon: c.icon, color: c.color }]));
    const categoryBreakdown = Array.from(categorySpendingMap.entries())
      .map(([catId, amount]) => {
        const meta = categoryNameMap.get(catId);
        return {
          categoryId: catId,
          name: meta?.name || 'Other',
          icon: meta?.icon || '📦',
          color: meta?.color || '#94A3B8',
          amount,
          percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const goalProjections = goals.map((g) => calculateGoalProjection(g));
    const goalsOnTrack = goalProjections.filter((p) => p.status === 'ON_TRACK' || p.status === 'AHEAD' || p.status === 'COMPLETED').length;

    const emergencyAcc = accounts.find((a) => a.name.toLowerCase().includes('emergency') || a.type === 'SAVINGS');
    const healthScore = calculateFinancialHealthScore({
      monthlyIncome: totalIncome || user.monthlyIncome || 0,
      monthlyExpenses: totalExpenses,
      totalMonthlyEmi: debtSummary.totalMonthlyEmi,
      emergencyFundBalance: emergencyAcc ? emergencyAcc.currentBalance : totalBankBalance * 0.5,
      essentialMonthlyExpenses: totalExpenses * 0.7,
      budgetAllocated: budget?.totalAmount || 0,
      budgetSpent: totalExpenses,
      totalGoalsCount: goals.length,
      goalsOnTrackCount: goalsOnTrack,
    });

    // 6-Month Trend
    const monthlyTrend = this.calculatePast6MonthsTrend();

    return {
      month,
      currentMonth: {
        income: totalIncome,
        expenses: totalExpenses,
        saved: totalSaved,
        savingsRate: Number(savingsRate.toFixed(1)),
        bankBalance: totalBankBalance,
        totalDebt: debtSummary.totalOutstanding,
        totalEmi: debtSummary.totalMonthlyEmi,
        budgetLimit: budget?.totalAmount || 0,
        budgetRemaining: budget ? Math.max(0, budget.totalAmount - totalExpenses) : 0,
      },
      categoryBreakdown,
      monthlyTrend,
      goalProjections,
      healthScore,
      creditCards,
      recentTransactions: transactions.slice(0, 8),
    };
  }

  private calculatePast6MonthsTrend() {
    const allTxns: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const now = new Date();
    const trend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.toISOString().slice(0, 7);
      const monthTxns = allTxns.filter((t) => t.date.startsWith(m));

      let inc = 0;
      let exp = 0;
      for (const t of monthTxns) {
        if (t.type === 'INCOME') inc += Math.abs(t.amount);
        else if (t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT') exp += Math.abs(t.amount);
      }

      const monthLabel = d.toLocaleString('default', { month: 'short' });
      trend.push({
        month: m,
        monthLabel,
        income: inc,
        expenses: exp,
        savings: Math.max(0, inc - exp),
      });
    }

    return trend;
  }

  // --- REPORT & RECONCILIATION ---
  getMonthlyReport(currentMonth: string, previousMonth: string) {
    const currentTxns = this.getTransactions({ startDate: `${currentMonth}-01`, endDate: `${currentMonth}-31` });
    const prevTxns = this.getTransactions({ startDate: `${previousMonth}-01`, endDate: `${previousMonth}-31` });
    const categories = this.getCategories();
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const calcTotals = (txns: Transaction[]) => {
      let income = 0;
      let expenses = 0;
      const catTotals = new Map<string, number>();

      for (const t of txns) {
        if (t.type === 'INCOME') income += Math.abs(t.amount);
        else if (t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT') {
          const amt = Math.abs(t.amount);
          expenses += amt;
          catTotals.set(t.categoryId, (catTotals.get(t.categoryId) || 0) + amt);
        }
      }
      return { income, expenses, catTotals };
    };

    const current = calcTotals(currentTxns);
    const previous = calcTotals(prevTxns);
    const expenseDeltaPct = previous.expenses > 0
      ? ((current.expenses - previous.expenses) / previous.expenses) * 100
      : 0;

    const savingsCurrent = Math.max(0, current.income - current.expenses);
    const savingsPrev = Math.max(0, previous.income - previous.expenses);

    const insights: string[] = [];
    if (current.expenses > previous.expenses && previous.expenses > 0) {
      insights.push(`💡 Monthly expenses increased by ${expenseDeltaPct.toFixed(1)}% compared to last month.`);
    } else if (current.expenses < previous.expenses && previous.expenses > 0) {
      insights.push(`✓ Great discipline! Spending dropped by ${Math.abs(expenseDeltaPct).toFixed(1)}% vs last month.`);
    }

    if (savingsCurrent > savingsPrev && savingsPrev > 0) {
      insights.push(`✓ You saved ${formatINR(savingsCurrent - savingsPrev)} more than last month.`);
    }

    const topCategories = Array.from(current.catTotals.entries())
      .map(([catId, amount]) => ({
        categoryId: catId,
        categoryName: catMap.get(catId) || 'Other',
        amount,
        percentage: current.expenses > 0 ? (amount / current.expenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      currentMonth,
      previousMonth,
      current: {
        income: current.income,
        expenses: current.expenses,
        savings: savingsCurrent,
        savingsRate: current.income > 0 ? (savingsCurrent / current.income) * 100 : 0,
      },
      previous: {
        income: previous.income,
        expenses: previous.expenses,
        savings: savingsPrev,
        savingsRate: previous.income > 0 ? (savingsPrev / previous.income) * 100 : 0,
      },
      expenseDeltaPct: Number(expenseDeltaPct.toFixed(1)),
      topCategories,
      insights,
    };
  }

  getReconciliation(month: string) {
    const txns = this.getTransactions({ startDate: `${month}-01`, endDate: `${month}-31` });
    const accounts = this.getAccounts();
    const openingBalance = accounts.reduce((sum, a) => sum + a.openingBalance, 0);
    const actualClosingBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

    return calculateMonthlyReconciliation(month, openingBalance, actualClosingBalance, txns);
  }

  // --- EXPORT / IMPORT ALL DATA ---
  exportAllData() {
    return {
      user: this.getUser(),
      accounts: this.getAccounts(),
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      goals: this.getGoals(),
      debts: this.getDebts(),
      rules: this.getRules(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  importAllData(data: any) {
    if (data.user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    if (data.accounts) localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(data.accounts));
    if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    if (data.budgets) localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
    if (data.goals) localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals));
    if (data.debts) localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(data.debts));
    if (data.rules) localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(data.rules));
  }

  clearAllData() {
    localStorage.clear();
    this.initDefaults();
  }
}

export const storageService = new StorageService();
