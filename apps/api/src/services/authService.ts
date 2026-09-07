import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-personal-finance';

export class AuthService {
  async register(data: { email: string; password: string; name: string; monthlyIncome?: number }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        monthlyIncome: data.monthlyIncome || 0,
        currency: 'INR',
      },
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        monthlyIncome: user.monthlyIncome,
        currency: user.currency,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    };
  }

  async login(data: { email: string; password?: string; isDemo?: boolean }) {
    let user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) {
      // If demo login requested and not present, create it
      if (data.isDemo || data.email === 'kailash@example.com') {
        const passwordHash = await bcrypt.hash('password123', 10);
        user = await prisma.user.create({
          data: {
            id: 'user_demo_1',
            email: 'kailash@example.com',
            passwordHash,
            name: 'Kailash',
            monthlyIncome: 120000,
            currency: 'INR',
          },
        });
      } else {
        throw new Error('Invalid email or password');
      }
    }

    if (!data.isDemo && data.password && user.passwordHash) {
      const isValid = await bcrypt.compare(data.password, user.passwordHash);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        monthlyIncome: user.monthlyIncome,
        currency: user.currency,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      monthlyIncome: user.monthlyIncome,
      currency: user.currency,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async completeOnboarding(
    userId: string,
    data: {
      monthlyIncome: number;
      currentBankBalance: number;
      monthlyRent?: number;
      monthlyEmi?: number;
      emergencyFundTarget?: number;
      bankName?: string;
    }
  ) {
    // 1. Update User Monthly Income
    const user = await prisma.user.update({
      where: { id: userId },
      data: { monthlyIncome: data.monthlyIncome },
    });

    // 2. Create or update primary salary/savings account
    const existingAcc = await prisma.account.findFirst({ where: { userId } });
    let primaryAccountId = existingAcc?.id;

    if (!existingAcc) {
      const acc = await prisma.account.create({
        data: {
          userId,
          name: `${data.bankName || 'HDFC'} Primary Account`,
          type: 'SALARY',
          bank: data.bankName || 'HDFC',
          accountNumberMasked: `${data.bankName || 'HDFC'} ****${Math.floor(1000 + Math.random() * 9000)}`,
          currentBalance: data.currentBankBalance,
          openingBalance: data.currentBankBalance,
          currency: 'INR',
          isActive: true,
        },
      });
      primaryAccountId = acc.id;
    }

    // 3. Create starter goals (₹1L bank balance & Emergency fund)
    await prisma.goal.createMany({
      data: [
        {
          userId,
          name: 'Keep ₹1,00,000 in Bank',
          category: 'BANK_BALANCE',
          targetAmount: 100000,
          currentAmount: data.currentBankBalance,
          monthlyContribution: Math.round(data.monthlyIncome * 0.1),
          accountId: primaryAccountId,
        },
        {
          userId,
          name: '6-Month Emergency Cushion',
          category: 'EMERGENCY_FUND',
          targetAmount: data.emergencyFundTarget || (data.monthlyIncome * 0.7 * 6),
          currentAmount: Math.round(data.currentBankBalance * 0.5),
          monthlyContribution: Math.round(data.monthlyIncome * 0.15),
          accountId: primaryAccountId,
        },
      ],
    });

    return { success: true, user };
  }
}
