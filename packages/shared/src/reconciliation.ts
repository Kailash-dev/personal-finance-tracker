import { Transaction, MonthlyReconciliation } from '@personal-finance/types';

export function calculateMonthlyReconciliation(
  month: string, // YYYY-MM
  openingBalance: number,
  actualClosingBalance: number,
  transactions: Transaction[]
): MonthlyReconciliation {
  let totalIncome = 0;
  let totalExpenses = 0;
  let netTransfers = 0;

  for (const tx of transactions) {
    if (tx.type === 'INCOME') {
      totalIncome += Math.abs(tx.amount);
    } else if (tx.type === 'EXPENSE') {
      totalExpenses += Math.abs(tx.amount);
    } else if (tx.type === 'DEBT_PAYMENT') {
      totalExpenses += Math.abs(tx.amount);
    } else if (tx.type === 'REFUND') {
      totalExpenses -= Math.abs(tx.amount);
    } else if (tx.type === 'TRANSFER' || tx.type === 'CASH_WITHDRAWAL') {
      // Internal transfers across tracked accounts don't alter overall net worth
      // But if tracking per-account, debit account loses amount, credit account gains amount
    }
  }

  const expectedClosingBalance = openingBalance + totalIncome - totalExpenses + netTransfers;
  const difference = actualClosingBalance - expectedClosingBalance;
  const isReconciled = Math.abs(difference) < 1.0; // within ₹1

  return {
    month,
    openingBalance,
    totalIncome,
    totalExpenses,
    netTransfers,
    expectedClosingBalance,
    actualClosingBalance,
    difference,
    isReconciled,
  };
}
