import { describe, it, expect } from 'vitest';
import { calculateGoalProjection, calculateDebtSummary, calculateEmergencyFundTarget } from '../projections';
import { Goal, Debt } from '@personal-finance/types';

describe('Goal Projection and Debt Math', () => {
  it('calculates required monthly savings and on-track status for a car goal', () => {
    // Current date: 2026-09-01, Target: 2028-12-01 (approx 27 months)
    const fixedNow = new Date('2026-09-01T00:00:00Z');
    const carGoal: Goal = {
      id: 'g_car',
      userId: 'u1',
      name: 'Buy Car',
      category: 'VEHICLE_CAR',
      targetAmount: 800000,
      currentAmount: 200000,
      targetDate: '2028-12-01',
      monthlyContribution: 25000,
      isCompleted: false,
      createdAt: '2026-09-01',
      updatedAt: '2026-09-01',
    };

    const projection = calculateGoalProjection(carGoal, fixedNow);

    expect(projection.remainingAmount).toBe(600000);
    expect(projection.progressPercentage).toBe(25);
    expect(projection.monthsRemaining).toBeGreaterThanOrEqual(26);
    expect(projection.requiredMonthlySaving).toBeLessThanOrEqual(24000);
    // Because current monthly contribution (₹25,000) > required (~₹22,222), it should be ON_TRACK or AHEAD
    expect(['ON_TRACK', 'AHEAD']).toContain(projection.status);
  });

  it('calculates debt summary, EMI totals and DTI ratio correctly', () => {
    const debts: Debt[] = [
      {
        id: 'd1',
        userId: 'u1',
        name: 'Car Loan',
        lender: 'HDFC',
        type: 'CAR_LOAN',
        originalAmount: 800000,
        outstandingAmount: 540000,
        interestRate: 8.5,
        monthlyEmi: 17500,
        startDate: '2025-01-01',
        dueDay: 5,
        createdAt: '2026-09-01',
        updatedAt: '2026-09-01',
      },
    ];

    const summary = calculateDebtSummary(debts, 120000);

    expect(summary.totalOutstanding).toBe(540000);
    expect(summary.totalMonthlyEmi).toBe(17500);
    expect(summary.debtToIncomeRatio).toBeCloseTo(14.58, 1);
  });

  it('calculates emergency fund target for 6 months essential expenses', () => {
    const ef = calculateEmergencyFundTarget(45000, 6, 120000);

    expect(ef.targetAmount).toBe(270000);
    expect(ef.shortfall).toBe(150000);
    expect(ef.progressPct).toBeCloseTo(44.4, 1);
    expect(ef.monthsCovered).toBeCloseTo(2.7, 1);
  });
});
