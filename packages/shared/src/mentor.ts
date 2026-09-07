import { Transaction, Category, Budget, Goal, Debt } from '@personal-finance/types';
import { formatINR } from './currency';
import { DEFAULT_CATEGORIES } from './constants';

export type BudgetProfileType =
  | 'BALANCED_50_30_20'
  | 'TIER_1_METRO'
  | 'TIER_2_CITY'
  | 'AGGRESSIVE_SAVER'
  | 'DEBT_PAYOFF';

export interface RecommendedCategoryBudget {
  categoryId: string;
  categoryName: string;
  icon: string;
  color: string;
  type: 'NEEDS' | 'WANTS' | 'SAVINGS';
  percentage: number;
  recommendedAmount: number;
  minAmount: number;
  maxAmount: number;
  guidance: string;
}

export interface RecommendedBudgetPlan {
  income: number;
  profile: BudgetProfileType;
  profileName: string;
  profileDescription: string;
  totalAllocated: number;
  needsTotal: number;
  needsPercentage: number;
  wantsTotal: number;
  wantsPercentage: number;
  savingsTotal: number;
  savingsPercentage: number;
  categories: RecommendedCategoryBudget[];
  keyAdvice: string[];
}

export interface SpendingLeak {
  id: string;
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  icon: string;
  monthlyImpact: number;
  annualImpact: number;
  description: string;
  recommendation: string;
}

export interface MentorshipInput {
  income: number;
  monthlyExpenses: number;
  transactions: Transaction[];
  debts: Debt[];
  goals: Goal[];
  budget?: Budget | null;
  bankBalance?: number;
}

export interface MentorshipReport {
  overallVerdict: 'EXCELLENT' | 'GOOD' | 'NEEDS_OPTIMIZATION' | 'CRITICAL';
  headline: string;
  summary: string;
  income: number;
  effectiveSavingsRate: number;
  emergencyFundStatus: {
    current: number;
    target: number;
    monthsCovered: number;
    status: 'OPTIMAL' | 'BUILDING' | 'CRITICAL';
    advice: string;
  };
  debtBurden: {
    totalOutstanding: number;
    monthlyEmi: number;
    dtiPercentage: number;
    isHealthy: boolean;
    advice: string;
  };
  leaks: SpendingLeak[];
  actionChecklist: {
    step: number;
    title: string;
    impactRupees: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    actionText: string;
  }[];
}

export interface FinancialAdviceResponse {
  answer: string;
  recommendations: string[];
  calculatedNumbers?: Record<string, string>;
  suggestedAction?: string;
}

/**
 * Calculates optimal Indian monthly budget allocation based on income and lifestyle profile
 */
export function calculateRecommendedBudget(
  income: number,
  profile: BudgetProfileType = 'BALANCED_50_30_20'
): RecommendedBudgetPlan {
  const safeIncome = Math.max(0, income);

  let profileName = 'Balanced 50/30/20 Plan';
  let profileDescription = 'Classic financial guideline: 50% for Essentials, 30% for Lifestyle, 20% for Savings & Investments.';
  let weights: Record<string, { pct: number; type: 'NEEDS' | 'WANTS' | 'SAVINGS'; note: string }> = {};

  if (profile === 'TIER_1_METRO') {
    profileName = 'Tier-1 Metro Living (Bangalore/Mumbai/NCR)';
    profileDescription = 'Optimized for higher rental & commuting costs in major Indian metros while preserving a 20% minimum savings cushion.';
    weights = {
      cat_housing: { pct: 0.30, type: 'NEEDS', note: 'Rent/Society maintenance (aim for < 30% of salary)' },
      cat_food: { pct: 0.14, type: 'NEEDS', note: 'Groceries (10%) + Food delivery/Dining (4%)' },
      cat_utilities: { pct: 0.05, type: 'NEEDS', note: 'Electricity, Wi-Fi, LPG, Water' },
      cat_transport: { pct: 0.07, type: 'NEEDS', note: 'Metro/Cab/Fuel/Auto commute' },
      cat_healthcare: { pct: 0.04, type: 'NEEDS', note: 'Medicines, consultations, basic insurance' },
      cat_investments: { pct: 0.12, type: 'SAVINGS', note: 'Mutual Fund SIPs / Equity index funds' },
      cat_financial: { pct: 0.10, type: 'SAVINGS', note: 'Emergency fund SIP / RD' },
      cat_shopping: { pct: 0.06, type: 'WANTS', note: 'Clothing, personal care & electronics' },
      cat_entertainment: { pct: 0.04, type: 'WANTS', note: 'OTT, movies, weekend outings' },
      cat_personal: { pct: 0.04, type: 'WANTS', note: 'Personal discretionary & family support' },
      cat_education: { pct: 0.04, type: 'NEEDS', note: 'Skill development, certifications, books' },
    };
  } else if (profile === 'TIER_2_CITY') {
    profileName = 'Tier-2/3 City Economy Plan';
    profileDescription = 'Lower rental footprint allows higher wealth generation (30%+ savings rate).';
    weights = {
      cat_housing: { pct: 0.20, type: 'NEEDS', note: 'Rent or house maintenance in Tier-2/3 location' },
      cat_food: { pct: 0.14, type: 'NEEDS', note: 'Fresh groceries, milk, and local dining' },
      cat_utilities: { pct: 0.05, type: 'NEEDS', note: 'Electricity, broadband, LPG cylinder' },
      cat_transport: { pct: 0.05, type: 'NEEDS', note: 'Fuel & two-wheeler maintenance' },
      cat_healthcare: { pct: 0.04, type: 'NEEDS', note: 'Health & family medical buffer' },
      cat_investments: { pct: 0.20, type: 'SAVINGS', note: 'Long-term Mutual Fund & PPF SIPs' },
      cat_financial: { pct: 0.12, type: 'SAVINGS', note: 'Emergency liquid fund & gold/FD' },
      cat_shopping: { pct: 0.07, type: 'WANTS', note: 'Shopping & festive expenses' },
      cat_entertainment: { pct: 0.05, type: 'WANTS', note: 'Outings, movies & hobbies' },
      cat_personal: { pct: 0.05, type: 'WANTS', note: 'Family personal allowance' },
      cat_education: { pct: 0.03, type: 'NEEDS', note: 'Courses & learning' },
    };
  } else if (profile === 'AGGRESSIVE_SAVER') {
    profileName = 'Aggressive Wealth Builder (40% Savings)';
    profileDescription = 'Maximum financial acceleration for early home buying, superbike goal, or FIRE (Financial Independence).';
    weights = {
      cat_housing: { pct: 0.22, type: 'NEEDS', note: 'Frugal housing allocation' },
      cat_food: { pct: 0.12, type: 'NEEDS', note: 'Home cooking priority; minimal food delivery' },
      cat_utilities: { pct: 0.04, type: 'NEEDS', note: 'Optimized essential utilities' },
      cat_transport: { pct: 0.05, type: 'NEEDS', note: 'Public transit or fuel-efficient commute' },
      cat_healthcare: { pct: 0.04, type: 'NEEDS', note: 'Essential wellness & health' },
      cat_investments: { pct: 0.25, type: 'SAVINGS', note: 'High-equity index SIPs' },
      cat_financial: { pct: 0.15, type: 'SAVINGS', note: 'High-speed goal accumulation' },
      cat_shopping: { pct: 0.04, type: 'WANTS', note: 'Need-based shopping only' },
      cat_entertainment: { pct: 0.03, type: 'WANTS', note: 'Low-cost social activities' },
      cat_personal: { pct: 0.03, type: 'WANTS', note: 'Controlled personal allowance' },
      cat_education: { pct: 0.03, type: 'NEEDS', note: 'High-ROI skill upgrades' },
    };
  } else if (profile === 'DEBT_PAYOFF') {
    profileName = 'Debt Avalanche & Payoff Priority';
    profileDescription = 'Directs all non-essential surplus into aggressive debt elimination (car/bike/personal loan pre-closure).';
    weights = {
      cat_housing: { pct: 0.24, type: 'NEEDS', note: 'Essential living space' },
      cat_food: { pct: 0.12, type: 'NEEDS', note: 'Strict home groceries & dairy' },
      cat_utilities: { pct: 0.04, type: 'NEEDS', note: 'Basic connections only' },
      cat_transport: { pct: 0.05, type: 'NEEDS', note: 'Essential travel only' },
      cat_healthcare: { pct: 0.04, type: 'NEEDS', note: 'Health safety cushion' },
      cat_financial: { pct: 0.30, type: 'SAVINGS', note: 'Debt pre-payments & EMI acceleration' },
      cat_investments: { pct: 0.08, type: 'SAVINGS', note: 'Minimum SIP continuity' },
      cat_shopping: { pct: 0.04, type: 'WANTS', note: 'Postponed discretionary purchases' },
      cat_entertainment: { pct: 0.03, type: 'WANTS', note: 'Minimal entertainment' },
      cat_personal: { pct: 0.03, type: 'WANTS', note: 'Bare minimum allowances' },
      cat_education: { pct: 0.03, type: 'NEEDS', note: 'Income-enhancing skills' },
    };
  } else {
    // BALANCED_50_30_20
    weights = {
      cat_housing: { pct: 0.25, type: 'NEEDS', note: 'Rent/Society maintenance (ideal 25% of income)' },
      cat_food: { pct: 0.13, type: 'NEEDS', note: 'Groceries (9%), Milk & essentials (2%), Dining (2%)' },
      cat_utilities: { pct: 0.05, type: 'NEEDS', note: 'Electricity, Wi-Fi, Water & LPG' },
      cat_transport: { pct: 0.06, type: 'NEEDS', note: 'Fuel, public transit & commute' },
      cat_healthcare: { pct: 0.04, type: 'NEEDS', note: 'Medicines & preventive health' },
      cat_investments: { pct: 0.15, type: 'SAVINGS', note: 'Long-term Mutual Funds / PPF' },
      cat_financial: { pct: 0.10, type: 'SAVINGS', note: 'Emergency fund & Goal SIP' },
      cat_shopping: { pct: 0.07, type: 'WANTS', note: 'Clothing & lifestyle' },
      cat_entertainment: { pct: 0.05, type: 'WANTS', note: 'Dining out, movies & OTT' },
      cat_personal: { pct: 0.05, type: 'WANTS', note: 'Family & miscellaneous personal' },
      cat_education: { pct: 0.05, type: 'NEEDS', note: 'Self-improvement & learning' },
    };
  }

  const categoryLookup = new Map<string, Category>(DEFAULT_CATEGORIES.map((c) => [c.id, c]));

  let needsTotal = 0;
  let wantsTotal = 0;
  let savingsTotal = 0;

  const categories: RecommendedCategoryBudget[] = Object.entries(weights).map(([catId, cfg]) => {
    const meta = categoryLookup.get(catId);
    const amount = Math.round(safeIncome * cfg.pct);
    const minAmount = Math.round(amount * 0.85);
    const maxAmount = Math.round(amount * 1.15);

    if (cfg.type === 'NEEDS') needsTotal += amount;
    else if (cfg.type === 'WANTS') wantsTotal += amount;
    else savingsTotal += amount;

    return {
      categoryId: catId,
      categoryName: meta?.name || catId,
      icon: meta?.icon || '📦',
      color: meta?.color || '#6366F1',
      type: cfg.type,
      percentage: Number((cfg.pct * 100).toFixed(1)),
      recommendedAmount: amount,
      minAmount,
      maxAmount,
      guidance: cfg.note,
    };
  });

  const totalAllocated = needsTotal + wantsTotal + savingsTotal;

  const keyAdvice: string[] = [
    `At ${formatINR(safeIncome)} monthly income, limit Housing/Rent strictly to ${formatINR(safeIncome * 0.30)} to avoid house-poor stress.`,
    `Automate your ${formatINR(savingsTotal)} monthly savings on salary day via recurring SIP / auto-debit before spending on lifestyle.`,
    `Cap Swiggy/Zomato/Dining and shopping to a combined maximum of ${formatINR(wantsTotal)}/month.`,
  ];

  return {
    income: safeIncome,
    profile,
    profileName,
    profileDescription,
    totalAllocated,
    needsTotal,
    needsPercentage: safeIncome > 0 ? Number(((needsTotal / safeIncome) * 100).toFixed(1)) : 0,
    wantsTotal,
    wantsPercentage: safeIncome > 0 ? Number(((wantsTotal / safeIncome) * 100).toFixed(1)) : 0,
    savingsTotal,
    savingsPercentage: safeIncome > 0 ? Number(((savingsTotal / safeIncome) * 100).toFixed(1)) : 0,
    categories,
    keyAdvice,
  };
}

/**
 * Scans actual transaction history to detect money leaks, micro-transactions, and budgeting anomalies
 */
export function analyzeSpendingLeaks(
  transactions: Transaction[],
  income: number,
  budgetLimits?: Record<string, number>
): SpendingLeak[] {
  const leaks: SpendingLeak[] = [];
  const safeIncome = Math.max(1, income);

  let miscTotal = 0;
  let foodDeliveryTotal = 0;
  let microUpiTotal = 0;
  let microUpiCount = 0;
  let rentTotal = 0;
  const subscriptionTracker = new Map<string, number>();

  for (const tx of transactions) {
    const absAmt = Math.abs(tx.amount);

    if (tx.type === 'EXPENSE') {
      // 1. Uncategorized / Miscellaneous Leak
      if (tx.categoryId === 'cat_misc' || !tx.categoryId) {
        miscTotal += absAmt;
      }

      // 2. Food Delivery Leak (Swiggy, Zomato, etc.)
      const descLower = (tx.merchantName || tx.description || '').toLowerCase();
      if (
        descLower.includes('swiggy') ||
        descLower.includes('zomato') ||
        descLower.includes('eats') ||
        tx.subcategoryId === 'sub_delivery'
      ) {
        foodDeliveryTotal += absAmt;
      }

      // 3. High-Frequency Micro-UPI Spends (₹20 to ₹250)
      if (tx.paymentMethod === 'UPI' && absAmt >= 20 && absAmt <= 250) {
        microUpiTotal += absAmt;
        microUpiCount++;
      }

      // 4. Rent Check
      if (tx.categoryId === 'cat_housing' || descLower.includes('rent')) {
        rentTotal += absAmt;
      }

      // 5. Subscriptions
      if (tx.categoryId === 'cat_entertainment' || descLower.includes('netflix') || descLower.includes('prime') || descLower.includes('spotify') || descLower.includes('hotstar')) {
        const key = descLower.slice(0, 10);
        subscriptionTracker.set(key, (subscriptionTracker.get(key) || 0) + absAmt);
      }
    }
  }

  // Check 1: Miscellaneous / Untracked Leak
  if (miscTotal > 0 && (miscTotal / safeIncome) > 0.05) {
    leaks.push({
      id: 'leak_misc',
      title: 'High Uncategorized / Miscellaneous Spending',
      severity: miscTotal / safeIncome > 0.10 ? 'HIGH' : 'MEDIUM',
      category: 'Uncategorized',
      icon: '❓',
      monthlyImpact: miscTotal,
      annualImpact: miscTotal * 12,
      description: `You have spent ${formatINR(miscTotal)} this period on unclassified or miscellaneous expenses (${((miscTotal / safeIncome) * 100).toFixed(0)}% of income).`,
      recommendation: 'Assign merchant rules or categories to these transactions. Tracking where money leaks stops 30-40% of accidental impulse spending.',
    });
  }

  // Check 2: Micro-UPI Accumulation Leak
  if (microUpiCount >= 10 && microUpiTotal > 2000) {
    leaks.push({
      id: 'leak_micro_upi',
      title: 'High-Frequency Small UPI Payments Leak',
      severity: microUpiTotal > 5000 ? 'HIGH' : 'MEDIUM',
      category: 'Daily Micro-Spends',
      icon: '📱',
      monthlyImpact: microUpiTotal,
      annualImpact: microUpiTotal * 12,
      description: `${microUpiCount} small UPI transactions (tea, snacks, quick deliveries of ₹20-₹250) added up to ${formatINR(microUpiTotal)} this month.`,
      recommendation: 'Set a dedicated weekly UPI allowance in a secondary account or UPI Lite wallet to cap daily frictionless impulse payments.',
    });
  }

  // Check 3: Food Delivery & Quick Commerce Surge
  if (foodDeliveryTotal > 0 && (foodDeliveryTotal / safeIncome) > 0.08) {
    leaks.push({
      id: 'leak_food_delivery',
      title: 'Excessive Food Delivery / Swiggy / Zomato',
      severity: foodDeliveryTotal / safeIncome > 0.15 ? 'HIGH' : 'MEDIUM',
      category: 'Food Delivery',
      icon: '🍔',
      monthlyImpact: foodDeliveryTotal,
      annualImpact: foodDeliveryTotal * 12,
      description: `Food delivery total is ${formatINR(foodDeliveryTotal)} (${((foodDeliveryTotal / safeIncome) * 100).toFixed(0)}% of income).`,
      recommendation: `Cooking home meals 3 extra days per week can save approximately ${formatINR(foodDeliveryTotal * 0.5)} every month.`,
    });
  }

  // Check 4: Rent Overstretch
  if (rentTotal > 0 && (rentTotal / safeIncome) > 0.35) {
    leaks.push({
      id: 'leak_rent_high',
      title: 'Housing / Rent Cost Overstretch',
      severity: 'HIGH',
      category: 'Housing',
      icon: '🏠',
      monthlyImpact: rentTotal,
      annualImpact: rentTotal * 12,
      description: `Your rent is ${formatINR(rentTotal)}, which is ${((rentTotal / safeIncome) * 100).toFixed(0)}% of your take-home pay (Recommended: < 30%).`,
      recommendation: 'When your lease renews, consider roommate sharing, moving slightly outward, or negotiating rent to avoid feeling house-poor.',
    });
  }

  return leaks;
}

/**
 * Generates comprehensive mentorship advice and monthly action plan
 */
export function generateMentorshipAdvice(input: MentorshipInput): MentorshipReport {
  const { income, monthlyExpenses, transactions, debts, goals, bankBalance = 0 } = input;
  const safeIncome = Math.max(0, income);
  const savings = Math.max(0, safeIncome - monthlyExpenses);
  const savingsRate = safeIncome > 0 ? (savings / safeIncome) * 100 : 0;

  const totalOutstandingDebt = debts.reduce((sum, d) => sum + d.outstandingAmount, 0);
  const totalMonthlyEmi = debts.reduce((sum, d) => sum + d.monthlyEmi, 0);
  const dti = safeIncome > 0 ? (totalMonthlyEmi / safeIncome) * 100 : 0;

  const essentialMonthlyExpenses = Math.max(1, monthlyExpenses * 0.7);
  const targetEmergencyFund = essentialMonthlyExpenses * 6;
  const monthsCovered = essentialMonthlyExpenses > 0 ? bankBalance / essentialMonthlyExpenses : 0;

  const leaks = analyzeSpendingLeaks(transactions, safeIncome);

  let overallVerdict: MentorshipReport['overallVerdict'] = 'GOOD';
  let headline = 'Healthy Financial Trajectory';
  let summary = `Your savings rate is ${savingsRate.toFixed(1)}% and your debt burden is manageable. Focus on building consistency and hitting your financial goals.`;

  if (safeIncome === 0) {
    overallVerdict = 'NEEDS_OPTIMIZATION';
    headline = 'Let’s Set Up Your Income Profile';
    summary = 'Input your monthly take-home salary to generate a personalized Indian budget and savings roadmap.';
  } else if (savingsRate < 10 || dti > 40) {
    overallVerdict = 'CRITICAL';
    headline = 'Urgent Optimization Required';
    summary = `You are saving only ${savingsRate.toFixed(1)}% of your income, with ${dti.toFixed(1)}% committed to EMIs. Immediate reductions in discretionary spending are necessary.`;
  } else if (savingsRate < 20 || leaks.length >= 2) {
    overallVerdict = 'NEEDS_OPTIMIZATION';
    headline = 'High Optimization Potential Found';
    summary = `Plugging the detected spending leaks can boost your monthly savings by ${formatINR(leaks.reduce((s, l) => s + l.monthlyImpact, 0))}/month.`;
  } else if (savingsRate >= 35 && dti < 20) {
    overallVerdict = 'EXCELLENT';
    headline = 'Outstanding Financial Discipline! 🌟';
    summary = `You are saving ${savingsRate.toFixed(1)}% of your salary with healthy debt levels. You are in the top tier of Indian personal wealth builders!`;
  }

  // Construct Action Checklist
  const actionChecklist: MentorshipReport['actionChecklist'] = [];

  // Step 1: Emergency Fund
  if (monthsCovered < 3) {
    const monthlyAlloc = Math.round(safeIncome * 0.15);
    actionChecklist.push({
      step: 1,
      title: 'Build a 3-Month Liquid Emergency Cushion',
      impactRupees: monthlyAlloc,
      priority: 'HIGH',
      actionText: `Set up a monthly recurring auto-debit of ${formatINR(monthlyAlloc)} into a high-yield liquid fund or sweep-in FD until you reach ${formatINR(essentialMonthlyExpenses * 3)}.`,
    });
  }

  // Step 2: Plug top leak
  if (leaks.length > 0) {
    const topLeak = leaks[0];
    actionChecklist.push({
      step: actionChecklist.length + 1,
      title: `Plug ${topLeak.title}`,
      impactRupees: topLeak.monthlyImpact,
      priority: 'HIGH',
      actionText: topLeak.recommendation,
    });
  }

  // Step 3: Debt Payoff
  if (debts.length > 0) {
    const highestInterestDebt = [...debts].sort((a, b) => b.interestRate - a.interestRate)[0];
    actionChecklist.push({
      step: actionChecklist.length + 1,
      title: `Target High-Interest Loan (${highestInterestDebt.name})`,
      impactRupees: highestInterestDebt.monthlyEmi,
      priority: 'HIGH',
      actionText: `Prepay an additional ₹2,000–₹5,000/month on ${highestInterestDebt.name} (${highestInterestDebt.interestRate}% interest) using the debt avalanche strategy to save massive interest.`,
    });
  }

  // Step 4: Wealth Creation SIP
  const recommendedSip = Math.round(safeIncome * 0.15);
  actionChecklist.push({
    step: actionChecklist.length + 1,
    title: 'Automate Salary-Day Mutual Fund SIP',
    impactRupees: recommendedSip,
    priority: 'MEDIUM',
    actionText: `Automate a ${formatINR(recommendedSip)}/month Nifty 50 Index / Flexicap SIP on the 2nd of every month right after salary credit.`,
  });

  // Step 5: Rent & Fixed Cost Review
  actionChecklist.push({
    step: actionChecklist.length + 1,
    title: 'Review Fixed Subscriptions & Utilities',
    impactRupees: 1500,
    priority: 'LOW',
    actionText: 'Audit unused OTT apps, switch annual broadband plans for discounts, and ensure electricity bill optimization.',
  });

  return {
    overallVerdict,
    headline,
    summary,
    income: safeIncome,
    effectiveSavingsRate: Number(savingsRate.toFixed(1)),
    emergencyFundStatus: {
      current: bankBalance,
      target: targetEmergencyFund,
      monthsCovered: Number(monthsCovered.toFixed(1)),
      status: monthsCovered >= 6 ? 'OPTIMAL' : monthsCovered >= 3 ? 'BUILDING' : 'CRITICAL',
      advice:
        monthsCovered >= 6
          ? 'Full 6-month safety net achieved.'
          : `You have ${monthsCovered.toFixed(1)} months of emergency buffer. Target is 6 months (${formatINR(targetEmergencyFund)}).`,
    },
    debtBurden: {
      totalOutstanding: totalOutstandingDebt,
      monthlyEmi: totalMonthlyEmi,
      dtiPercentage: Number(dti.toFixed(1)),
      isHealthy: dti < 30,
      advice:
        dti === 0
          ? 'Zero debt! Complete financial freedom.'
          : dti <= 30
          ? 'EMI burden is within safe limits (<30%).'
          : `High EMI load of ${dti.toFixed(1)}%. Avoid new EMIs until existing loans are paid down.`,
    },
    leaks,
    actionChecklist,
  };
}

/**
 * Interactive Indian Financial Advisor Q&A with real numerical calculation
 */
export function askFinanceMentor(query: string, context: MentorshipInput): FinancialAdviceResponse {
  const q = query.toLowerCase();
  const income = context.income || 50000;
  const expenses = context.monthlyExpenses || 35000;
  const debts = context.debts || [];
  const goals = context.goals || [];

  // Query 1: ₹50K salary budgeting / general salary budgeting
  if (q.includes('50k') || q.includes('50,000') || q.includes('budget my income') || q.includes('plan my salary') || q.includes('how to budget')) {
    const rentBudget = Math.round(income * 0.25);
    const groceryBudget = Math.round(income * 0.10);
    const milkBudget = Math.round(income * 0.03);
    const savingsBudget = Math.round(income * 0.20);
    const diningBudget = Math.round(income * 0.05);

    return {
      answer: `Here is the mathematically optimal Indian budget breakdown for your ${formatINR(income)} monthly income:`,
      recommendations: [
        `🏠 **Rent / Housing**: Limit to **${formatINR(rentBudget)} - ${formatINR(income * 0.30)}** (25-30%). Never exceed ₹15,000.`,
        `🛒 **Groceries**: Allocate **${formatINR(groceryBudget)}** (10%) for supermarket, vegetables & staples.`,
        `🥛 **Milk & Daily Essentials**: Allocate **${formatINR(milkBudget)}** (3%) for daily dairy & bread.`,
        `⚡ **Utilities & Wi-Fi**: Allocate **${formatINR(Math.round(income * 0.05))}** (5%) for electricity, gas & broadband.`,
        `🍔 **Dining Out / Swiggy**: Cap strictly at **${formatINR(diningBudget)}** (5%).`,
        `💰 **Emergency & Wealth SIP**: Automate **${formatINR(savingsBudget)}** (20%) directly on salary day!`,
      ],
      calculatedNumbers: {
        'Rent (25%)': formatINR(rentBudget),
        'Groceries (10%)': formatINR(groceryBudget),
        'Milk/Daily (3%)': formatINR(milkBudget),
        'Utilities (5%)': formatINR(Math.round(income * 0.05)),
        'Savings & SIP (20%)': formatINR(savingsBudget),
      },
      suggestedAction: 'Click "Auto-Plan with Mentor" on the Budgets page to apply these limits directly to your monthly tracker.',
    };
  }

  // Query 2: Cutting down food / Swiggy / grocery expenses
  if (q.includes('food') || q.includes('swiggy') || q.includes('zomato') || q.includes('grocery') || q.includes('groceries') || q.includes('miscellaneous')) {
    return {
      answer: `To eliminate food and miscellaneous expenditure leaks from your budget:`,
      recommendations: [
        `Separate grocery shopping into a weekly budget (e.g. ₹1,200/week) at DMart/local market instead of daily impulse orders on quick-commerce apps.`,
        `Cap food delivery apps (Swiggy/Zomato) to 1-2 designated weekend days per week with a hard ₹2,500/month cap.`,
        `For daily tea, coffee, and small snacks, set a weekly cash or UPI Lite wallet of ₹500 to stop endless small ₹30-₹100 debits.`,
        `Review all "Miscellaneous" items weekly and reassign them to specific categories to uncover hidden waste.`,
      ],
      calculatedNumbers: {
        'Potential Monthly Savings': formatINR(Math.round(income * 0.08)),
        'Potential Annual Savings': formatINR(Math.round(income * 0.08 * 12)),
      },
      suggestedAction: 'Check the Spending Leaks card below to see your detected food delivery and micro-UPI totals.',
    };
  }

  // Query 3: Emergency Fund guidance
  if (q.includes('emergency') || q.includes('savings') || q.includes('safety')) {
    const essential = Math.max(1, expenses * 0.7);
    const target3M = essential * 3;
    const target6M = essential * 6;
    return {
      answer: `Your Emergency Fund target based on your current monthly living expenses of ${formatINR(expenses)}:`,
      recommendations: [
        `**Phase 1 (Essential 3-Month Cushion)**: Target **${formatINR(target3M)}**.`,
        `**Phase 2 (Full 6-Month Safety Net)**: Target **${formatINR(target6M)}**.`,
        `Keep 50% in a separate savings account / sweep-in FD and 50% in an ultra-short duration / liquid mutual fund for instant UPI/ATM liquidity.`,
        `Never invest emergency funds in equity stocks or locked-in tax-saving schemes.`,
      ],
      calculatedNumbers: {
        '3-Month Target': formatINR(target3M),
        '6-Month Target': formatINR(target6M),
        'Recommended Monthly SIP': formatINR(Math.round(income * 0.15)),
      },
    };
  }

  // Query 4: Debt vs Investment (Prepay Loan or Invest?)
  if (q.includes('debt') || q.includes('loan') || q.includes('prepay') || q.includes('emi') || q.includes('invest')) {
    return {
      answer: `How to prioritize between paying off loans vs investing in Mutual Funds:`,
      recommendations: [
        `**Credit Cards & Personal Loans (> 13% interest)**: Always prepay aggressively before investing, as no guaranteed investment beats 14-36% interest.`,
        `**Car & Bike Loans (8.5% - 10.5% interest)**: Prepay partially by paying 1 extra EMI per year, but maintain your core equity SIPs simultaneously.`,
        `**Home Loans (8.5% interest)**: Benefit from Section 24b/80C tax deductions; a balanced 50% prepay / 50% SIP strategy is mathematically optimal.`,
      ],
      calculatedNumbers: {
        'Active Monthly EMIs': formatINR(debts.reduce((s, d) => s + d.monthlyEmi, 0)),
        'Total Outstanding Debt': formatINR(debts.reduce((s, d) => s + d.outstandingAmount, 0)),
      },
    };
  }

  // Generic fallback
  const plan = calculateRecommendedBudget(income, 'BALANCED_50_30_20');
  return {
    answer: `Based on your monthly income profile of ${formatINR(income)}:`,
    recommendations: [
      `Maintain 50% (${formatINR(plan.needsTotal)}) for fixed essentials like Rent, Groceries, Utilities, and Commute.`,
      `Dedicate 20-30% (${formatINR(plan.savingsTotal)}) for emergency buffer and automated wealth creation.`,
      `Cap lifestyle, dining out, and discretionary wants to 20% (${formatINR(plan.wantsTotal)}).`,
      `Track every UPI transaction regularly to prevent unnoticed miscellaneous leaks.`,
    ],
    calculatedNumbers: {
      'Recommended Savings': formatINR(plan.savingsTotal),
      'Essential Needs Cap': formatINR(plan.needsTotal),
      'Wants & Lifestyle Cap': formatINR(plan.wantsTotal),
    },
  };
}
