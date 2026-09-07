import { describe, it, expect } from 'vitest';
import { categorizeTransaction, cleanTransactionDescription } from '../categorization';

describe('Transaction Categorization Engine', () => {
  it('cleans raw Indian bank statement description prefixes', () => {
    expect(cleanTransactionDescription('UPI/DR/12345/ZOMATO/PAYTM/REF123')).toContain('ZOMATO');
    expect(cleanTransactionDescription('POS 4123 DMART MUMBAI')).toContain('DMART MUMBAI');
    expect(cleanTransactionDescription('UPI-SWIGGY-12345@OKAXIS')).toContain('SWIGGY');
  });

  it('categorizes known Indian merchants accurately', () => {
    const zomato = categorizeTransaction('UPI-ZOMATO-987654@OKHDFC', -420);
    expect(zomato.categoryId).toBe('cat_food');
    expect(zomato.subcategoryId).toBe('sub_delivery');
    expect(zomato.merchantName).toBe('Zomato');
    expect(zomato.confidence).toBeGreaterThan(0.9);

    const dmart = categorizeTransaction('POS 1234 DMART SUPERMARKET', -3450);
    expect(dmart.categoryId).toBe('cat_food');
    expect(dmart.subcategoryId).toBe('sub_groceries');

    const hpcl = categorizeTransaction('HPCL PETROL PUMP BANGALORE', -2000);
    expect(hpcl.categoryId).toBe('cat_transport');
    expect(hpcl.subcategoryId).toBe('sub_petrol');

    const milk = categorizeTransaction('UPI-AMUL MILK-STORE', -360);
    expect(milk.categoryId).toBe('cat_food');
    expect(milk.subcategoryId).toBe('sub_milk');

    const salary = categorizeTransaction('NEFT CR-SALARY FOR AUG 2026', 120000);
    expect(salary.categoryId).toBe('cat_income');
    expect(salary.type).toBe('INCOME');
  });

  it('honors custom merchant rules with highest precedence', () => {
    const customRules = [
      {
        id: 'rule1',
        userId: 'u1',
        pattern: 'CHAIWALA',
        merchantName: 'Local Chai',
        categoryId: 'cat_food',
        subcategoryId: 'sub_snacks',
        confidenceScore: 0.99,
        createdAt: '2026-09-01',
      },
    ];

    const res = categorizeTransaction('UPI-CHAIWALA CORNER', -30, customRules);
    expect(res.merchantName).toBe('Local Chai');
    expect(res.confidence).toBe(0.99);
  });
});
