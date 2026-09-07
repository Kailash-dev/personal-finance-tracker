import { storageService } from './storageService';
import {
  User,
  Account,
  Transaction,
  Category,
  Budget,
  Goal,
  Debt,
  MerchantRule,
} from '@personal-finance/types';

const API_BASE_URL = import.meta.env?.VITE_API_URL || '';

export class DataProvider {
  private useApi: boolean = false;

  constructor() {
    this.checkApiStatus();
  }

  private async checkApiStatus() {
    if (!API_BASE_URL) {
      this.useApi = false;
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      this.useApi = res.ok;
    } catch {
      this.useApi = false;
    }
  }

  // --- USER ---
  async getUser(): Promise<User> {
    return storageService.getUser();
  }

  async updateUser(user: Partial<User>): Promise<User> {
    return storageService.updateUser(user);
  }

  // --- ACCOUNTS ---
  async getAccounts(): Promise<Account[]> {
    return storageService.getAccounts();
  }

  async createAccount(acc: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    return storageService.createAccount(acc);
  }

  async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
    return storageService.updateAccount(id, updates);
  }

  // --- TRANSACTIONS ---
  async getTransactions(filters?: any): Promise<Transaction[]> {
    return storageService.getTransactions(filters);
  }

  async createTransaction(txData: any): Promise<Transaction> {
    return storageService.createTransaction(txData);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    return storageService.updateTransaction(id, updates);
  }

  async batchUpdateTransactions(ids: string[], updates: Partial<Transaction>): Promise<Transaction[]> {
    return storageService.batchUpdateTransactions(ids, updates);
  }

  async deleteTransaction(id: string): Promise<void> {
    storageService.deleteTransaction(id);
  }

  async autoCategorizeTransactions(onlyUncategorized?: boolean): Promise<{ updatedCount: number; matchedCount: number }> {
    return storageService.autoCategorizeTransactions(onlyUncategorized);
  }

  // --- CATEGORIES & RULES ---
  async getCategories(): Promise<Category[]> {
    return storageService.getCategories();
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    return storageService.createCategory(category);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    return storageService.updateCategory(id, updates);
  }

  async getRules(): Promise<MerchantRule[]> {
    return storageService.getRules();
  }

  async addCustomRule(rule: Omit<MerchantRule, 'id' | 'createdAt'>): Promise<MerchantRule> {
    return storageService.addCustomRule(rule);
  }

  // --- BUDGETS ---
  async getBudget(month: string): Promise<Budget | null> {
    return storageService.getBudgetForMonth(month);
  }

  async saveBudget(month: string, totalAmount: number, items: { categoryId: string; amount: number }[]): Promise<Budget> {
    return storageService.saveBudget(month, totalAmount, items);
  }

  // --- GOALS ---
  async getGoals(): Promise<Goal[]> {
    return storageService.getGoals();
  }

  async createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    return storageService.createGoal(goal);
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    return storageService.updateGoal(id, updates);
  }

  async addGoalContribution(goalId: string, amount: number, notes?: string): Promise<Goal> {
    return storageService.addGoalContribution(goalId, amount, notes);
  }

  // --- DEBTS ---
  async getDebts(): Promise<Debt[]> {
    return storageService.getDebts();
  }

  async createDebt(debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Debt> {
    return storageService.createDebt(debt);
  }

  async updateDebt(id: string, updates: Partial<Debt>): Promise<Debt> {
    return storageService.updateDebt(id, updates);
  }

  async deleteDebt(id: string): Promise<void> {
    storageService.deleteDebt(id);
  }

  async recordDebtPayment(debtId: string, amount: number, accountId?: string, date?: string): Promise<void> {
    storageService.recordDebtPayment(debtId, amount, accountId, date);
  }

  // --- BORROWINGS (उधार) ---
  async getBorrowings(month?: string) {
    return storageService.getBorrowings(month);
  }

  async createBorrowing(data: any) {
    return storageService.createBorrowing(data);
  }

  async updateBorrowing(id: string, updates: any) {
    return storageService.updateBorrowing(id, updates);
  }

  async deleteBorrowing(id: string) {
    storageService.deleteBorrowing(id);
  }

  async settleBorrowing(id: string, amount: number, accountId?: string, date?: string) {
    return storageService.settleBorrowing(id, amount, accountId, date);
  }

  async rolloverBorrowing(id: string, targetMonth: string) {
    return storageService.rolloverBorrowing(id, targetMonth);
  }

  // --- INCOME STREAMS (JOB SALARY + FREELANCE / CONSULTING) ---
  async getIncomeStreams() {
    return storageService.getIncomeStreams();
  }

  async createIncomeStream(data: any) {
    return storageService.createIncomeStream(data);
  }

  async updateIncomeStream(id: string, updates: any) {
    return storageService.updateIncomeStream(id, updates);
  }

  async deleteIncomeStream(id: string) {
    storageService.deleteIncomeStream(id);
  }

  // --- CIBIL SCORE ANALYSIS & RECOVERY ---
  async getCibilAnalysis() {
    return storageService.getCibilAnalysis();
  }

  // --- DASHBOARD & REPORTS ---
  async getDashboardData(month?: string) {
    return storageService.getDashboardData(month);
  }

  async getMonthlyReport(currentMonth: string, previousMonth: string) {
    return storageService.getMonthlyReport(currentMonth, previousMonth);
  }

  async getReconciliation(month: string) {
    return storageService.getReconciliation(month);
  }

  // --- BULK IMPORT CONFIRMATION ---
  async confirmBankImport(
    accountId: string,
    transactions: {
      date: string;
      description: string;
      amount: number;
      type: any;
      paymentMethod: any;
      categoryId?: string;
      subcategoryId?: string;
      referenceNumber?: string;
      isSkipped?: boolean;
    }[]
  ) {
    const unSkipped = transactions.filter((t) => !t.isSkipped);
    for (const t of unSkipped) {
      storageService.createTransaction({
        accountId,
        categoryId: t.categoryId || 'cat_misc',
        subcategoryId: t.subcategoryId,
        date: t.date,
        description: t.description,
        amount: t.amount,
        type: t.type,
        paymentMethod: t.paymentMethod,
        referenceNumber: t.referenceNumber,
      });
    }
    return { success: true, count: unSkipped.length };
  }

  async seedKailashFinanceData() {
    storageService.seedKailashFinanceData();
  }
}

export const dataProvider = new DataProvider();
