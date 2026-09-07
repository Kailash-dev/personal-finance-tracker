import { describe, it, expect } from 'vitest';
import { calculateFinancialHealthScore } from '../healthScore';
import { calculateMonthlyReconciliation } from '../reconciliation';
import { Transaction } from '@personal-finance/types';

describe('Financial Rules and Double-Counting Safeguards', () => {
  it('does NOT count transfers between accounts as monthly expenses', () => {
    const transactions: Transaction[] = [
      {
        id: 'tx1',
        userId: 'u1',
        accountId: 'acc_hdfc',
        categoryId: 'cat_food',
        date: '2026-09-01',
        description: 'Zomato Lunch',
        amount: -450,
        type: 'EXPENSE',
        paymentMethod: 'UPI',
        source: 'MANUAL',
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      },
      {
        id: 'tx2',
        userId: 'u1',
        accountId: 'acc_hdfc',
        toAccountId: 'acc_sbi',
        categoryId: 'cat_transfer',
        date: '2026-09-02',
        description: 'Self transfer HDFC to SBI',
        amount: -50000,
        type: 'TRANSFER',
        paymentMethod: 'IMPS',
        source: 'MANUAL',
        createdAt: '2026-09-02',
        updatedAt: '2026-09-02',
      },
      {
        id: 'tx3',
        userId: 'u1',
        accountId: 'acc_hdfc',
        categoryId: 'cat_income',
        date: '2026-09-01',
        description: 'Monthly Salary',
        amount: 120000,
        type: 'INCOME',
        paymentMethod: 'NEFT',
        source: 'MANUAL',
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      },
    ];

    const recon = calculateMonthlyReconciliation('2026-09', 10000, 129550, transactions);

    // Total expense must be ONLY the ₹450 food expense, not the ₹50,000 transfer!
    expect(recon.totalExpenses).toBe(450);
    expect(recon.totalIncome).toBe(120000);
  });

  it('calculates 0-100 Financial Health Score with balanced factors', () => {
    const health = calculateFinancialHealthScore({
      monthlyIncome: 120000,
      monthlyExpenses: 70000,
      totalMonthlyEmi: 18500,
      emergencyFundBalance: 250000,
      essentialMonthlyExpenses: 45000,
      budgetAllocated: 75000,
      budgetSpent: 70000,
      totalGoalsCount: 3,
      goalsOnTrackCount: 3,
    });

    expect(health.totalScore).toBeGreaterThanOrEqual(80);
    expect(health.rating).toBe('EXCELLENT');
    expect(health.details.savingsRate).toBeCloseTo(41.7, 1);
    expect(health.details.debtToIncomeRatio).toBeCloseTo(15.4, 1);
    expect(health.insights.length).toBeGreaterThan(0);
  });
});
