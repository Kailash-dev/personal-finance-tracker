import { MerchantRule, TransactionType } from '@personal-finance/types';
import { DEFAULT_MERCHANT_RULES } from './constants';

export interface CategorizationResult {
  merchantName: string;
  categoryId: string;
  subcategoryId?: string;
  type: TransactionType;
  confidence: number;
  ruleMatched?: string;
}

/**
 * Normalizes raw Indian bank statement description
 * Extracts merchant name or keywords from UPI, POS, NEFT, IMPS, ATM prefixes
 */
export function cleanTransactionDescription(rawDesc: string): string {
  if (!rawDesc) return 'Unknown Transaction';

  let cleaned = rawDesc.trim().toUpperCase();

  // Strip typical Indian banking prefixes
  cleaned = cleaned.replace(/^UPI[-/](?:DR|CR|P2M|P2P)[-/]?/i, '');
  cleaned = cleaned.replace(/^UPI[-/]/i, '');
  cleaned = cleaned.replace(/^POS\s+\d+\s+/i, '');
  cleaned = cleaned.replace(/^(?:NEFT|IMPS|RTGS|ACH|NACH|INB|MB)[-/]/i, '');
  cleaned = cleaned.replace(/^(?:ATM\s+WDL|EAW-|NFS\s+WDL)[-/]?/i, 'ATM CASH ');

  // Remove common trailing reference IDs like "@OKAXIS", "/REF123456", "/UPI"
  cleaned = cleaned.replace(/@[A-Z0-9]+/gi, '');
  cleaned = cleaned.replace(/\/[A-Z0-9_-]+$/gi, '');
  cleaned = cleaned.replace(/[-/]{2,}/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned || rawDesc;
}

/**
 * Matches a transaction description against rules to deduce category and merchant
 */
export function categorizeTransaction(
  description: string,
  amount: number,
  customRules: MerchantRule[] = []
): CategorizationResult {
  const cleaned = cleanTransactionDescription(description);
  const upperRaw = description.toUpperCase();
  const upperCleaned = cleaned.toUpperCase();

  // 1. First test user custom rules
  for (const rule of customRules) {
    if (matchesPattern(upperRaw, rule.pattern, rule.isRegex) || matchesPattern(upperCleaned, rule.pattern, rule.isRegex)) {
      return {
        merchantName: rule.merchantName,
        categoryId: rule.categoryId,
        subcategoryId: rule.subcategoryId,
        type: rule.defaultType || (amount < 0 ? 'EXPENSE' : 'INCOME'),
        confidence: rule.confidenceScore || 0.95,
        ruleMatched: rule.pattern,
      };
    }
  }

  // 2. Test system default rules
  for (const rule of DEFAULT_MERCHANT_RULES) {
    if (matchesPattern(upperRaw, rule.pattern, rule.isRegex) || matchesPattern(upperCleaned, rule.pattern, rule.isRegex)) {
      return {
        merchantName: rule.merchantName,
        categoryId: rule.categoryId,
        subcategoryId: rule.subcategoryId,
        type: rule.defaultType || (amount < 0 ? 'EXPENSE' : 'INCOME'),
        confidence: rule.confidenceScore,
        ruleMatched: rule.pattern,
      };
    }
  }

  // 3. Fallback heuristics for transfers / income / generic
  if (upperRaw.includes('SALARY') || upperRaw.includes('PAYROLL') || upperRaw.includes('CREDIT INTEREST')) {
    return {
      merchantName: 'Income Source',
      categoryId: 'cat_income',
      subcategoryId: 'sub_salary',
      type: 'INCOME',
      confidence: 0.9,
    };
  }

  if (upperRaw.includes('TRANSFER') || upperRaw.includes('TFR') || upperRaw.includes('TO A/C') || upperRaw.includes('FROM A/C')) {
    return {
      merchantName: 'Account Transfer',
      categoryId: 'cat_transfer',
      subcategoryId: 'sub_acc_transfer',
      type: 'TRANSFER',
      confidence: 0.85,
    };
  }

  if (upperRaw.includes('ATM') || upperRaw.includes('CASH WDL')) {
    return {
      merchantName: 'Cash Withdrawal',
      categoryId: 'cat_transfer',
      subcategoryId: 'sub_cash_withdrawal',
      type: 'CASH_WITHDRAWAL',
      confidence: 0.9,
    };
  }

  // Generic fallback
  return {
    merchantName: cleaned.slice(0, 30),
    categoryId: 'cat_misc',
    subcategoryId: 'sub_misc_other',
    type: amount < 0 ? 'EXPENSE' : 'INCOME',
    confidence: 0.35,
  };
}

function matchesPattern(text: string, pattern: string, isRegex?: boolean): boolean {
  if (isRegex) {
    try {
      const regex = new RegExp(pattern, 'i');
      return regex.test(text);
    } catch {
      return text.includes(pattern.toUpperCase());
    }
  }
  return text.includes(pattern.toUpperCase());
}
