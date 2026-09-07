import { describe, it, expect } from 'vitest';
import {
  calculateRecommendedBudget,
  analyzeSpendingLeaks,
  generateMentorshipAdvice,
  askFinanceMentor,
} from '../mentor';
import { Transaction } from '@personal-finance/types';

describe('Indian Finance Mentor & Budget Planner', () => {
  it('calculates accurate category allocations for ₹50,000 income', () => {
    const plan = calculateRecommendedBudget(50000, 'BALANCED_50_30_20');

    expect(plan.income).toBe(50000);
    expect(plan.totalAllocated).toBeLessThanOrEqual(50000);

    const rent = plan.categories.find((c) => c.categoryId === 'cat_housing');
    expect(rent).toBeDefined();
    expect(rent?.recommendedAmount).toBe(12500); // 25% of 50k

    const food = plan.categories.find((c) => c.categoryId === 'cat_food');
    expect(food).toBeDefined();
    expect(food?.recommendedAmount).toBe(6500); // 13% of 50k

    const savings = plan.categories.find((c) => c.categoryId === 'cat_investments');
    expect(savings).toBeDefined();
    expect(savings?.recommendedAmount).toBe(7500); // 15% of 50k
  });

  it('adjusts allocations for Tier-1 Metro profile', () => {
    const plan = calculateRecommendedBudget(50000, 'TIER_1_METRO');
    const rent = plan.categories.find((c) => c.categoryId === 'cat_housing');
    expect(rent?.recommendedAmount).toBe(15000); // 30% for metro rent
  });

  it('detects miscellaneous leaks and micro-UPI clusters', () => {
    const txns: Transaction[] = [
      {
        id: 'tx1',
        userId: 'u1',
        accountId: 'a1',
        date: '2026-09-01',
        amount: -3500,
        type: 'EXPENSE',
        paymentMethod: 'UPI',
        categoryId: 'cat_misc',
        description: 'Uncategorized store',
        isRecurring: false,
        createdAt: '',
        updatedAt: '',
      },
      // 12 micro UPI payments
      ...Array.from({ length: 12 }, (_, i) => ({
        id: `micro_${i}`,
        userId: 'u1',
        accountId: 'a1',
        date: '2026-09-02',
        amount: -180,
        type: 'EXPENSE' as const,
        paymentMethod: 'UPI' as const,
        categoryId: 'cat_food',
        description: 'Chai & Snacks Tapri',
        isRecurring: false,
        createdAt: '',
        updatedAt: '',
      })),
    ];

    const leaks = analyzeSpendingLeaks(txns, 50000);
    expect(leaks.length).toBeGreaterThanOrEqual(2);

    const miscLeak = leaks.find((l) => l.id === 'leak_misc');
    expect(miscLeak).toBeDefined();

    const upiLeak = leaks.find((l) => l.id === 'leak_micro_upi');
    expect(upiLeak).toBeDefined();
    expect(upiLeak?.monthlyImpact).toBe(2160);
  });

  it('generates mentorship report with actionable steps', () => {
    const report = generateMentorshipAdvice({
      income: 50000,
      monthlyExpenses: 32000,
      transactions: [],
      debts: [],
      goals: [],
      bankBalance: 25000,
    });

    expect(report.effectiveSavingsRate).toBe(36.0);
    expect(report.actionChecklist.length).toBeGreaterThan(0);
    expect(report.actionChecklist[0].title).toContain('Emergency');
  });

  it('answers specific ₹50K budgeting question intelligently', () => {
    const response = askFinanceMentor('How should I budget my 50k salary?', {
      income: 50000,
      monthlyExpenses: 30000,
      transactions: [],
      debts: [],
      goals: [],
    });

    expect(response.recommendations.length).toBeGreaterThan(0);
    expect(response.calculatedNumbers?.['Rent (25%)']).toBe('₹12,500');
  });
});
