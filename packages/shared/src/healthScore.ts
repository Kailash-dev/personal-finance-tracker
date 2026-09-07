import { FinancialHealthScore } from '@personal-finance/types';

export interface HealthScoreInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalMonthlyEmi: number;
  emergencyFundBalance: number;
  essentialMonthlyExpenses: number;
  budgetAllocated?: number;
  budgetSpent?: number;
  totalGoalsCount: number;
  goalsOnTrackCount: number;
}

/**
 * Calculates a comprehensive Financial Health Score (0-100)
 * Note: Purely informational, non-advisory metric.
 */
export function calculateFinancialHealthScore(input: HealthScoreInput): FinancialHealthScore {
  const {
    monthlyIncome,
    monthlyExpenses,
    totalMonthlyEmi,
    emergencyFundBalance,
    essentialMonthlyExpenses,
    budgetAllocated = 0,
    budgetSpent = 0,
    totalGoalsCount,
    goalsOnTrackCount,
  } = input;

  const insights: string[] = [];

  // 1. Savings Rate Factor (Max 25 pts)
  const savings = Math.max(0, monthlyIncome - monthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  let savingsScore = 0;

  if (savingsRate >= 35) {
    savingsScore = 25;
    insights.push(`🌟 Outstanding savings rate of ${savingsRate.toFixed(1)}%!`);
  } else if (savingsRate >= 20) {
    savingsScore = 20;
    insights.push(`✓ Healthy savings rate of ${savingsRate.toFixed(1)}% (Target: >20%).`);
  } else if (savingsRate >= 10) {
    savingsScore = 12;
    insights.push(`⚠ Moderate savings rate of ${savingsRate.toFixed(1)}%. Try to reach 20%.`);
  } else if (savingsRate > 0) {
    savingsScore = 5;
    insights.push(`⚠ Low savings rate of ${savingsRate.toFixed(1)}%. Look for non-essential cutbacks.`);
  } else {
    savingsScore = 0;
    insights.push(`🚨 You are spending more than your monthly income.`);
  }

  // 2. Debt / EMI Burden Factor (Max 25 pts)
  const dti = monthlyIncome > 0 ? (totalMonthlyEmi / monthlyIncome) * 100 : 0;
  let debtScore = 0;

  if (dti === 0) {
    debtScore = 25;
    insights.push(`🎉 Debt-free! Zero monthly EMI burden.`);
  } else if (dti <= 20) {
    debtScore = 23;
    insights.push(`✓ Manageable EMI burden (${dti.toFixed(1)}% of income).`);
  } else if (dti <= 35) {
    debtScore = 17;
    insights.push(`💡 EMI payments represent ${dti.toFixed(1)}% of income (Ideal < 30%).`);
  } else if (dti <= 50) {
    debtScore = 8;
    insights.push(`⚠ High debt burden: ${dti.toFixed(1)}% of income is committed to EMIs.`);
  } else {
    debtScore = 2;
    insights.push(`🚨 Critical EMI burden (${dti.toFixed(1)}% of income). Avoid taking further debt.`);
  }

  // 3. Emergency Fund Factor (Max 20 pts)
  const essential = essentialMonthlyExpenses > 0 ? essentialMonthlyExpenses : Math.max(1, monthlyExpenses * 0.7);
  const emergencyMonths = essential > 0 ? emergencyFundBalance / essential : 0;
  let emergencyFundScore = 0;

  if (emergencyMonths >= 6) {
    emergencyFundScore = 20;
    insights.push(`🛡️ Robust emergency fund covering ${emergencyMonths.toFixed(1)} months of essential living.`);
  } else if (emergencyMonths >= 3) {
    emergencyFundScore = 15;
    insights.push(`✓ Emergency fund covers ${emergencyMonths.toFixed(1)} months. Work toward 6 months.`);
  } else if (emergencyMonths >= 1) {
    emergencyFundScore = 8;
    insights.push(`⚠ Emergency fund covers ${emergencyMonths.toFixed(1)} months. Aim for at least 3-6 months.`);
  } else {
    emergencyFundScore = 2;
    insights.push(`🚨 Minimal emergency fund. Build a 3-month safety cushion urgently.`);
  }

  // 4. Budget Adherence (Max 15 pts)
  let budgetScore = 12; // Default if no budget set
  let budgetAdherencePct = 100;
  if (budgetAllocated > 0) {
    budgetAdherencePct = (budgetSpent / budgetAllocated) * 100;
    if (budgetAdherencePct <= 85) {
      budgetScore = 15;
      insights.push(`🎯 Well within monthly budget (${budgetAdherencePct.toFixed(0)}% used).`);
    } else if (budgetAdherencePct <= 100) {
      budgetScore = 11;
      insights.push(`✓ Monthly budget on track (${budgetAdherencePct.toFixed(0)}% utilized).`);
    } else {
      budgetScore = Math.max(0, 15 - Math.round((budgetAdherencePct - 100) / 5));
      insights.push(`⚠ Monthly budget exceeded by ${(budgetAdherencePct - 100).toFixed(0)}%.`);
    }
  }

  // 5. Goal Progress (Max 15 pts)
  let goalScore = 10;
  let goalOnTrackPct = 100;
  if (totalGoalsCount > 0) {
    goalOnTrackPct = (goalsOnTrackCount / totalGoalsCount) * 100;
    goalScore = Math.round((goalOnTrackPct / 100) * 15);
    if (goalOnTrackPct >= 80) {
      insights.push(`🚀 ${goalsOnTrackCount} of ${totalGoalsCount} financial goals are on track.`);
    } else {
      insights.push(`💡 ${totalGoalsCount - goalsOnTrackCount} goal(s) need higher monthly contributions to stay on schedule.`);
    }
  }

  const totalScore = Math.min(100, Math.max(0, savingsScore + debtScore + emergencyFundScore + budgetScore + goalScore));

  let rating: FinancialHealthScore['rating'] = 'FAIR';
  if (totalScore >= 80) rating = 'EXCELLENT';
  else if (totalScore >= 65) rating = 'GOOD';
  else if (totalScore >= 50) rating = 'FAIR';
  else if (totalScore >= 35) rating = 'NEEDS_ATTENTION';
  else rating = 'CRITICAL';

  return {
    totalScore,
    rating,
    factors: {
      savingsScore: Math.round((savingsScore / 25) * 100),
      debtScore: Math.round((debtScore / 25) * 100),
      emergencyFundScore: Math.round((emergencyFundScore / 20) * 100),
      budgetScore: Math.round((budgetScore / 15) * 100),
      goalScore: Math.round((goalScore / 15) * 100),
    },
    details: {
      savingsRate: Number(savingsRate.toFixed(1)),
      debtToIncomeRatio: Number(dti.toFixed(1)),
      emergencyMonthsCovered: Number(emergencyMonths.toFixed(1)),
      budgetAdherencePct: Number(budgetAdherencePct.toFixed(1)),
      goalOnTrackPct: Number(goalOnTrackPct.toFixed(1)),
    },
    insights,
  };
}
