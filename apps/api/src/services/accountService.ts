import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AccountService {
  async getAccounts(userId: string) {
    return prisma.account.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createAccount(userId: string, data: any) {
    return prisma.account.create({
      data: {
        userId,
        name: data.name,
        type: data.type,
        bank: data.bank,
        accountNumberMasked: data.accountNumberMasked,
        currentBalance: data.currentBalance || data.openingBalance || 0,
        openingBalance: data.openingBalance || 0,
        creditLimit: data.creditLimit,
        availableLimit: data.availableLimit,
        statementDate: data.statementDate,
        dueDate: data.dueDate,
      },
    });
  }

  async updateAccount(id: string, userId: string, data: any) {
    return prisma.account.update({
      where: { id, userId },
      data,
    });
  }
}

export class BudgetService {
  async getBudget(userId: string, month: string) {
    let budget = await prisma.budget.findUnique({
      where: { userId_month: { userId, month } },
      include: {
        items: {
          include: { category: true },
        },
      },
    });

    if (!budget) {
      // Find previous month budget to clone or create empty
      const prev = await prisma.budget.findFirst({
        where: { userId },
        orderBy: { month: 'desc' },
        include: { items: true },
      });

      if (prev) {
        budget = await prisma.budget.create({
          data: {
            userId,
            month,
            totalAmount: prev.totalAmount,
            items: {
              create: prev.items.map((i) => ({
                categoryId: i.categoryId,
                amount: i.amount,
              })),
            },
          },
          include: {
            items: { include: { category: true } },
          },
        });
      }
    }

    return budget;
  }

  async setBudget(userId: string, data: { month: string; totalAmount: number; items: { categoryId: string; amount: number }[] }) {
    return prisma.budget.upsert({
      where: { userId_month: { userId, month: data.month } },
      update: {
        totalAmount: data.totalAmount,
        items: {
          deleteMany: {},
          create: data.items.map((i) => ({
            categoryId: i.categoryId,
            amount: i.amount,
          })),
        },
      },
      create: {
        userId,
        month: data.month,
        totalAmount: data.totalAmount,
        items: {
          create: data.items.map((i) => ({
            categoryId: i.categoryId,
            amount: i.amount,
          })),
        },
      },
      include: {
        items: { include: { category: true } },
      },
    });
  }
}

export class GoalService {
  async getGoals(userId: string) {
    return prisma.goal.findMany({
      where: { userId },
      include: { contributions: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createGoal(userId: string, data: any) {
    return prisma.goal.create({
      data: {
        userId,
        name: data.name,
        category: data.category,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        targetDate: data.targetDate,
        monthlyContribution: data.monthlyContribution,
        accountId: data.accountId,
        notes: data.notes,
      },
    });
  }

  async updateGoal(id: string, userId: string, data: any) {
    return prisma.goal.update({
      where: { id, userId },
      data,
    });
  }

  async addContribution(goalId: string, userId: string, amount: number, notes?: string) {
    const goal = await prisma.goal.findUnique({ where: { id: goalId, userId } });
    if (!goal) throw new Error('Goal not found');

    const [contribution, updatedGoal] = await prisma.$transaction([
      prisma.goalContribution.create({
        data: {
          goalId,
          amount,
          date: new Date().toISOString().split('T')[0],
          notes,
        },
      }),
      prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: amount },
        },
      }),
    ]);

    return { contribution, goal: updatedGoal };
  }
}

export class DebtService {
  async getDebts(userId: string) {
    return prisma.debt.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createDebt(userId: string, data: any) {
    return prisma.debt.create({
      data: {
        userId,
        name: data.name,
        lender: data.lender,
        type: data.type,
        originalAmount: data.originalAmount,
        outstandingAmount: data.outstandingAmount,
        interestRate: data.interestRate,
        monthlyEmi: data.monthlyEmi,
        startDate: data.startDate,
        endDate: data.endDate,
        dueDay: data.dueDay || 5,
        notes: data.notes,
      },
    });
  }

  async updateDebt(id: string, userId: string, data: any) {
    return prisma.debt.update({
      where: { id, userId },
      data,
    });
  }
}
