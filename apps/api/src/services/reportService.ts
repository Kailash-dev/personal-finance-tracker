import { PrismaClient } from '@prisma/client';
import { calculateMonthlyReconciliation, formatINR } from '@personal-finance/shared';

const prisma = new PrismaClient();

export class ReportService {
  async getMonthlyReport(userId: string, currentMonth: string, previousMonth: string) {
    const [currentTxns, prevTxns, user, categories] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId, date: { gte: `${currentMonth}-01`, lte: `${currentMonth}-31` } },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: `${previousMonth}-01`, lte: `${previousMonth}-31` } },
        include: { category: true },
      }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.category.findMany(),
    ]);

    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const calcTotals = (txns: typeof currentTxns) => {
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

    // Insights generation based on actual math
    const insights: string[] = [];
    if (current.expenses > previous.expenses && previous.expenses > 0) {
      insights.push(`💡 Monthly expenses increased by ${expenseDeltaPct.toFixed(1)}% compared to last month.`);
    } else if (current.expenses < previous.expenses && previous.expenses > 0) {
      insights.push(`✓ Great discipline! Spending dropped by ${Math.abs(expenseDeltaPct).toFixed(1)}% vs last month.`);
    }

    if (savingsCurrent > savingsPrev && savingsPrev > 0) {
      insights.push(`✓ You saved ${formatINR(savingsCurrent - savingsPrev)} more than last month.`);
    }

    // Check specific high categories
    for (const [catId, currAmt] of current.catTotals.entries()) {
      const prevAmt = previous.catTotals.get(catId) || 0;
      const catName = catMap.get(catId) || 'Unknown';
      if (prevAmt > 0 && currAmt > prevAmt * 1.25) {
        insights.push(`⚠ ${catName} spending is up by ${formatINR(currAmt - prevAmt)} (+${(((currAmt - prevAmt) / prevAmt) * 100).toFixed(0)}%).`);
      }
    }

    // Top spending categories
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

  async getReconciliation(userId: string, month: string, accountId?: string) {
    const where: any = {
      userId,
      date: { gte: `${month}-01`, lte: `${month}-31` },
    };
    if (accountId) where.accountId = accountId;

    const [txns, accounts] = await Promise.all([
      prisma.transaction.findMany({ where }),
      prisma.account.findMany({ where: { userId, isActive: true } }),
    ]);

    const openingBalance = accounts.reduce((sum, a) => sum + a.openingBalance, 0);
    const actualClosingBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

    return calculateMonthlyReconciliation(month, openingBalance, actualClosingBalance, txns as any);
  }
}
