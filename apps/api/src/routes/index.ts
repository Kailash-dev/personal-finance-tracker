import { Router } from 'express';
import multer from 'multer';
import { TransactionService } from '../services/transactionService';
import { AccountService, BudgetService, GoalService, DebtService } from '../services/accountService';
import { ImportService } from '../services/importService';
import { DashboardService } from '../services/dashboardService';
import { ReportService } from '../services/reportService';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORIES } from '@personal-finance/shared';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const prisma = new PrismaClient();

const txService = new TransactionService();
const accService = new AccountService();
const budgetService = new BudgetService();
const goalService = new GoalService();
const debtService = new DebtService();
const importService = new ImportService();
const dashboardService = new DashboardService();
const reportService = new ReportService();

// Default user ID for personal mode (customizable for multi-tenant SaaS)
const getUserId = (req: any) => req.headers['x-user-id'] || 'user_demo_1';

// Health Check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Categories
router.get('/categories', async (_req, res, next) => {
  try {
    const cats = await prisma.category.findMany({
      include: { subcategories: true },
    });
    if (cats.length === 0) {
      return res.json(DEFAULT_CATEGORIES);
    }
    res.json(cats);
  } catch (e) {
    next(e);
  }
});

// Dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const month = req.query.month as string;
    const data = await dashboardService.getDashboardData(userId, month);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// Transactions
router.get('/transactions', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const result = await txService.getTransactions(userId, {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      categoryId: req.query.categoryId as string,
      accountId: req.query.accountId as string,
      type: req.query.type as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/transactions', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const tx = await txService.createTransaction(userId, req.body);
    res.status(201).json(tx);
  } catch (e) {
    next(e);
  }
});

router.patch('/transactions/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const tx = await txService.updateTransaction(req.params.id, userId, req.body);
    res.json(tx);
  } catch (e) {
    next(e);
  }
});

router.delete('/transactions/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    await txService.deleteTransaction(req.params.id, userId);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Accounts
router.get('/accounts', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const accounts = await accService.getAccounts(userId);
    res.json(accounts);
  } catch (e) {
    next(e);
  }
});

router.post('/accounts', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const account = await accService.createAccount(userId, req.body);
    res.status(201).json(account);
  } catch (e) {
    next(e);
  }
});

// Budgets
router.get('/budgets', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const budget = await budgetService.getBudget(userId, month);
    res.json(budget);
  } catch (e) {
    next(e);
  }
});

router.post('/budgets', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const budget = await budgetService.setBudget(userId, req.body);
    res.json(budget);
  } catch (e) {
    next(e);
  }
});

// Goals
router.get('/goals', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const goals = await goalService.getGoals(userId);
    res.json(goals);
  } catch (e) {
    next(e);
  }
});

router.post('/goals', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const goal = await goalService.createGoal(userId, req.body);
    res.status(201).json(goal);
  } catch (e) {
    next(e);
  }
});

router.post('/goals/:id/contribute', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const result = await goalService.addContribution(req.params.id, userId, req.body.amount, req.body.notes);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Debts
router.get('/debts', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const debts = await debtService.getDebts(userId);
    res.json(debts);
  } catch (e) {
    next(e);
  }
});

router.post('/debts', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const debt = await debtService.createDebt(userId, req.body);
    res.status(201).json(debt);
  } catch (e) {
    next(e);
  }
});

// PDF Statement Import
router.post('/import/pdf', upload.single('file'), async (req: any, res, next) => {
  try {
    const userId = getUserId(req);
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file' });
    }
    const accountId = req.body.accountId;
    const bankHint = req.body.bankHint;

    const result = await importService.processPdfBuffer(
      userId,
      accountId,
      req.file.originalname,
      req.file.buffer,
      bankHint
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/import/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const details = await importService.getImportDetails(req.params.id, userId);
    res.json(details);
  } catch (e) {
    next(e);
  }
});

router.post('/import/:id/confirm', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const result = await importService.confirmImport(req.params.id, userId, req.body.transactions);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Reports & Reconciliation
router.get('/reports/monthly', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const now = new Date();
    const currentMonth = (req.query.currentMonth as string) || now.toISOString().slice(0, 7);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonth = (req.query.previousMonth as string) || prevDate.toISOString().slice(0, 7);

    const report = await reportService.getMonthlyReport(userId, currentMonth, previousMonth);
    res.json(report);
  } catch (e) {
    next(e);
  }
});

router.get('/reports/reconciliation', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const accountId = req.query.accountId as string;
    const recon = await reportService.getReconciliation(userId, month, accountId);
    res.json(recon);
  } catch (e) {
    next(e);
  }
});

export default router;
