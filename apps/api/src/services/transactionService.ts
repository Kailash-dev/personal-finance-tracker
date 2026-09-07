import { PrismaClient } from '@prisma/client';
import { categorizeTransaction } from '@personal-finance/shared';

const prisma = new PrismaClient();

export class TransactionService {
  async getTransactions(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { userId };

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    } else if (filters?.startDate) {
      where.date = { gte: filters.startDate };
    } else if (filters?.endDate) {
      where.date = { lte: filters.endDate };
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.accountId) {
      where.OR = [
        { accountId: filters.accountId },
        { toAccountId: filters.accountId },
      ];
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where.description = {
        contains: filters.search,
      };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: true,
          toAccount: true,
          category: true,
          subcategory: true,
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createTransaction(userId: string, data: {
    accountId: string;
    toAccountId?: string;
    categoryId?: string;
    subcategoryId?: string;
    date: string;
    description: string;
    amount: number;
    type?: string;
    paymentMethod?: string;
    referenceNumber?: string;
    notes?: string;
  }) {
    let finalCategoryId = data.categoryId;
    let finalSubcategoryId = data.subcategoryId;
    let finalType = data.type;

    // If category not provided, auto-categorize
    if (!finalCategoryId) {
      const customRules = await prisma.merchantRule.findMany({ where: { userId } });
      const catRes = categorizeTransaction(data.description, data.amount, customRules as any);
      finalCategoryId = catRes.categoryId;
      finalSubcategoryId = catRes.subcategoryId;
      finalType = finalType || catRes.type;
    }

    const tx = await prisma.transaction.create({
      data: {
        userId,
        accountId: data.accountId,
        toAccountId: data.toAccountId,
        categoryId: finalCategoryId || 'cat_misc',
        subcategoryId: finalSubcategoryId,
        date: data.date,
        description: data.description,
        amount: data.amount,
        type: finalType || (data.amount < 0 ? 'EXPENSE' : 'INCOME'),
        paymentMethod: data.paymentMethod || 'UPI',
        source: 'MANUAL',
        referenceNumber: data.referenceNumber,
        notes: data.notes,
      },
      include: {
        account: true,
        toAccount: true,
        category: true,
        subcategory: true,
      },
    });

    // Update account balance
    await prisma.account.update({
      where: { id: data.accountId },
      data: {
        currentBalance: {
          increment: data.amount,
        },
      },
    });

    if (data.toAccountId && data.type === 'TRANSFER') {
      await prisma.account.update({
        where: { id: data.toAccountId },
        data: {
          currentBalance: {
            increment: Math.abs(data.amount),
          },
        },
      });
    }

    return tx;
  }

  async updateTransaction(id: string, userId: string, data: any) {
    return prisma.transaction.update({
      where: { id, userId },
      data,
      include: {
        account: true,
        toAccount: true,
        category: true,
        subcategory: true,
      },
    });
  }

  async deleteTransaction(id: string, userId: string) {
    const tx = await prisma.transaction.findUnique({ where: { id, userId } });
    if (!tx) throw new Error('Transaction not found');

    // Reverse balance adjustment
    await prisma.account.update({
      where: { id: tx.accountId },
      data: {
        currentBalance: {
          decrement: tx.amount,
        },
      },
    });

    return prisma.transaction.delete({ where: { id } });
  }
}
