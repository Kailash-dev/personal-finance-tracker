export type TransactionType =
  | 'EXPENSE'
  | 'INCOME'
  | 'TRANSFER'
  | 'INVESTMENT'
  | 'DEBT_PAYMENT'
  | 'REFUND'
  | 'REVERSAL'
  | 'CASH_WITHDRAWAL';

export type PaymentMethod =
  | 'UPI'
  | 'NET_BANKING'
  | 'DEBIT_CARD'
  | 'CREDIT_CARD'
  | 'CASH'
  | 'NEFT'
  | 'IMPS'
  | 'RTGS'
  | 'AUTO_DEBIT'
  | 'CHEQUE'
  | 'OTHER';

export type AccountType =
  | 'SAVINGS'
  | 'CURRENT'
  | 'SALARY'
  | 'CREDIT_CARD'
  | 'CASH'
  | 'INVESTMENT'
  | 'LOAN'
  | 'WALLET';

export type BankName =
  | 'HDFC'
  | 'SBI'
  | 'ICICI'
  | 'AXIS'
  | 'KOTAK'
  | 'INDUSIND'
  | 'PNB'
  | 'BANK_OF_BARODA'
  | 'CANARA'
  | 'FEDERAL'
  | 'OTHER';

export type TransactionSource = 'MANUAL' | 'BANK_PDF' | 'CSV' | 'RECURRING' | 'IMPORT';

export type ImportStatus = 'PENDING_REVIEW' | 'CONFIRMED' | 'REJECTED';

export type GoalCategory =
  | 'BANK_BALANCE'
  | 'EMERGENCY_FUND'
  | 'VEHICLE_CAR'
  | 'VEHICLE_BIKE'
  | 'HOUSE_PURCHASE'
  | 'RETIREMENT'
  | 'VACATION'
  | 'GOLD'
  | 'CUSTOM';

export type DebtType =
  | 'RENT_HOUSING'
  | 'GROCERIES_FOOD'
  | 'MILK_DAIRY'
  | 'UTILITIES_BILLS'
  | 'MAID_COOK'
  | 'FUEL_TRANSPORT'
  | 'FAMILY_PERSONAL'
  | 'CHIT_FUND_VC'
  | 'BIKE_LOAN'
  | 'CAR_LOAN'
  | 'CREDIT_CARD_MIN_PAYMENT'
  | 'PERSONAL_BORROWING'
  | 'HOME_LOAN'
  | 'PERSONAL_LOAN'
  | 'EDUCATION_LOAN'
  | 'FRIENDS_FAMILY'
  | 'OTHER_OUTGOING';



export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface User {
  id: string;
  email: string;
  name: string;
  monthlyIncome?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  bank?: BankName | string;
  accountNumberMasked?: string;
  currentBalance: number;
  openingBalance: number;
  currency: string;
  creditLimit?: number;
  availableLimit?: number;
  statementDate?: number; // Day of month (1-31)
  dueDate?: number; // Day of month (1-31)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
  isEssential: boolean;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId?: string; // For transfers
  categoryId: string;
  subcategoryId?: string;
  date: string; // YYYY-MM-DD
  description: string;
  merchantName?: string;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  source: TransactionSource;
  referenceNumber?: string;
  balanceAfter?: number;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  importId?: string;
  createdAt: string;
  updatedAt: string;

  // Populated fields
  account?: Account;
  toAccount?: Account;
  category?: Category;
  subcategory?: Subcategory;
}

export interface MerchantRule {
  id: string;
  userId: string;
  pattern: string; // Regex or keyword
  merchantName: string;
  categoryId: string;
  subcategoryId?: string;
  defaultType?: TransactionType;
  confidenceScore: number; // 0.0 - 1.0
  isRegex?: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  totalAmount: number;
  items: BudgetItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  categoryId: string;
  amount: number;
  category?: Category;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string; // YYYY-MM-DD
  monthlyContribution?: number;
  accountId?: string;
  isCompleted: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Debt {
  id: string;
  userId: string;
  name: string;
  lender: string;
  type: DebtType;
  originalAmount: number;
  outstandingAmount: number;
  interestRate: number; // Annual % (e.g., 8.5)
  monthlyEmi: number;
  startDate: string;
  endDate?: string;
  dueDay: number; // 1-31
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BorrowingType = 'BORROWED' | 'LENT';
export type BorrowingStatus = 'PENDING' | 'PARTIALLY_PAID' | 'SETTLED';

export interface Borrowing {
  id: string;
  userId: string;
  type: BorrowingType; // BORROWED (I owe money) vs LENT (Money owed to me)
  personName: string;
  amount: number;
  amountSettled: number;
  borrowDate: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  carryForwardMonth?: string; // YYYY-MM (e.g., 2026-10)
  rolloverCount?: number;
  status: BorrowingStatus;
  purpose?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type IncomeStreamType = 'SALARY_JOB' | 'FREELANCE' | 'CONSULTING' | 'BUSINESS' | 'RENTAL' | 'DIVIDEND' | 'OTHER';

export interface IncomeStream {
  id: string;
  userId: string;
  name: string;
  type: IncomeStreamType;
  expectedAmount: number;
  expectedDay: number; // Day of month (1-31)
  isGuaranteed: boolean;
  clientOrEmployer: string;
  status: 'EXPECTED' | 'RECEIVED' | 'DELAYED';
  notes?: string;
}

export interface CibilProfile {
  estimatedScore: number;
  targetScore: number;
  creditUtilizationRatio: number; // % (e.g. 76%)
  totalCreditLimit: number;
  totalCreditUtilized: number;
  onTimePaymentStreakMonths: number;
  settledAccountsCount: number;
  highInterestDebtTotal: number;
  cibilStatus: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  recommendations: string[];
}


export interface RecurringTransaction {
  id: string;
  userId: string;
  name: string;
  amount: number;
  type: TransactionType;
  frequency: RecurringFrequency;
  categoryId: string;
  subcategoryId?: string;
  accountId: string;
  startDate: string;
  endDate?: string;
  dueDay?: number;
  isActive: boolean;
  lastRunDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankImport {
  id: string;
  userId: string;
  accountId: string;
  fileName: string;
  bankName: BankName | string;
  periodStart?: string;
  periodEnd?: string;
  totalParsed: number;
  totalCategorized: number;
  status: ImportStatus;
  transactions?: BankImportTransaction[];
  createdAt: string;
}

export interface BankImportTransaction {
  id: string;
  importId: string;
  date: string;
  description: string;
  referenceNumber?: string;
  amount: number;
  type: TransactionType;
  paymentMethod: PaymentMethod;
  balanceAfter?: number;
  categoryId?: string;
  subcategoryId?: string;
  confidence: number;
  isDuplicate?: boolean;
  duplicateReason?: string;
  isSkipped?: boolean;
  rawText?: string;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number; // Percentage (e.g., 39.5%)
  totalEmi: number;
  totalDebt: number;
  bankBalance: number;
  budgetUtilization?: number;
  topCategories: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
}

export interface FinancialHealthScore {
  totalScore: number; // 0-100
  rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_ATTENTION' | 'CRITICAL';
  factors: {
    savingsScore: number; // 0-100
    debtScore: number; // 0-100
    emergencyFundScore: number; // 0-100
    budgetScore: number; // 0-100
    goalScore: number; // 0-100
  };
  details: {
    savingsRate: number;
    debtToIncomeRatio: number;
    emergencyMonthsCovered: number;
    budgetAdherencePct: number;
    goalOnTrackPct: number;
  };
  insights: string[];
}

export interface MonthlyReconciliation {
  month: string;
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netTransfers: number;
  expectedClosingBalance: number;
  actualClosingBalance: number;
  difference: number;
  isReconciled: boolean;
}
