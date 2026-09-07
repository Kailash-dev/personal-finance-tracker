import { Transaction, BankImportTransaction } from '@personal-finance/types';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  confidence: number;
  reason?: string;
  matchedTransactionId?: string;
}

/**
 * Checks if an incoming candidate transaction is a duplicate of an existing transaction
 */
export function checkDuplicateTransaction(
  candidate: {
    date: string;
    amount: number;
    description: string;
    referenceNumber?: string;
    accountId?: string;
  },
  existingTransactions: (Transaction | BankImportTransaction)[]
): DuplicateCheckResult {
  const candDate = new Date(candidate.date).getTime();
  const candAmount = Math.abs(candidate.amount);
  const candRef = candidate.referenceNumber?.trim().toUpperCase();
  const candDesc = candidate.description.trim().toUpperCase();

  for (const existing of existingTransactions) {
    const exDate = new Date(existing.date).getTime();
    const exAmount = Math.abs(existing.amount);
    const exRef = existing.referenceNumber?.trim().toUpperCase();
    const exDesc = existing.description.trim().toUpperCase();

    // 1. Exact Reference Match (Strongest signal)
    if (candRef && exRef && candRef === exRef && candRef.length >= 4) {
      return {
        isDuplicate: true,
        confidence: 1.0,
        reason: `Exact reference number match (${candRef})`,
        matchedTransactionId: 'id' in existing ? existing.id : undefined,
      };
    }

    // 2. Exact Date + Exact Amount + Matching Description
    const dayDiff = Math.abs(candDate - exDate) / (1000 * 60 * 60 * 24);
    const amountDiff = Math.abs(candAmount - exAmount);

    if (amountDiff < 0.01 && dayDiff === 0 && (candDesc === exDesc || candDesc.includes(exDesc) || exDesc.includes(candDesc))) {
      return {
        isDuplicate: true,
        confidence: 0.98,
        reason: 'Identical date, amount, and description',
        matchedTransactionId: 'id' in existing ? existing.id : undefined,
      };
    }

    // 3. Near Date (within 2 days) + Exact Amount + Similar Description
    if (amountDiff < 0.01 && dayDiff <= 2) {
      if (candDesc === exDesc || stringSimilarity(candDesc, exDesc) > 0.7) {
        return {
          isDuplicate: true,
          confidence: 0.85,
          reason: `Likely duplicate: ₹${candAmount} within ${Math.round(dayDiff)} day(s)`,
          matchedTransactionId: 'id' in existing ? existing.id : undefined,
        };
      }
    }
  }

  return {
    isDuplicate: false,
    confidence: 0,
  };
}

/**
 * Basic Dice-coefficient string similarity
 */
function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (!str1 || !str2) return 0;
  if (str1.length < 2 || str2.length < 2) return 0;

  const getBigrams = (str: string) => {
    const s = str.toLowerCase();
    const v = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const k = s.slice(i, i + 2);
      v.set(k, (v.get(k) || 0) + 1);
    }
    return v;
  };

  const b1 = getBigrams(str1);
  const b2 = getBigrams(str2);
  let intersection = 0;

  b1.forEach((count, key) => {
    if (b2.has(key)) {
      intersection += Math.min(count, b2.get(key)!);
    }
  });

  return (2.0 * intersection) / (str1.length - 1 + str2.length - 1);
}
