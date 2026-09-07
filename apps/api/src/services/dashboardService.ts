import { PrismaClient } from '@prisma/client';
import { calculateFinancialHealthScore, calculateGoalProjection, calculateDebtSummary } from '@personal-finance/shared';

const prisma = new PrismaClient();

export class DashboardService {
  async getDashboardData(userId: string, targetMonth?: string) {
    const month = targetMonth || new Date().toISOString().slice(0, 7); // YYYY-MM

    // 1. Fetch user, accounts, debts, goals, categories
    const [user, accounts, debts, goals, categories, budget] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.account.findMany({ where: { userId, isActive: true } }),
      prisma.debt.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.category.findMany({ include: { subcategories: true } }),
      prisma.budget.findUnique({
        where: { userId_month: { userId, month } },
        include: { items: true },
      }),
    ]);

    // 2. Fetch current month transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: `${month}-01`,
          lte: `${month}-31`,
        },
      },
      include: {
        category: true,
        subcategory: true,
        account: true,
      },
      orderBy: { date: 'desc' },
    });

    // 3. Compute income, expenses, savings (excluding transfers & cash withdrawals)
    let totalIncome = 0;
    let totalExpenses = 0;
    const categorySpendingMap = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.type === 'INCOME') {
        totalIncome += Math.abs(tx.amount);
      } else if (tx.type === 'EXPENSE' || tx.type === 'DEBT_PAYMENT') {
        const absAmt = Math.abs(tx.amount);
        totalExpenses += absAmt;
        categorySpendingMap.set(tx.categoryId, (categorySpendingMap.get(tx.categoryId) || 0) + absAmt);
      } else if (tx.type === 'REFUND') {
        totalExpenses -= Math.abs(tx.amount);
      }
    }

    const totalSaved = Math.max(0, totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;

    // 4. Accounts & Balances
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
        available: (c.creditLimit || 0) - Math.abs(c.currentBalance),
        statementDate: c.statementDate,
        dueDate: c.dueDate,
      }));

    // 5. Debt Summary
    const debtSummary = calculateDebtSummary(debts as any, totalIncome || user?.monthlyIncome || 0);

    // 6. Category Breakdown for Donut Chart
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

    // 7. Monthly Trend (Past 6 months)
    const monthlyTrend = await this.getMonthlyTrend(userId);

    // 8. Goal Projections
    const goalProjections = goals.map((g) => calculateGoalProjection(g as any));
    const goalsOnTrack = goalProjections.filter((p) => p.status === 'ON_TRACK' || p.status === 'AHEAD' || p.status === 'COMPLETED').length;

    // 9. Financial Health Score
    const emergencyAcc = accounts.find((a) => a.name.toLowerCase().includes('emergency') || a.type === 'SAVINGS');
    const healthScore = calculateFinancialHealthScore({
      monthlyIncome: totalIncome || user?.monthlyIncome || 0,
      monthlyExpenses: totalExpenses,
      totalMonthlyEmi: debtSummary.totalMonthlyEmi,
      emergencyFundBalance: emergencyAcc ? emergencyAcc.currentBalance : totalBankBalance * 0.5,
      essentialMonthlyExpenses: totalExpenses * 0.7,
      budgetAllocated: budget?.totalAmount || 0,
      budgetSpent: totalExpenses,
      totalGoalsCount: goals.length,
      goalsOnTrackCount: goalsOnTrack,
    });

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

  private async getMonthlyTrend(userId: string) {
    // Generate past 6 months
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }

    const trend = [];
    for (const m of months) {
      const txns = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: `${m}-01`, lte: `${m}-31` },
        },
      });

      let inc = 0;
      let exp = 0;
      for (const t of txns) {
        if (t.type === 'INCOME') inc += Math.abs(t.amount);
        else if (t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT') exp += Math.abs(t.amount);
      }

      const monthName = new Date(`${m}-01`).toLocaleString('default', { month: 'short' });
      trend.push({
        month: m,
        monthLabel: monthName,
        income: inc,
        expenses: exp,
        savings: Math.max(0, inc - exp),
      });
    }

    return trend;
  }
}
