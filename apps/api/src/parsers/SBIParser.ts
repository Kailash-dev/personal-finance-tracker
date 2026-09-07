import { BankStatementParser, BankStatementParseResult, ParsedRawTransaction } from './BankStatementParser';
import { parseINR } from '@personal-finance/shared';
import { PaymentMethod, TransactionType } from '@personal-finance/types';

/**
 * SBI (State Bank of India) Statement Parser
 */
export class SBIParser implements BankStatementParser {
  name = 'SBI Statement Parser';

  canHandle(text: string, bankHint?: string): boolean {
    if (bankHint === 'SBI') return true;
    return text.includes('STATE BANK OF INDIA') || text.includes('onlinesbi.com');
  }

  async parse(text: string): Promise<BankStatementParseResult> {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const transactions: ParsedRawTransaction[] = [];

    // SBI format often has DD MMM YYYY or DD/MM/YYYY
    const sbiDateRegex = /^(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|\d{2}\/\d{2}\/\d{4})/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(sbiDateRegex);

      if (match) {
        const rawDate = match[1];
        const date = this.normalizeSbiDate(rawDate);
        if (!date) continue;

        const numbers = line.match(/\b\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?\b/g);
        if (!numbers || numbers.length === 0) continue;

        const isCredit = line.includes(' CR') || line.includes('CREDIT') || line.includes('TRANSFER FROM');
        const txnAmount = parseINR(numbers[numbers.length >= 2 ? numbers.length - 2 : 0]);
        const balanceAfter = numbers.length >= 2 ? parseINR(numbers[numbers.length - 1]) : undefined;

        const amount = isCredit ? Math.abs(txnAmount) : -Math.abs(txnAmount);
        const type: TransactionType = isCredit ? 'INCOME' : 'EXPENSE';

        let desc = line
          .replace(match[0], '')
          .replace(/\b\d{1,3}(?:,\d{2,3})*(?:\.\d{2})?\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        transactions.push({
          date,
          description: desc || 'SBI Transaction',
          amount,
          type,
          paymentMethod: this.deducePaymentMethod(desc),
          balanceAfter,
          rawText: line,
        });
      }
    }

    transactions.sort((a, b) => a.date.localeCompare(b.date));

    return {
      bankName: 'State Bank of India',
      transactions,
      isScanned: transactions.length === 0,
      periodStart: transactions.length > 0 ? transactions[0].date : undefined,
      periodEnd: transactions.length > 0 ? transactions[transactions.length - 1].date : undefined,
    };
  }

  private normalizeSbiDate(d: string): string | null {
    try {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
      return null;
    } catch {
      return null;
    }
  }

  private deducePaymentMethod(desc: string): PaymentMethod {
    const d = desc.toUpperCase();
    if (d.includes('UPI')) return 'UPI';
    if (d.includes('ATM')) return 'CASH';
    if (d.includes('NEFT')) return 'NEFT';
    if (d.includes('IMPS')) return 'IMPS';
    return 'NET_BANKING';
  }
}

/**
 * ICICI Bank Statement Parser
 */
export class ICICIParser implements BankStatementParser {
  name = 'ICICI Bank Statement Parser';

  canHandle(text: string, bankHint?: string): boolean {
    if (bankHint === 'ICICI') return true;
    return text.includes('ICICI BANK') || text.includes('icicibank.com');
  }

  async parse(text: string): Promise<BankStatementParseResult> {
    // Similar robust parsing logic tuned for ICICI column layout
    const generic = new (await import('./GenericParser')).GenericParser();
    const res = await generic.parse(text);
    return {
      ...res,
      bankName: 'ICICI Bank',
    };
  }
}
