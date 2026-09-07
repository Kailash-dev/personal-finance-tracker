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

    const EXACT_USER_DEBTS: Debt[] = [
      {
        id: 'debt_bike_loan',
        userId: 'user_kailash',
        name: 'Bike Loan Monthly EMI',
        lender: 'Hero Fincorp / HDFC',
        type: 'BIKE_LOAN',
        originalAmount: 225000,
        outstandingAmount: 37500,
        monthlyEmi: 6250,
        interestRate: 11.5,
        totalTenureMonths: 36,
        emisPaid: 30,
        emisRemaining: 6,
        startDate: '2024-01-10',
        dueDay: 10,
        notes: 'Financed in Jan 2024 (36m tenure, 30 paid, only 6 EMIs left of ₹6,250)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_mobile_emi',
        userId: 'user_kailash',
        name: 'Mobile Phone EMI (Bajaj Finserv)',
        lender: 'Bajaj Finance',
        type: 'PERSONAL_LOAN',
        originalAmount: 91200,
        outstandingAmount: 87400,
        monthlyEmi: 3800,
        interestRate: 0,
        totalTenureMonths: 24,
        emisPaid: 1,
        emisRemaining: 23,
        startDate: '2026-08-12',
        dueDay: 12,
        notes: '24-month tenure (1 paid, 23 EMIs left of ₹3,800)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_borrowed_interest',
        userId: 'user_kailash',
        name: 'Money Borrowed on Interest',
        lender: 'Private Lender / Hand Loan',
        type: 'PERSONAL_BORROWING',
        originalAmount: 50000,
        outstandingAmount: 50000,
        monthlyEmi: 2000,
        interestRate: 24,
        totalTenureMonths: 12,
        emisPaid: 0,
        emisRemaining: 12,
        startDate: '2026-09-01',
        dueDay: 10,
        notes: 'Hand loan borrowed on interest (Monthly interest payout)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_father_credit_card',
        userId: 'user_kailash',
        name: "Father's Credit Card (Bill / EMI)",
        lender: 'Credit Card (Father)',
        type: 'CREDIT_CARD_MIN_PAYMENT',
        originalAmount: 25000,
        outstandingAmount: 25000,
        monthlyEmi: 5000,
        interestRate: 0,
        totalTenureMonths: 5,
        emisPaid: 0,
        emisRemaining: 5,
        startDate: '2026-09-01',
        dueDay: 15,
        notes: "Father's credit card dues / monthly payment to clear",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_simpl_bnpl',
        userId: 'user_kailash',
        name: 'Simpl PayLater',
        lender: 'Simpl BNPL',
        type: 'BNPL',
        originalAmount: 4500,
        outstandingAmount: 4500,
        monthlyEmi: 4500,
        interestRate: 0,
        totalTenureMonths: 1,
        emisPaid: 0,
        emisRemaining: 1,
        startDate: '2026-09-01',
        dueDay: 20,
        notes: 'Simpl Pay Later dues',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_lazypay_bnpl',
        userId: 'user_kailash',
        name: 'LazyPay BNPL',
        lender: 'PayU / LazyPay',
        type: 'BNPL',
        originalAmount: 15000,
        outstandingAmount: 15000,
        monthlyEmi: 15000,
        interestRate: 0,
        totalTenureMonths: 1,
        emisPaid: 0,
        emisRemaining: 1,
        startDate: '2026-09-01',
        dueDay: 3,
        notes: 'LazyPay Buy Now Pay Later dues',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_branch_loan',
        userId: 'user_kailash',
        name: 'Branch NBFC Loan',
        lender: 'Branch International FinTech',
        type: 'NBFC_LOAN',
        originalAmount: 26000,
        outstandingAmount: 26000,
        monthlyEmi: 26000,
        interestRate: 0,
        totalTenureMonths: 1,
        emisPaid: 0,
        emisRemaining: 1,
        startDate: '2026-09-01',
        dueDay: 5,
        notes: 'Branch FinTech / NBFC loan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_mpokket_loan',
        userId: 'user_kailash',
        name: 'mPokket Loan',
        lender: 'mPokket Financial Services',
        type: 'NBFC_LOAN',
        originalAmount: 32000,
        outstandingAmount: 32000,
        monthlyEmi: 32000,
        interestRate: 0,
        totalTenureMonths: 1,
        emisPaid: 0,
        emisRemaining: 1,
        startDate: '2026-09-01',
        dueDay: 10,
        notes: 'mPokket Instant Loan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_snapmint_bnpl',
        userId: 'user_kailash',
        name: 'Snapmint PayLater / EMI',
        lender: 'Snapmint BNPL',
        type: 'BNPL',
        originalAmount: 62000,
        outstandingAmount: 62000,
        monthlyEmi: 62000,
        interestRate: 0,
        totalTenureMonths: 1,
        emisPaid: 0,
        emisRemaining: 1,
        startDate: '2026-09-01',
        dueDay: 15,
        notes: 'Snapmint Online EMI / Buy Now Pay Later',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_freo_bnpl',
        userId: 'user_kailash',
        name: 'Freo Pay / Credit Line',
        lender: 'Freo (MoneyTap)',
        type: 'BNPL',
        originalAmount: 7000,
        outstandingAmount: 7000,
        monthlyEmi: 7000,
        interestRate: 0,
        totalTenureMonths: 1,
        emisPaid: 0,
        emisRemaining: 1,
        startDate: '2026-09-01',
        dueDay: 25,
        notes: 'Freo Pay BNPL dues',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_vc2_10th',
        userId: 'user_kailash',
        name: 'Chit Fund (VC 1) 10th Installment',
        lender: 'Local Chit Group',
        type: 'CHIT_FUND_VC',
        originalAmount: 50000,
        outstandingAmount: 22500,
        monthlyEmi: 4500,
        interestRate: 0,
        totalTenureMonths: 11,
        emisPaid: 6,
        emisRemaining: 5,
        startDate: '2026-05-10',
        dueDay: 10,
        notes: 'Chit fund VC 1 monthly contribution on 10th (5 EMIs remaining)',
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
        totalTenureMonths: 10,
        emisPaid: 5,
        emisRemaining: 5,
        startDate: '2026-04-25',
        dueDay: 25,
        notes: 'Chit fund VC 2 second installment due on 25th Sept (5 EMIs remaining)',
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
        totalTenureMonths: 6,
        emisPaid: 5,
        emisRemaining: 1,
        startDate: '2026-04-02',
        dueDay: 30,
        notes: 'Travel EMI ends permanently on 2nd Oct (Last EMI remaining)!',
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
        totalTenureMonths: 3,
        emisPaid: 2,
        emisRemaining: 1,
        startDate: '2026-07-07',
        dueDay: 7,
        notes: '3-month short term loan. 2 EMIs paid (today 7th Sept paid ₹7,000). Only 1 EMI left next month!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_slice_bnpl',
        userId: 'user_kailash',
        name: 'Slice (Card / Borrow)',
        lender: 'Slice (GaragePreneurs / Quadrant)',
        type: 'BNPL',
        originalAmount: 19000,
        outstandingAmount: 19000,
        monthlyEmi: 19000,
        interestRate: 0,
        totalTenureMonths: 1,
        emisPaid: 0,
        emisRemaining: 1,
        startDate: '2026-09-01',
        dueDay: 5,
        notes: 'Slice Borrow / Card pending repayment',
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
        totalTenureMonths: 4,
        emisPaid: 1,
        emisRemaining: 3,
        startDate: '2025-01-01',
        dueDay: 28,
        notes: 'SBI Credit Card minimum due for September (Due 28th)',
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
        totalTenureMonths: 3,
        emisPaid: 2,
        emisRemaining: 1,
        startDate: '2026-07-15',
        dueDay: 15,
        notes: '3 installments of ₹1,400: 2 paid! 1 remaining in Sept to close card forever!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_ram_fincorp',
        userId: 'user_kailash',
        name: 'Ram Fincorp Loan Repayment',
        lender: 'Ram Fincorp',
        type: 'NBFC_LOAN',
        originalAmount: 17500,
        outstandingAmount: 17500,
        monthlyEmi: 17500,
        interestRate: 0,
        totalTenureMonths: 1,
        emisPaid: 0,
        emisRemaining: 1,
        startDate: '2026-08-09',
        dueDay: 9,
        notes: 'Ram Fincorp loan repayment — due 9th September 2026 (OVERDUE — pay immediately!)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const EXACT_USER_ACCOUNTS: Account[] = [
      {
        id: 'acc_salary',
        userId: 'user_kailash',
        name: 'Kotak Mahindra Salary A/c',
        type: 'SAVINGS',
        bank: 'KOTAK',
        accountNumberMasked: '•••• 9318',
        currentBalance: 515.52,
        openingBalance: 38.10,
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

    const EXACT_USER_BORROWINGS: Borrowing[] = [
      {
        id: 'bor_rajni_5k',
        userId: 'user_kailash',
        personName: 'Rajni Ji Personal Borrowing',
        amount: 5000,
        amountSettled: 0,
        borrowDate: '2026-09-04',
        dueDate: '2026-09-10',
        type: 'BORROWED',
        status: 'PENDING',
        purpose: 'Personal borrowing to repay on 10th Sept (Salary Day)',
        hasInterest: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
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
        hasInterest: false,
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
        carryForwardMonth: '2026-10',
        type: 'BORROWED',
        status: 'PENDING',
        purpose: 'Shifted to new city on 4th Sept - to be paid in October',
        hasInterest: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'borr_nagendra_4500',
        userId: 'user_kailash',
        type: 'BORROWED',
        personName: 'Nagendra',
        amount: 4500,
        amountSettled: 0,
        status: 'PENDING',
        borrowDate: '2026-09-01',
        dueDate: '2026-10-10',
        purpose: 'Borrowed from friend Nagendra',
        hasInterest: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const USER_CONFIG_KEY = 'rupeetrack_user_exact_debts_v16';
    if (!localStorage.getItem(USER_CONFIG_KEY)) {
      // Merge accounts
      const existingAccountsRaw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      let currentAccounts: Account[] = [];
      try {
        if (existingAccountsRaw) currentAccounts = JSON.parse(existingAccountsRaw);
      } catch (e) {
        currentAccounts = [];
      }
      const mergedAccounts = [...currentAccounts];
      for (const acc of EXACT_USER_ACCOUNTS) {
        const idx = mergedAccounts.findIndex((a) => a.id === acc.id || a.name.toLowerCase() === acc.name.toLowerCase());
        if (idx >= 0) {
          mergedAccounts[idx] = { ...acc, ...mergedAccounts[idx] };
        } else {
          mergedAccounts.push(acc);
        }
      }
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(mergedAccounts));

      // Merge debts without dropping any existing entries (Chits, Cards, EMIs, BNPLs)
      const existingDebtsRaw = localStorage.getItem(STORAGE_KEYS.DEBTS);
      let currentDebts: Debt[] = [];
      try {
        if (existingDebtsRaw) currentDebts = JSON.parse(existingDebtsRaw);
      } catch (e) {
        currentDebts = [];
      }
      
      const mergedDebts = [...currentDebts];
      for (const debt of EXACT_USER_DEBTS) {
        const idx = mergedDebts.findIndex((d) => d.id === debt.id || d.name.toLowerCase() === debt.name.toLowerCase());
        if (idx >= 0) {
          mergedDebts[idx] = { ...debt, ...mergedDebts[idx] };
        } else {
          mergedDebts.push(debt);
        }
      }
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(mergedDebts));

      // Merge borrowings without dropping previous hand borrowings
      const existingBorrowingsRaw = localStorage.getItem(STORAGE_KEYS.BORROWINGS);
      let currentBorrowings: Borrowing[] = [];
      try {
        if (existingBorrowingsRaw) currentBorrowings = JSON.parse(existingBorrowingsRaw);
      } catch (e) {
        currentBorrowings = [];
      }

      const mergedBorrowings = [...currentBorrowings];
      for (const borrowing of EXACT_USER_BORROWINGS) {
        const idx = mergedBorrowings.findIndex(
          (b) => b.id === borrowing.id || b.personName.toLowerCase() === borrowing.personName.toLowerCase()
        );
        if (idx >= 0) {
          mergedBorrowings[idx] = { ...borrowing, ...mergedBorrowings[idx] };
        } else {
          mergedBorrowings.push(borrowing);
        }
      }
      localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(mergedBorrowings));
      localStorage.setItem(USER_CONFIG_KEY, 'true');
    }

    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(EXACT_USER_ACCOUNTS));
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
      localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(EXACT_USER_DEBTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BORROWINGS)) {
      localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(EXACT_USER_BORROWINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.INCOME_STREAMS)) {
      localStorage.setItem(STORAGE_KEYS.INCOME_STREAMS, JSON.stringify([]));
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
      name: 'Gayari Kailash Pyarelal',
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
        name: 'Kotak Mahindra Bank (Salary A/c 2114584803)',
        type: 'SALARY',
        bank: 'KOTAK',
        accountNumberMasked: '•••• 4803',
        currentBalance: 4713.39,
        openingBalance: 515.52,
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
        totalTenureMonths: 1,
        emisPaid: 0,
        emisRemaining: 1,
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
        totalTenureMonths: 24,
        emisPaid: 10,
        emisRemaining: 14,
        startDate: '2025-09-10',
        dueDay: 10,
        notes: 'Monthly bike loan EMI auto-debit on 10th (14 EMIs remaining)',
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
        totalTenureMonths: 11,
        emisPaid: 6,
        emisRemaining: 5,
        startDate: '2026-05-10',
        dueDay: 10,
        notes: 'Chit fund VC 2 monthly contribution on 10th (5 EMIs remaining)',
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
        totalTenureMonths: 6,
        emisPaid: 3,
        emisRemaining: 3,
        startDate: '2026-06-12',
        dueDay: 12,
        notes: 'Mobile phone no-cost EMI on Bajaj Finserv (3 EMIs remaining)',
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
        totalTenureMonths: 3,
        emisPaid: 2,
        emisRemaining: 1,
        startDate: '2026-07-15',
        dueDay: 15,
        notes: '3 installments of ₹1,400: 2 paid! 1 remaining in Sept to close card forever!',
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
        totalTenureMonths: 10,
        emisPaid: 5,
        emisRemaining: 5,
        startDate: '2026-04-25',
        dueDay: 25,
        notes: 'Chit fund second installment due on 25th Sept (5 EMIs remaining)',
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
        totalTenureMonths: 4,
        emisPaid: 1,
        emisRemaining: 3,
        startDate: '2025-01-01',
        dueDay: 28,
        notes: 'SBI Credit Card minimum due for September (Due 28th)',
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
        totalTenureMonths: 6,
        emisPaid: 5,
        emisRemaining: 1,
        startDate: '2026-04-02',
        dueDay: 30,
        notes: 'Travel EMI ends permanently on 2nd Oct (Last EMI remaining)!',
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
        totalTenureMonths: 3,
        emisPaid: 2,
        emisRemaining: 1,
        startDate: '2026-07-07',
        dueDay: 7,
        notes: '3-month short term loan. 2 EMIs paid (today 7th Sept paid ₹7,000). Only 1 EMI left next month!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_rent',
        userId: 'user_kailash',
        name: 'Monthly House Rent',
        lender: 'Landlord',
        type: 'RENT_HOUSING',
        originalAmount: 11000,
        outstandingAmount: 11000,
        monthlyEmi: 11000,
        interestRate: 0,
        startDate: '2026-09-01',
        dueDay: 10,
        notes: 'Monthly house rent due on salary day 10th Sept',
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
        notes: 'Broker fee for new house shifted on 4th Sept (Due on Salary Day 10th)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_groceries',
        userId: 'user_kailash',
        name: 'Monthly Groceries & DMart',
        lender: 'D-Mart / Blinkit',
        type: 'GROCERIES_FOOD',
        originalAmount: 4000,
        outstandingAmount: 4000,
        monthlyEmi: 4000,
        interestRate: 0,
        startDate: '2026-09-01',
        dueDay: 15,
        notes: 'Essential groceries & food supplies for September (Mid-month ~15th)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_milk',
        userId: 'user_kailash',
        name: 'Daily Milk (Amul / Local Dairy)',
        lender: 'Local Milkman',
        type: 'MILK_DAIRY',
        originalAmount: 1800,
        outstandingAmount: 1800,
        monthlyEmi: 1800,
        interestRate: 0,
        startDate: '2026-09-01',
        dueDay: 30,
        notes: 'Monthly milk bill settled end of month',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_maid',
        userId: 'user_kailash',
        name: 'Maid & Cook Salary',
        lender: 'Domestic Help',
        type: 'MAID_COOK',
        originalAmount: 3000,
        outstandingAmount: 3000,
        monthlyEmi: 3000,
        interestRate: 0,
        startDate: '2026-09-01',
        dueDay: 10,
        notes: 'Housemaid & Cook monthly salary on 10th',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_electricity',
        userId: 'user_kailash',
        name: 'Electricity & Water Bill',
        lender: 'Power Discom / Board',
        type: 'UTILITIES_BILLS',
        originalAmount: 2500,
        outstandingAmount: 2500,
        monthlyEmi: 2500,
        interestRate: 0,
        startDate: '2026-09-01',
        dueDay: 20,
        notes: 'Monthly power and utilities bill (~20th)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'debt_petrol',
        userId: 'user_kailash',
        name: 'Fuel & Petrol Budget',
        lender: 'HPCL / BPCL',
        type: 'FUEL_TRANSPORT',
        originalAmount: 2000,
        outstandingAmount: 2000,
        monthlyEmi: 2000,
        interestRate: 0,
        startDate: '2026-09-01',
        dueDay: 15,
        notes: 'Two-wheeler and commuting fuel for the month',
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
        notes: 'Wife personal and household allowance for September (Paid 10th)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const borrowings: Borrowing[] = [
      {
        id: 'bor_rajni_5k',
        userId: 'user_kailash',
        personName: 'Rajni Ji Personal Borrowing',
        amount: 5000,
        amountSettled: 0,
        borrowDate: '2026-09-04',
        dueDate: '2026-09-10',
        type: 'BORROWED',
        status: 'PENDING',
        purpose: 'Personal borrowing to repay on 10th Sept (Salary Day)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
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
        id: 'bor_relocation_10k',
        userId: 'user_kailash',
        personName: 'City Relocation Hand Loan',
        amount: 10000,
        amountSettled: 0,
        borrowDate: '2026-09-04',
        dueDate: '2026-10-10',
        carryForwardMonth: '2026-10',
        type: 'BORROWED',
        status: 'PENDING',
        purpose: 'Shifted to new city on 4th Sept - to be paid in October',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const transactions: Transaction[] = [
      {
            "id": "tx_kotak_1",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-06",
            "description": "Recd:IMPS/621808628740/ROPPENTRAN/KKBK/X9318/IMPS",
            "amount": 477.42,
            "type": "INCOME",
            "paymentMethod": "IMPS",
            "referenceNumber": "IMPS-621808788449",
            "balanceAfter": 515.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #1)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_2",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-06",
            "description": "UPI/GAYARI KAILASH/INDB/859519791097/Payment from",
            "amount": -511.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-621865185496",
            "balanceAfter": 4.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #2)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_3",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-08",
            "description": "UPI/BHAVINBHAI ARV/HDFC/658669147572/UPI",
            "amount": 156.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622017980003",
            "balanceAfter": 160.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #3)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_4",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-08",
            "description": "UPI/GAYARI KAILASH/INDB/311855008952/Payment from",
            "amount": -160.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622019402639",
            "balanceAfter": 0.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #4)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_5",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-08",
            "description": "Recd:IMPS/622013371901/ROPPENTRAN/KKBK/X9318/IMPS",
            "amount": 120.68,
            "type": "INCOME",
            "paymentMethod": "IMPS",
            "referenceNumber": "IMPS-622013883855",
            "balanceAfter": 121.2,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #5)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_6",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-08",
            "description": "UPI/GAYARI KAILASH/INDB/528096762589/Payment from",
            "amount": -120.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622026480777",
            "balanceAfter": 1.2,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #6)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_7",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_salary",
            "date": "2026-08-09",
            "description": "NEFT IN42622153703542 VCRAFT INNOVATIONS ICIC0SF0",
            "amount": 50000.0,
            "type": "INCOME",
            "paymentMethod": "NEFT",
            "referenceNumber": "NEFTINW-1677820415",
            "balanceAfter": 50001.2,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #7)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_8",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-09",
            "description": "UPI/GAYARI KAILASH/INDB/254152990174/Payment from",
            "amount": -594.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622134512360",
            "balanceAfter": 49407.2,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #8)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_9",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-09",
            "description": "UPI/PYARELAL  DALU/BARB/622141005927/Back",
            "amount": -3800.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622137503769",
            "balanceAfter": 45607.2,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #9)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_10",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_emi_personal",
            "date": "2026-08-09",
            "description": "UPI/PYARELAL  DALU/BARB/622141010775/Vc emi",
            "amount": -4495.0,
            "type": "DEBT_PAYMENT",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622137533008",
            "balanceAfter": 41112.2,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #10)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_11",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_emi_personal",
            "date": "2026-08-09",
            "description": "UPI/CRED Club/UTIB/127661384142/payment on C",
            "amount": -11677.0,
            "type": "DEBT_PAYMENT",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622137657679",
            "balanceAfter": 29435.2,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #11)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_12",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_freelance",
            "date": "2026-08-09",
            "description": "UPI/Cashfree Payme/utib/397767022216/CF PG Settle",
            "amount": 5500.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622137819810",
            "balanceAfter": 34935.2,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #12)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_13",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_emi_personal",
            "date": "2026-08-10",
            "description": "UPI/RAJANI  KUMAR/SBIN/622242950846/Borrowed ret",
            "amount": -5000.0,
            "type": "DEBT_PAYMENT",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622250216180",
            "balanceAfter": 29935.2,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #13)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_14",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_transport",
            "subcategoryId": "sub_public_transit",
            "date": "2026-08-10",
            "description": "UPI/Indian Railway/SBIN/127669341025/UPI",
            "amount": -33.95,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622251436505",
            "balanceAfter": 29901.25,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #14)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_15",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-10",
            "description": "UPI/Sai nath pay p/YESB/622243278248/Paid via Sup",
            "amount": -30.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622251596306",
            "balanceAfter": 29871.25,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #15)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_16",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-10",
            "description": "UPI/EKTABA ENTERPR/UTIB/622244062014/Paid via Sup",
            "amount": -450.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622255009894",
            "balanceAfter": 29421.25,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #16)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_17",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-10",
            "description": "UPI/HARE KRISHNA D/UTIB/622244331491/Paid via Sup",
            "amount": -80.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622256208682",
            "balanceAfter": 29341.25,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #17)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_18",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-10",
            "description": "UPI/MRITYUNJOY SAS/UTIB/622244422642/Paid via Sup",
            "amount": -900.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622256624704",
            "balanceAfter": 28441.25,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #18)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_19",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_family",
            "subcategoryId": "sub_childcare",
            "date": "2026-08-10",
            "description": "UPI/Reshma Bhurala/SBIN/622249165267/Paid via Sup",
            "amount": -7000.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622279558597",
            "balanceAfter": 21441.25,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #19)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_20",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_shopping",
            "subcategoryId": "sub_clothing",
            "date": "2026-08-10",
            "description": "UPI/Zudio Antalia /YESB/622249903275/Paid via Sup",
            "amount": -997.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622283157210",
            "balanceAfter": 20444.25,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #20)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_21",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-10",
            "description": "UPI/Vikaskumar Kis/YESB/622250460991/Paid via Sup",
            "amount": -180.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622285654783",
            "balanceAfter": 20264.25,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #21)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_22",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_transport",
            "subcategoryId": "sub_public_transit",
            "date": "2026-08-10",
            "description": "UPI/Indian Railway/SBIN/127697187412/UPI",
            "amount": -33.95,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622286221054",
            "balanceAfter": 20230.3,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #22)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_23",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_emi_bike",
            "date": "2026-08-10",
            "description": "UPI/PhonePe/UTIB/143266335853/Payment from",
            "amount": -6203.0,
            "type": "DEBT_PAYMENT",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622294819987",
            "balanceAfter": 14027.3,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #23)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_24",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-10",
            "description": "UPI/PYARELAL  DALU/BARB/622252738812/Paid via Sup",
            "amount": -6000.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622295244248",
            "balanceAfter": 8027.3,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #24)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_25",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-10",
            "description": "UPI/GAYARI KAILASH/INDB/658963956588/Payment from",
            "amount": -3000.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622298897533",
            "balanceAfter": 5027.3,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #25)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_26",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-10",
            "description": "UPI/GAYARI KAILASH/INDB/926782565724/Payment from",
            "amount": -3500.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622298952213",
            "balanceAfter": 1527.3,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #26)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_27",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-10",
            "description": "Recd:IMPS/622220320693/ROPPENTRAN/KKBK/X9318/IMPS",
            "amount": 100.22,
            "type": "INCOME",
            "paymentMethod": "IMPS",
            "referenceNumber": "IMPS-622220899368",
            "balanceAfter": 1627.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #27)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_28",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-10",
            "description": "UPI/GAYARI KAILASH/INDB/397114771433/Payment from",
            "amount": -100.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622204185351",
            "balanceAfter": 1527.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #28)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_29",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-10",
            "description": "UPI/RUMELA ROY/PUNB/622255076999/Paid via Sup",
            "amount": 1000.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622205129725",
            "balanceAfter": 2527.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #29)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_30",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-08-10",
            "description": "UPI/JODHAPUR SWEET/YESB/622255429730/Paid via Sup",
            "amount": -140.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622206753787",
            "balanceAfter": 2387.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #30)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_31",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-10",
            "description": "UPI/CHHEDA SOCIETY/YESB/622255586765/Paid via Sup",
            "amount": -82.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622207534811",
            "balanceAfter": 2305.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #31)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_32",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-10",
            "description": "UPI/CHANDRA PRAKAS/UTIB/622255604184/Paid via Sup",
            "amount": -20.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622207622811",
            "balanceAfter": 2285.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #32)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_33",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_emi_personal",
            "date": "2026-08-11",
            "description": "UPI/Axis Bank cred/UTIB/127718803871/UPI",
            "amount": -1405.0,
            "type": "DEBT_PAYMENT",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622315307494",
            "balanceAfter": 880.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #33)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_34",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-11",
            "description": "UPI/PADIYAR HEMLAT/BARB/127718866438/UPI",
            "amount": -450.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622315470296",
            "balanceAfter": 430.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #34)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_35",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-11",
            "description": "UPI/PhonePe/YESB/491153402699/Payment from",
            "amount": -204.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622337245834",
            "balanceAfter": 226.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #35)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_36",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-12",
            "description": "UPI/GAYARI KAILASH/INDB/091164792574/Payment from",
            "amount": -226.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622409348269",
            "balanceAfter": 0.52,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #36)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_37",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-13",
            "description": "Recd:IMPS/622518299496/ROPPENTRAN/KKBK/X9318/IMPS",
            "amount": 175.03,
            "type": "INCOME",
            "paymentMethod": "IMPS",
            "referenceNumber": "IMPS-622518458841",
            "balanceAfter": 175.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #37)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_38",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-08-13",
            "description": "UPI/SWIGGY/ICIC/622599460518/Paid via Sup",
            "amount": -153.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622515467156",
            "balanceAfter": 22.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #38)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_39",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-15",
            "description": "UPI/MUKUL TATER/HDFC/659300509790/UPI",
            "amount": 1100.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622726541140",
            "balanceAfter": 1122.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #39)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_40",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_utilities",
            "subcategoryId": "sub_mobile_recharge",
            "date": "2026-08-15",
            "description": "UPI/Vodafone Idea /UTIB/532135529460/Payment from",
            "amount": -23.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622741297914",
            "balanceAfter": 1099.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #40)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_41",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-15",
            "description": "UPI/JAGDISH/UTIB/659326196136/Paid via Sup",
            "amount": -60.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622743122972",
            "balanceAfter": 1039.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #41)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_42",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-15",
            "description": "UPI/JAGDISH/UTIB/659326218079/Paid via Sup",
            "amount": -30.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622743211675",
            "balanceAfter": 1009.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #42)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_43",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-15",
            "description": "UPI/GAYARI KAILASH/INDB/279542400406/Payment from",
            "amount": -1000.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622751863921",
            "balanceAfter": 9.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #43)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_44",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-15",
            "description": "UPI/GOOGLE INDIA D/utib/987615022276/UPI",
            "amount": 1.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622752161900",
            "balanceAfter": 10.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #44)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_45",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-16",
            "description": "UPI/Sandip/BARB/659454300578/Paid via Nav",
            "amount": 1000.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622802043894",
            "balanceAfter": 1010.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #45)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_46",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-16",
            "description": "UPI/Sandip/BARB/659454333568/Paid via Nav",
            "amount": 5000.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622802200728",
            "balanceAfter": 6010.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #46)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_47",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-16",
            "description": "UPI/GAYARI KAILASH/INDB/868837462577/Payment from",
            "amount": 6000.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622808519663",
            "balanceAfter": 12010.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #47)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_48",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_housing",
            "subcategoryId": "sub_rent",
            "date": "2026-08-16",
            "description": "UPI/SUMITRA NIKUNJ/BARB/659440581789/Rent deposit",
            "amount": -7500.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622808551048",
            "balanceAfter": 4510.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #48)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_49",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-16",
            "description": "UPI/JITESH SURESHB/BARB/659440612785/6500 ma thi",
            "amount": -3000.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622808673799",
            "balanceAfter": 1510.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #49)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_50",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_tea_coffee",
            "date": "2026-08-16",
            "description": "UPI/GOVINDA  SNACK/UTIB/659444131690/Paid via Sup",
            "amount": -290.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622822759025",
            "balanceAfter": 1220.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #50)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_51",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-17",
            "description": "UPI/Super Money/ICIC/659551908248/Paid via Sup",
            "amount": -349.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622961854011",
            "balanceAfter": 871.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #51)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_52",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_tea_coffee",
            "date": "2026-08-17",
            "description": "UPI/CHAI SUTTA BAR/UTIB/659558665936/Paid via Sup",
            "amount": -85.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622991677828",
            "balanceAfter": 786.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #52)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_53",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_tea_coffee",
            "date": "2026-08-17",
            "description": "UPI/CHAI SUTTA BAR/UTIB/659558670739/Paid via Sup",
            "amount": -10.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-622991708693",
            "balanceAfter": 776.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #53)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_54",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_utilities",
            "subcategoryId": "sub_subscriptions",
            "date": "2026-08-18",
            "description": "UPI/Oolka/YESB/659660652264/RecurringTxn",
            "amount": -99.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623008920017",
            "balanceAfter": 677.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #54)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_55",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_utilities",
            "subcategoryId": "sub_subscriptions",
            "date": "2026-08-18",
            "description": "UPI/APPLE MEDIA SE/HDFC/103875799781/Execution te",
            "amount": -5.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623049126672",
            "balanceAfter": 672.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #55)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_56",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-18",
            "description": "UPI/APPLE MEDIA SE/HDFC/103875826202/Mandate Refu",
            "amount": 5.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623049808717",
            "balanceAfter": 677.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #56)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_57",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-18",
            "description": "UPI/SHREENATH MOBI/HDFC/623004773861/UPI Send Mon",
            "amount": 5000.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623054479704",
            "balanceAfter": 5677.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #57)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_58",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-19",
            "description": "UPI/KALURAM  GAMET/CNRB/659778760975/Paid via Sup",
            "amount": -40.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623189144186",
            "balanceAfter": 5637.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #58)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_59",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-19",
            "description": "UPI/Mubabarik Husa/YESB/659778915501/Verified Pay",
            "amount": -140.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623189854758",
            "balanceAfter": 5497.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #59)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_60",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-19",
            "description": "UPI/SHANKAR SINGH /YESB/659779132282/Paid via Sup",
            "amount": -30.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623190867097",
            "balanceAfter": 5467.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #60)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_61",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-20",
            "description": "UPI/SHREENATH MOBI/HDFC/623221228014/Samsung A36",
            "amount": 5000.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-280019191841",
            "balanceAfter": 10467.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #61)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_62",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_freelance",
            "date": "2026-08-21",
            "description": "MB:RECEIVED FROM ISHVAX",
            "amount": 5000.0,
            "type": "INCOME",
            "paymentMethod": "NET_BANKING",
            "referenceNumber": "KMBT2108261239331370",
            "balanceAfter": 15467.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #62)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_63",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-21",
            "description": "UPI/MS VISHAL FRES/YESB/623315778295/Paid via Sup",
            "amount": -20.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623361484710",
            "balanceAfter": 15447.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #63)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_64",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-21",
            "description": "UPI/Shreenath Fast/YESB/623317971973/Paid via Sup",
            "amount": -120.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623370599627",
            "balanceAfter": 15327.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #64)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_65",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-21",
            "description": "UPI/MS VISHAL FRES/YESB/623318098352/Paid via Sup",
            "amount": -30.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623371206377",
            "balanceAfter": 15297.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #65)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_66",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-21",
            "description": "UPI/KISHAN LAL/UNBA/623318399992/Pay to Bhara",
            "amount": -50.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623372713155",
            "balanceAfter": 15247.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #66)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_67",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-22",
            "description": "UPI/DHARMESH SAHU/YESB/623421925485/Paid via Sup",
            "amount": -20.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623491911993",
            "balanceAfter": 15227.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #67)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_68",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-22",
            "description": "UPI/PRAKASH SINGH /YESB/623422558320/Paid via Sup",
            "amount": -40.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623494659622",
            "balanceAfter": 15187.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #68)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_69",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_transport",
            "subcategoryId": "sub_petrol",
            "date": "2026-08-22",
            "description": "UPI/Vaibhav HP Fil/YESB/623424686544/Paid via Sup",
            "amount": -230.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623404392535",
            "balanceAfter": 14957.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #69)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_70",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_utilities",
            "subcategoryId": "sub_subscriptions",
            "date": "2026-08-22",
            "description": "UPI/KOMAL ELECTRIC/CNRB/623424930127/Paid via Sup",
            "amount": -80.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623405509438",
            "balanceAfter": 14877.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #70)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_71",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_transport",
            "subcategoryId": "sub_public_transit",
            "date": "2026-08-22",
            "description": "UPI/BHARAT CARGO/HDFC/623425346940/Paid via Sup",
            "amount": -2500.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623407495502",
            "balanceAfter": 12377.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #71)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_72",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-22",
            "description": "UPI/PATEL FAST FOO/UTIB/623426046752/Paid via Sup",
            "amount": -80.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623411010182",
            "balanceAfter": 12297.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #72)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_73",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-22",
            "description": "UPI/Super Money/ICIC/623426931926/Paid via Sup",
            "amount": -299.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623415308882",
            "balanceAfter": 11998.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #73)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_74",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-23",
            "description": "UPI/Mrs  KANKU BAI/UTIB/623535537811/Paid via Sup",
            "amount": -40.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623555798270",
            "balanceAfter": 11958.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #74)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_75",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-23",
            "description": "UPI/MAHESH KUMAR M/YESB/623535602992/Paid via Sup",
            "amount": -40.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623556053389",
            "balanceAfter": 11918.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #75)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_76",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-23",
            "description": "UPI/ASHOK PURBIA/UNBA/623545634723/Pay to Bhara",
            "amount": -10.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623500004092",
            "balanceAfter": 11908.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #76)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_77",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-08-23",
            "description": "UPI/SHRI NATH BHEL/YESB/623546247739/Paid via Sup",
            "amount": -60.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623502612312",
            "balanceAfter": 11848.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #77)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_78",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-23",
            "description": "UPI/BADRI LAL GURJ/YESB/623546430896/Paid via Sup",
            "amount": -40.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623503413403",
            "balanceAfter": 11808.55,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #78)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_79",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_utilities",
            "subcategoryId": "sub_subscriptions",
            "date": "2026-08-24",
            "description": "CHRG:SMS ALERT FEE FOR THE MONTH OF JUL26",
            "amount": -18.94,
            "type": "EXPENSE",
            "paymentMethod": "AUTO_DEBIT",
            "referenceNumber": "",
            "balanceAfter": 11789.61,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #79)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_80",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-24",
            "description": "UPI/GAYARI KAILASH/INDB/195572643817/Payment from",
            "amount": -10000.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623622854804",
            "balanceAfter": 1789.61,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #80)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_81",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_transport",
            "subcategoryId": "sub_public_transit",
            "date": "2026-08-24",
            "description": "UPI/GAYARI DINESH /CNRB/623650269652/Train ticket",
            "amount": -220.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623625249219",
            "balanceAfter": 1569.61,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #81)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_82",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-08-24",
            "description": "UPI/Zomato Media P/HDFC/623650694759/Zomato Payme",
            "amount": -151.53,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623627206551",
            "balanceAfter": 1418.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #82)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_83",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_tea_coffee",
            "date": "2026-08-24",
            "description": "UPI/MPS THE TEA RO/ICIC/623653626009/Paid via Sup",
            "amount": -75.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623641274969",
            "balanceAfter": 1343.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #83)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_84",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-24",
            "description": "UPI/Shri Krishna B/YESB/623655876433/Paid via Sup",
            "amount": -30.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623652737040",
            "balanceAfter": 1313.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #84)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_85",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-24",
            "description": "UPI/TULSI RAM SALV/YESB/623661151122/Paid via Sup",
            "amount": -20.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623675474485",
            "balanceAfter": 1293.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #85)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_86",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_transport",
            "subcategoryId": "sub_public_transit",
            "date": "2026-08-24",
            "description": "UPI/Kalyan  Singh/SBIN/623661397777/Bus rent",
            "amount": -400.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623676831045",
            "balanceAfter": 893.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #86)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_87",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-25",
            "description": "UPI/Hotel Sunrise/YESB/623762130200/Paid via Sup(Value Date: 25-08-2026)",
            "amount": -405.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623782001703",
            "balanceAfter": 488.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #87)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_88",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-25",
            "description": "UPI/Patni Gopalbha/BARB/623762242401/Paid via Sup",
            "amount": -85.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623783496154",
            "balanceAfter": 403.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #88)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_89",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-25",
            "description": "UPI/DINANATH VIJAY/UBIN/623764022802/Paid via Sup",
            "amount": -70.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623792660682",
            "balanceAfter": 333.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #89)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_90",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-26",
            "description": "Recd:IMPS/623894216911/R K BANSAL/KKBK/X0380/RK Ba",
            "amount": 13230.0,
            "type": "INCOME",
            "paymentMethod": "IMPS",
            "referenceNumber": "IMPS-623810290820",
            "balanceAfter": 13563.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #90)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_91",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-26",
            "description": "UPI/SHREENATH MOBI/HDFC/623870720593/Phone Buybac",
            "amount": 5800.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-160020506609",
            "balanceAfter": 19363.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #91)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_92",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_housing",
            "subcategoryId": "sub_rent",
            "date": "2026-08-26",
            "description": "UPI/SUMITRA NIKUNJ/BARB/623883708269/Deposit full",
            "amount": -7500.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623890100929",
            "balanceAfter": 11863.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #92)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_93",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-26",
            "description": "UPI/GAYARI KAILASH/INDB/314199114318/Payment from",
            "amount": -11000.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623890248598",
            "balanceAfter": 863.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #93)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_94",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-26",
            "description": "UPI/GAYARI DINESH /CNRB/623855509909/UPI",
            "amount": 80.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623891480153",
            "balanceAfter": 943.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #94)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_95",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-26",
            "description": "UPI/Jaiswal Aman S/YESB/623884610352/Paid via Sup",
            "amount": -70.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623894151554",
            "balanceAfter": 873.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #95)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_96",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_tea_coffee",
            "date": "2026-08-26",
            "description": "UPI/CHAI SUTTA BAR/UTIB/623887336191/Paid via Sup",
            "amount": -40.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623805688081",
            "balanceAfter": 833.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #96)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_97",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-26",
            "description": "Chg: Charge for Deposit on  26-08-2026",
            "amount": -150.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "623815781615",
            "balanceAfter": 683.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #97)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_98",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-26",
            "description": "Cash Deposit at/BVABH229/Solitair-B-Center VapiVal",
            "amount": 1500.0,
            "type": "INCOME",
            "paymentMethod": "CASH",
            "referenceNumber": "623815781615",
            "balanceAfter": 2183.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #98)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_99",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-26",
            "description": "Chg: GST Charge for Deposit on  26-08-2026",
            "amount": -27.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "623815781615",
            "balanceAfter": 2156.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #99)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_100",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-27",
            "description": "UPI/SATISH VINAYKR/YESB/623998762035/Paid via Sup",
            "amount": -30.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623965131563",
            "balanceAfter": 2126.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #100)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_101",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_tea_coffee",
            "date": "2026-08-27",
            "description": "UPI/Jagdish wada p/YESB/623999729865/Paid via Sup",
            "amount": -50.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623969305959",
            "balanceAfter": 2076.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #101)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_102",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_tea_coffee",
            "date": "2026-08-27",
            "description": "UPI/CHAI SUTTA BAR/UTIB/660500911247/Paid via Sup",
            "amount": -40.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-623974451908",
            "balanceAfter": 2036.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #102)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_103",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-28",
            "description": "UPI/GAYARI KAILASH/INDB/525526597352/Payment from",
            "amount": -4.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624019811919",
            "balanceAfter": 2032.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #103)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_104",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-28",
            "description": "UPI/GAYARI KAILASH/INDB/082688203731/Payment from",
            "amount": 8.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624019835170",
            "balanceAfter": 2040.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #104)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_105",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_groceries",
            "date": "2026-08-28",
            "description": "UPI/Blinkit/HDFC/660611114979/Pay via Razo",
            "amount": -678.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624028248604",
            "balanceAfter": 1362.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #105)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_106",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_freelance",
            "date": "2026-08-28",
            "description": "UPI/Cashfree Payme/utib/475429722406/CF PG Settle",
            "amount": 3400.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624041343949",
            "balanceAfter": 4762.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #106)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_107",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_transport",
            "subcategoryId": "sub_public_transit",
            "date": "2026-08-29",
            "description": "UPI/Shrinath Cargo/YESB/660722061861/Payment for",
            "amount": -100.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624180493954",
            "balanceAfter": 4662.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #107)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_108",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-29",
            "description": "UPI/SATISH VINAYKR/YESB/660727412559/Paid via Sup",
            "amount": -60.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624105210267",
            "balanceAfter": 4602.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #108)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_109",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_emi_personal",
            "date": "2026-08-29",
            "description": "UPI/PYARELAL  DALU/BARB/660730399327/Vc emi 2000",
            "amount": -2500.0,
            "type": "DEBT_PAYMENT",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624117779989",
            "balanceAfter": 2102.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #109)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_110",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_groceries",
            "date": "2026-08-29",
            "description": "UPI/Sanjay provija/YESB/660730849414/Paid via Sup",
            "amount": -20.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624120117442",
            "balanceAfter": 2082.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #110)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_111",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-29",
            "description": "UPI/PIYUSHKUMAR RA/UTIB/660731160530/Paid via Sup",
            "amount": -20.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624121893130",
            "balanceAfter": 2062.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #111)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_112",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-29",
            "description": "UPI/PIYUSHKUMAR RA/UTIB/660731212213/Paid via Sup",
            "amount": -30.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624122206469",
            "balanceAfter": 2032.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #112)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_113",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-30",
            "description": "UPI/SUKUMAR RAJAN /YESB/660834633785/Paid via Sup",
            "amount": -100.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624240247968",
            "balanceAfter": 1932.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #113)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_114",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_tea_coffee",
            "date": "2026-08-30",
            "description": "UPI/CHAI SUTTA BAR/UTIB/660839414672/Paid via Sup",
            "amount": -60.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624263346944",
            "balanceAfter": 1872.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #114)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_115",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-30",
            "description": "UPI/Jaiswal Aman S/YESB/660840148358/Paid via Sup",
            "amount": -70.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624266583985",
            "balanceAfter": 1802.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #115)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_116",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-30",
            "description": "UPI/JAGDISH/UTIB/660842163190/Paid via Sup",
            "amount": -40.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624275011613",
            "balanceAfter": 1762.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #116)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_117",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_groceries",
            "date": "2026-08-31",
            "description": "UPI/BLINKIT COMMER/HDFC/660951753771/Blinkit Paym",
            "amount": -159.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624325856843",
            "balanceAfter": 1603.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #117)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_118",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-08-31",
            "description": "UPI/9549230227@sup/INDB/660953132839/Paid via Sup",
            "amount": -200.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624332800189",
            "balanceAfter": 1403.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #118)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_119",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-31",
            "description": "UPI/MAXWELL FOREVE/CNRB/660954452595/Paid via Sup",
            "amount": -42.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624338741943",
            "balanceAfter": 1361.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #119)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_120",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-31",
            "description": "UPI/MAXWELL FOREVE/CNRB/660954489492/Paid via Sup",
            "amount": -20.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624338902946",
            "balanceAfter": 1341.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #120)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_121",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-08-31",
            "description": "UPI/Shiv kumar Fru/YESB/660954529196/Paid via Sup",
            "amount": -70.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624339074319",
            "balanceAfter": 1271.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #121)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_122",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_shopping",
            "subcategoryId": "sub_clothing",
            "date": "2026-08-31",
            "description": "UPI/EXOTIC FLOWERS/UTIB/660956256483/Paid via Sup",
            "amount": -800.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624346613341",
            "balanceAfter": 471.08,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #122)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_123",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-08-31",
            "description": "UPI/RESTAURANT BRA/HDFC/660959042833/Paid via Sup",
            "amount": -366.46,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624361753376",
            "balanceAfter": 104.62,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #123)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_124",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-08-31",
            "description": "UPI/GAYARI DINESH /CNRB/237018917046/Payment from",
            "amount": 800.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-180021757989",
            "balanceAfter": 904.62,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #124)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_125",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-09-01",
            "description": "UPI/Burger King/HDFC/128822989426/Pay(Value Date: 01-09-2026)",
            "amount": -135.46,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624462080246",
            "balanceAfter": 769.16,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #125)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_126",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-09-01",
            "description": "UPI/LA PINO'Z PIZZ/YESB/661064808686/Paid via Sup",
            "amount": -131.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624493344000",
            "balanceAfter": 638.16,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #126)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_127",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-09-01",
            "description": "UPI/ZOMATO/HDFC/661066620892/Paid via Sup",
            "amount": -99.43,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624403392316",
            "balanceAfter": 538.73,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #127)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_128",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-01",
            "description": "UPI/Ramakant/YESB/661069405849/Paid via Sup",
            "amount": -50.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624415839999",
            "balanceAfter": 488.73,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #128)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_129",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-09-01",
            "description": "UPI/Reshma Bhurala/SBIN/829365591085/Payment from",
            "amount": 10000.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-180021967997",
            "balanceAfter": 10488.73,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #129)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_130",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_transport",
            "subcategoryId": "sub_public_transit",
            "date": "2026-09-02",
            "description": "UPI/Indian Railway/SBIN/128904333161/UPI",
            "amount": -33.95,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624575510681",
            "balanceAfter": 10454.78,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #130)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_131",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_utilities",
            "subcategoryId": "sub_subscriptions",
            "date": "2026-09-02",
            "description": "UPI/APPLE MEDIA SE/HDFC/103974000127/Execution te",
            "amount": -75.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624507660599",
            "balanceAfter": 10379.78,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #131)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_132",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-03",
            "description": "UPI/GK low price 4/YESB/624601301865/Paid via Sup",
            "amount": -121.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624680227403",
            "balanceAfter": 10258.78,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #132)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_133",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-09-04",
            "description": "UPI/CHANDAN KUMAR/BARB/624704444808/Paid via Sup",
            "amount": -800.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624799953026",
            "balanceAfter": 9458.78,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #133)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_134",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-04",
            "description": "UPI/SHREE BHAVANI /YESB/624704842823/Paid via Sup",
            "amount": -691.39,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624701699809",
            "balanceAfter": 8767.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #134)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_135",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-04",
            "description": "UPI/Mr BAJRANGI KU/IDIB/624706676159/Paid via Sup",
            "amount": -3700.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624709808868",
            "balanceAfter": 5067.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #135)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_136",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-09-04",
            "description": "UPI/GAYARI DINESH /CNRB/624706884762/Paid via Sup",
            "amount": 5000.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624710753579",
            "balanceAfter": 10067.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #136)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_137",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-04",
            "description": "UPI/RAJKUMAR A KHA/UNBA/624706901397/Pay to Bhara",
            "amount": -200.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624710833702",
            "balanceAfter": 9867.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #137)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_138",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-04",
            "description": "UPI/DHARMESH GENER/YESB/624707364049/Paid via Sup",
            "amount": -144.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624712973029",
            "balanceAfter": 9723.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #138)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_139",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-09-04",
            "description": "UPI/Swiggy Ltd/UTIB/624707931436/Pay 20for 20",
            "amount": -323.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624715637640",
            "balanceAfter": 9400.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #139)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_140",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_family",
            "subcategoryId": "sub_childcare",
            "date": "2026-09-04",
            "description": "UPI/Reshma Bhurala/SBIN/624707944133/Emi amount t",
            "amount": -7000.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624715701480",
            "balanceAfter": 2400.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #140)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_141",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_family",
            "subcategoryId": "sub_childcare",
            "date": "2026-09-04",
            "description": "UPI/Reshma Bhurala/SBIN/624708012588/Paid via Sup",
            "amount": -500.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624716020285",
            "balanceAfter": 1900.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #141)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_142",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_groceries",
            "date": "2026-09-04",
            "description": "UPI/SUNILMANGARAMM/UTIB/624711161902/Sugar",
            "amount": -140.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624731561757",
            "balanceAfter": 1760.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #142)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_143",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-09-04",
            "description": "UPI/PRABHANSH GOPA/BARB/624712058810/Paid via Sup",
            "amount": -450.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624735693968",
            "balanceAfter": 1310.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #143)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_144",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-04",
            "description": "UPI/SUNILMANGARAMM/UTIB/624714549926/Paid via Sup",
            "amount": -1011.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624746027932",
            "balanceAfter": 299.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #144)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_145",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-04",
            "description": "UPI/RAJESHBHAI RAN/FDRL/624714874425/Pay to Bhara",
            "amount": -60.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624747377086",
            "balanceAfter": 239.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #145)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_146",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-04",
            "description": "UPI/Roshan Ravikir/YESB/624714888817/Paid via Sup",
            "amount": -120.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624747434956",
            "balanceAfter": 119.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #146)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_147",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-04",
            "description": "UPI/TUPE PREMKUMAR/BKID/624714934382/Paid via Sup",
            "amount": -20.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624747624828",
            "balanceAfter": 99.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #147)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_148",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-04",
            "description": "UPI/REETU RAMJOSH /BKID/624714965329/Paid via Sup",
            "amount": -50.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624747755909",
            "balanceAfter": 49.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #148)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_149",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-09-04",
            "description": "UPI/Reshma Bhurala/SBIN/065994102599/Payment from",
            "amount": 2000.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-230022679317",
            "balanceAfter": 2049.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #149)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_150",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_financial",
            "subcategoryId": "sub_bank_charges",
            "date": "2026-09-04",
            "description": "UPI/9549230227@sup/INDB/624716077695/Paid via Sup",
            "amount": -1500.0,
            "type": "TRANSFER",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624752435858",
            "balanceAfter": 549.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #150)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_151",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_groceries",
            "date": "2026-09-04",
            "description": "UPI/Blinkit/HDFC/624716962411/Pay via Razo",
            "amount": -269.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624756354696",
            "balanceAfter": 280.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #151)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_152",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-09-05",
            "description": "UPI/RADHE DHOKLA/YESB/624820375793/Food Bill at",
            "amount": -120.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624877115906",
            "balanceAfter": 160.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #152)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_153",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-05",
            "description": "UPI/SUNILMANGARAMM/UTIB/624823316682/Paid via Sup",
            "amount": -100.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624891167767",
            "balanceAfter": 60.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #153)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_154",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_income",
            "subcategoryId": "sub_other_income",
            "date": "2026-09-06",
            "description": "UPI/Reshma Bhurala/SBIN/771592443155/Payment from",
            "amount": 5000.0,
            "type": "INCOME",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-150023119141",
            "balanceAfter": 5060.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #154)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_155",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-09-06",
            "description": "UPI/Swiggy Ltd/UTIB/624943827902/Pay 20for 20",
            "amount": -175.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624987714596",
            "balanceAfter": 4885.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #155)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_156",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_food",
            "subcategoryId": "sub_dining_out",
            "date": "2026-09-06",
            "description": "UPI/SWIGGY/ICIC/624943903947/Paid via Sup",
            "amount": -152.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624988011805",
            "balanceAfter": 4733.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #156)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      },
      {
            "id": "tx_kotak_157",
            "userId": "user_kailash",
            "accountId": "acc_salary",
            "categoryId": "cat_misc",
            "subcategoryId": "sub_misc",
            "date": "2026-09-06",
            "description": "UPI/DHARMESH GENER/UTIB/624947280226/Paid via Sup",
            "amount": -20.0,
            "type": "EXPENSE",
            "paymentMethod": "UPI",
            "referenceNumber": "UPI-624902466709",
            "balanceAfter": 4713.39,
            "source": "CSV",
            "notes": "Imported from Kotak Mahindra Bank Statement (Tx #157)",
            "createdAt": "2026-09-07T10:00:00.000Z",
            "updatedAt": "2026-09-07T10:00:00.000Z"
      }
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
    localStorage.setItem('rupeetrack_kailash_finplan_v5', 'true');
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

    return txns.sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      const numA = parseInt(a.id.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.id.replace(/\D/g, ''), 10) || 0;
      return numB - numA;
    });
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

  updateTransaction(id: string, updates: Partial<Transaction>): Transaction {
    let txns: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const idx = txns.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Transaction not found');

    const oldTx = txns[idx];
    const newTx: Transaction = {
      ...oldTx,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If amount or account changed, adjust account balances
    const accounts = this.getAccounts();
    if (updates.amount !== undefined && updates.amount !== oldTx.amount) {
      const accIdx = accounts.findIndex((a) => a.id === (updates.accountId || oldTx.accountId));
      if (accIdx !== -1) {
        // Revert old amount, apply new amount
        accounts[accIdx].currentBalance = accounts[accIdx].currentBalance - oldTx.amount + updates.amount;
      }
    } else if (updates.accountId && updates.accountId !== oldTx.accountId) {
      const oldAccIdx = accounts.findIndex((a) => a.id === oldTx.accountId);
      const newAccIdx = accounts.findIndex((a) => a.id === updates.accountId);
      if (oldAccIdx !== -1) accounts[oldAccIdx].currentBalance -= oldTx.amount;
      if (newAccIdx !== -1) accounts[newAccIdx].currentBalance += oldTx.amount;
    }

    txns[idx] = newTx;
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    return newTx;
  }

  batchUpdateTransactions(ids: string[], updates: Partial<Transaction>): Transaction[] {
    let txns: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const idSet = new Set(ids);
    const updatedList: Transaction[] = [];

    txns = txns.map((t) => {
      if (idSet.has(t.id)) {
        const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
        updatedList.push(updated);
        return updated;
      }
      return t;
    });

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
    return updatedList;
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

  autoCategorizeTransactions(onlyUncategorized: boolean = false): { updatedCount: number; matchedCount: number } {
    let txns: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    const rules = this.getRules();
    let updatedCount = 0;

    txns = txns.map((t) => {
      const isUncategorized = !t.categoryId || t.categoryId === 'cat_misc' || t.categoryId === '';
      if (onlyUncategorized && !isUncategorized) {
        return t;
      }

      const res = categorizeTransaction(t.description, t.amount, rules as any);
      if (res && res.categoryId && (res.categoryId !== 'cat_misc' || !t.categoryId)) {
        if (t.categoryId !== res.categoryId || t.merchantName !== res.merchantName) {
          updatedCount++;
          return {
            ...t,
            categoryId: res.categoryId,
            subcategoryId: res.subcategoryId || t.subcategoryId,
            merchantName: res.merchantName || t.merchantName,
            type: t.type || res.type,
            updatedAt: new Date().toISOString(),
          };
        }
      }
      return t;
    });

    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
    return { updatedCount, matchedCount: txns.length };
  }

  // --- CATEGORIES & RULES ---
  getCategories(): Category[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : DEFAULT_CATEGORIES;
  }

  createCategory(category: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      ...category,
      id: `cat_custom_${Date.now()}`,
      subcategories: category.subcategories || [],
    };
    categories.push(newCat);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category {
    const categories = this.getCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    categories[idx] = { ...categories[idx], ...updates };
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    return categories[idx];
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
    const monthlyTrend = this.calculatePast6MonthsTrend(month);

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

  private calculatePast6MonthsTrend(targetMonth?: string) {
    const allTxns: Transaction[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
    let baseYear = 2026;
    let baseMonth = 9;
    if (targetMonth) {
      const parts = targetMonth.split('-');
      baseYear = parseInt(parts[0], 10);
      baseMonth = parseInt(parts[1], 10);
    } else {
      const now = new Date();
      baseYear = now.getFullYear();
      baseMonth = now.getMonth() + 1;
    }

    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseYear, baseMonth - 1 - i, 1);
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
