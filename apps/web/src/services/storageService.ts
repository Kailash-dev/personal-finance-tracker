import {
  User,
  Account,
  Transaction,
  Category,
  Budget,
  Goal,
  Debt,
  MerchantRule,
  RecurringTransaction,
  BankImport,
  Borrowing,
  IncomeStream,
  CibilProfile,
} from '@personal-finance/types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MERCHANT_RULES,
  categorizeTransaction,
  checkDuplicateTransaction,
  calculateFinancialHealthScore,
  calculateGoalProjection,
  calculateDebtSummary,
  calculateMonthlyReconciliation,
  calculateCibilAnalysis,
  calculateIncomeSummary,
  formatINR,
} from '@personal-finance/shared';

const STORAGE_KEYS = {
  USER: 'rupeetrack_user',
  ACCOUNTS: 'rupeetrack_accounts',
  TRANSACTIONS: 'rupeetrack_transactions',
  CATEGORIES: 'rupeetrack_categories',
  BUDGETS: 'rupeetrack_budgets',
  GOALS: 'rupeetrack_goals',
  DEBTS: 'rupeetrack_debts',
  BORROWINGS: 'rupeetrack_borrowings',
  INCOME_STREAMS: 'rupeetrack_income_streams',
  RECURRING: 'rupeetrack_recurring',
  RULES: 'rupeetrack_rules',
  IMPORTS: 'rupeetrack_imports',
  THEME: 'rupeetrack_theme',
};

class StorageService {
  constructor() {
    this.initDefaults();
  }

  private initDefaults() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem('rupeetrack_kailash_finplan_v3')) {
      this.seedKailashFinanceData();
      return;
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEBTS)) {
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BORROWINGS)) {
      localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECURRING)) {
      localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.RULES)) {
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(DEFAULT_MERCHANT_RULES));
    }
  }

  seedKailashFinanceData() {
    const user: User = {
      id: 'user_kailash',
      name: 'Kailash',
      email: 'kailash@personal-finance.local',
      monthlyIncome: 50000,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const accounts: Account[] = [
      {
        id: 'acc_salary',
        userId: 'user_kailash',
        name: 'Primary Salary Bank Account',
        type: 'SALARY',
        bank: 'HDFC',
        accountNumberMasked: '•••• 4892',
        currentBalance: 1500,
        openingBalance: 1500,
        currency: 'INR',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_cash',
        userId: 'user_kailash',
        name: 'Cash in Hand / Wallet',
        type: 'CASH',
        bank: 'OTHER',
        accountNumberMasked: 'Cash',
        currentBalance: 500,
        openingBalance: 500,
        currency: 'INR',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'acc_sbi_card',
        userId: 'user_kailash',
        name: 'SBI Credit Card',
        type: 'CREDIT_CARD',
        bank: 'SBI',
        accountNumberMasked: '•••• 7120',
        currentBalance: -38000,
        openingBalance: -38000,
        creditLimit: 50000,
        dueDate: 28,
        currency: 'INR',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const debts: Debt[] = [
      {
        id: 'debt_ram_fincorp',
        userId: 'user_kailash',
        name: 'Ram Fincorp Small Borrowing',
        lender: 'Ram Fincorp',
        type: 'PERSONAL_BORROWING',
        originalAmount: 16650,
        outstandingAmount: 16650,
        monthlyEmi: 16650,
        interestRate: 0,
        startDate: '2026-08-09',
        dueDay: 9,
        notes: 'Due on 9th September (Fintech loan repayment)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_bike_emi',
        userId: 'user_kailash',
        name: 'Bike Loan Monthly EMI',
        lender: 'HDFC / Hero Fincorp',
        type: 'BIKE_LOAN',
        originalAmount: 150000,
        outstandingAmount: 85000,
        monthlyEmi: 6250,
        interestRate: 11.5,
        startDate: '2025-09-10',
        dueDay: 10,
        notes: 'Monthly bike loan EMI auto-debit on 10th',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_vc2_10th',
        userId: 'user_kailash',
        name: 'Chit Fund (VC 2) 10th Installment',
        lender: 'Local Chit Group',
        type: 'CHIT_FUND_VC',
        originalAmount: 50000,
        outstandingAmount: 22500,
        monthlyEmi: 4500,
        interestRate: 0,
        startDate: '2026-05-10',
        dueDay: 10,
        notes: 'Chit fund VC 2 monthly contribution on 10th',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_vc2_25th',
        userId: 'user_kailash',
        name: 'Chit Fund (VC 2) 25th Installment',
        lender: 'Local Chit Group',
        type: 'CHIT_FUND_VC',
        originalAmount: 100000,
        outstandingAmount: 47500,
        monthlyEmi: 9500,
        interestRate: 0,
        startDate: '2026-04-25',
        dueDay: 25,
        notes: 'Chit fund second installment due on 25th Sept',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_sbi_card',
        userId: 'user_kailash',
        name: 'SBI Credit Card Minimum Due',
        lender: 'SBI Card',
        type: 'CREDIT_CARD_MIN_PAYMENT',
        originalAmount: 45000,
        outstandingAmount: 38000,
        monthlyEmi: 12108,
        interestRate: 42.0,
        startDate: '2025-01-01',
        dueDay: 28,
        notes: 'SBI Credit Card minimum due for September',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_axis_settlement',
        userId: 'user_kailash',
        name: 'Axis Bank CC Settlement (Final 3 of 3)',
        lender: 'Axis Bank Collections',
        type: 'CREDIT_CARD_MIN_PAYMENT',
        originalAmount: 4200,
        outstandingAmount: 1400,
        monthlyEmi: 1400,
        interestRate: 0,
        startDate: '2026-07-15',
        dueDay: 15,
        notes: '3 installments of ₹1,400: 2 paid! 1 remaining in Sept to close card forever!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_personal_loan_3m',
        userId: 'user_kailash',
        name: 'Short-Term Personal Loan (2 of 3 Paid)',
        lender: 'NBFC / Bank',
        type: 'PERSONAL_LOAN',
        originalAmount: 21000,
        outstandingAmount: 7000,
        monthlyEmi: 7000,
        interestRate: 14.0,
        startDate: '2026-07-07',
        dueDay: 7,
        notes: '3-month short term loan. 2 EMIs paid (today 7th Sept paid ₹7,000). Only 1 EMI left next month!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_bajaj_mobile',
        userId: 'user_kailash',
        name: 'Bajaj Finserv Mobile EMI',
        lender: 'Bajaj Finance',
        type: 'PERSONAL_LOAN',
        originalAmount: 22800,
        outstandingAmount: 11400,
        monthlyEmi: 3800,
        interestRate: 0,
        startDate: '2026-06-12',
        dueDay: 12,
        notes: 'Mobile phone no-cost EMI on Bajaj Finserv',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_travel_emi',
        userId: 'user_kailash',
        name: 'Travel EMI (Ending 2nd Oct)',
        lender: 'Consumer Travel Loan',
        type: 'PERSONAL_LOAN',
        originalAmount: 15000,
        outstandingAmount: 2500,
        monthlyEmi: 2500,
        interestRate: 12.0,
        startDate: '2026-04-02',
        dueDay: 2,
        notes: 'Travel EMI ends permanently on 2nd Oct (Last EMI remaining)!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_broker_fee',
        userId: 'user_kailash',
        name: 'House Broker Fee (Shifted 4th Sept)',
        lender: 'Real Estate Broker',
        type: 'RENT_HOUSING',
        originalAmount: 4100,
        outstandingAmount: 4100,
        monthlyEmi: 4100,
        interestRate: 0,
        startDate: '2026-09-04',
        dueDay: 10,
        notes: 'Broker fee for new house shifted on 4th Sept (Due on Salary Day)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_wife_allowance',
        userId: 'user_kailash',
        name: 'Wife & Family Allowance',
        lender: 'Family Living',
        type: 'FAMILY_PERSONAL',
        originalAmount: 7000,
        outstandingAmount: 7000,
        monthlyEmi: 7000,
        interestRate: 0,
        startDate: '2026-09-01',
        dueDay: 10,
        notes: 'Wife personal and household allowance for September',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_groceries',
        userId: 'user_kailash',
        name: 'Monthly Groceries & Provisions',
        lender: 'D-Mart / Blinkit',
        type: 'GROCERIES_FOOD',
        originalAmount: 4000,
        outstandingAmount: 4000,
        monthlyEmi: 4000,
        interestRate: 0,
        startDate: '2026-09-01',
        dueDay: 10,
        notes: 'Essential groceries & food supplies for September',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const borrowings: Borrowing[] = [
      {
        id: 'bor_friend_5k',
        userId: 'user_kailash',
        personName: 'Friend / Personal Loan',
        amount: 5000,
        amountSettled: 0,
        borrowDate: '2026-09-04',
        dueDate: '2026-09-10',
        type: 'BORROWED',
        status: 'PENDING',
        purpose: 'Personal borrowing due on salary day 10th Sept',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bor_rajni_5k',
        userId: 'user_kailash',
        personName: 'Rajni Ji',
        amount: 5000,
        amountSettled: 0,
        borrowDate: '2026-09-04',
        dueDate: '2026-09-10',
        type: 'BORROWED',
        status: 'PENDING',
        purpose: 'Personal borrowing to repay on 10th Sept',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bor_relocation_10k',
        userId: 'user_kailash',
        personName: 'City Relocation Hand Loan',
        amount: 10000,
        amountSettled: 0,
        borrowDate: '2026-09-04',
        dueDate: '2026-10-10',
        type: 'BORROWED',
        status: 'PENDING',
        purpose: 'Shifted to new city on 4th Sept - to be paid in October',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const transactions: Transaction[] = [
      // --- AUGUST 2026 INCOME (CREDITED) ---
      {
        id: 'tx_aug_salary',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_income',
        subcategoryId: 'sub_salary',
        date: '2026-08-10',
        description: 'August 2026 Monthly Salary Credit',
        amount: 50000,
        type: 'INCOME',
        paymentMethod: 'NET_BANKING',
        source: 'MANUAL',
        notes: 'Full monthly salary credited on 10th August',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // --- AUGUST 2026 EMIS & DEBT PAYMENTS (DEBITED) ---
      {
        id: 'tx_aug_travel_emi',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_financial',
        subcategoryId: 'sub_emi_personal',
        date: '2026-08-02',
        description: 'Travel Loan EMI Auto-Debit (August)',
        amount: -2500,
        type: 'DEBT_PAYMENT',
        paymentMethod: 'AUTO_DEBIT',
        source: 'MANUAL',
        notes: 'Travel EMI auto-debited on 2nd August',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_personal_loan',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_financial',
        subcategoryId: 'sub_emi_personal',
        date: '2026-08-07',
        description: 'Short-Term Personal Loan EMI (1 of 3 Paid)',
        amount: -7000,
        type: 'DEBT_PAYMENT',
        paymentMethod: 'NET_BANKING',
        source: 'MANUAL',
        notes: '1st EMI of 3-month personal loan paid on 7th August',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_bike_emi',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_financial',
        subcategoryId: 'sub_emi_bike',
        date: '2026-08-10',
        description: 'Bike Loan Monthly EMI Auto-Debit (August)',
        amount: -6250,
        type: 'DEBT_PAYMENT',
        paymentMethod: 'AUTO_DEBIT',
        source: 'MANUAL',
        notes: 'Monthly bike EMI cleared on salary date',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_vc2_10th',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_financial',
        subcategoryId: 'sub_emi_personal',
        date: '2026-08-10',
        description: 'Chit Fund (VC 2) 10th Installment (August)',
        amount: -4500,
        type: 'DEBT_PAYMENT',
        paymentMethod: 'UPI',
        source: 'MANUAL',
        notes: 'Chit fund committee contribution paid via UPI on 10th August',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_mobile_emi',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_financial',
        subcategoryId: 'sub_emi_personal',
        date: '2026-08-12',
        description: 'Bajaj Finserv Mobile Phone EMI (August)',
        amount: -3800,
        type: 'DEBT_PAYMENT',
        paymentMethod: 'AUTO_DEBIT',
        source: 'MANUAL',
        notes: 'No-cost mobile phone EMI on Bajaj Finance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_axis_settlement',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_financial',
        subcategoryId: 'sub_credit_card_pay',
        date: '2026-08-15',
        description: 'Axis Bank CC Settlement (Installment 2 of 3 Paid)',
        amount: -1400,
        type: 'DEBT_PAYMENT',
        paymentMethod: 'NET_BANKING',
        source: 'MANUAL',
        notes: 'Second settlement installment of ₹1,400 cleared',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_vc2_25th',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_financial',
        subcategoryId: 'sub_emi_personal',
        date: '2026-08-25',
        description: 'Chit Fund (VC 2) 25th Installment (August)',
        amount: -9500,
        type: 'DEBT_PAYMENT',
        paymentMethod: 'UPI',
        source: 'MANUAL',
        notes: 'Second monthly chit fund installment paid on 25th August',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_sbi_card',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_financial',
        subcategoryId: 'sub_credit_card_pay',
        date: '2026-08-28',
        description: 'SBI Credit Card Minimum / Partial Due Repayment',
        amount: -12000,
        type: 'DEBT_PAYMENT',
        paymentMethod: 'NET_BANKING',
        source: 'MANUAL',
        notes: 'August credit card bill payment to maintain credit standing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // --- AUGUST 2026 LIVING & HOUSEHOLD EXPENSES (DEBITED) ---
      {
        id: 'tx_aug_house_rent',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_housing',
        subcategoryId: 'sub_rent',
        date: '2026-08-05',
        description: 'House Rent & Maintenance (August)',
        amount: -10000,
        type: 'EXPENSE',
        paymentMethod: 'NET_BANKING',
        source: 'MANUAL',
        notes: 'Previous residence flat rent paid for August',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_wife_allowance',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_family',
        subcategoryId: 'sub_childcare',
        date: '2026-08-10',
        description: 'Wife & Family Household Allowance (August)',
        amount: -7000,
        type: 'EXPENSE',
        paymentMethod: 'UPI',
        source: 'MANUAL',
        notes: 'Monthly family living allowance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_groceries',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_food',
        subcategoryId: 'sub_groceries',
        date: '2026-08-12',
        description: 'DMart Monthly Groceries & Staples (August)',
        amount: -4500,
        type: 'EXPENSE',
        paymentMethod: 'UPI',
        source: 'MANUAL',
        notes: 'Monthly staples, groceries & home provisions',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_utilities',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_utilities',
        subcategoryId: 'sub_electricity',
        date: '2026-08-15',
        description: 'Electricity & Utility Bills (August)',
        amount: -2200,
        type: 'EXPENSE',
        paymentMethod: 'UPI',
        source: 'MANUAL',
        notes: 'Power, water and piped gas bills for August',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_aug_fuel',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_transport',
        subcategoryId: 'sub_petrol',
        date: '2026-08-18',
        description: 'Petrol & Daily Commute Fuel (August)',
        amount: -2000,
        type: 'EXPENSE',
        paymentMethod: 'UPI',
        source: 'MANUAL',
        notes: 'Two-wheeler petrol refills during August',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      // --- SEPTEMBER 2026 TRANSACTIONS (CURRENT MONTH) ---
      {
        id: 'tx_personal_loan_today',
        userId: 'user_kailash',
        accountId: 'acc_salary',
        categoryId: 'cat_financial',
        subcategoryId: 'sub_emi_personal',
        date: '2026-09-07',
        description: 'Short-Term Personal Loan EMI (2 of 3 Paid Today)',
        amount: -7000,
        type: 'DEBT_PAYMENT',
        paymentMethod: 'NET_BANKING',
        source: 'MANUAL',
        notes: 'Personal loan EMI paid today on 7th Sept (2 of 3 EMIs completed, 1 remaining)!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const budgets: Budget[] = [
      {
        id: 'bgt_2026_08',
        userId: 'user_kailash',
        month: '2026-08',
        totalAmount: 50000,
        items: [
          { id: 'bi_aug_housing', budgetId: 'bgt_2026_08', categoryId: 'cat_housing', amount: 10000 },
          { id: 'bi_aug_food', budgetId: 'bgt_2026_08', categoryId: 'cat_food', amount: 4500 },
          { id: 'bi_aug_family', budgetId: 'bgt_2026_08', categoryId: 'cat_family', amount: 7000 },
          { id: 'bi_aug_financial', budgetId: 'bgt_2026_08', categoryId: 'cat_financial', amount: 24300 },
          { id: 'bi_aug_utilities', budgetId: 'bgt_2026_08', categoryId: 'cat_utilities', amount: 2200 },
          { id: 'bi_aug_transport', budgetId: 'bgt_2026_08', categoryId: 'cat_transport', amount: 2000 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bgt_2026_09',
        userId: 'user_kailash',
        month: '2026-09',
        totalAmount: 50000,
        items: [
          { id: 'bi_housing', budgetId: 'bgt_2026_09', categoryId: 'cat_housing', amount: 4100 },
          { id: 'bi_food', budgetId: 'bgt_2026_09', categoryId: 'cat_food', amount: 4000 },
          { id: 'bi_family', budgetId: 'bgt_2026_09', categoryId: 'cat_family', amount: 7000 },
          { id: 'bi_financial', budgetId: 'bgt_2026_09', categoryId: 'cat_financial', amount: 32000 },
          { id: 'bi_utilities', budgetId: 'bgt_2026_09', categoryId: 'cat_utilities', amount: 2900 },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const incomeStreams: IncomeStream[] = [
      {
        id: 'inc_freelance_1',
        userId: 'user_kailash',
        name: 'Freelance Tech & Consulting Work',
        type: 'FREELANCE',
        expectedAmount: 15000,
        expectedDay: 20,
        isGuaranteed: false,
        clientOrEmployer: 'Direct Clients / Upwork',
        status: 'EXPECTED',
        notes: 'Target side-income to accelerate debt payoff and bridge September cash gap',
      },
    ];

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(borrowings));
    localStorage.setItem(STORAGE_KEYS.INCOME_STREAMS, JSON.stringify(incomeStreams));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(DEFAULT_MERCHANT_RULES));
    localStorage.setItem('rupeetrack_kailash_finplan_v3', 'true');
  }

  // --- USER ---
  getUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw
      ? JSON.parse(raw)
      : {
          id: 'user_1',
          email: '',
          name: '',
          monthlyIncome: 0,
          currency: 'INR',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
  }

  updateUser(user: Partial<User>): User {
    const current = this.getUser();
    const updated = { ...current, ...user, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    return updated;
  }

  // --- ACCOUNTS ---
  getAccounts(): Account[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    let accounts: Account[] = raw ? JSON.parse(raw) : [];
    if (!accounts || accounts.length === 0) {
      this.seedKailashFinanceData();
      accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS) || '[]');
    }
    return accounts;
  }

  createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Account {
    const accounts = this.getAccounts();
    const newAcc: Account = {
      ...account,
      id: `acc_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    accounts.push(newAcc);
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    return newAcc;
  }

  updateAccount(id: string, updates: Partial<Account>): Account {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Account not found');
    accounts[idx] = { ...accounts[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    return accounts[idx];
  }

  // --- TRANSACTIONS ---
  getTransactions(filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
    type?: string;
    search?: string;
  }): Transaction[] {
    let raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    let txns: Transaction[] = raw ? JSON.parse(raw) : [];
    if (!txns || txns.length === 0) {
      this.seedKailashFinanceData();
      txns = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    }
    const accounts = this.getAccounts();
    const categories = this.getCategories();
    const accMap = new Map(accounts.map((a) => [a.id, a]));
    const catMap = new Map(categories.map((c) => [c.id, c]));

    txns = txns.map((t) => ({
      ...t,
      account: accMap.get(t.accountId),
      toAccount: t.toAccountId ? accMap.get(t.toAccountId) : undefined,
      category: catMap.get(t.categoryId),
    }));

    if (filters?.startDate) {
      txns = txns.filter((t) => t.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      txns = txns.filter((t) => t.date <= filters.endDate!);
    }
    if (filters?.categoryId) {
      txns = txns.filter((t) => t.categoryId === filters.categoryId);
    }
    if (filters?.accountId) {
      txns = txns.filter((t) => t.accountId === filters.accountId || t.toAccountId === filters.accountId);
    }
    if (filters?.type) {
      txns = txns.filter((t) => t.type === filters.type);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      txns = txns.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.merchantName?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.referenceNumber?.toLowerCase().includes(q)
      );
    }

    return txns.sort((a, b) => b.date.localeCompare(a.date));
  }

  createTransaction(txData: {
    accountId: string;
    toAccountId?: string;
    categoryId?: string;
    subcategoryId?: string;
    date: string;
    description: string;
    amount: number;
    type?: any;
    paymentMethod?: any;
    referenceNumber?: string;
    notes?: string;
  }): Transaction {
    const user = this.getUser();
    const rules = this.getRules();
    let finalCategoryId = txData.categoryId;
    let finalSubcategoryId = txData.subcategoryId;
    let finalType = txData.type;

    if (!finalCategoryId) {
      const catRes = categorizeTransaction(txData.description, txData.amount, rules as any);
      finalCategoryId = catRes.categoryId;
      finalSubcategoryId = catRes.subcategoryId;
      finalType = finalType || catRes.type;
    }

    // Ensure account exists
    let accounts = this.getAccounts();
    if (accounts.length === 0) {
      const defaultAcc = this.createAccount({
        userId: user.id,
        name: 'Primary Bank Account',
        type: 'SAVINGS',
        bank: 'HDFC',
        accountNumberMasked: '•••• 1234',
        currentBalance: 0,
        openingBalance: 0,
        currency: 'INR',
        isActive: true,
      });
      txData.accountId = defaultAcc.id;
      accounts = this.getAccounts();
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      accountId: txData.accountId || accounts[0]?.id || 'acc_primary',
      toAccountId: txData.toAccountId,
      categoryId: finalCategoryId || 'cat_misc',
      subcategoryId: finalSubcategoryId,
      date: txData.date,
      description: txData.description,
      amount: txData.amount,
      type: finalType || (txData.amount < 0 ? 'EXPENSE' : 'INCOME'),
      paymentMethod: txData.paymentMethod || 'UPI',
      source: 'MANUAL',
      referenceNumber: txData.referenceNumber,
      notes: txData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const txns = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    txns.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));

    // Update account balance
    const accIdx = accounts.findIndex((a) => a.id === newTx.accountId);
    if (accIdx !== -1) {
      accounts[accIdx].currentBalance += newTx.amount;
      if (accounts[accIdx].type === 'CREDIT_CARD' && accounts[accIdx].creditLimit) {
        accounts[accIdx].availableLimit = (accounts[accIdx].creditLimit || 0) + accounts[accIdx].currentBalance;
      }
    }

    if (txData.toAccountId && txData.type === 'TRANSFER') {
      const toIdx = accounts.findIndex((a) => a.id === txData.toAccountId);
      if (toIdx !== -1) {
        accounts[toIdx].currentBalance += Math.abs(txData.amount);
      }
    }

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    return newTx;
  }

  deleteTransaction(id: string): void {
    let txns: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const tx = txns.find((t) => t.id === id);
    if (!tx) return;

    txns = txns.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));

    // Revert account balance
    const accounts = this.getAccounts();
    const accIdx = accounts.findIndex((a) => a.id === tx.accountId);
    if (accIdx !== -1) {
      accounts[accIdx].currentBalance -= tx.amount;
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    }
  }

  // --- CATEGORIES & RULES ---
  getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  }

  getRules(): MerchantRule[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES);
    return raw ? JSON.parse(raw) : (DEFAULT_MERCHANT_RULES as any);
  }

  addCustomRule(rule: Omit<MerchantRule, 'id' | 'createdAt'>): MerchantRule {
    const rules = this.getRules();
    const newRule: MerchantRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    rules.unshift(newRule);
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
    return newRule;
  }

  // --- BUDGETS ---
  getBudgets(): Budget[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return raw ? JSON.parse(raw) : [];
  }

  getBudgetForMonth(month: string): Budget | null {
    const budgets = this.getBudgets();
    let b = budgets.find((item) => item.month === month);
    if (!b && budgets.length > 0) {
      // Clone latest budget for this month
      const latest = budgets[budgets.length - 1];
      b = {
        id: `budget_${month}`,
        userId: latest.userId,
        month,
        totalAmount: latest.totalAmount,
        items: latest.items.map((i, idx) => ({ ...i, id: `bi_${month}_${idx}` })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      budgets.push(b);
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    }
    return b || null;
  }

  saveBudget(month: string, totalAmount: number, items: { categoryId: string; amount: number }[]): Budget {
    const budgets = this.getBudgets();
    const user = this.getUser();
    const existingIdx = budgets.findIndex((b) => b.month === month);

    const newBudget: Budget = {
      id: `budget_${month}`,
      userId: user.id,
      month,
      totalAmount,
      items: items.map((i, idx) => ({ id: `bi_${month}_${idx}`, budgetId: `budget_${month}`, categoryId: i.categoryId, amount: i.amount })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx !== -1) {
      budgets[existingIdx] = newBudget;
    } else {
      budgets.push(newBudget);
    }

    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return newBudget;
  }

  // --- GOALS ---
  getGoals(): Goal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
    return raw ? JSON.parse(raw) : [];
  }

  createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Goal {
    const goals = this.getGoals();
    const newGoal: Goal = {
      ...goal,
      id: `goal_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return newGoal;
  }

  updateGoal(id: string, updates: Partial<Goal>): Goal {
    const goals = this.getGoals();
    const idx = goals.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error('Goal not found');
    goals[idx] = { ...goals[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return goals[idx];
  }

  addGoalContribution(goalId: string, amount: number, notes?: string): Goal {
    const goals = this.getGoals();
    const idx = goals.findIndex((g) => g.id === goalId);
    if (idx === -1) throw new Error('Goal not found');
    goals[idx].currentAmount += amount;
    if (goals[idx].currentAmount >= goals[idx].targetAmount) {
      goals[idx].isCompleted = true;
    }
    goals[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return goals[idx];
  }

  // --- DEBTS ---
  getDebts(): Debt[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEBTS);
    let debts: Debt[] = raw ? JSON.parse(raw) : [];
    if (!debts || debts.length === 0) {
      this.seedKailashFinanceData();
      debts = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEBTS) || '[]');
    }
    return debts;
  }

  createDebt(debt: Omit<Debt, 'id' | 'createdAt' | 'updatedAt'>): Debt {
    const debts = this.getDebts();
    const newDebt: Debt = {
      ...debt,
      id: `debt_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    debts.push(newDebt);
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    return newDebt;
  }

  updateDebt(id: string, updates: Partial<Debt>): Debt {
    const debts = this.getDebts();
    const idx = debts.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Debt not found');
    debts[idx] = { ...debts[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
    return debts[idx];
  }

  deleteDebt(id: string): void {
    let debts = this.getDebts();
    debts = debts.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }

  recordDebtPayment(debtId: string, amount: number, accountId?: string, date?: string): void {
    const debts = this.getDebts();
    const d = debts.find((item) => item.id === debtId);
    if (!d) return;

    // Reduce outstanding amount
    d.outstandingAmount = Math.max(0, d.outstandingAmount - amount);
    d.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));

    // Determine exact category and transaction type
    let catId = 'cat_financial';
    let subId: string | undefined = 'sub_emi_personal';
    let txType: any = 'DEBT_PAYMENT';

    if (d.type === 'RENT_HOUSING') {
      catId = 'cat_housing';
      subId = 'sub_rent';
      txType = 'EXPENSE';
    } else if (d.type === 'GROCERIES_FOOD') {
      catId = 'cat_food';
      subId = 'sub_groceries';
      txType = 'EXPENSE';
    } else if (d.type === 'MILK_DAIRY') {
      catId = 'cat_food';
      subId = 'sub_milk';
      txType = 'EXPENSE';
    } else if (d.type === 'UTILITIES_BILLS') {
      catId = 'cat_utilities';
      subId = 'sub_electricity';
      txType = 'EXPENSE';
    } else if (d.type === 'MAID_COOK') {
      catId = 'cat_utilities';
      subId = 'sub_maid';
      txType = 'EXPENSE';
    } else if (d.type === 'FUEL_TRANSPORT') {
      catId = 'cat_transport';
      subId = 'sub_petrol';
      txType = 'EXPENSE';
    } else if (d.type === 'FAMILY_PERSONAL') {
      catId = 'cat_family';
      subId = 'sub_wife_personal';
      txType = 'EXPENSE';
    } else if (d.type === 'BIKE_LOAN') {
      catId = 'cat_financial';
      subId = 'sub_emi_bike';
      txType = 'DEBT_PAYMENT';
    } else if (d.type === 'CAR_LOAN') {
      catId = 'cat_financial';
      subId = 'sub_emi_car';
      txType = 'DEBT_PAYMENT';
    } else if (d.type === 'CREDIT_CARD_MIN_PAYMENT') {
      catId = 'cat_financial';
      subId = 'sub_cc_payment';
      txType = 'DEBT_PAYMENT';
    }

    // Log as transaction
    const finalDate = date || new Date().toISOString().split('T')[0];
    this.createTransaction({
      accountId: accountId || 'acc_primary',
      categoryId: catId,
      subcategoryId: subId,
      date: finalDate,
      description: `Monthly Payment: ${d.name} (${d.lender})`,
      amount: -amount,
      type: txType,
      paymentMethod: 'UPI',
    });
  }

  // --- SHORT-TERM BORROWINGS & HAND LOANS (उधार) ---
  getBorrowings(month?: string): Borrowing[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BORROWINGS);
    let list: Borrowing[] = raw ? JSON.parse(raw) : [];
    if (!list || list.length === 0) {
      this.seedKailashFinanceData();
      list = JSON.parse(localStorage.getItem(STORAGE_KEYS.BORROWINGS) || '[]');
    }
    if (month) {
      list = list.filter((b) => b.borrowDate.startsWith(month) || (b.dueDate && b.dueDate.startsWith(month)) || b.status !== 'SETTLED');
    }
    return list.sort((a, b) => b.borrowDate.localeCompare(a.borrowDate));
  }

  createBorrowing(borrowing: Omit<Borrowing, 'id' | 'createdAt' | 'updatedAt' | 'amountSettled' | 'status'> & { recordCashFlow?: boolean; accountId?: string }): Borrowing {
    const list = this.getBorrowings();
    const newBorrowing: Borrowing = {
      ...borrowing,
      id: `bor_${Date.now()}`,
      amountSettled: 0,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newBorrowing);
    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(list));

    // Optional: Log instant cashflow transaction
    if (borrowing.recordCashFlow) {
      this.createTransaction({
        accountId: borrowing.accountId || 'acc_primary',
        categoryId: 'cat_transfer',
        subcategoryId: 'sub_friend_transfer',
        date: borrowing.borrowDate,
        description: borrowing.type === 'BORROWED'
          ? `Hand Loan Received: ${borrowing.personName} (${borrowing.purpose || 'Borrowing'})`
          : `Hand Loan Given: ${borrowing.personName} (${borrowing.purpose || 'Lending'})`,
        amount: borrowing.type === 'BORROWED' ? borrowing.amount : -borrowing.amount,
        type: borrowing.type === 'BORROWED' ? 'INCOME' : 'EXPENSE',
        paymentMethod: 'UPI',
      });
    }

    return newBorrowing;
  }

  updateBorrowing(id: string, updates: Partial<Borrowing>): Borrowing {
    const list = this.getBorrowings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Borrowing record not found');
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(list));
    return list[idx];
  }

  deleteBorrowing(id: string): void {
    let list = this.getBorrowings();
    list = list.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(list));
  }

  settleBorrowing(id: string, settleAmount: number, accountId?: string, date?: string): Borrowing {
    const list = this.getBorrowings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Borrowing record not found');

    const b = list[idx];
    const newSettled = Math.min(b.amount, b.amountSettled + settleAmount);
    b.amountSettled = newSettled;
    b.status = newSettled >= b.amount ? 'SETTLED' : 'PARTIALLY_PAID';
    b.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(list));

    // Log settlement transaction
    const finalDate = date || new Date().toISOString().split('T')[0];
    this.createTransaction({
      accountId: accountId || 'acc_primary',
      categoryId: 'cat_transfer',
      subcategoryId: 'sub_friend_transfer',
      date: finalDate,
      description: b.type === 'BORROWED'
        ? `Repaid Hand Loan: ${b.personName}`
        : `Collected Hand Loan: ${b.personName}`,
      amount: b.type === 'BORROWED' ? -settleAmount : settleAmount,
      type: b.type === 'BORROWED' ? 'EXPENSE' : 'INCOME',
      paymentMethod: 'UPI',
    });

    return b;
  }

  rolloverBorrowing(id: string, targetMonth: string): Borrowing {
    const list = this.getBorrowings();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Borrowing record not found');

    const b = list[idx];
    b.carryForwardMonth = targetMonth;
    b.rolloverCount = (b.rolloverCount || 0) + 1;
    b.notes = `${b.notes || ''} [Carried forward to ${targetMonth}]`.trim();
    b.updatedAt = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(list));
    return b;
  }

  // --- INCOME STREAMS (JOB SALARY + FREELANCE / CONSULTING) ---
  getIncomeStreams(): IncomeStream[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INCOME_STREAMS);
    let streams: IncomeStream[] = raw ? JSON.parse(raw) : [];
    if (!streams || streams.length === 0) {
      this.seedKailashFinanceData();
      streams = JSON.parse(localStorage.getItem(STORAGE_KEYS.INCOME_STREAMS) || '[]');
    }
    return streams;
  }

  createIncomeStream(stream: Omit<IncomeStream, 'id'>): IncomeStream {
    const streams = this.getIncomeStreams();
    const newStream: IncomeStream = {
      ...stream,
      id: `inc_${Date.now()}`,
    };
    streams.push(newStream);
    localStorage.setItem(STORAGE_KEYS.INCOME_STREAMS, JSON.stringify(streams));
    return newStream;
  }

  updateIncomeStream(id: string, updates: Partial<IncomeStream>): IncomeStream {
    const streams = this.getIncomeStreams();
    const idx = streams.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Income stream not found');
    streams[idx] = { ...streams[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.INCOME_STREAMS, JSON.stringify(streams));
    return streams[idx];
  }

  deleteIncomeStream(id: string): void {
    let streams = this.getIncomeStreams();
    streams = streams.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.INCOME_STREAMS, JSON.stringify(streams));
  }

  // --- CIBIL SCORE ANALYSIS & RECOVERY ---
  getCibilAnalysis(): CibilProfile {
    const debts = this.getDebts();
    const accounts = this.getAccounts();
    return calculateCibilAnalysis(debts, accounts);
  }

  // --- DASHBOARD DATA AGGREGATOR ---
  getDashboardData(targetMonth?: string) {
    const month = targetMonth || new Date().toISOString().slice(0, 7);
    const user = this.getUser();
    const accounts = this.getAccounts();
    const debts = this.getDebts();
    const goals = this.getGoals();
    const categories = this.getCategories();
    const budget = this.getBudgetForMonth(month);
    const transactions = this.getTransactions({
      startDate: `${month}-01`,
      endDate: `${month}-31`,
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categorySpendingMap = new Map<string, number>();

    for (const tx of transactions) {
      if (tx.type === 'INCOME') {
        totalIncome += Math.abs(tx.amount);
      } else if (tx.type === 'EXPENSE' || tx.type === 'DEBT_PAYMENT') {
        const abs = Math.abs(tx.amount);
        totalExpenses += abs;
        categorySpendingMap.set(tx.categoryId, (categorySpendingMap.get(tx.categoryId) || 0) + abs);
      } else if (tx.type === 'REFUND') {
        totalExpenses -= Math.abs(tx.amount);
      }
    }

    const totalSaved = Math.max(0, totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;

    const totalBankBalance = accounts
      .filter((a) => a.type === 'SAVINGS' || a.type === 'SALARY' || a.type === 'CURRENT')
      .reduce((sum, a) => sum + a.currentBalance, 0);

    const creditCards = accounts
      .filter((a) => a.type === 'CREDIT_CARD')
      .map((c) => ({
        id: c.id,
        name: c.name,
        bank: c.bank,
        outstanding: Math.abs(c.currentBalance),
        limit: c.creditLimit || 0,
        available: (c.creditLimit || 0) + c.currentBalance,
        statementDate: c.statementDate,
        dueDate: c.dueDate,
      }));

    const debtSummary = calculateDebtSummary(debts, totalIncome || user.monthlyIncome || 0);

    const categoryNameMap = new Map(categories.map((c) => [c.id, { name: c.name, icon: c.icon, color: c.color }]));
    const categoryBreakdown = Array.from(categorySpendingMap.entries())
      .map(([catId, amount]) => {
        const meta = categoryNameMap.get(catId);
        return {
          categoryId: catId,
          name: meta?.name || 'Other',
          icon: meta?.icon || '📦',
          color: meta?.color || '#94A3B8',
          amount,
          percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const goalProjections = goals.map((g) => calculateGoalProjection(g));
    const goalsOnTrack = goalProjections.filter((p) => p.status === 'ON_TRACK' || p.status === 'AHEAD' || p.status === 'COMPLETED').length;

    const emergencyAcc = accounts.find((a) => a.name.toLowerCase().includes('emergency') || a.type === 'SAVINGS');
    const healthScore = calculateFinancialHealthScore({
      monthlyIncome: totalIncome || user.monthlyIncome || 0,
      monthlyExpenses: totalExpenses,
      totalMonthlyEmi: debtSummary.totalMonthlyEmi,
      emergencyFundBalance: emergencyAcc ? emergencyAcc.currentBalance : totalBankBalance * 0.5,
      essentialMonthlyExpenses: totalExpenses * 0.7,
      budgetAllocated: budget?.totalAmount || 0,
      budgetSpent: totalExpenses,
      totalGoalsCount: goals.length,
      goalsOnTrackCount: goalsOnTrack,
    });

    // 6-Month Trend
    const monthlyTrend = this.calculatePast6MonthsTrend();

    return {
      month,
      currentMonth: {
        income: totalIncome,
        expenses: totalExpenses,
        saved: totalSaved,
        savingsRate: Number(savingsRate.toFixed(1)),
        bankBalance: totalBankBalance,
        totalDebt: debtSummary.totalOutstanding,
        totalEmi: debtSummary.totalMonthlyEmi,
        budgetLimit: budget?.totalAmount || 0,
        budgetRemaining: budget ? Math.max(0, budget.totalAmount - totalExpenses) : 0,
      },
      categoryBreakdown,
      monthlyTrend,
      goalProjections,
      healthScore,
      creditCards,
      recentTransactions: transactions.slice(0, 8),
    };
  }

  private calculatePast6MonthsTrend() {
    const allTxns: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const now = new Date();
    const trend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.toISOString().slice(0, 7);
      const monthTxns = allTxns.filter((t) => t.date.startsWith(m));

      let inc = 0;
      let exp = 0;
      for (const t of monthTxns) {
        if (t.type === 'INCOME') inc += Math.abs(t.amount);
        else if (t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT') exp += Math.abs(t.amount);
      }

      const monthLabel = d.toLocaleString('default', { month: 'short' });
      trend.push({
        month: m,
        monthLabel,
        income: inc,
        expenses: exp,
        savings: Math.max(0, inc - exp),
      });
    }

    return trend;
  }

  // --- REPORT & RECONCILIATION ---
  getMonthlyReport(currentMonth: string, previousMonth: string) {
    const currentTxns = this.getTransactions({ startDate: `${currentMonth}-01`, endDate: `${currentMonth}-31` });
    const prevTxns = this.getTransactions({ startDate: `${previousMonth}-01`, endDate: `${previousMonth}-31` });
    const categories = this.getCategories();
    const catMap = new Map(categories.map((c) => [c.id, c.name]));

    const calcTotals = (txns: Transaction[]) => {
      let income = 0;
      let expenses = 0;
      const catTotals = new Map<string, number>();

      for (const t of txns) {
        if (t.type === 'INCOME') income += Math.abs(t.amount);
        else if (t.type === 'EXPENSE' || t.type === 'DEBT_PAYMENT') {
          const amt = Math.abs(t.amount);
          expenses += amt;
          catTotals.set(t.categoryId, (catTotals.get(t.categoryId) || 0) + amt);
        }
      }
      return { income, expenses, catTotals };
    };

    const current = calcTotals(currentTxns);
    const previous = calcTotals(prevTxns);
    const expenseDeltaPct = previous.expenses > 0
      ? ((current.expenses - previous.expenses) / previous.expenses) * 100
      : 0;

    const savingsCurrent = Math.max(0, current.income - current.expenses);
    const savingsPrev = Math.max(0, previous.income - previous.expenses);

    const insights: string[] = [];
    if (current.expenses > previous.expenses && previous.expenses > 0) {
      insights.push(`💡 Monthly expenses increased by ${expenseDeltaPct.toFixed(1)}% compared to last month.`);
    } else if (current.expenses < previous.expenses && previous.expenses > 0) {
      insights.push(`✓ Great discipline! Spending dropped by ${Math.abs(expenseDeltaPct).toFixed(1)}% vs last month.`);
    }

    if (savingsCurrent > savingsPrev && savingsPrev > 0) {
      insights.push(`✓ You saved ${formatINR(savingsCurrent - savingsPrev)} more than last month.`);
    }

    const topCategories = Array.from(current.catTotals.entries())
      .map(([catId, amount]) => ({
        categoryId: catId,
        categoryName: catMap.get(catId) || 'Other',
        amount,
        percentage: current.expenses > 0 ? (amount / current.expenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      currentMonth,
      previousMonth,
      current: {
        income: current.income,
        expenses: current.expenses,
        savings: savingsCurrent,
        savingsRate: current.income > 0 ? (savingsCurrent / current.income) * 100 : 0,
      },
      previous: {
        income: previous.income,
        expenses: previous.expenses,
        savings: savingsPrev,
        savingsRate: previous.income > 0 ? (savingsPrev / previous.income) * 100 : 0,
      },
      expenseDeltaPct: Number(expenseDeltaPct.toFixed(1)),
      topCategories,
      insights,
    };
  }

  getReconciliation(month: string) {
    const txns = this.getTransactions({ startDate: `${month}-01`, endDate: `${month}-31` });
    const accounts = this.getAccounts();
    const openingBalance = accounts.reduce((sum, a) => sum + a.openingBalance, 0);
    const actualClosingBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

    return calculateMonthlyReconciliation(month, openingBalance, actualClosingBalance, txns);
  }

  // --- EXPORT / IMPORT ALL DATA ---
  exportAllData() {
    return {
      user: this.getUser(),
      accounts: this.getAccounts(),
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      goals: this.getGoals(),
      debts: this.getDebts(),
      rules: this.getRules(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  importAllData(data: any) {
    if (data.user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    if (data.accounts) localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(data.accounts));
    if (data.transactions) localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
    if (data.budgets) localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(data.budgets));
    if (data.goals) localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(data.goals));
    if (data.debts) localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(data.debts));
    if (data.rules) localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(data.rules));
  }

  clearAllData() {
    localStorage.clear();
    this.initDefaults();
  }
}

export const storageService = new StorageService();
