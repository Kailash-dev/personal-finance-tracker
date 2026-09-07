import { Goal, Debt } from '@personal-finance/types';

export interface GoalProjectionResult {
  goalId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  targetDate?: string;
  monthsRemaining?: number;
  requiredMonthlySaving?: number;
  currentMonthlyContribution?: number;
  projectedCompletionDate?: string;
  status: 'ON_TRACK' | 'BEHIND' | 'AHEAD' | 'COMPLETED' | 'NO_TARGET_DATE';
  statusMessage: string;
}

/**
 * Calculates projection metrics for a financial goal
 */
export function calculateGoalProjection(goal: Goal, currentDate: Date = new Date()): GoalProjectionResult {
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  const progressPercentage = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;

  if (goal.isCompleted || remainingAmount === 0) {
    return {
      goalId: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      remainingAmount: 0,
      progressPercentage: 100,
      status: 'COMPLETED',
      statusMessage: 'Goal completed!',
    };
  }

  let monthsRemaining: number | undefined;
  let requiredMonthlySaving: number | undefined;
  let projectedCompletionDate: string | undefined;
  let status: GoalProjectionResult['status'] = 'NO_TARGET_DATE';
  let statusMessage = 'No target date specified';

  if (goal.targetDate) {
    const target = new Date(goal.targetDate);
    const diffTime = target.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    monthsRemaining = Math.max(1, Math.round(diffDays / 30.4375));

    requiredMonthlySaving = Math.ceil(remainingAmount / monthsRemaining);

    const contribution = goal.monthlyContribution || 0;
    if (contribution > 0) {
      const monthsNeeded = Math.ceil(remainingAmount / contribution);
      const projDate = new Date(currentDate);
      projDate.setMonth(projDate.getMonth() + monthsNeeded);
      projectedCompletionDate = projDate.toISOString().split('T')[0];

      if (contribution >= requiredMonthlySaving) {
        status = contribution > requiredMonthlySaving * 1.1 ? 'AHEAD' : 'ON_TRACK';
        statusMessage = `On track! At ₹${contribution.toLocaleString('en-IN')}/mo, goal will be achieved by ${projDate.toLocaleString('default', { month: 'short', year: 'numeric' })}.`;
      } else {
        status = 'BEHIND';
        statusMessage = `Behind target. Required ₹${requiredMonthlySaving.toLocaleString('en-IN')}/mo to meet target date (${monthsRemaining} mos left).`;
      }
    } else {
      status = 'BEHIND';
      statusMessage = `Requires ₹${requiredMonthlySaving.toLocaleString('en-IN')}/mo to complete by target date.`;
    }
  } else if (goal.monthlyContribution && goal.monthlyContribution > 0) {
    const monthsNeeded = Math.ceil(remainingAmount / goal.monthlyContribution);
    const projDate = new Date(currentDate);
    projDate.setMonth(projDate.getMonth() + monthsNeeded);
    projectedCompletionDate = projDate.toISOString().split('T')[0];
    status = 'ON_TRACK';
    statusMessage = `Projected completion in ${monthsNeeded} months (${projDate.toLocaleString('default', { month: 'short', year: 'numeric' })}).`;
  }

  return {
    goalId: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    remainingAmount,
    progressPercentage,
    targetDate: goal.targetDate,
    monthsRemaining,
    requiredMonthlySaving,
    currentMonthlyContribution: goal.monthlyContribution,
    projectedCompletionDate,
    status,
    statusMessage,
  };
}

export interface EmiDetailsResult {
  totalEmis: number;
  paidEmis: number;
  remainingEmis: number;
  originalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  monthlyEmi: number;
  progressPercentage: number;
  projectedPayoffDate?: string;
  isCompleted: boolean;
}

/**
 * Calculates accurate EMI count, remaining EMIs, and completion breakdown for a debt/loan
 */
export function calculateEmiDetails(debt: Debt, currentDate: Date = new Date()): EmiDetailsResult {
  const monthlyEmi = debt.monthlyEmi || 0;
  const originalAmount = debt.originalAmount || 0;
  const outstandingAmount = Math.max(0, debt.outstandingAmount || 0);
  const paidAmount = Math.max(0, originalAmount - outstandingAmount);

  // Derive total EMIs: explicit totalTenureMonths OR estimated from amounts
  let totalEmis = debt.totalTenureMonths || (monthlyEmi > 0 ? Math.max(1, Math.round(originalAmount / monthlyEmi)) : 1);
  
  // Derive remaining EMIs: explicit emisRemaining OR calculated from outstanding
  let remainingEmis = debt.emisRemaining !== undefined
    ? debt.emisRemaining
    : (monthlyEmi > 0 ? Math.max(0, Math.ceil(outstandingAmount / monthlyEmi)) : 0);

  // If outstanding is 0, remaining EMIs is 0
  if (outstandingAmount === 0) {
    remainingEmis = 0;
  }

  // Derive paid EMIs
  let paidEmis = debt.emisPaid !== undefined ? debt.emisPaid : Math.max(0, totalEmis - remainingEmis);
  if (paidEmis + remainingEmis > totalEmis) {
    totalEmis = paidEmis + remainingEmis;
  }

  const progressPercentage = originalAmount > 0
    ? Math.min(100, (paidAmount / originalAmount) * 100)
    : (outstandingAmount === 0 ? 100 : 0);

  let projectedPayoffDate: string | undefined;
  if (remainingEmis > 0) {
    const proj = new Date(currentDate);
    proj.setMonth(proj.getMonth() + remainingEmis);
    projectedPayoffDate = proj.toISOString().split('T')[0];
  }

  return {
    totalEmis,
    paidEmis,
    remainingEmis,
    originalAmount,
    paidAmount,
    outstandingAmount,
    monthlyEmi,
    progressPercentage,
    projectedPayoffDate,
    isCompleted: outstandingAmount === 0 || remainingEmis === 0,
  };
}

export interface CreditCardDetailsResult {
  totalDueAmount: number; // Full statement balance / Total Amount Due (TAD)
  minimumDueAmount: number; // Minimum Amount Due (MAD)
  revolvingBalance: number; // Balance left if paying only MAD (totalDueAmount - minimumDueAmount)
  creditLimit: number; // Total card limit
  creditUtilizationRatio: number; // CUR percentage (e.g. 68%)
  aprInterestRate: number; // Annual finance charge % (e.g. 42% p.a. / 3.5% monthly)
  estimatedMonthlyFinanceCharge: number; // Estimated monthly finance charge + 18% GST on interest
  isPaidInFull: boolean;
}

/**
 * Calculates complete credit card statement dynamics: Total Due (TAD), Minimum Due (MAD),
 * revolving finance charges, and credit limit utilization.
 */
export function calculateCreditCardDetails(debt: Debt): CreditCardDetailsResult {
  const totalDueAmount = debt.totalDueAmount !== undefined ? debt.totalDueAmount : (debt.outstandingAmount || debt.originalAmount || 0);
  const minimumDueAmount = debt.minimumDueAmount !== undefined
    ? debt.minimumDueAmount
    : (debt.monthlyEmi > 0 ? debt.monthlyEmi : Math.max(500, Math.round(totalDueAmount * 0.05)));
  
  const revolvingBalance = Math.max(0, totalDueAmount - minimumDueAmount);
  const creditLimit = debt.creditLimit || Math.max(totalDueAmount * 1.5, 50000);
  const creditUtilizationRatio = creditLimit > 0 ? Math.min(100, Math.round((totalDueAmount / creditLimit) * 100)) : 0;

  // Indian Bank Standard Credit Card APR: ~42% p.a. (3.5%/month) + 18% GST on interest charges
  const aprInterestRate = debt.interestRate > 0 ? debt.interestRate : 42;
  const monthlyRate = aprInterestRate / 12 / 100;
  const rawInterest = revolvingBalance * monthlyRate;
  const estimatedMonthlyFinanceCharge = Math.round(rawInterest * 1.18); // Include 18% GST on bank charges

  return {
    totalDueAmount,
    minimumDueAmount,
    revolvingBalance,
    creditLimit,
    creditUtilizationRatio,
    aprInterestRate,
    estimatedMonthlyFinanceCharge,
    isPaidInFull: totalDueAmount === 0,
  };
}

export interface DebtSummaryResult {
  totalOriginal: number;
  totalOutstanding: number;
  totalPaid: number;
  totalMonthlyEmi: number;
  totalRemainingEmis: number;
  maxRemainingMonths: number;
  overallProgressPercentage: number;
  debtToIncomeRatio: number; // Percentage
  estimatedPayoffMonths: number;
  projectedDebtFreeDate?: string;
  debtsCount: number;
}

/**
 * Calculates debt metrics, total EMIs count, and Debt-to-Income (DTI) ratio
 */
export function calculateDebtSummary(debts: Debt[], monthlyIncome: number, currentDate: Date = new Date()): DebtSummaryResult {
  const totalOriginal = debts.reduce((sum, d) => sum + (d.originalAmount || 0), 0);
  const totalOutstanding = debts.reduce((sum, d) => sum + (d.outstandingAmount || 0), 0);
  const totalPaid = Math.max(0, totalOriginal - totalOutstanding);
  const totalMonthlyEmi = debts.reduce((sum, d) => sum + (d.monthlyEmi || 0), 0);

  let totalRemainingEmis = 0;
  let maxRemainingMonths = 0;

  for (const d of debts) {
    const emiInfo = calculateEmiDetails(d, currentDate);
    totalRemainingEmis += emiInfo.remainingEmis;
    if (emiInfo.remainingEmis > maxRemainingMonths) {
      maxRemainingMonths = emiInfo.remainingEmis;
    }
  }

  const overallProgressPercentage = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;
  const debtToIncomeRatio = monthlyIncome > 0 ? (totalMonthlyEmi / monthlyIncome) * 100 : 0;
  const estimatedPayoffMonths = maxRemainingMonths || (totalMonthlyEmi > 0 ? Math.ceil(totalOutstanding / totalMonthlyEmi) : 0);

  let projectedDebtFreeDate: string | undefined;
  if (estimatedPayoffMonths > 0) {
    const dDate = new Date(currentDate);
    dDate.setMonth(dDate.getMonth() + estimatedPayoffMonths);
    projectedDebtFreeDate = dDate.toISOString().split('T')[0];
  }

  return {
    totalOriginal,
    totalOutstanding,
    totalPaid,
    totalMonthlyEmi,
    totalRemainingEmis,
    maxRemainingMonths,
    overallProgressPercentage,
    debtToIncomeRatio,
    estimatedPayoffMonths,
    projectedDebtFreeDate,
    debtsCount: debts.length,
  };
}

/**
 * Emergency fund recommendation calculation
 */
export function calculateEmergencyFundTarget(
  essentialMonthlyExpenses: number,
  targetMonths: 3 | 6 | 9 | 12 = 6,
  currentSavings: number = 0
) {
  const targetAmount = essentialMonthlyExpenses * targetMonths;
  const progressPct = targetAmount > 0 ? Math.min(100, (currentSavings / targetAmount) * 100) : 0;
  const shortfall = Math.max(0, targetAmount - currentSavings);
  const monthsCovered = essentialMonthlyExpenses > 0 ? currentSavings / essentialMonthlyExpenses : 0;

  return {
    essentialMonthlyExpenses,
    targetMonths,
    targetAmount,
    currentSavings,
    progressPct,
    shortfall,
    monthsCovered: Number(monthsCovered.toFixed(1)),
  };
}
