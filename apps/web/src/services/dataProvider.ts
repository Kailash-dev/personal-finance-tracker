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

  async deleteTransaction(id: string): Promise<void> {
    storageService.deleteTransaction(id);
  }

  // --- CATEGORIES & RULES ---
  async getCategories(): Promise<Category[]> {
    return storageService.getCategories();
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
}

export const dataProvider = new DataProvider();
