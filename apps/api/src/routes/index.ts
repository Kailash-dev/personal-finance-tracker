import { Router } from 'express';
import multer from 'multer';
import { TransactionService } from '../services/transactionService';
import { AccountService, BudgetService, GoalService, DebtService } from '../services/accountService';
import { ImportService } from '../services/importService';
import { DashboardService } from '../services/dashboardService';
import { ReportService } from '../services/reportService';
import { AuthService } from '../services/authService';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORIES } from '@personal-finance/shared';

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });
const prisma = new PrismaClient();

const authService = new AuthService();
const txService = new TransactionService();
const accService = new AccountService();
const budgetService = new BudgetService();
const goalService = new GoalService();
const debtService = new DebtService();
const importService = new ImportService();
const dashboardService = new DashboardService();
const reportService = new ReportService();

const getUserId = (req: AuthenticatedRequest) => req.userId || (req.headers['x-user-id'] as string) || 'user_demo_1';

// Health Check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- AUTHENTICATION ---
router.post('/auth/register', async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/auth/login', async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/auth/me', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const user = await authService.getMe(userId);
    res.json(user);
  } catch (e) {
    next(e);
  }
});

router.post('/auth/onboarding', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const result = await authService.completeOnboarding(userId, req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// --- CATEGORIES ---
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

// --- DASHBOARD ---
router.get('/dashboard', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const month = req.query.month as string;
    const data = await dashboardService.getDashboardData(userId, month);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// --- TRANSACTIONS ---
router.get('/transactions', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
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

router.post('/transactions', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const tx = await txService.createTransaction(userId, req.body);
    res.status(201).json(tx);
  } catch (e) {
    next(e);
  }
});

router.patch('/transactions/:id', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tx = await txService.updateTransaction(id, userId, req.body);
    res.json(tx);
  } catch (e) {
    next(e);
  }
});

router.delete('/transactions/:id', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await txService.deleteTransaction(id, userId);
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

// --- ACCOUNTS ---
router.get('/accounts', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const accounts = await accService.getAccounts(userId);
    res.json(accounts);
  } catch (e) {
    next(e);
  }
});

router.post('/accounts', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const account = await accService.createAccount(userId, req.body);
    res.status(201).json(account);
  } catch (e) {
    next(e);
  }
});

// --- BUDGETS ---
router.get('/budgets', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const budget = await budgetService.getBudget(userId, month);
    res.json(budget);
  } catch (e) {
    next(e);
  }
});

router.post('/budgets', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const budget = await budgetService.setBudget(userId, req.body);
    res.json(budget);
  } catch (e) {
    next(e);
  }
});

// --- GOALS ---
router.get('/goals', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const goals = await goalService.getGoals(userId);
    res.json(goals);
  } catch (e) {
    next(e);
  }
});

router.post('/goals', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const goal = await goalService.createGoal(userId, req.body);
    res.status(201).json(goal);
  } catch (e) {
    next(e);
  }
});

router.post('/goals/:id/contribute', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await goalService.addContribution(id, userId, req.body.amount, req.body.notes);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// --- DEBTS ---
router.get('/debts', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const debts = await debtService.getDebts(userId);
    res.json(debts);
  } catch (e) {
    next(e);
  }
});

router.post('/debts', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const debt = await debtService.createDebt(userId, req.body);
    res.status(201).json(debt);
  } catch (e) {
    next(e);
  }
});

// --- PDF IMPORT ---
router.post('/import/pdf', optionalAuth, upload.single('file'), async (req: any, res, next) => {
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

router.get('/import/:id', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const details = await importService.getImportDetails(id, userId);
    res.json(details);
  } catch (e) {
    next(e);
  }
});

router.post('/import/:id/confirm', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = getUserId(req);
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await importService.confirmImport(id, userId, req.body.transactions);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// --- REPORTS & RECONCILIATION ---
router.get('/reports/monthly', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
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

router.get('/reports/reconciliation', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
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
