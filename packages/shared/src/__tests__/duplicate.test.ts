import { describe, it, expect } from 'vitest';
import { checkDuplicateTransaction } from '../duplicate';
import { Transaction } from '@personal-finance/types';

describe('Duplicate Transaction Detection', () => {
  const existing: Transaction[] = [
    {
      id: 'tx_existing_1',
      userId: 'u1',
      accountId: 'acc_hdfc',
      categoryId: 'cat_food',
      date: '2026-09-05',
      description: 'ZOMATO INDIA',
      referenceNumber: 'REF987654321',
      amount: -650,
      type: 'EXPENSE',
      paymentMethod: 'UPI',
      source: 'BANK_PDF',
      createdAt: '2026-09-05',
      updatedAt: '2026-09-05',
    },
  ];

  it('detects duplicate via exact reference number match', () => {
    const candidate = {
      date: '2026-09-05',
      amount: -650,
      description: 'UPI/ZOMATO/REF987654321',
      referenceNumber: 'REF987654321',
    };

    const result = checkDuplicateTransaction(candidate, existing);
    expect(result.isDuplicate).toBe(true);
    expect(result.confidence).toBe(1.0);
    expect(result.matchedTransactionId).toBe('tx_existing_1');
  });

  it('detects duplicate on exact date, amount, and similar description', () => {
    const candidate = {
      date: '2026-09-05',
      amount: -650,
      description: 'ZOMATO INDIA',
    };

    const result = checkDuplicateTransaction(candidate, existing);
    expect(result.isDuplicate).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it('does NOT flag different transactions on different dates/amounts', () => {
    const candidate = {
      date: '2026-09-08',
      amount: -1200,
      description: 'SWIGGY',
    };

    const result = checkDuplicateTransaction(candidate, existing);
    expect(result.isDuplicate).toBe(false);
  });
});
